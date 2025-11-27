"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, BarChart3, Shield, LogOut, RefreshCw } from "lucide-react"
import Link from "next/link"

type DashboardStats = {
  totalStudents: number
  totalCourses: number
  pendingReviews: number
  dueThisWeek: number
  avgCreativity: number
  aiUsageRate: number
  gradedSubmissions: number
  avgGrade: number
  totalSubmissions: number
  facultyId: string
  facultyName: string
}

export default function FacultyDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!session) return
    
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/faculty/dashboard")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (session) {
      fetchStats()
    }
  }, [session])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      fetchStats()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {session.user?.name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchStats}
                disabled={isRefreshing}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Updating...' : 'Refresh'}
              </Button>
              <span className="text-xs text-gray-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        {loading ? (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardDescription>Total Students</CardDescription>
                <CardTitle className="text-3xl">{stats.totalStudents}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">
                  Across {stats.totalCourses} course{stats.totalCourses !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <CardDescription>Pending Reviews</CardDescription>
                <CardTitle className="text-3xl">{stats.pendingReviews}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-orange-600 font-medium">
                  {stats.dueThisWeek} due this week
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardDescription>Avg Creativity</CardDescription>
                <CardTitle className="text-3xl">{stats.avgCreativity.toFixed(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-green-600 font-medium">
                  Based on {stats.gradedSubmissions} graded submissions
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardDescription>AI Usage Rate</CardDescription>
                <CardTitle className="text-3xl">{stats.aiUsageRate}%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">Class average</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link href="/faculty/subjects">
            <Card className="border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>My Subjects</CardTitle>
                <CardDescription>
                  Manage the subjects you teach and view enrolled students.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/faculty/assignments">
            <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Assignments</CardTitle>
                <CardDescription>
                  Create and manage assignments. Set AI usage policies and deadlines.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/faculty/analytics">
            <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Monitor student performance, AI usage patterns, and creativity trends.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/faculty/grading">
            <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Grading</CardTitle>
                <CardDescription>
                  Review submissions with rubric-based grading and AI detection insights.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
