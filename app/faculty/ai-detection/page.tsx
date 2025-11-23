"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function AIDetectionPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [counts, setCounts] = useState({ critical: 0, high: 0, medium: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/faculty/ai-detection')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
        setCounts(data.counts || { critical: 0, high: 0, medium: 0 })
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching AI detection alerts:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Detection Alerts</h1>
        <p className="text-muted-foreground mt-2">
          Review submissions flagged with high AI confidence
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.critical}</div>
            <p className="text-xs text-muted-foreground mt-1">
              AI confidence &gt; 90%
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.high}</div>
            <p className="text-xs text-muted-foreground mt-1">
              AI confidence 70-90%
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Medium Priority
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.medium}</div>
            <p className="text-xs text-muted-foreground mt-1">
              AI confidence 50-70%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Flagged Submissions</CardTitle>
          <CardDescription>
            Submissions requiring manual review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <p className="text-lg font-medium">No High-Confidence AI Detections</p>
                <p className="text-sm mt-1">All submissions are below the 50% AI confidence threshold</p>
              </div>
            ) : (
              alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border-2 rounded-lg ${
                  alert.severity === "critical" ? "border-red-300 bg-red-50" :
                  alert.severity === "high" ? "border-orange-300 bg-orange-50" :
                  "border-yellow-300 bg-yellow-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`h-5 w-5 ${
                        alert.severity === "critical" ? "text-red-600" :
                        alert.severity === "high" ? "text-orange-600" :
                        "text-yellow-600"
                      }`} />
                      <h3 className="font-semibold">{alert.student}</h3>
                      <Badge variant={
                        alert.severity === "critical" ? "destructive" :
                        alert.severity === "high" ? "default" :
                        "secondary"
                      }>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{alert.assignment}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Student ID: {alert.studentId}</span>
                      <span>•</span>
                      <span>Submitted {formatDate(alert.submittedAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold mb-1 ${
                      alert.severity === "critical" ? "text-red-600" :
                      alert.severity === "high" ? "text-orange-600" :
                      "text-yellow-600"
                    }`}>
                      {alert.aiConfidence}%
                    </div>
                    <p className="text-xs text-gray-600 mb-3">AI Confidence</p>
                    <Link href={`/faculty/grading/${alert.id}`}>
                      <Button size="sm">Review Now</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detection Info */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle>About AI Detection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Detection Method:</strong> DetectGPT with GPT-2 perplexity analysis
          </p>
          <p>
            <strong>Confidence Levels:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Critical (90-100%):</strong> Very high confidence of AI generation</li>
            <li><strong>High (70-89%):</strong> Strong indicators of AI assistance</li>
            <li><strong>Medium (50-69%):</strong> Mixed AI and human characteristics</li>
            <li><strong>Low (&lt;50%):</strong> Primarily human-written</li>
          </ul>
          <p className="pt-2 border-t">
            <strong>Note:</strong> AI detection is a supportive tool. Always combine with your professional judgment and review the student's reflection on AI usage.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
