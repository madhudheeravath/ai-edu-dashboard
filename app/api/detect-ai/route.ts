import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const DETECTGPT_SERVICE_URL = process.env.DETECTGPT_SERVICE_URL || "https://simple-detectgpt-3mrk1v55n-madhuxx24-8951s-projects.vercel.app"

export async function POST(req: NextRequest) {
  console.log("🟢 AI Detection API called")
  try {
    const session = await getServerSession(authOptions)
    console.log("Session status:", session ? "Authenticated" : "Unauthenticated")

    if (!session || !session.user) {
      console.log("❌ Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { text, previousText } = body
    console.log(`Analyzing text length: ${text?.length || 0} chars`)

    // 1. Run Local Analysis first
    const localAnalysis = performLocalAnalysis(text)

    // 2. Try External Service
    let finalAnalysis = localAnalysis
    let method = "Local Heuristic Analysis"

    try {
      const externalAnalysis = await analyzeWithDetectGPT(text, previousText)

      // 3. Hybrid Decision Logic
      // If external service is ambiguous (40-60%), rely on local analysis
      if (externalAnalysis.aiLikelihood > 40 && externalAnalysis.aiLikelihood < 60) {
        finalAnalysis = localAnalysis
        method = "Local Analysis (Resolved Ambiguity)"
      }
      // If external says "Human" (<50%) but we found STRONG AI markers locally (>70%), we boost it
      else if (externalAnalysis.aiLikelihood < 50 && localAnalysis.aiLikelihood > 70) {
        finalAnalysis = {
          ...externalAnalysis,
          aiLikelihood: Math.round((externalAnalysis.aiLikelihood + localAnalysis.aiLikelihood) / 2),
          humanLikelihood: Math.round((externalAnalysis.humanLikelihood + localAnalysis.humanLikelihood) / 2),
          verdict: "Mixed signals (AI patterns detected)",
          hasAIMarkers: true,
          aiMarkerCount: localAnalysis.aiMarkerCount
        }
        method = "Hybrid Analysis (Boosted)"
      } else {
        // Otherwise trust the external service
        finalAnalysis = externalAnalysis
        method = "DetectGPT-Lite Analysis"
      }

    } catch (serviceError) {
      console.warn("DetectGPT service failed, using local analysis:", serviceError)
      finalAnalysis = localAnalysis
      method = "Local Heuristic Analysis (Fallback)"
    }

    return NextResponse.json({
      ...finalAnalysis,
      detectionMethod: method,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error("AI Detection Error:", error)
    // Emergency fallback
    try {
      const body = await req.json().catch(() => ({}))
      const text = body.text || ""
      const fallback = performLocalAnalysis(text)
      return NextResponse.json({
        ...fallback,
        detectionMethod: "Emergency Fallback",
        timestamp: new Date().toISOString(),
      })
    } catch (e) {
      return NextResponse.json(
        { error: "Failed to analyze content. Please try again." },
        { status: 500 }
      )
    }
  }
}

async function analyzeWithDetectGPT(text: string, previousText?: string) {
  // console.log(`Calling DetectGPT service at: ${DETECTGPT_SERVICE_URL}/api/detect`)

  const response = await fetch(`${DETECTGPT_SERVICE_URL}/api/detect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      previousText: previousText || null,
    }),
    signal: AbortSignal.timeout(15000), // 15 second timeout
  })

  if (!response.ok) {
    throw new Error(`DetectGPT service error: ${response.status}`)
  }

  const result = await response.json()

  return {
    aiLikelihood: result.aiLikelihood,
    humanLikelihood: result.humanLikelihood,
    confidence: result.confidence,
    wordCount: result.wordCount,
    sentenceCount: result.sentenceCount,
    avgWordsPerSentence: result.avgWordsPerSentence,
    vocabularyRichness: result.vocabularyRichness,
    readabilityScore: result.readabilityScore,
    hasAIMarkers: result.hasAIMarkers,
    formalityLevel: result.formalityLevel,
    sentenceVariation: result.sentenceVariation,
    hasPersonalTouch: result.hasPersonalTouch,
    wordsAdded: result.wordsAdded || 0,
    wordsRemoved: result.wordsRemoved || 0,
    percentageChange: result.percentageChange || 0,
    significantlyModified: result.significantlyModified || false,
    verdict: result.verdict,
    aiMarkerCount: result.aiMarkerCount || 0
  }
}

function performLocalAnalysis(text: string) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

  // 1. Check for AI Markers (Keywords/Phrases)
  const aiMarkers = [
    /delve/i, /landscape/i, /unprecedented/i, /transformative/i, /paradigm/i,
    /leverage/i, /harness/i, /underscores/i, /crucial/i, /imperative/i,
    /in conclusion/i, /summary/i, /moreover/i, /furthermore/i,
    /as an ai/i, /language model/i, /it is important to/i, /let's explore/i,
    /tapestry/i, /nuance/i, /multifaceted/i, /comprehensive/i
  ]

  let markerCount = 0
  aiMarkers.forEach(marker => {
    if (marker.test(text)) markerCount++
  })

  // 2. Check for Sentence Variation (AI is often very uniform)
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length)
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1)
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / (sentenceLengths.length || 1)
  const stdDev = Math.sqrt(variance)
  const variationScore = stdDev / (avgLength || 1) // Coefficient of variation

  // 3. Check for "Personal Touch" (I, me, my, we, our - AI uses these less in academic context)
  const personalPronouns = /\b(i|me|my|mine|we|us|our|ours)\b/i
  const hasPersonalTouch = personalPronouns.test(text)

  // Calculate Score
  let aiScore = 0

  // Base score from markers (heavy weight)
  aiScore += Math.min(markerCount * 20, 80)

  // Uniformity penalty (low variation = higher AI chance)
  if (variationScore < 0.15 && sentences.length > 3) aiScore += 25

  // Personal touch bonus (Strongly reduces AI score)
  if (hasPersonalTouch) aiScore -= 30

  // Length factor (Short text is usually Human, UNLESS markers are found)
  if (words.length < 30 && markerCount === 0) aiScore -= 40

  // Clamp score
  aiScore = Math.max(0, Math.min(100, aiScore))

  // Decisive Logic: Avoid 50/50
  // If score is low (<30), push to 0-10 (Human)
  if (aiScore < 30) aiScore = Math.max(0, aiScore - 10)

  // If score is high (>70), push to 80-100 (AI)
  if (aiScore > 70) aiScore = Math.min(100, aiScore + 10)

  // If score is middle (30-70)
  if (aiScore >= 30 && aiScore <= 70) {
    if (markerCount > 0) {
      aiScore += 15 // Lean towards AI if markers exist
    } else {
      aiScore = 15 // Assume human if ambiguous and no markers
    }
  }

  const humanScore = 100 - aiScore

  return {
    aiLikelihood: Math.round(aiScore),
    humanLikelihood: Math.round(humanScore),
    confidence: markerCount > 2 ? "high" : "medium",
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: avgLength,
    vocabularyRichness: 0.6, // Placeholder
    readabilityScore: 0.7, // Placeholder
    hasAIMarkers: markerCount > 0,
    aiMarkerCount: markerCount,
    formalityLevel: "Moderate",
    sentenceVariation: variationScore,
    hasPersonalTouch: hasPersonalTouch,
    wordsAdded: 0,
    wordsRemoved: 0,
    percentageChange: 0,
    significantlyModified: false,
    verdict: aiScore > 50 ? "Likely AI-generated" : "Likely human-written",
  }
}
