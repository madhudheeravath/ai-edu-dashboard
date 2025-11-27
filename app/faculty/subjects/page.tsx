"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SubjectSelector } from "@/components/subject-selector"
import { Users, BookOpen, GraduationCap, Edit2, CheckCircle, Plus } from "lucide-react"

type AssignedSubject = {
  id: string
  subjectId: string
  assignedAt: string
  subject: {
    id: string
    subjectCode: string
    name: string
    description: string | null
    credits: number
    department: string
    semester: number
    students: {
      student: {
        studentId: string
        name: string
        email: string
      }
    }[]
    _count: {
      students: number
      assignments: number
    }
  }
}

export default function FacultySubjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchAssignedSubjects()
    }
  }, [session])

  const fetchAssignedSubjects = async () => {
    try {
      const response = await fetch("/api/faculty/subjects")
      if (response.ok) {
        const data = await response.json()
        setAssignedSubjects(data)
        // If no subjects assigned, show the selector
        if (data.length === 0) {
          setIsEditing(true)
        }
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectionComplete = () => {
    setIsEditing(false)
    fetchAssignedSubjects()
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Subjects</h1>
          <p className="text-gray-600 mt-1">Manage subjects you teach</p>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {isEditing ? (
          <div className="max-w-6xl">
            <SubjectSelector 
              userRole="faculty"
              onSelectionComplete={handleSelectionComplete}
              initialSelected={assignedSubjects.map(a => a.subjectId)}
            />
            {assignedSubjects.length > 0 && (
              <div className="mt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Subjects You Teach
                </h2>
                <p className="text-gray-600">
                  You are teaching {assignedSubjects.length} subject(s)
                </p>
              </div>
              <Button onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
                <Edit2 className="h-4 w-4 mr-2" />
                Change Subjects
              </Button>
            </div>

            {/* Assigned Subjects Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {assignedSubjects.map((assignment) => (
                <Card key={assignment.id} className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{assignment.subject.subjectCode}</Badge>
                          <Badge>{assignment.subject.credits} Credits</Badge>
                          <Badge variant="secondary">{assignment.subject.department}</Badge>
                        </div>
                        <CardTitle className="text-xl">{assignment.subject.name}</CardTitle>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {assignment.subject.description || "No description available"}
                    </CardDescription>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <span>
                          <strong>{assignment.subject._count.students}</strong> students enrolled
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span>
                          <strong>{assignment.subject._count.assignments}</strong> assignments
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Student List Preview */}
                    {assignment.subject.students && assignment.subject.students.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">Recent Students</h4>
                        <div className="space-y-1">
                          {assignment.subject.students.slice(0, 3).map(({ student }) => (
                            <div key={student.studentId} className="text-xs text-gray-600">
                              {student.name} ({student.studentId})
                            </div>
                          ))}
                          {assignment.subject.students.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{assignment.subject.students.length - 3} more students
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link href={`/faculty/assignments?subject=${assignment.subject.subjectCode}`}>
                        <Button variant="outline" className="w-full" size="sm">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Assignments
                        </Button>
                      </Link>
                      <Link href={`/faculty/students?subject=${assignment.subject.subjectCode}`}>
                        <Button variant="outline" className="w-full" size="sm">
                          <Users className="h-4 w-4 mr-1" />
                          Students
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {assignedSubjects.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Subjects Assigned</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't selected any subjects to teach yet. Click below to get started.
                  </p>
                  <Button onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
                    Select Subjects to Teach
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            {assignedSubjects.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link href="/faculty/assignments">
                    <Card className="hover:bg-purple-50 cursor-pointer transition-colors">
                      <CardContent className="flex items-center gap-3 py-4">
                        <Plus className="h-5 w-5 text-purple-600" />
                        <span>Create New Assignment</span>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/faculty/enrolled-students">
                    <Card className="hover:bg-purple-50 cursor-pointer transition-colors">
                      <CardContent className="flex items-center gap-3 py-4">
                        <Users className="h-5 w-5 text-purple-600" />
                        <span>View Enrolled Students</span>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/faculty/analytics">
                    <Card className="hover:bg-purple-50 cursor-pointer transition-colors">
                      <CardContent className="flex items-center gap-3 py-4">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                        <span>View Analytics</span>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
