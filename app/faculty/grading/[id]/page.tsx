"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Bot, 
  MessageSquare,
  Save,
  Send
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function GradingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Rubric scores
  const [originality, setOriginality] = useState(3)
  const [effort, setEffort] = useState(3)
  const [facultyAiIdentified, setFacultyAiIdentified] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [finalGrade, setFinalGrade] = useState(0)

  // Submission data
  const [submission, setSubmission] = useState<any>(null)

  useEffect(() => {
    fetchSubmission()
  }, [params.id])

  useEffect(() => {
    // Calculate final grade based on rubric
    const grade = calculateGrade()
    setFinalGrade(grade)
  }, [originality, effort])

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/faculty/submission/${params.id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSubmission(data)
      
      // If already graded, populate rubric fields
      if (data.rubric) {
        setOriginality(data.rubric.originality || 3)
        setEffort(data.rubric.effort || 3)
        setFeedback(data.rubric.feedback || "")
      }
      
      setLoading(false)
    } catch (error) {
      console.error("Error fetching submission:", error)
      setLoading(false)
      toast({
        title: "Error",
        description: "Failed to load submission",
        variant: "destructive"
      })
    }
  }

  const calculateGrade = () => {
    // Weighted formula: Originality (40%) + Effort (30%) + Creativity (30%)
    const creativity = submission?.metrics?.criticalThinkingScore / 20 || 3
    return parseFloat(((originality * 0.4) + (effort * 0.3) + (creativity * 0.3)).toFixed(2))
  }

  const handleSubmitGrade = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide written feedback for the student",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/faculty/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: params.id,
          originality,
          effort,
          finalGrade,
          facultyAiIdentified,
          feedback,
          confidence: 0.85
        })
      })

      if (response.ok) {
        toast({
          title: "Grade submitted! ✅",
          description: "Student has been notified"
        })
        router.push("/faculty/grading")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit grade",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
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
        <div className="flex items-center gap-4">
          <Link href="/faculty/grading">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Grade Submission</h1>
            <p className="text-muted-foreground">{submission.assignment.title}</p>
          </div>
        </div>
        <Badge variant={submission.aiDetection.finalScore > 70 ? "destructive" : "outline"}>
          {submission.aiDetection.finalScore}% AI Detected
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Submission Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Work */}
          <Card>
            <CardHeader>
              <Tabs defaultValue="final">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="draft">Draft</TabsTrigger>
                  <TabsTrigger value="final">Final Submission</TabsTrigger>
                </TabsList>
                
                <TabsContent value="draft" className="mt-4">
                  <div className="prose max-w-none">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{submission.aiDetection.draftScore}% AI</Badge>
                        <span className="text-sm text-muted-foreground">Original Draft</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {submission.draftText}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="final" className="mt-4">
                  <div className="prose max-w-none">
                    <div className="p-4 bg-white border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={submission.aiDetection.finalScore > 70 ? "destructive" : "outline"}>
                          {submission.aiDetection.finalScore}% AI
                        </Badge>
                        <span className="text-sm text-muted-foreground">Final Submission</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {submission.finalText}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>

          {/* Reflection */}
          {submission.reflection && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Student Reflection
                </CardTitle>
                <CardDescription>
                  Type: {submission.reflection.type} • Depth Score: {submission.reflection.depthScore}/5 • {submission.reflection.words} words
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {submission.reflection.content}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Grading Panel */}
        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">{submission.student.name}</p>
                <p className="text-muted-foreground">{submission.student.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-medium">{submission.student.studentId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Year</p>
                  <p className="font-medium">{submission.student.year}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Major</p>
                  <p className="font-medium">{submission.student.major}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prior GPA</p>
                  <p className="font-medium">{submission.student.priorGpa}</p>
                </div>
              </div>
              {submission.student.firstGen && (
                <Badge variant="secondary">First Generation</Badge>
              )}
            </CardContent>
          </Card>

          {/* AI Usage Stats */}
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                AI Usage Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>AI Confidence</span>
                  <span className="font-bold">{submission.aiDetection.confidence.toFixed(0)}%</span>
                </div>
                <Progress value={submission.aiDetection.confidence} indicatorClassName="bg-purple-600" />
              </div>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Access Time</span>
                  <span className="font-medium">{submission.aiAccessHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Time</span>
                  <span className="font-medium">{submission.metrics.timeHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium">{submission.aiDetection.method}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rubric Grading */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rubric Evaluation</CardTitle>
              <CardDescription>Rate the student's work (1-5 scale)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Originality */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Originality</Label>
                  <span className="text-sm font-bold">{originality}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={originality}
                  onChange={(e) => setOriginality(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Novel ideas and unique perspective
                </p>
              </div>

              {/* Effort */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Effort</Label>
                  <span className="text-sm font-bold">{effort}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={effort}
                  onChange={(e) => setEffort(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Depth of analysis and research
                </p>
              </div>

              {/* Faculty AI Detection */}
              <div className="space-y-2">
                <Label>Faculty AI Assessment</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={facultyAiIdentified}
                    onChange={(e) => setFacultyAiIdentified(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">I believe AI was used significantly</span>
                </div>
              </div>

              {/* Calculated Grade */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Final Grade</Label>
                  <span className="text-2xl font-bold text-blue-600">{finalGrade}/5</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-calculated: Originality (40%) + Effort (30%) + Creativity (30%)
                </p>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <Label>Written Feedback *</Label>
                <Textarea
                  placeholder="Provide detailed feedback for the student..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {feedback.length} characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleSubmitGrade}
                  disabled={submitting || !feedback.trim()}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit Grade"}
                </Button>
                <Button variant="outline" className="w-full" disabled={submitting}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
