import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const DETECTGPT_SERVICE_URL = process.env.DETECTGPT_SERVICE_URL || "https://simple-detectgpt-3mrk1v55n-madhuxx24-8951s-projects.vercel.app"

// Strip HTML tags and extract prose text
function stripHtmlAndCode(text: string): string {
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, ' ')
  // Remove code blocks (anything that looks like code)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, ' ')
  // Remove inline code
  cleaned = cleaned.replace(/`[^`]+`/g, ' ')
  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, ' ')
  // Remove email-like patterns
  cleaned = cleaned.replace(/[\w.-]+@[\w.-]+\.\w+/g, ' ')
  // Remove special characters but keep punctuation
  cleaned = cleaned.replace(/[{}[\]<>\/\\|@#$%^&*=+]/g, ' ')
  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  return cleaned
}

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

    // Clean the text - strip HTML/code if present
    const cleanedText = stripHtmlAndCode(text)
    console.log(`Cleaned text length: ${cleanedText?.length || 0} chars`)

    // 1. Run Local Analysis on cleaned text
    const localAnalysis = performLocalAnalysis(cleanedText)
    console.log(`Local analysis: AI=${localAnalysis.aiLikelihood}%, markers=${localAnalysis.aiMarkerCount}`)

    // 2. Try External Service
    let finalAnalysis = localAnalysis
    let method = "Local Heuristic Analysis"

    try {
      const externalAnalysis = await analyzeWithDetectGPT(cleanedText, previousText)
      console.log(`External analysis: AI=${externalAnalysis.aiLikelihood}%`)

      // 3. Hybrid Decision Logic - prioritize higher AI detection
      const maxAI = Math.max(externalAnalysis.aiLikelihood, localAnalysis.aiLikelihood)
      const avgAI = Math.round((externalAnalysis.aiLikelihood + localAnalysis.aiLikelihood) / 2)
      
      // If EITHER detector finds high AI (>60%), use the higher score
      if (maxAI >= 60) {
        finalAnalysis = {
          ...localAnalysis,
          aiLikelihood: maxAI,
          humanLikelihood: 100 - maxAI,
          verdict: maxAI >= 70 ? "Highly likely AI-generated" : "Likely AI-generated",
        }
        method = "Hybrid Analysis (Max Score)"
      }
      // If both are low (<30%), trust that it's human
      else if (externalAnalysis.aiLikelihood < 30 && localAnalysis.aiLikelihood < 30) {
        finalAnalysis = {
          ...localAnalysis,
          aiLikelihood: Math.min(externalAnalysis.aiLikelihood, localAnalysis.aiLikelihood),
          humanLikelihood: 100 - Math.min(externalAnalysis.aiLikelihood, localAnalysis.aiLikelihood),
        }
        method = "Hybrid Analysis (Confirmed Human)"
      }
      // Otherwise use average
      else {
        finalAnalysis = {
          ...localAnalysis,
          aiLikelihood: avgAI,
          humanLikelihood: 100 - avgAI,
          verdict: avgAI >= 50 ? "Likely AI-generated" : "Possibly AI-assisted",
        }
        method = "Hybrid Analysis (Average)"
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

  if (words.length < 10) {
    return {
      aiLikelihood: 0,
      humanLikelihood: 100,
      confidence: "low",
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: 0,
      vocabularyRichness: 0,
      readabilityScore: 0,
      hasAIMarkers: false,
      aiMarkerCount: 0,
      formalityLevel: "Unknown",
      sentenceVariation: 0,
      hasPersonalTouch: false,
      wordsAdded: 0,
      wordsRemoved: 0,
      percentageChange: 0,
      significantlyModified: false,
      verdict: "Too short to analyze",
    }
  }

  // 1. AI Marker Words/Phrases (expanded list)
  const aiMarkers = [
    // Classic AI phrases
    /\bdelve\b/i, /\blandscape\b/i, /\bunprecedented\b/i, /\btransformative\b/i,
    /\bparadigm\b/i, /\bleverage\b/i, /\bharness\b/i, /\bunderscores\b/i,
    /\bimperative\b/i, /\btapestry\b/i, /\bnuance[ds]?\b/i, /\bmultifaceted\b/i,
    /\bholistic\b/i, /\bseamless(ly)?\b/i, /\brobust\b/i, /\bintricate\b/i,
    /\bpivotal\b/i, /\bfacilitate\b/i, /\boptimize\b/i, /\bstreamline\b/i,
    
    // Transitional/connector phrases AI loves
    /\bmoreover\b/i, /\bfurthermore\b/i, /\bconsequently\b/i, /\bnevertheless\b/i,
    /\bnonetheless\b/i, /\bthus\b/i, /\bhence\b/i, /\bthereby\b/i,
    /\bin essence\b/i, /\bin summary\b/i, /\bin conclusion\b/i,
    /\bit is (important|worth|essential|crucial|noteworthy) to (note|mention|understand|recognize)\b/i,
    /\bthis (ensures|allows|enables|facilitates)\b/i,
    
    // Hedging language AI uses
    /\bcan be seen as\b/i, /\bit('s| is) worth noting\b/i,
    /\bone might argue\b/i, /\bit could be argued\b/i,
    /\bthis demonstrates\b/i, /\bthis highlights\b/i,
    /\bthis underscores\b/i, /\bthis illustrates\b/i,
    
    // AI structural patterns
    /\blet's (explore|examine|delve|discuss|look at)\b/i,
    /\bby (leveraging|utilizing|harnessing|employing)\b/i,
    /\bplay(s)? a (crucial|vital|key|significant|pivotal) role\b/i,
    /\b(ensuring|ensuring that|ensure that)\b/i,
    /\b(key|core|main|primary) (takeaway|point|concept|idea)s?\b/i,
    
    // Overly formal/polished phrases
    /\bcomprehensive (understanding|overview|guide|analysis)\b/i,
    /\bwide (range|array|variety) of\b/i,
    /\bvarious (aspects|elements|factors|components)\b/i,
    /\b(significantly|substantially|considerably) (impact|affect|influence)\b/i,

    // Educational/Tutorial AI patterns (ChatGPT loves these)
    /\bby the end of (this|the)\b/i,
    /\byou (should|will) be able to\b/i,
    /\blearning outcome/i,
    /\bthis (section|chapter|tutorial|guide) (covers|explains|discusses|introduces)\b/i,
    /\bhere('s| is) (a|an) (example|breakdown|overview)\b/i,
    /\b(make sure|ensure|remember) (to|that)\b/i,
    /\b(properly|correctly|effectively|efficiently)\b/i,
    /\bstep[- ]by[- ]step\b/i,
    /\bbelow (is|are) (a|an|the|some)\b/i,
    /\babove (is|are) (a|an|the|some)\b/i,
    /\bfollowing (is|are) (a|an|the|some)\b/i,
    /\b(note|hint|tip|remember):/i,
    /\bfor (each|every|all) of the\b/i,
    /\bthe (purpose|goal|objective) (of|is)\b/i,
    /\bused (for|to) (create|make|build|define|specify)\b/i,
    /\bthis (is|allows|enables|helps) (you|us) (to)?\b/i,
    /\b(create|write|build|make) (a|an) (basic|simple)\b/i,
    /\b(basic|simple|fundamental) (concept|understanding|knowledge)\b/i,
    /\bstructure (of|for) (a|an|the)\b/i,
    /\b(sample|example) (run|output|code)\b/i,
  ]

  let markerCount = 0
  const foundMarkers: string[] = []
  aiMarkers.forEach(marker => {
    const matches = text.match(marker)
    if (matches) {
      markerCount++
      foundMarkers.push(matches[0])
    }
  })

  // 2. Check for repetitive sentence starters (AI pattern)
  const sentenceStarters: { [key: string]: number } = {}
  sentences.forEach(s => {
    const firstWords = s.trim().split(/\s+/).slice(0, 2).join(' ').toLowerCase()
    sentenceStarters[firstWords] = (sentenceStarters[firstWords] || 0) + 1
  })
  const repetitiveStarters = Object.values(sentenceStarters).filter(count => count > 2).length

  // 3. Check for Sentence Length Variation
  const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length)
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1)
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / (sentenceLengths.length || 1)
  const stdDev = Math.sqrt(variance)
  const variationCoeff = stdDev / (avgLength || 1)

  // AI tends to have very uniform sentence lengths (low variation)
  const isUniformLength = variationCoeff < 0.25 && sentences.length > 5

  // 4. Check for Personal Touch
  const personalPronouns = (text.match(/\b(i|me|my|mine|myself)\b/gi) || []).length
  const hasStrongPersonalTouch = personalPronouns > 3

  // 5. Check for conversational elements (more human)
  const conversationalPatterns = /\b(honestly|actually|basically|literally|anyway|btw|lol|haha|well,|so,|like,|you know)\b/gi
  const conversationalCount = (text.match(conversationalPatterns) || []).length

  // 6. Check for typos/informal writing (more human)
  const informalPatterns = /\b(gonna|wanna|kinda|sorta|dunno|gotta|cuz|coz|u|ur|r|n|thru)\b/gi
  const informalCount = (text.match(informalPatterns) || []).length

  // 7. Vocabulary richness (unique words / total words)
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')))
  const vocabRichness = uniqueWords.size / words.length

  // 8. Check for list/bullet patterns (AI loves lists)
  const listPatterns = text.match(/^[\s]*[-•*\d.]+[\s]+/gm) || []
  const hasLists = listPatterns.length > 3

  // 9. Check for colon usage (AI overuses colons for explanations)
  const colonCount = (text.match(/:/g) || []).length
  const excessiveColons = colonCount > sentences.length * 0.3

  // === CALCULATE AI SCORE ===
  let aiScore = 0

  // Marker-based scoring (primary signal)
  if (markerCount >= 5) aiScore += 50
  else if (markerCount >= 3) aiScore += 35
  else if (markerCount >= 2) aiScore += 25
  else if (markerCount >= 1) aiScore += 15

  // Uniformity penalty
  if (isUniformLength) aiScore += 15

  // Repetitive sentence starters
  if (repetitiveStarters > 0) aiScore += repetitiveStarters * 8

  // List patterns
  if (hasLists) aiScore += 10

  // Excessive colons
  if (excessiveColons) aiScore += 8

  // Low vocabulary richness (AI tends to repeat words)
  if (vocabRichness < 0.5 && words.length > 100) aiScore += 12

  // === HUMAN SIGNALS (reduce score) ===
  if (hasStrongPersonalTouch) aiScore -= 25
  if (conversationalCount > 0) aiScore -= conversationalCount * 10
  if (informalCount > 0) aiScore -= informalCount * 15

  // High vocabulary richness bonus
  if (vocabRichness > 0.7) aiScore -= 10

  // Clamp to 0-100
  aiScore = Math.max(0, Math.min(100, aiScore))

  // Determine confidence
  let confidence = "medium"
  if (markerCount >= 4 || aiScore >= 70) confidence = "high"
  else if (markerCount === 0 && aiScore < 20) confidence = "high"
  else if (words.length < 50) confidence = "low"

  const humanScore = 100 - aiScore

  // Determine verdict
  let verdict = "Likely human-written"
  if (aiScore >= 70) verdict = "Highly likely AI-generated"
  else if (aiScore >= 50) verdict = "Likely AI-generated"
  else if (aiScore >= 30) verdict = "Mixed signals - possibly AI-assisted"

  // Determine formality
  let formalityLevel = "Moderate"
  if (informalCount > 2 || conversationalCount > 2) formalityLevel = "Informal"
  else if (markerCount >= 3) formalityLevel = "Formal"

  return {
    aiLikelihood: Math.round(aiScore),
    humanLikelihood: Math.round(humanScore),
    confidence,
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: Math.round(avgLength * 10) / 10,
    vocabularyRichness: Math.round(vocabRichness * 100) / 100,
    readabilityScore: 0.7,
    hasAIMarkers: markerCount > 0,
    aiMarkerCount: markerCount,
    formalityLevel,
    sentenceVariation: Math.round(variationCoeff * 100) / 100,
    hasPersonalTouch: hasStrongPersonalTouch,
    wordsAdded: 0,
    wordsRemoved: 0,
    percentageChange: 0,
    significantlyModified: false,
    verdict,
    foundMarkers: foundMarkers.slice(0, 5), // Show first 5 markers found
  }
}
