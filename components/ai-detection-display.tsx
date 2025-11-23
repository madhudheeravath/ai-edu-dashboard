"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bot, User, TrendingUp, TrendingDown, AlertCircle, CheckCircle, FileText } from "lucide-react"

interface AIDetectionResult {
  aiLikelihood: number
  humanLikelihood: number
  confidence: string
  verdict: string
  stage: string
  wordCount: number
  sentenceCount: number
  avgWordsPerSentence: number
  vocabularyRichness: number
  readabilityScore: number
  hasAIMarkers: boolean
  formalityLevel: string
  sentenceVariation: number
  hasPersonalTouch: boolean
  wordsAdded: number
  wordsRemoved: number
  percentageChange: number
  significantlyModified: boolean
}

interface AIDetectionDisplayProps {
  result: AIDetectionResult
  stage: "draft" | "final"
  showComparison?: boolean
}

export function AIDetectionDisplay({ result, stage, showComparison = false }: AIDetectionDisplayProps) {
  const getConfidenceColor = (confidence: string) => {
    if (confidence === "High") return "text-green-600"
    if (confidence === "Medium") return "text-yellow-600"
    return "text-gray-600"
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI Content Analysis - {stage === "draft" ? "Initial Draft" : "Final Submission"}
          </CardTitle>
          <div className="flex items-center gap-2">
            {result.confidence && (
              <Badge variant={result.confidence === "high" ? "default" : "secondary"}>
                {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)} Confidence
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          {result.verdict}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* AI vs Human Score */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-red-600" />
                <span className="font-medium">AI-Generated Content</span>
              </div>
              <span className="font-bold">{result.aiLikelihood}%</span>
            </div>
            <Progress value={result.aiLikelihood} indicatorClassName="bg-red-500" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="font-medium">Human-Written Content</span>
              </div>
              <span className="font-bold">{result.humanLikelihood}%</span>
            </div>
            <Progress value={result.humanLikelihood} indicatorClassName="bg-green-500" />
          </div>
        </div>

        {/* Content Changes (if comparing) */}
        {showComparison && result.wordsAdded !== undefined && result.wordsAdded !== null && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Changes from Draft
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span><strong>{result.wordsAdded || 0}</strong> words added</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span><strong>{result.wordsRemoved || 0}</strong> words removed</span>
              </div>
            </div>
            <div className="text-sm">
              <span className="font-medium">Overall change: </span>
              <span className={result.significantlyModified ? "text-orange-600 font-semibold" : "text-green-600"}>
                {result.percentageChange?.toFixed(1) || '0'}%
                {result.significantlyModified && " (Significant)"}
              </span>
            </div>
          </div>
        )}

        {/* Text Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{result.wordCount || 0}</div>
            <div className="text-xs text-gray-600">Words</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{result.sentenceCount || 0}</div>
            <div className="text-xs text-gray-600">Sentences</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{result.avgWordsPerSentence?.toFixed(1) || '0'}</div>
            <div className="text-xs text-gray-600">Avg Words/Sent</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{result.vocabularyRichness ? (result.vocabularyRichness * 100).toFixed(0) : 0}%</div>
            <div className="text-xs text-gray-600">Vocab Richness</div>
          </div>
        </div>

        {/* Writing Patterns */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Writing Patterns</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">AI Markers</span>
              {result.hasAIMarkers ? (
                <Badge variant="destructive" className="text-xs">Detected</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">None</Badge>
              )}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Personal Touch</span>
              {result.hasPersonalTouch ? (
                <Badge variant="default" className="text-xs bg-green-600">Yes</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">No</Badge>
              )}
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Formality</span>
              <Badge variant="secondary" className="text-xs">{result.formalityLevel || 'N/A'}</Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Sentence Variety</span>
              <Badge variant="secondary" className="text-xs">
                {result.sentenceVariation ? (result.sentenceVariation * 100).toFixed(0) : 0}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className={`p-4 rounded-lg ${
          result.aiLikelihood > 70 ? "bg-red-50 border border-red-200" :
          result.aiLikelihood > 50 ? "bg-yellow-50 border border-yellow-200" :
          "bg-green-50 border border-green-200"
        }`}>
          <div className="flex items-start gap-3">
            {result.aiLikelihood > 70 ? (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            ) : result.aiLikelihood > 50 ? (
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            )}
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Interpretation:</p>
              <p className="text-gray-700">
                {result.aiLikelihood > 70 && (
                  <>This content shows strong indicators of AI generation. It may have been primarily created by AI tools with minimal human editing.</>
                )}
                {result.aiLikelihood > 50 && result.aiLikelihood <= 70 && (
                  <>This content shows a mix of AI and human characteristics. It may be AI-refined human writing or heavily edited AI output.</>
                )}
                {result.aiLikelihood <= 50 && (
                  <>This content shows primarily human writing characteristics. While AI assistance may have been used, the work appears to be predominantly original student writing.</>
                )}
              </p>
              {stage === "final" && showComparison && result.significantlyModified && (
                <p className="text-gray-700 italic">
                  Note: Significant changes were made between draft and final submission, which may indicate AI refinement.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
