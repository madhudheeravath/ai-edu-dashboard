"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle, Lock, GraduationCap, FileText } from "lucide-react"
import { formatDate, getDueDateStatus } from "@/lib/utils"
import Link from "next/link"

type Subject = {
  id: string
  subjectCode: string
  name: string
  department: string
}

type Assignment = {
  id: string
  assignmentId: string
  title: string
  description: string
  type: string
  dueDate: string
  aiAllowed: boolean
  aiLockedUntilDraft: boolean
  major: string
  subjectId?: string
  subject?: Subject
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
  const [enrolledSubjects, setEnrolledSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch enrolled subjects
        const subjectsRes = await fetch("/api/student/subjects")
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json()
          const subjects = subjectsData.map((s: any) => s.subject)
          setEnrolledSubjects(subjects)
        }

        // Fetch assignments
        const assignmentsRes = await fetch("/api/assignments")
        if (assignmentsRes.ok) {
          const assignmentsData = await assignmentsRes.json()
          setAssignments(assignmentsData)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchData()
    }
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

  // Filter assignments by subject and status
  const getFilteredAssignments = () => {
    let filtered = assignments

    // Filter by subject
    if (selectedSubject !== "all") {
      filtered = filtered.filter(a => a.subjectId === selectedSubject || a.subject?.id === selectedSubject)
    }

    // Filter by status
    const now = new Date()
    switch (statusFilter) {
      case "upcoming":
        filtered = filtered.filter(a => new Date(a.dueDate) > now)
        break
      case "in-progress":
        filtered = filtered.filter(a => 
          a.submissions.length > 0 && a.submissions[0].status === "Draft"
        )
        break
      case "completed":
        filtered = filtered.filter(a => 
          a.submissions.length > 0 && 
          (a.submissions[0].status === "Submitted" || a.submissions[0].status === "Graded")
        )
        break
      case "overdue":
        filtered = filtered.filter(a => 
          new Date(a.dueDate) < now && 
          (a.submissions.length === 0 || a.submissions[0].status === "Draft")
        )
        break
    }

    return filtered
  }

  const filteredAssignments = getFilteredAssignments()

  // Get assignment counts by subject
  const getSubjectAssignmentCount = (subjectId: string) => {
    return assignments.filter(a => a.subjectId === subjectId || a.subject?.id === subjectId).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
              <p className="text-gray-600 mt-1">
                View and manage assignments by subject
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
        {enrolledSubjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Subjects Enrolled
              </h3>
              <p className="text-gray-600 mb-6">
                You need to enroll in subjects first to view assignments.
              </p>
              <Link href="/student/subjects">
                <Button>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Enroll in Subjects
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Subject Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    My Subjects
                  </CardTitle>
                  <CardDescription>
                    Select a subject to view its assignments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant={selectedSubject === "all" ? "default" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setSelectedSubject("all")}
                  >
                    <span>All Subjects</span>
                    <Badge variant="secondary">{assignments.length}</Badge>
                  </Button>
                  
                  {enrolledSubjects.map((subject) => (
                    <Button
                      key={subject.id}
                      variant={selectedSubject === subject.id ? "default" : "ghost"}
                      className="w-full justify-between text-left h-auto py-3"
                      onClick={() => setSelectedSubject(subject.id)}
                    >
                      <div className="truncate text-left">
                        <span className="font-medium">{subject.subjectCode}</span>
                        <p className="text-xs opacity-70 truncate">{subject.name}</p>
                      </div>
                      <Badge variant="secondary">
                        {getSubjectAssignmentCount(subject.id)}
                      </Badge>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Assignments List */}
            <div className="lg:col-span-3 space-y-6">
              {/* Selected Subject Header */}
              {selectedSubject !== "all" && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {enrolledSubjects.find(s => s.id === selectedSubject)?.name}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {enrolledSubjects.find(s => s.id === selectedSubject)?.subjectCode} • 
                          {enrolledSubjects.find(s => s.id === selectedSubject)?.department}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Status Filter Tabs */}
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                </TabsList>

                <TabsContent value={statusFilter} className="mt-6">
                  {filteredAssignments.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No assignments found
                        </h3>
                        <p className="text-gray-600">
                          {selectedSubject === "all"
                            ? "No assignments match the selected filter."
                            : "No assignments for this subject yet."
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
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
                                  {/* Subject Badge */}
                                  {assignment.subject && selectedSubject === "all" && (
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {assignment.subject.subjectCode} - {assignment.subject.name}
                                      </Badge>
                                    </div>
                                  )}
                                  <CardDescription className="text-base mt-2 line-clamp-2">
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
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
