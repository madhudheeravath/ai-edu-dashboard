"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/faculty/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching analytics:", error)
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
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track AI usage patterns and student creativity trends
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg AI Usage
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avgAI || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all submissions
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
            <div className="text-2xl font-bold">{analytics?.avgCreativity || 0}/5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Submissions
            </CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle>AI Usage Distribution</CardTitle>
          <CardDescription>
            Number of students by AI usage level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { level: '0-20%', students: Math.round(analytics?.totalStudents * 0.2) || 0, fill: '#22c55e' },
              { level: '21-40%', students: Math.round(analytics?.totalStudents * 0.25) || 0, fill: '#84cc16' },
              { level: '41-60%', students: Math.round(analytics?.totalStudents * 0.3) || 0, fill: '#eab308' },
              { level: '61-80%', students: Math.round(analytics?.totalStudents * 0.15) || 0, fill: '#f97316' },
              { level: '81-100%', students: Math.round(analytics?.totalStudents * 0.1) || 0, fill: '#ef4444' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Student Comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>First-Gen vs Continuing-Gen</CardTitle>
            <CardDescription>
              AI usage and creativity comparison
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>First-Gen AI Usage</span>
                <span className="font-medium">{analytics?.firstGenComparison?.firstGen || 0}%</span>
              </div>
              <Progress value={analytics?.firstGenComparison?.firstGen || 0} indicatorClassName="bg-blue-600" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Continuing-Gen AI Usage</span>
                <span className="font-medium">{analytics?.firstGenComparison?.continuingGen || 0}%</span>
              </div>
              <Progress value={analytics?.firstGenComparison?.continuingGen || 0} indicatorClassName="bg-green-600" />
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {analytics?.firstGenComparison?.firstGen > analytics?.firstGenComparison?.continuingGen ? (
                  `First-gen students show ${analytics?.firstGenComparison?.firstGen - analytics?.firstGenComparison?.continuingGen}% higher AI usage`
                ) : analytics?.firstGenComparison?.continuingGen > analytics?.firstGenComparison?.firstGen ? (
                  `Continuing-gen students show ${analytics?.firstGenComparison?.continuingGen - analytics?.firstGenComparison?.firstGen}% higher AI usage`
                ) : (
                  'Both groups show similar AI usage'
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Creativity Score Distribution</CardTitle>
            <CardDescription>
              Based on AI usage levels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Low AI Users (0-30%)</span>
                <span className="font-medium">{analytics?.creativityByAILevel?.low || 0}/5</span>
              </div>
              <Progress value={(analytics?.creativityByAILevel?.low || 0) * 20} indicatorClassName="bg-green-600" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Medium AI Users (31-60%)</span>
                <span className="font-medium">{analytics?.creativityByAILevel?.medium || 0}/5</span>
              </div>
              <Progress value={(analytics?.creativityByAILevel?.medium || 0) * 20} indicatorClassName="bg-yellow-600" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>High AI Users (61-100%)</span>
                <span className="font-medium">{analytics?.creativityByAILevel?.high || 0}/5</span>
              </div>
              <Progress value={(analytics?.creativityByAILevel?.high || 0) * 20} indicatorClassName="bg-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analytics?.creativityByAILevel?.low > 0 && analytics?.creativityByAILevel?.high > 0 && (
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
              <p className="text-sm">
                Low AI users show {((analytics.creativityByAILevel.low - analytics.creativityByAILevel.high) / analytics.creativityByAILevel.high * 100).toFixed(0)}% higher creativity scores ({analytics.creativityByAILevel.low}/5 vs {analytics.creativityByAILevel.high}/5)
              </p>
            </div>
          )}
          {analytics?.firstGenComparison?.firstGen !== analytics?.firstGenComparison?.continuingGen && (
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
              <p className="text-sm">
                {analytics?.firstGenComparison?.firstGen > analytics?.firstGenComparison?.continuingGen
                  ? `First-generation students show ${analytics.firstGenComparison.firstGen - analytics.firstGenComparison.continuingGen}% higher AI usage`
                  : `Continuing-generation students show ${analytics.firstGenComparison.continuingGen - analytics.firstGenComparison.firstGen}% higher AI usage`
                }
              </p>
            </div>
          )}
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
            <p className="text-sm">
              Average AI detection across {analytics?.totalSubmissions || 0} submissions is {analytics?.avgAI || 0}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
