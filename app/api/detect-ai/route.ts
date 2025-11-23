import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const DETECTGPT_SERVICE_URL = process.env.DETECTGPT_SERVICE_URL || "https://simple-detectgpt-3mrk1v55n-madhuxx24-8951s-projects.vercel.app"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { text, previousText } = body

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Use DetectGPT-Lite service (no fallback)
    const analysis = await analyzeWithDetectGPT(text, previousText)
    
    return NextResponse.json({
      ...analysis,
      detectionMethod: "DetectGPT-Lite Analysis",
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error("AI Detection Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze content. Please try again." },
      { status: 500 }
    )
  }
}

async function analyzeWithDetectGPT(text: string, previousText?: string) {
  console.log(`Calling DetectGPT service at: ${DETECTGPT_SERVICE_URL}/api/detect`)
  
  const response = await fetch(`${DETECTGPT_SERVICE_URL}/api/detect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      previousText: previousText || null,
    }),
    signal: AbortSignal.timeout(30000), // 30 second timeout
  })

  console.log(`DetectGPT service response status: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`DetectGPT service error: ${response.status} - ${errorText}`)
    throw new Error(`DetectGPT service error: ${response.status}`)
  }

  const detectGPTResult = await response.json()
  console.log(`DetectGPT service result:`, detectGPTResult)

  // The new AI detection service provides comprehensive analysis
  return {
    aiLikelihood: detectGPTResult.aiLikelihood,
    humanLikelihood: detectGPTResult.humanLikelihood,
    confidence: detectGPTResult.confidence,
    wordCount: detectGPTResult.wordCount,
    sentenceCount: detectGPTResult.sentenceCount,
    avgWordsPerSentence: detectGPTResult.avgWordsPerSentence,
    vocabularyRichness: detectGPTResult.vocabularyRichness,
    readabilityScore: detectGPTResult.readabilityScore,
    hasAIMarkers: detectGPTResult.hasAIMarkers,
    formalityLevel: detectGPTResult.formalityLevel,
    sentenceVariation: detectGPTResult.sentenceVariation,
    hasPersonalTouch: detectGPTResult.hasPersonalTouch,
    wordsAdded: detectGPTResult.wordsAdded || 0,
    wordsRemoved: detectGPTResult.wordsRemoved || 0,
    percentageChange: detectGPTResult.percentageChange || 0,
    significantlyModified: detectGPTResult.significantlyModified || false,
    verdict: detectGPTResult.verdict,
    detectGPTScore: detectGPTResult.aiLikelihood,
    sentimentScore: detectGPTResult.sentimentScore || 0,
    sentimentLabel: detectGPTResult.sentimentLabel || 'Neutral',
    aiMarkerCount: detectGPTResult.aiMarkerCount || 0,
    processingTime: detectGPTResult.processingTime || 0
  }
}

function calculateTextStats(text: string) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()))

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: words.length / Math.max(sentences.length, 1),
    vocabularyRichness: uniqueWords.size / Math.max(words.length, 1)
  }
}

function detectAIPatterns(text: string) {
  const aiMarkers = [
    /let's explore/i,
    /it's important to note/i,
    /in conclusion/i,
    /as an AI/i,
    /delve into/i,
  ]

  const hasAIMarkers = aiMarkers.some(pattern => pattern.test(text))
  const formalWords = text.match(/\b(moreover|furthermore|consequently|therefore|thus|hence|whereby)\b/gi) || []
  const formalityScore = Math.min(formalWords.length / 10, 1)

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length)
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length
  const sentenceVariation = Math.min(variance / 50, 1)

  const personalMarkers = [
    /\bI'm\b/g,
    /\bI've\b/g,
    /\bdon't\b/g,
    /\bcan't\b/g,
  ]
  const hasPersonalTouch = personalMarkers.some(pattern => pattern.test(text))

  const hasGoodStructure = sentences.length >= 3 && avgLength > 10 && avgLength < 30
  const qualityScore = hasGoodStructure ? 0.8 : 0.5

  return {
    hasAIMarkers,
    formalityScore,
    sentenceVariation,
    hasPersonalTouch,
    qualityScore
  }
}

function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/))
  const words2 = new Set(text2.toLowerCase().split(/\s+/))
  
  const intersection = new Set(Array.from(words1).filter(x => words2.has(x)))
  const union = new Set([...Array.from(words1), ...Array.from(words2)])
  
  return intersection.size / union.size
}

function getFormalityLevel(score: number): string {
  if (score > 0.7) return "Very Formal"
  if (score > 0.5) return "Formal"
  if (score > 0.3) return "Moderate"
  return "Informal"
}

function simpleFallbackAnalysis(text: string) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  // Simple AI detection based on text patterns
  const aiScore = Math.min(50 + Math.random() * 20, 70) // Random 50-70%
  const humanScore = 100 - aiScore
  
  return {
    aiLikelihood: Math.round(aiScore),
    humanLikelihood: Math.round(humanScore),
    confidence: "low",
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: words.length / Math.max(sentences.length, 1),
    vocabularyRichness: 0.5,
    readabilityScore: 0.7,
    hasAIMarkers: false,
    formalityLevel: "Moderate",
    sentenceVariation: 0.6,
    hasPersonalTouch: true,
    wordsAdded: 0,
    wordsRemoved: 0,
    percentageChange: 0,
    significantlyModified: false,
    verdict: "Analysis unavailable - using basic heuristics",
    detectGPTScore: 0,
  }
}
