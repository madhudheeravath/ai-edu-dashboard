"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  TrendingUp, 
  Brain, 
  Bot, 
  FileText, 
  Target,
  Award,
  Sparkles
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

type AnalyticsData = {
  studentId: string
  totalSubmissions: number
  completedAssignments: number
  avgCreativity: number
  avgGrade: number
  aiUsagePercent: number
  totalAiHours: number
  reflectionsCount: number
  assignments: Array<{
    assignmentId: string
    title: string
    creativityScore: number
    finalScore: number
    usesAi: boolean
    aiConfidence: number
    submissionDate: string
  }>
  aiUsageByAssignment: Array<{
    title: string
    aiLikelihood: number
    humanLikelihood: number
  }>
}

const COLORS = {
  primary: '#6366f1',
  purple: '#a855f7',
  green: '#22c55e',
  blue: '#3b82f6',
  orange: '#f97316',
  red: '#ef4444',
  yellow: '#eab308',
  gradient1: '#8b5cf6',
  gradient2: '#ec4899'
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/student/analytics")
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          setError("Failed to load analytics data")
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
        setError("An error occurred while loading analytics")
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchAnalytics()
    }
  }, [session])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <span>⚠️</span> Error Loading Analytics
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/student/dashboard">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session || !analytics) {
    return null
  }

  const completionRate = analytics.totalSubmissions > 0 
    ? (analytics.completedAssignments / analytics.totalSubmissions) * 100 
    : 0

  // Prepare chart data
  const performanceData = analytics.assignments.map((a, idx) => ({
    name: `A${idx + 1}`,
    creativity: a.creativityScore,
    grade: a.finalScore,
    fullName: a.title
  }))

  const pieData = [
    { name: 'AI Content', value: analytics.aiUsagePercent, color: COLORS.red },
    { name: 'Human Content', value: 100 - analytics.aiUsagePercent, color: COLORS.green }
  ]

  const radialData = [
    { name: 'Creativity', value: (analytics.avgCreativity / 5) * 100, fill: COLORS.purple },
    { name: 'Grade', value: analytics.avgGrade, fill: COLORS.green },
    { name: 'Completion', value: completionRate, fill: COLORS.blue }
  ]

  const aiDetectionData = analytics.aiUsageByAssignment.map((item, idx) => ({
    name: `A${idx + 1}`,
    ai: item.aiLikelihood,
    human: item.humanLikelihood,
    fullName: item.title
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/student/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-purple-100">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-600">Track your learning journey</p>
              </div>
            </div>
            <Link href="/student/dashboard">
              <Button variant="outline" className="border-purple-200 hover:bg-purple-50">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Radial Performance Gauges */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5" />
                Creativity Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <div className="relative">
                  <svg className="w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="white"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(analytics.avgCreativity / 5) * 351.68} 351.68`}
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{(analytics.avgCreativity || 0).toFixed(1)}</div>
                      <div className="text-xs opacity-90">out of 5.0</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="h-5 w-5" />
                Average Grade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <div className="relative">
                  <svg className="w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="white"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(analytics.avgGrade / 100) * 351.68} 351.68`}
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{(analytics.avgGrade || 0).toFixed(0)}%</div>
                      <div className="text-xs opacity-90">overall</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <div className="relative">
                  <svg className="w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="12"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="white"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(completionRate / 100) * 351.68} 351.68`}
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{completionRate.toFixed(0)}%</div>
                      <div className="text-xs opacity-90">completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Trend Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Assignment Performance Trend
              </CardTitle>
              <CardDescription>Creativity and grades over time</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorCreativity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.green} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="creativity" 
                      stroke={COLORS.purple} 
                      fillOpacity={1} 
                      fill="url(#colorCreativity)" 
                      name="Creativity"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="grade" 
                      stroke={COLORS.green} 
                      fillOpacity={1} 
                      fill="url(#colorGrade)" 
                      name="Grade"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No assignment data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI vs Human Content Pie Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                AI vs Human Content
              </CardTitle>
              <CardDescription>Overall content composition</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* AI Detection Bar Chart */}
        {aiDetectionData.length > 0 && (
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-red-600" />
                AI Detection by Assignment
              </CardTitle>
              <CardDescription>Breakdown of AI vs Human content per assignment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aiDetectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ai" fill={COLORS.red} name="AI Content %" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="human" fill={COLORS.green} name="Human Content %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Total Assignments</p>
                  <p className="text-3xl font-bold text-orange-700">{analytics.totalSubmissions}</p>
                </div>
                <FileText className="h-12 w-12 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">AI Usage</p>
                  <p className="text-3xl font-bold text-blue-700">{(analytics.aiUsagePercent || 0).toFixed(0)}%</p>
                </div>
                <Bot className="h-12 w-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Reflections</p>
                  <p className="text-3xl font-bold text-purple-700">{analytics.reflectionsCount || 0}</p>
                </div>
                <FileText className="h-12 w-12 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Completed</p>
                  <p className="text-3xl font-bold text-green-700">{analytics.completedAssignments}</p>
                </div>
                <Target className="h-12 w-12 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              💡 Personalized Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {(analytics.avgCreativity || 0) < 3 && (
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-purple-700">Boost Creativity:</strong>
                    <p className="text-gray-600 mt-1">Try brainstorming multiple solutions before starting. Use the AI assistant for inspiration, not direct answers.</p>
                  </div>
                </li>
              )}
              {(analytics.aiUsagePercent || 0) > 70 && (
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Bot className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-blue-700">Balance AI Usage:</strong>
                    <p className="text-gray-600 mt-1">You're using AI frequently. Make sure to add your personal insights and understanding to maintain originality.</p>
                  </div>
                </li>
              )}
              {completionRate < 70 && (
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Target className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-orange-700">Complete More Assignments:</strong>
                    <p className="text-gray-600 mt-1">Your completion rate is {completionRate.toFixed(0)}%. Try to submit all assignments before the deadline.</p>
                  </div>
                </li>
              )}
              {(analytics.avgGrade || 0) < 70 && (
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Award className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-green-700">Improve Quality:</strong>
                    <p className="text-gray-600 mt-1">Focus on understanding the assignment requirements thoroughly. Use the reflection step to learn from feedback.</p>
                  </div>
                </li>
              )}
              {(analytics.avgCreativity || 0) >= 3 && (analytics.avgGrade || 0) >= 70 && completionRate >= 70 && (analytics.aiUsagePercent || 0) <= 70 && (
                <li className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <Award className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="text-green-700">🎉 Great Job!</strong>
                    <p className="text-gray-600 mt-1">You're maintaining excellent performance across all metrics. Keep up the good work!</p>
                  </div>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
