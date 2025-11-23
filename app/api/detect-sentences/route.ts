import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { text } = body

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Split text into sentences - improved splitting
    const sentences = text
      .split(/(?<=[.!?])\s+/)  // Split on punctuation followed by space
      .filter((s) => s.trim().length > 0)
      .map(s => s.trim())

    console.log(`Analyzing ${sentences.length} sentences from text`)

    const analyzedSentences = []
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      
      // Skip if just punctuation
      if (/^[.!?\s]+$/.test(sentence)) {
        continue
      }

      const sentenceWords = sentence.split(/\s+/).length
      
      if (sentenceWords < 5) {
        // Too short to analyze reliably
        analyzedSentences.push({
          text: sentence,
          aiLikelihood: 50,
          type: "unknown",
          confidence: "low"
        })
        continue
      }

      // Skip very long sentences for DetectGPT (>150 words)
      // These will use heuristic instead
      const useDetectGPT = sentenceWords <= 150

      // Try DetectGPT service first (for reasonable length sentences)
      if (useDetectGPT) {
        try {
          const detectGPTUrl = process.env.DETECTGPT_SERVICE_URL || "http://localhost:8000"
          const response = await fetch(`${detectGPTUrl}/detect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: sentence }),
            signal: AbortSignal.timeout(5000),
          })

          if (response.ok) {
            const result = await response.json()
            
            // Debug logging
            console.log(`DetectGPT result: "${sentence.substring(0, 50)}..." -> ${result.aiLikelihood}% AI (score: ${result.score}, method: ${result.method})`)
            
            // If DetectGPT returned error fallback (50/50), use heuristic instead
            if (result.method === "Error Fallback" || (result.aiLikelihood === 50 && result.score === 0)) {
              console.log(`DetectGPT failed for this sentence, using heuristic instead`)
              // Fall through to heuristic
            } else {
              // Use DetectGPT result
              analyzedSentences.push({
                text: sentence,
                aiLikelihood: result.aiLikelihood,
                type: result.aiLikelihood >= 50 ? "ai" : "human",
                confidence: result.confidence.toLowerCase(),
                score: result.score
              })
              continue
            }
          }
        } catch (err) {
          // Fallback to heuristic
        }
      }

      // Heuristic fallback for sentence-level
      const aiLikelihood = analyzeSentenceHeuristic(sentence)
      
      console.log(`Heuristic fallback: "${sentence.substring(0, 50)}..." -> ${aiLikelihood}% AI`)
      
      analyzedSentences.push({
        text: sentence,
        aiLikelihood,
        type: aiLikelihood >= 50 ? "ai" : "human",
        confidence: "medium",
        method: "heuristic"
      })
    }

    return NextResponse.json({
      sentences: analyzedSentences,
      totalSentences: analyzedSentences.length,
      aiSentences: analyzedSentences.filter(s => s.type === "ai").length,
      humanSentences: analyzedSentences.filter(s => s.type === "human").length,
    })
  } catch (error: any) {
    console.error("Sentence detection error:", error)
    return NextResponse.json(
      { error: "Failed to analyze sentences" },
      { status: 500 }
    )
  }
}

function analyzeSentenceHeuristic(sentence: string): number {
  let aiScore = 40  // Start with baseline assumption of some AI
  const words = sentence.split(/\s+/)
  const lowerSentence = sentence.toLowerCase()

  // AI markers (formal, repetitive phrases) - MORE AGGRESSIVE
  const aiMarkers = [
    "it is important to note",
    "furthermore",
    "moreover",
    "in conclusion",
    "delve into",
    "dive into",
    "intricate",
    "multifaceted",
    "comprehensive",
    "crucial",
    "essential",
    "fundamental",
    "paramount",
    "demonstrates",
    "illustrates",
    "exemplifies",
    "highlighting",
    "showcases",
    "reimagined",
    "breakthrough",
    "innovative"
  ]

  aiMarkers.forEach(marker => {
    if (lowerSentence.includes(marker)) {
      aiScore += 12  // Increased back to be more aggressive
    }
  })

  // Long, complex sentences tend to be AI - MORE AGGRESSIVE
  if (words.length > 20) aiScore += 8
  if (words.length > 30) aiScore += 12

  // Very formal vocabulary - MORE AGGRESSIVE
  const formalWords = [
    "utilize", "facilitate", "implement", "leverage", "paradigm", "synergy",
    "demonstrates", "showcases", "enhances", "optimizes", "transforms",
    "alongside", "reimagined", "breakthrough", "innovations"
  ]
  formalWords.forEach(word => {
    if (lowerSentence.includes(word)) {
      aiScore += 8
    }
  })

  // Lack of personal pronouns suggests AI - MORE AGGRESSIVE
  if (!/\b(i|me|my|we|us|our)\b/i.test(sentence)) {
    aiScore += 10
  }

  // Perfect grammar and structure - MORE AGGRESSIVE
  if (words.length > 15 && !/\b(like|kinda|sorta|lol|tbh|imo|actually|basically)\b/i.test(sentence)) {
    aiScore += 8
  }

  // Technical/scientific tone
  if (/\b(technology|artificial intelligence|demonstrates|innovative|sustainable|efficient)\b/i.test(sentence)) {
    aiScore += 10
  }

  // Return score in 0-100 range
  return Math.min(Math.max(aiScore, 30), 95)  // Higher baseline (30) and max (95)
}
