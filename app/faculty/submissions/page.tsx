"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, BookOpen, FileText, GraduationCap } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

type Subject = {
  id: string
  subjectCode: string
  name: string
  department: string
}

type Submission = {
  id: string
  submissionId: string
  student: string
  studentId: string
  assignment: string
  assignmentType: string
  type: string
  subjectId?: string
  subject?: Subject
  submittedAt: string
  aiDetected: number
  status: string
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/faculty/submissions`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
        if (data.subjects) {
          setSubjects(data.subjects)
        }
      } else {
        console.error("Failed to fetch submissions")
        setSubmissions([])
      }
    } catch (error) {
      console.error("Error fetching submissions:", error)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  // Get submission count by subject
  const getSubjectSubmissionCount = (subjectId: string) => {
    return submissions.filter(s => s.subjectId === subjectId).length
  }

  // Filter submissions by subject, status, and search
  const filteredSubmissions = submissions.filter(sub => {
    // Filter by selected subject
    const matchesSubject = selectedSubject === "all" || sub.subjectId === selectedSubject
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    const matchesSearch = 
      sub.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.assignment.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSubject && matchesStatus && matchesSearch
  })

  if (loading && subjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
          <p className="text-muted-foreground mt-2">
            Review and grade student submissions by subject
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export All
        </Button>
      </div>

      {subjects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Subjects Assigned
            </h3>
            <p className="text-gray-600 mb-6">
              You need to select subjects you teach first to view submissions.
            </p>
            <Link href="/faculty/subjects">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Add Subjects
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Subject Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  My Subjects
                </CardTitle>
                <CardDescription>
                  Select a subject to view submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedSubject === "all" ? "default" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => setSelectedSubject("all")}
                >
                  <span>All Subjects</span>
                  <Badge variant="secondary">{submissions.length}</Badge>
                </Button>
                
                {subjects.map((subject) => (
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
                      {getSubjectSubmissionCount(subject.id)}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Submissions Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Selected Subject Header */}
            {selectedSubject !== "all" && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {subjects.find(s => s.id === selectedSubject)?.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {subjects.find(s => s.id === selectedSubject)?.subjectCode} • 
                        {subjects.find(s => s.id === selectedSubject)?.department}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by student or assignment..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Submissions</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="Graded">Graded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submissions Table */}
            {filteredSubmissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50 text-gray-400" />
                  <p className="text-lg font-medium">No submissions yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedSubject === "all" 
                      ? "No student submissions to review"
                      : "No submissions for this subject yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedSubject === "all" ? "All Submissions" : "Subject Submissions"} ({filteredSubmissions.length})
                  </CardTitle>
                  <CardDescription>
                    Click on a submission to review and grade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Assignment</TableHead>
                        {selectedSubject === "all" && <TableHead>Subject</TableHead>}
                        <TableHead>Type</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>AI Detection</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{submission.student}</p>
                              <p className="text-sm text-muted-foreground">{submission.studentId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {submission.assignment}
                          </TableCell>
                          {selectedSubject === "all" && (
                            <TableCell>
                              {submission.subject ? (
                                <Badge variant="outline" className="text-xs">
                                  {submission.subject.subjectCode}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge variant="outline">{submission.type || submission.assignmentType}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(submission.submittedAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={submission.aiDetected > 70 ? "destructive" : "outline"}
                            >
                              {submission.aiDetected}% AI
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                submission.status === "flagged" ? "destructive" :
                                submission.status === "Graded" || submission.status === "graded" ? "default" :
                                "secondary"
                              }
                            >
                              {submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link href={`/faculty/grading/${submission.id}`}>
                              <Button size="sm" variant={submission.status === "Graded" || submission.status === "graded" ? "outline" : "default"}>
                                {submission.status === "Graded" || submission.status === "graded" ? "View" : "Grade"}
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
