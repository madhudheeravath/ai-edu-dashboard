"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SubjectSelector } from "@/components/subject-selector"
import { GraduationCap, BookOpen, Users, ArrowLeft, LogOut, Edit2, CheckCircle } from "lucide-react"

type EnrolledSubject = {
  id: string
  subjectId: string
  enrolledAt: string
  subject: {
    id: string
    subjectCode: string
    name: string
    description: string | null
    credits: number
    department: string
    semester: number
    faculty: {
      faculty: {
        facultyId: string
        name: string
      }
    }[]
    _count: {
      assignments: number
    }
  }
}

export default function StudentSubjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [enrolledSubjects, setEnrolledSubjects] = useState<EnrolledSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchEnrolledSubjects()
    }
  }, [session])

  const fetchEnrolledSubjects = async () => {
    try {
      const response = await fetch("/api/student/subjects")
      if (response.ok) {
        const data = await response.json()
        setEnrolledSubjects(data)
        // If no subjects enrolled, show the selector
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
    fetchEnrolledSubjects()
  }

  if (status === "loading" || loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/student/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>
              <p className="text-sm text-gray-600">Manage your enrolled subjects</p>
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
        {isEditing ? (
          <div className="max-w-6xl mx-auto">
            <SubjectSelector 
              userRole="student"
              onSelectionComplete={handleSelectionComplete}
              initialSelected={enrolledSubjects.map(e => e.subjectId)}
            />
            {enrolledSubjects.length > 0 && (
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
                <h2 className="text-3xl font-bold text-gray-900">
                  Your Enrolled Subjects
                </h2>
                <p className="text-gray-600">
                  You are currently enrolled in {enrolledSubjects.length} subject(s)
                </p>
              </div>
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Change Subjects
              </Button>
            </div>

            {/* Enrolled Subjects Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {enrolledSubjects.map((enrollment) => (
                <Card key={enrollment.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{enrollment.subject.subjectCode}</Badge>
                          <Badge>{enrollment.subject.credits} Credits</Badge>
                          <Badge variant="secondary">{enrollment.subject.department}</Badge>
                        </div>
                        <CardTitle className="text-xl">{enrollment.subject.name}</CardTitle>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {enrollment.subject.description || "No description available"}
                    </CardDescription>
                    
                    <div className="space-y-2 text-sm">
                      {enrollment.subject.faculty && enrollment.subject.faculty.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>
                            <strong>Faculty:</strong>{" "}
                            {enrollment.subject.faculty.map(f => f.faculty.name).join(", ")}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span>
                          <strong>{enrollment.subject._count.assignments}</strong> assignments
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Link href={`/student/assignments?subject=${enrollment.subject.subjectCode}`}>
                        <Button variant="outline" className="w-full">
                          View Assignments
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {enrolledSubjects.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <GraduationCap className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Subjects Enrolled</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't enrolled in any subjects yet. Click below to get started.
                  </p>
                  <Button onClick={() => setIsEditing(true)}>
                    Enroll in Subjects
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}
