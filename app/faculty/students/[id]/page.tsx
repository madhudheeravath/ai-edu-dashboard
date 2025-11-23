"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, GraduationCap, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function StudentDetailPage() {
  const params = useParams()
  const [student, setStudent] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentDetails()
  }, [params.id])

  const fetchStudentDetails = async () => {
    try {
      const response = await fetch(`/api/faculty/student/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data.student)
        setSubmissions(data.submissions || [])
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching student details:", error)
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

  if (!student) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Not Found</CardTitle>
            <CardDescription>Unable to load student information</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/faculty/students">
              <Button>Back to Students</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/faculty/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground">{student.studentId}</p>
        </div>
      </div>

      {/* Student Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Year & Major
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Year {student.year}</div>
            <p className="text-sm text-muted-foreground">{student.major}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Prior GPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.priorGpa?.toFixed(2) || 'N/A'}</div>
            <p className="text-sm text-muted-foreground">
              {student.firstGen && <Badge variant="secondary">First Gen</Badge>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-sm text-muted-foreground">Total submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium break-all">{student.email}</div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions History */}
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>All submissions by this student</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AI Confidence</TableHead>
                <TableHead>Creativity</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No submissions yet
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub: any) => (
                  <TableRow key={sub.submissionId}>
                    <TableCell className="font-medium">{sub.assignmentType}</TableCell>
                    <TableCell>{new Date(sub.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        sub.status === 'Graded' ? 'default' : 
                        sub.status === 'Submitted' ? 'secondary' : 
                        'outline'
                      }>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.aiConfidence > 60 ? "destructive" : "outline"}>
                        {Math.round(sub.aiConfidence || 0)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.creativityScore ? `${sub.creativityScore.toFixed(1)}/5` : '-'}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        {sub.finalScore ? `${sub.finalScore.toFixed(1)}/5` : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {sub.status === 'Submitted' ? (
                        <Link href={`/faculty/grading/${sub.submissionId}`}>
                          <Button size="sm" variant="outline">Grade</Button>
                        </Link>
                      ) : (
                        <Link href={`/faculty/grading/${sub.submissionId}`}>
                          <Button size="sm" variant="ghost">View</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
