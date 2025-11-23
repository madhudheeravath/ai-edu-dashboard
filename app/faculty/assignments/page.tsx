"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import { Plus, Edit, Trash2, FileText, Calendar, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AssignmentsPage() {
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [major, setMajor] = useState("")
  const [year, setYear] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [aiAllowed, setAiAllowed] = useState(false)
  const [aiLockedUntilDraft, setAiLockedUntilDraft] = useState(false)

  useEffect(() => {
    fetchAssignments()
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

  const handleCreateNew = () => {
    setEditingAssignment(null)
    setTitle("")
    setDescription("")
    setType("")
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
    setMajor(assignment.major)
    setYear(String(assignment.year || "1"))
    setDueDate(new Date(assignment.dueDate).toISOString().split('T')[0])
    setAiAllowed(assignment.aiAllowed)
    setAiLockedUntilDraft(assignment.aiLockedUntilDraft)
    setShowDialog(true)
  }

  const handleSave = async () => {
    if (!title || !type || !major || !year || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

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
        major,
        year: parseInt(year),
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
            Create and manage your course assignments
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
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
              {assignments.reduce((sum, a) => sum + (a.submissionCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assignments</CardTitle>
          <CardDescription>
            Manage all assignments for your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Major</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No assignments yet</p>
                    <p className="text-sm mt-1">Create your first assignment to get started</p>
                  </TableCell>
                </TableRow>
              ) : (
                assignments.map((assignment) => (
                  <TableRow key={assignment.assignmentId}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{assignment.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>Year {assignment.year || 1}</Badge>
                    </TableCell>
                    <TableCell>{assignment.major}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {assignment.submissionCount || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                <Label htmlFor="major">Major *</Label>
                <Select value={major} onValueChange={setMajor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select major" />
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
