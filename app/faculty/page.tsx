"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Target
} from "lucide-react"
import Link from "next/link"

export default function FacultyDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingSubmissions: 0,
    avgAIUsage: 0,
    avgCreativity: 0,
  })

  const [recentSubmissions, setRecentSubmissions] = useState([])
  const [aiAlerts, setAiAlerts] = useState([])

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/faculty/dashboard')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats({
          totalStudents: statsData.totalStudents || 0,
          pendingSubmissions: statsData.pendingReviews || 0,
          avgAIUsage: statsData.aiUsageRate || 0,
          avgCreativity: statsData.avgCreativity || 0,
        })
      }

      // Fetch recent submissions (limit to 3)
      const submissionsResponse = await fetch('/api/faculty/submissions?status=Submitted&limit=3')
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        const formatted = submissionsData.submissions.slice(0, 3).map((sub: any) => ({
          id: sub.submissionId,
          student: sub.student,
          assignment: `${sub.assignment} - ${sub.major}`,
          submittedAt: formatTimeAgo(sub.submittedAt),
          aiDetected: Math.round((sub.aiDetected || 0)),
          status: sub.aiDetected > 80 ? "flagged" : "pending"
        }))
        setRecentSubmissions(formatted)
      }

      // Fetch AI detection alerts
      const alertsResponse = await fetch('/api/faculty/ai-detection')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        const topAlerts = alertsData.alerts.slice(0, 2).map((alert: any) => ({
          student: alert.student,
          assignment: alert.assignment.split(' - ')[0],
          confidence: alert.aiConfidence,
          type: alert.severity
        }))
        setAiAlerts(topAlerts)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Monitor student progress and AI usage patterns
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Grading
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Submissions awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg AI Usage
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgAIUsage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Class average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Creativity Score
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCreativity}/5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest student work requiring review</CardDescription>
              </div>
              <Link href="/faculty/submissions">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.map((submission: any) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{submission.student}</p>
                    <p className="text-sm text-muted-foreground">
                      {submission.assignment}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {submission.submittedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={submission.status === "flagged" ? "destructive" : "outline"}>
                      {submission.aiDetected}% AI
                    </Badge>
                    <Link href={`/faculty/grading/${submission.id}`}>
                      <Button size="sm">Grade</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Detection Alerts */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle>AI Detection Alerts</CardTitle>
            </div>
            <CardDescription>High confidence AI-generated content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiAlerts.map((alert: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-orange-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{alert.student}</p>
                    <p className="text-sm text-gray-600">{alert.assignment}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="bg-red-600">
                      {alert.confidence}% AI
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">High Confidence</p>
                  </div>
                </div>
              ))}
              
              <Link href="/faculty/ai-detection">
                <Button variant="outline" className="w-full mt-2">
                  View All Alerts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/faculty/grading">
              <Button className="w-full" variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Grade Submissions
              </Button>
            </Link>
            <Link href="/faculty/analytics">
              <Button className="w-full" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            <Link href="/faculty/students">
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Student List
              </Button>
            </Link>
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
