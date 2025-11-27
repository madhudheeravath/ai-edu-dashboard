"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, BookOpen, MessageSquare, BarChart3, LogOut } from "lucide-react"
import { ChatInterface } from "@/components/chat/chat-interface"

type RecentSubmission = {
  submissionId: string
  assignmentId: string
  title: string
  status: string
  finalScore: number
  timeHours: number
  submittedAt: string
}

type UpcomingAssignment = {
  assignmentId: string
  title: string
  type: string
  dueDate: string
  aiAllowed: boolean
}

type DashboardStats = {
  activeAssignments: number
  dueThisWeek: number
  completedAssignments: number
  avgCreativity: number
  aiUsagePercent: number
  totalAiHours: number
  aiHoursPerWeek: number
  reflectionsCount: number
  avgGrade: number
  totalSubmissions: number
  studentId: string
  recentSubmissions: RecentSubmission[]
  upcomingAssignments: UpcomingAssignment[]
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/student/dashboard")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const recentSubmissions = stats?.recentSubmissions ?? []
  const upcomingAssignments = stats?.upcomingAssignments ?? []
  const aiHoursPerWeek = stats?.aiHoursPerWeek ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {session.user?.name}!</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Welcome to Your Dashboard!
          </h2>
          <p className="text-gray-600">
            Track your assignments, AI usage, and learning progress all in one place.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Assignments</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? "..." : stats?.activeAssignments || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">
                {loading ? "Loading..." : `${stats?.dueThisWeek || 0} due this week`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Creativity Score</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? "..." : stats?.avgCreativity || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">
                Average across {stats?.totalSubmissions || 0} submissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>AI Usage</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? "..." : `${stats?.aiUsagePercent || 0}%`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">
                {loading ? "Loading..." : `${stats?.totalSubmissions || 0} submissions this semester`}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Reflections</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? "..." : stats?.reflectionsCount || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">This semester</p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/student/subjects" className="block">
            <Card className="border-2 border-indigo-200 hover:border-indigo-400 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>My Subjects</CardTitle>
                <CardDescription>
                  Enroll in subjects and view your current courses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">Manage Subjects</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/assignments" className="block">
            <Card className="border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>
                  View and submit your assignments. Track deadlines and manage submissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">View Assignments</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/analytics" className="block">
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Track your creativity scores, AI usage, and learning progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Analytics</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* AI Assistant directly on the dashboard */}
        <div className="mt-8">
          <ChatInterface
            assignmentTitle="Your coursework"
            assignmentDescription="Use this assistant to get help with ideas, structure, and feedback on any of your assignments."
          />
        </div>

        {/* Recent submissions and upcoming assignments */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions (Last 6 Weeks)</CardTitle>
              <CardDescription>Your most recent work</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : recentSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {recentSubmissions.map((sub) => (
                    <div
                      key={sub.submissionId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium line-clamp-1">{sub.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(sub.submittedAt).toLocaleDateString()} • {sub.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Final Score</p>
                        <p className="font-semibold">
                          {sub.finalScore > 0 ? sub.finalScore.toFixed(1) : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No submissions in the last 6 weeks yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>What&apos;s coming up next</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : upcomingAssignments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAssignments.map((a) => (
                    <div
                      key={a.assignmentId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium line-clamp-1">{a.title}</p>
                        <p className="text-xs text-gray-500">
                          Due {new Date(a.dueDate).toLocaleDateString()} • {a.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {a.aiAllowed ? "AI Allowed" : "AI Locked"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming assignments.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and helpful links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Link href="/student/subjects" className="block">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <span className="text-sm">My Subjects</span>
                </Button>
              </Link>
              <Link href="/student/assignments" className="block">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm">Browse Assignments</span>
                </Button>
              </Link>
              <Link href="/student/analytics" className="block">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-sm">View Analytics</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => window.location.href = '/student/assignments'}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm">Get AI Help</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
