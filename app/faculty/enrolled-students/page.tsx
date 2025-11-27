"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Search, 
  Mail, 
  RefreshCw,
  Filter,
  UserCheck,
  Calendar
} from "lucide-react"

type EnrolledStudent = {
  studentId: string
  name: string
  email: string
  major: string
  year: number
  enrolledAt: string
}

type SubjectWithStudents = {
  id: string
  subjectId: string
  subjectCode: string
  name: string
  department: string
  credits: number
  assignedAt: string
  students: EnrolledStudent[]
  _count: {
    students: number
  }
}

export default function EnrolledStudentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subjects, setSubjects] = useState<SubjectWithStudents[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchEnrolledStudents()
    }
  }, [session])

  const fetchEnrolledStudents = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/faculty/enrolled-students")
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Get all unique students across all subjects
  const getAllStudents = () => {
    const studentMap = new Map<string, EnrolledStudent & { subjects: string[] }>()
    
    subjects.forEach(subject => {
      subject.students.forEach(student => {
        if (studentMap.has(student.studentId)) {
          const existing = studentMap.get(student.studentId)!
          existing.subjects.push(subject.name)
        } else {
          studentMap.set(student.studentId, {
            ...student,
            subjects: [subject.name]
          })
        }
      })
    })
    
    return Array.from(studentMap.values())
  }

  // Filter students based on search and subject filter
  const getFilteredStudents = () => {
    let students: (EnrolledStudent & { subjects?: string[] })[] = []
    
    if (selectedSubject === "all") {
      students = getAllStudents()
    } else {
      const subject = subjects.find(s => s.id === selectedSubject)
      if (subject) {
        students = subject.students.map(s => ({ ...s, subjects: [subject.name] }))
      }
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      students = students.filter(s => 
        s.name.toLowerCase().includes(search) ||
        s.studentId.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.major.toLowerCase().includes(search)
      )
    }
    
    return students
  }

  const totalStudents = getAllStudents().length
  const filteredStudents = getFilteredStudents()

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enrolled students...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Enrolled Students</h1>
          <p className="text-gray-600 mt-1">
            Students enrolled in your subjects
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchEnrolledStudents}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{totalStudents}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Across all your subjects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Your Subjects</CardDescription>
            <CardTitle className="text-3xl">{subjects.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Currently teaching</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription>Avg Students/Subject</CardDescription>
            <CardTitle className="text-3xl">
              {subjects.length > 0 
                ? Math.round(subjects.reduce((acc, s) => acc + s.students.length, 0) / subjects.length)
                : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Per subject average</p>
          </CardContent>
        </Card>
      </div>

      {subjects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Assigned</h3>
            <p className="text-gray-600 mb-4">
              You haven't been assigned any subjects yet. Add subjects to see enrolled students.
            </p>
            <Button onClick={() => router.push("/faculty/subjects")}>
              <BookOpen className="h-4 w-4 mr-2" />
              Add Subjects
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="by-subject" className="space-y-4">
          <TabsList>
            <TabsTrigger value="by-subject">By Subject</TabsTrigger>
            <TabsTrigger value="all-students">All Students</TabsTrigger>
          </TabsList>

          <TabsContent value="by-subject" className="space-y-4">
            {subjects.map(subject => (
              <Card key={subject.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{subject.subjectCode}</Badge>
                        <Badge>{subject.department}</Badge>
                        <Badge variant="secondary">{subject.credits} Credits</Badge>
                      </div>
                      <CardTitle className="text-xl">{subject.name}</CardTitle>
                      <CardDescription>
                        {subject.students.length} student{subject.students.length !== 1 ? 's' : ''} enrolled
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-500">
                        Assigned {new Date(subject.assignedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {subject.students.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No students enrolled in this subject yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Major</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {subject.students.map(student => (
                            <tr key={student.studentId} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {student.studentId}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-medium text-xs">
                                      {student.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  {student.name}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                <a href={`mailto:${student.email}`} className="hover:text-blue-600 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {student.email}
                                </a>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{student.major}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">Year {student.year}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(student.enrolledAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="all-students" className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, ID, email, or major..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.subjectCode} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {selectedSubject === "all" ? "All Enrolled Students" : "Filtered Students"}
                </CardTitle>
                <CardDescription>
                  Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredStudents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No students found matching your criteria.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Major</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subjects</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredStudents.map(student => (
                          <tr key={student.studentId} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {student.studentId}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-xs">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                {student.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <a href={`mailto:${student.email}`} className="hover:text-blue-600 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {student.email}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{student.major}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">Year {student.year}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {student.subjects?.map((subj, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {subj}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
