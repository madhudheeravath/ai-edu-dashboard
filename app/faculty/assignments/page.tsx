"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, FileText, Calendar, Users, BookOpen, GraduationCap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type Subject = {
  id: string
  subjectCode: string
  name: string
  department: string
}

type Assignment = {
  assignmentId: string
  title: string
  description: string
  type: string
  dueDate: string
  major: string
  year: number
  aiAllowed: boolean
  aiLockedUntilDraft: boolean
  subjectId?: string
  subject?: Subject
  submissionCount: number
}

export default function AssignmentsPage() {
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>("all")

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [major, setMajor] = useState("")
  const [year, setYear] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [aiAllowed, setAiAllowed] = useState(false)
  const [aiLockedUntilDraft, setAiLockedUntilDraft] = useState(false)

  useEffect(() => {
    fetchAssignments()
    fetchFacultySubjects()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/faculty/assignments')
      if (response.ok) {
        const data = await response.json()
        setAssignments(data.assignments || [])
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching assignments:", error)
      setLoading(false)
    }
  }

  const fetchFacultySubjects = async () => {
    try {
      const response = await fetch('/api/faculty/subjects')
      if (response.ok) {
        const data = await response.json()
        // Extract subjects from the faculty subjects response
        const subjectList = data.map((fs: any) => fs.subject)
        setSubjects(subjectList)
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  // Filter assignments by selected subject
  const getFilteredAssignments = () => {
    if (selectedSubject === "all") {
      return assignments
    }
    return assignments.filter(a => a.subjectId === selectedSubject || a.subject?.id === selectedSubject)
  }

  const filteredAssignments = getFilteredAssignments()

  // Get assignment count by subject
  const getSubjectAssignmentCount = (subjectId: string) => {
    return assignments.filter(a => a.subjectId === subjectId || a.subject?.id === subjectId).length
  }

  const handleCreateNew = () => {
    setEditingAssignment(null)
    setTitle("")
    setDescription("")
    setType("")
    setSubjectId(selectedSubject !== "all" ? selectedSubject : "")
    setMajor("")
    setYear("1")
    setDueDate("")
    setAiAllowed(true)
    setAiLockedUntilDraft(false)
    setShowDialog(true)
  }

  const handleEdit = (assignment: any) => {
    setEditingAssignment(assignment)
    setTitle(assignment.title)
    setDescription(assignment.description || "")
    setType(assignment.type)
    setSubjectId(assignment.subjectId || "")
    setMajor(assignment.major)
    setYear(String(assignment.year || "1"))
    setDueDate(new Date(assignment.dueDate).toISOString().split('T')[0])
    setAiAllowed(assignment.aiAllowed)
    setAiLockedUntilDraft(assignment.aiLockedUntilDraft)
    setShowDialog(true)
  }

  // Auto-fill major and year when subject is selected
  const handleSubjectChange = (value: string) => {
    setSubjectId(value)
    const selectedSubject = subjects.find(s => s.id === value)
    if (selectedSubject) {
      setMajor(selectedSubject.department)
    }
  }

  const handleSave = async () => {
    if (!title || !type || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    // Use subject's department if no major specified
    const assignmentMajor = major || (subjects.find(s => s.id === subjectId)?.department) || "General"
    const assignmentYear = parseInt(year) || 1

    setSaving(true)
    try {
      const url = editingAssignment
        ? `/api/faculty/assignments/${editingAssignment.assignmentId}`
        : '/api/faculty/assignments'
      
      const method = editingAssignment ? 'PUT' : 'POST'

      const requestData = {
        title,
        description,
        type,
        subjectId: subjectId || null,
        major: assignmentMajor,
        year: assignmentYear,
        dueDate,
        aiAllowed,
        aiLockedUntilDraft
      }

      console.log('Frontend sending assignment data:', requestData)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Assignment ${editingAssignment ? 'updated' : 'created'} successfully`
        })
        setShowDialog(false)
        fetchAssignments()
      } else {
        throw new Error('Failed to save assignment')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save assignment",
        variant: "destructive"
      })
    }
    setSaving(false)
  }

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return
    }

    try {
      const response = await fetch(`/api/faculty/assignments/${assignmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assignment deleted successfully"
        })
        fetchAssignments()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete assignment",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      })
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage assignments by subject
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
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
              You need to select subjects you teach first before creating assignments.
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
                  Select a subject to view assignments
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
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
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
                    <Button onClick={handleCreateNew}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Assignment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {selectedSubject === "all" ? "Total Assignments" : "Subject Assignments"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredAssignments.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredAssignments.reduce((sum, a) => sum + (a.submissionCount || 0), 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assignments Grid */}
            {filteredAssignments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50 text-gray-400" />
                  <p className="text-lg font-medium">No assignments yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedSubject === "all" 
                      ? "Create your first assignment to get started"
                      : "Create an assignment for this subject"}
                  </p>
                  <Button onClick={handleCreateNew} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredAssignments.map((assignment) => (
                  <Card key={assignment.assignmentId} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <Badge variant="outline">{assignment.type}</Badge>
                          </div>
                          {assignment.subject && selectedSubject === "all" && (
                            <Badge variant="secondary" className="mb-2">
                              {assignment.subject.subjectCode} - {assignment.subject.name}
                            </Badge>
                          )}
                          <CardDescription className="line-clamp-2">
                            {assignment.description || "No description provided"}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(assignment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(assignment.assignmentId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{assignment.submissionCount || 0} submissions</span>
                        </div>
                        <Badge>Year {assignment.year || 1}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </DialogTitle>
            <DialogDescription>
              {editingAssignment
                ? 'Update assignment details and settings'
                : 'Fill in the assignment details below'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Subject Selection - NEW */}
            {subjects.length > 0 && (
              <div className="space-y-2 p-4 bg-purple-50 rounded-lg">
                <Label htmlFor="subject" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Select Subject (Recommended)
                </Label>
                <Select value={subjectId} onValueChange={handleSubjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject you teach" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.subjectCode} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600">
                  Selecting a subject will automatically assign this assignment to all enrolled students
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Research Paper on AI Ethics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Assignment instructions and requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Assignment Type *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Essay">Essay</SelectItem>
                    <SelectItem value="Research">Research Paper</SelectItem>
                    <SelectItem value="Lab Report">Lab Report</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Presentation">Presentation</SelectItem>
                    <SelectItem value="Exam">Exam</SelectItem>
                    <SelectItem value="Reflection">Reflection</SelectItem>
                    <SelectItem value="Discussion">Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Major/Department</Label>
                <Select value={major} onValueChange={setMajor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-filled from subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="CS">CS</SelectItem>
                    <SelectItem value="Economics">Economics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Math">Math</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Psychology">Psychology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600">AI Enabled</Badge>
                <p className="text-sm text-muted-foreground">
                  AI tools are available for all assignments
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingAssignment ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
