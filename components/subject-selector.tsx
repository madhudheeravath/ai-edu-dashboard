"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, BookOpen, Users, GraduationCap, CheckCircle } from "lucide-react"

type Subject = {
  id: string
  subjectCode: string
  name: string
  description: string | null
  credits: number
  department: string
  semester: number
  _count: {
    students: number
    assignments: number
  }
  faculty?: {
    faculty: {
      facultyId: string
      name: string
    }
  }[]
}

type SubjectSelectorProps = {
  userRole: "student" | "faculty"
  onSelectionComplete?: (subjects: string[]) => void
  maxSubjects?: number
  minSubjects?: number
  initialSelected?: string[]
}

export function SubjectSelector({
  userRole,
  onSelectionComplete,
  maxSubjects = 4,
  minSubjects = 1,
  initialSelected = []
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(initialSelected)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects?forEnrollment=true")
      if (response.ok) {
        const data = await response.json()
        setSubjects(data)
      }
    } catch (error) {
      setError("Failed to load subjects")
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectToggle = (subjectId: string) => {
    setError("")
    setSuccess("")
    
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId)
      } else {
        if (prev.length >= maxSubjects) {
          setError(`You can only select up to ${maxSubjects} subjects`)
          return prev
        }
        return [...prev, subjectId]
      }
    })
  }

  const handleSave = async () => {
    console.log("handleSave called with subjects:", selectedSubjects)
    
    if (selectedSubjects.length < minSubjects) {
      setError(`Please select at least ${minSubjects} subject(s)`)
      return
    }

    if (selectedSubjects.length > maxSubjects) {
      setError(`You can only select up to ${maxSubjects} subjects`)
      return
    }

    setSaving(true)
    setError("")

    try {
      const endpoint = userRole === "student" 
        ? "/api/student/subjects" 
        : "/api/faculty/subjects"

      console.log("Sending request to:", endpoint, "with:", { subjectIds: selectedSubjects })

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectIds: selectedSubjects })
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok) {
        setSuccess(userRole === "student" 
          ? "Successfully enrolled in subjects!" 
          : "Successfully assigned subjects!")
        
        if (onSelectionComplete) {
          onSelectionComplete(selectedSubjects)
        }
      } else {
        setError(data.error || "Failed to save subjects")
      }
    } catch (error) {
      console.error("Save error:", error)
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Get unique departments for filtering
  const departments = Array.from(new Set(subjects.map(s => s.department)))

  const filteredSubjects = filter === "all" 
    ? subjects 
    : subjects.filter(s => s.department === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading subjects...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {userRole === "student" ? "Enroll in Subjects" : "Select Subjects to Teach"}
          </h2>
          <p className="text-gray-600">
            Select 1 to {maxSubjects} subjects (recommended: 3-4)
          </p>
        </div>
        <Badge variant={selectedSubjects.length >= 1 ? "default" : "secondary"}>
          {selectedSubjects.length} / {maxSubjects} selected
        </Badge>
      </div>

      {/* Department Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All Departments
        </Button>
        {departments.map(dept => (
          <Button
            key={dept}
            variant={filter === dept ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(dept)}
          >
            {dept}
          </Button>
        ))}
      </div>

      {/* Subjects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map(subject => {
          const isSelected = selectedSubjects.includes(subject.id)
          
          return (
            <Card 
              key={subject.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? "border-2 border-primary bg-primary/5" 
                  : "hover:border-gray-300"
              }`}
              onClick={() => handleSubjectToggle(subject.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{subject.subjectCode}</Badge>
                      <Badge variant="secondary">{subject.credits} Credits</Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{subject.name}</CardTitle>
                  </div>
                  <Checkbox 
                    checked={isSelected}
                    className="mt-1"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-3">
                  {subject.description || "No description available"}
                </CardDescription>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>{subject.department}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{subject._count.students} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{subject._count.assignments} assignments</span>
                  </div>
                </div>
                {subject.faculty && subject.faculty.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span>Taught by: {subject.faculty.map(f => f.faculty.name).join(", ")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between sticky bottom-0 bg-white py-4 border-t">
        <div className="text-sm text-gray-600">
          {selectedSubjects.length < minSubjects ? (
            <span className="text-orange-600">
              Please select {minSubjects - selectedSubjects.length} more subject(s)
            </span>
          ) : (
            <span className="text-green-600">
              ✓ Ready to save ({selectedSubjects.length} subjects selected)
            </span>
          )}
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving || selectedSubjects.length < minSubjects}
          size="lg"
          className={selectedSubjects.length < minSubjects ? "opacity-50" : ""}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              {userRole === "student" ? "Enroll in Selected Subjects" : "Assign Selected Subjects"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
