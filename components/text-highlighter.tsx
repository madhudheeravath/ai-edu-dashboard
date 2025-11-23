"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, EyeOff } from "lucide-react"

interface AnalyzedSentence {
  text: string
  aiLikelihood: number
  type: "ai" | "human" | "unknown"
  confidence: string
  score?: number
}

interface TextHighlighterProps {
  text: string
  autoAnalyze?: boolean
}

export function TextHighlighter({ text, autoAnalyze = true }: TextHighlighterProps) {
  const [analyzedSentences, setAnalyzedSentences] = useState<AnalyzedSentence[]>([])
  const [loading, setLoading] = useState(false)
  const [showHighlights, setShowHighlights] = useState(true)
  const [stats, setStats] = useState({ ai: 0, human: 0, total: 0 })

  useEffect(() => {
    if (autoAnalyze && text && text.trim().length > 0) {
      analyzeSentences()
    }
  }, [text, autoAnalyze])

  const analyzeSentences = async () => {
    if (!text || text.trim().length === 0) return

    setLoading(true)
    try {
      const response = await fetch("/api/detect-sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyzedSentences(data.sentences)
        setStats({
          ai: data.aiSentences,
          human: data.humanSentences,
          total: data.totalSentences,
        })
      }
    } catch (error) {
      console.error("Failed to analyze sentences:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSentenceColor = (sentence: AnalyzedSentence) => {
    if (!showHighlights) return "transparent"
    
    if (sentence.type === "ai") {
      // Red shades for AI
      if (sentence.aiLikelihood > 85) return "rgb(254, 202, 202)" // bg-red-200
      if (sentence.aiLikelihood > 70) return "rgb(252, 231, 228)" // bg-red-100
      return "rgb(254, 242, 242)" // bg-red-50
    } else if (sentence.type === "human") {
      // Green shades for human
      if (sentence.aiLikelihood < 20) return "rgb(187, 247, 208)" // bg-green-200
      if (sentence.aiLikelihood < 35) return "rgb(220, 252, 231)" // bg-green-100
      return "rgb(240, 253, 244)" // bg-green-50
    }
    return "rgb(243, 244, 246)" // bg-gray-100 for unknown
  }

  const getSentenceBorder = (sentence: AnalyzedSentence) => {
    if (!showHighlights) return "transparent"
    
    if (sentence.type === "ai") {
      return "2px solid rgb(248, 113, 113)" // border-red-400
    } else if (sentence.type === "human") {
      return "2px solid rgb(74, 222, 128)" // border-green-400
    }
    return "1px solid rgb(209, 213, 219)" // border-gray-300
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-600">Analyzing text line-by-line...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (analyzedSentences.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Line-by-Line AI Detection</CardTitle>
          <CardDescription>Click to analyze which parts are AI-generated vs human-written</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={analyzeSentences} disabled={!text || text.trim().length === 0}>
            Analyze Text
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Line-by-Line Analysis</CardTitle>
            <CardDescription>
              <span className="inline-block w-4 h-4 bg-red-200 border-2 border-red-400 rounded mr-2" />
              AI-Generated
              <span className="inline-block w-4 h-4 bg-green-200 border-2 border-green-400 rounded mr-2 ml-4" />
              Human-Written
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHighlights(!showHighlights)}
            >
              {showHighlights ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Colors
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Colors
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.ai}</div>
            <div className="text-xs text-gray-600">AI Sentences</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.human}</div>
            <div className="text-xs text-gray-600">Human Sentences</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Sentences</div>
          </div>
        </div>

        {/* Highlighted text */}
        <div className="p-6 bg-white border rounded-lg space-y-1 max-h-[500px] overflow-y-auto">
          {analyzedSentences.map((sentence, index) => (
            <span
              key={index}
              className="inline-block mb-1 mr-1 px-2 py-1 rounded transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: getSentenceColor(sentence),
                border: getSentenceBorder(sentence),
              }}
              title={`${sentence.type.toUpperCase()}: ${sentence.aiLikelihood}% AI likelihood (${sentence.confidence} confidence)`}
            >
              {sentence.text}
            </span>
          ))}
        </div>

        {/* Legend */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Hover over text to see detection confidence</p>
          <p>• Darker colors = higher confidence in detection</p>
          <p>• Analysis is done sentence-by-sentence for accuracy</p>
        </div>

        <Button
          onClick={analyzeSentences}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Re-analyze Text
        </Button>
      </CardContent>
    </Card>
  )
}
