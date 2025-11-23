"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function GradingPage() {
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([])
  const [gradedToday, setGradedToday] = useState(0)
  const [avgTimePerGrade, setAvgTimePerGrade] = useState<number | null>(null)

  useEffect(() => {
    fetchPendingSubmissions()
    fetchGradedToday()
    
    // Refresh when window gains focus (user returns from grading page)
    const handleFocus = () => {
      fetchPendingSubmissions()
      fetchGradedToday()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchPendingSubmissions = async () => {
    try {
      const response = await fetch('/api/faculty/submissions?status=Submitted')
      if (response.ok) {
        const data = await response.json()
        // Transform to match expected format
        const pending = data.submissions.map((sub: any) => ({
          id: sub.submissionId,
          student: sub.student,
          assignment: sub.assignment,
          submittedAt: sub.submittedAt,
          aiDetected: sub.aiDetected,
          priority: sub.aiDetected > 80 ? 'urgent' : sub.aiDetected > 50 ? 'high' : 'normal'
        }))
        setPendingSubmissions(pending)
      }
    } catch (error) {
      console.error("Error fetching pending submissions:", error)
      setPendingSubmissions([])
    }
  }

  const fetchGradedToday = async () => {
    try {
      const response = await fetch('/api/faculty/graded-today')
      if (response.ok) {
        const data = await response.json()
        setGradedToday(data.count)
        setAvgTimePerGrade(data.avgTimeMinutes)
      }
    } catch (error) {
      console.error("Error fetching graded today:", error)
      setGradedToday(0)
      setAvgTimePerGrade(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grading Queue</h1>
        <p className="text-muted-foreground mt-2">
          {pendingSubmissions.length} submissions awaiting your review
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Graded Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradedToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Time per Grade
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgTimePerGrade !== null ? `${avgTimePerGrade}m` : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions to Grade</CardTitle>
          <CardDescription>Ordered by submission time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{submission.student}</p>
                    {submission.priority === "urgent" && (
                      <Badge variant="destructive" className="text-xs">Urgent</Badge>
                    )}
                    {submission.priority === "high" && (
                      <Badge variant="default" className="text-xs">High Priority</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{submission.assignment}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted {formatDate(submission.submittedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={submission.aiDetected > 70 ? "destructive" : "outline"}>
                    {submission.aiDetected}% AI
                  </Badge>
                  <Link href={`/faculty/grading/${submission.id}`}>
                    <Button>Start Grading</Button>
                  </Link>
                </div>
              </div>
            ))}

            {pendingSubmissions.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-muted-foreground mt-2">
                  No submissions pending review at this time.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
