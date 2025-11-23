"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle, Lock } from "lucide-react"
import { formatDate, getDueDateStatus } from "@/lib/utils"
import Link from "next/link"

type Assignment = {
  id: string
  assignmentId: string
  title: string
  description: string
  type: string
  dueDate: string
  aiAllowed: boolean
  aiLockedUntilDraft: boolean
  faculty: {
    name: string
    major: string
  }
  submissions: Array<{
    id: string
    status: string
    finalScore: number
    submissionDate: string
  }>
}

export default function AssignmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        console.log('Fetching assignments for student...')
        const response = await fetch("/api/assignments")
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Assignments received:', data.length || 0, 'assignments')
          console.log('Assignment data:', data)
          setAssignments(data)
        } else {
          const error = await response.json()
          console.error('Failed to fetch assignments:', error)
        }
      } catch (error) {
        console.error("Failed to fetch assignments:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchAssignments()
    }
    
    // Refresh when page regains focus
    const handleFocus = () => {
      if (session) {
        fetchAssignments()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [session])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    )
  }

  const getFilteredAssignments = () => {
    const now = new Date()
    
    switch (filter) {
      case "upcoming":
        // Show assignments with future due dates
        return assignments.filter(a => new Date(a.dueDate) > now)
      case "in-progress":
        // Show assignments with draft submissions
        return assignments.filter(a => 
          a.submissions.length > 0 && a.submissions[0].status === "Draft"
        )
      case "completed":
        // Show assignments with submitted/graded work
        return assignments.filter(a => 
          a.submissions.length > 0 && 
          (a.submissions[0].status === "Submitted" || a.submissions[0].status === "Graded")
        )
      case "overdue":
        // Show assignments past due date without submission
        return assignments.filter(a => 
          new Date(a.dueDate) < now && 
          (a.submissions.length === 0 || a.submissions[0].status === "Draft")
        )
      case "all":
      default:
        // Show ALL assignments for the student
        return assignments
    }
  }

  const filteredAssignments = getFilteredAssignments()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
              <p className="text-gray-600 mt-1">
                {filteredAssignments.length} {filter === "all" ? "total" : filter} assignments
              </p>
            </div>
            <Link href="/student/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-64 bg-white">
              <SelectValue placeholder="Filter assignments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assignments Grid */}
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No assignments found
              </h3>
              <p className="text-gray-600">
                {filter === "all" 
                  ? "Your instructor hasn't posted any assignments yet."
                  : `You don't have any ${filter} assignments.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredAssignments.map((assignment) => {
              const submission = assignment.submissions[0]
              const dueDateInfo = getDueDateStatus(assignment.dueDate)
              const isOverdue = dueDateInfo.status === "overdue" && !submission

              return (
                <Card 
                  key={assignment.id} 
                  className={`hover:shadow-lg transition-shadow ${
                    isOverdue ? "border-red-300" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <CardTitle className="text-xl">{assignment.title}</CardTitle>
                        </div>
                        <CardDescription className="text-base mt-2">
                          {assignment.description}
                        </CardDescription>
                      </div>
                      {submission ? (
                        <Badge variant="default" className="ml-4">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {submission.status}
                        </Badge>
                      ) : isOverdue ? (
                        <Badge variant="destructive" className="ml-4">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-4">
                          Not Started
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p className={`text-sm font-medium ${dueDateInfo.color}`}>
                            {formatDate(assignment.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="text-sm font-medium">{assignment.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Instructor</p>
                          <p className="text-sm font-medium">{assignment.faculty.name}</p>
                        </div>
                      </div>
                    </div>

                    {assignment.aiLockedUntilDraft && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-900">
                          <Lock className="h-3 w-3 inline mr-1" />
                          AI assistant available after you submit your draft work
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/student/assignments/${assignment.assignmentId}`} className="flex-1">
                        <Button className="w-full">
                          {submission 
                            ? (submission.status === "Draft" ? "Continue Assignment" : "View Submission")
                            : "Start Assignment"}
                        </Button>
                      </Link>
                      
                      {/* Show resubmit option for submitted assignments before due date */}
                      {submission && submission.status === "Submitted" && new Date(assignment.dueDate) > new Date() && (
                        <Link href={`/student/assignments/${assignment.assignmentId}?resubmit=true`}>
                          <Button variant="outline" className="whitespace-nowrap">
                            Resubmit
                          </Button>
                        </Link>
                      )}
                      
                      {submission && submission.status !== "Draft" && (
                        <Button variant="outline" size="icon">
                          <span className="text-sm font-semibold">
                            {submission.finalScore ? `${submission.finalScore}%` : "—"}
                          </span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
