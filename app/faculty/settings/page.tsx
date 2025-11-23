"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Profile state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [major, setMajor] = useState("")
  const [facultyId, setFacultyId] = useState("")
  const [bio, setBio] = useState("")
  
  // Notification preferences
  const [notifNewSubmissions, setNotifNewSubmissions] = useState(true)
  const [notifHighAI, setNotifHighAI] = useState(true)
  const [notifStudentQuestions, setNotifStudentQuestions] = useState(false)
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(true)
  
  // Grading preferences
  const [gradingShowAIFirst, setGradingShowAIFirst] = useState(true)
  const [gradingAutoSave, setGradingAutoSave] = useState(true)
  const [gradingRequireFeedback, setGradingRequireFeedback] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/faculty/settings')
      if (response.ok) {
        const data = await response.json()
        setName(data.name)
        setEmail(data.email)
        setMajor(data.major)
        setFacultyId(data.facultyId)
        setBio(data.bio || "")
        
        if (data.notifications) {
          setNotifNewSubmissions(data.notifications.newSubmissions)
          setNotifHighAI(data.notifications.highAI)
          setNotifStudentQuestions(data.notifications.studentQuestions)
          setNotifWeeklySummary(data.notifications.weeklySummary)
        }
        
        if (data.grading) {
          setGradingShowAIFirst(data.grading.showAIFirst)
          setGradingAutoSave(data.grading.autoSave)
          setGradingRequireFeedback(data.grading.requireFeedback)
        }
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching settings:", error)
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/faculty/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, major, bio })
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully"
        })
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    }
    setSaving(false)
  }

  const handleExport = async (type: string) => {
    try {
      const response = await fetch(`/api/faculty/export?type=${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.${type === 'analytics' ? 'json' : 'csv'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Success",
          description: `${type} data exported successfully`
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your faculty profile and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="major">Department</Label>
              <Input id="major" value={major} disabled />
              <p className="text-xs text-muted-foreground">Your department determines which majors you can teach</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="facultyId">Faculty ID</Label>
              <Input id="facultyId" value={facultyId} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Submissions</p>
              <p className="text-sm text-muted-foreground">
                Get notified when students submit assignments
              </p>
            </div>
            <Switch checked={notifNewSubmissions} onCheckedChange={setNotifNewSubmissions} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">High AI Detection</p>
              <p className="text-sm text-muted-foreground">
                Alerts for submissions with AI confidence &gt; 80%
              </p>
            </div>
            <Switch checked={notifHighAI} onCheckedChange={setNotifHighAI} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Student Questions</p>
              <p className="text-sm text-muted-foreground">
                Notifications for student messages
              </p>
            </div>
            <Switch checked={notifStudentQuestions} onCheckedChange={setNotifStudentQuestions} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Summary</p>
              <p className="text-sm text-muted-foreground">
                Receive weekly analytics summary via email
              </p>
            </div>
            <Switch checked={notifWeeklySummary} onCheckedChange={setNotifWeeklySummary} />
          </div>
        </CardContent>
      </Card>

      {/* Grading Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Grading Preferences</CardTitle>
          <CardDescription>
            Customize your grading workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show AI Detection First</p>
              <p className="text-sm text-muted-foreground">
                Display AI detection panel at the top
              </p>
            </div>
            <Switch checked={gradingShowAIFirst} onCheckedChange={setGradingShowAIFirst} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-save Rubric Scores</p>
              <p className="text-sm text-muted-foreground">
                Automatically save rubric as you adjust sliders
              </p>
            </div>
            <Switch checked={gradingAutoSave} onCheckedChange={setGradingAutoSave} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Feedback Comment</p>
              <p className="text-sm text-muted-foreground">
                Enforce minimum 50 characters for feedback
              </p>
            </div>
            <Switch checked={gradingRequireFeedback} onCheckedChange={setGradingRequireFeedback} />
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export and manage your course data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export All Submissions</p>
              <p className="text-sm text-muted-foreground">
                Download CSV of all graded submissions
              </p>
            </div>
            <Button variant="outline" onClick={() => handleExport('submissions')}>Export CSV</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Analytics Data</p>
              <p className="text-sm text-muted-foreground">
                Download JSON of analytics metrics
              </p>
            </div>
            <Button variant="outline" onClick={() => handleExport('analytics')}>Export JSON</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Student List</p>
              <p className="text-sm text-muted-foreground">
                Download roster with performance data
              </p>
            </div>
            <Button variant="outline" onClick={() => handleExport('students')}>Export CSV</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions - proceed with caution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reset All Grades</p>
              <p className="text-sm text-muted-foreground">
                Remove all rubric evaluations (cannot be undone)
              </p>
            </div>
            <Button variant="destructive" disabled>Reset Grades</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
