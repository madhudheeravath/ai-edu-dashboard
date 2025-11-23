"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Upload,
  MessageSquare,
  FileText,
  ArrowLeft,
  AlertCircle,
  X,
  File
} from "lucide-react"
import { formatDate, getDueDateStatus } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ChatInterface } from "@/components/chat/chat-interface"
import { AIDetectionDisplay } from "@/components/ai-detection-display"

type Assignment = {
  id: string
  assignmentId: string
  title: string
  description: string
  type: string
  dueDate: string
  aiAllowed: boolean
  aiLockedUntilDraft: boolean
  faculty: {
    name: string
    major: string
  }
}

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isResubmit = searchParams.get('resubmit') === 'true'
  const { toast } = useToast()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)
  const [hasSubmission, setHasSubmission] = useState(false)
  const [draftText, setDraftText] = useState("")
  const [draftFile, setDraftFile] = useState<File | null>(null)
  const [reflectionText, setReflectionText] = useState("")
  const [reflectionFile, setReflectionFile] = useState<File | null>(null)
  const [finalText, setFinalText] = useState("")
  const [finalFile, setFinalFile] = useState<File | null>(null)
  const [currentStep, setCurrentStep] = useState(1) // 1: Draft, 2: AI Chat, 3: Reflection, 4: Final
  const [submitting, setSubmitting] = useState(false)
  const [draftDetection, setDraftDetection] = useState<any>(null)
  const [finalDetection, setFinalDetection] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch("/api/assignments")
        if (response.ok) {
          const data = await response.json()
          const found = data.find((a: Assignment) => a.assignmentId === params.id)
          if (found) {
            setAssignment(found)
          } else {
            toast({
              title: "Assignment not found",
              description: "The assignment you're looking for doesn't exist.",
              variant: "destructive",
            })
            router.push("/student/assignments")
          }
        }
      } catch (error) {
        console.error("Error fetching assignment:", error)
        toast({
          title: "Error",
          description: "Failed to load assignment details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchAssignment()
    }
  }, [session, params.id, router, toast])

  // Fetch existing submission
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await fetch(`/api/student/submission/${params.id}`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.hasSubmission) {
            setExistingSubmission(data.submission)
            setHasSubmission(true)
            
            // Pre-fill form fields if resubmitting
            if (isResubmit && data.submission.status === "Submitted") {
              setDraftText(data.submission.draftContent || "")
              setFinalText(data.submission.finalContent || "")
              setReflectionText(data.submission.reflection?.content || "")
              setCurrentStep(4) // Start at final step for resubmission
            }
            
            // Set AI detection if available
            if (data.submission.aiDetection && data.submission.aiDetection.length > 0) {
              setDraftDetection(data.submission.aiDetection.find((d: any) => d.stage === 'draft'))
              setFinalDetection(data.submission.aiDetection.find((d: any) => d.stage === 'final'))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching submission:", error)
      }
    }

    if (session && params.id) {
      fetchSubmission()
    }
  }, [session, params.id, isResubmit])

  // Extract text from uploaded file
  const handleFileUpload = async (file: File, type: "draft" | "reflection" | "final") => {
    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        
        // Populate the text area with extracted text
        if (type === "draft") {
          setDraftText(data.text)
          toast({
            title: "File uploaded! ✅",
            description: `Extracted ${data.wordCount} words from ${data.fileName}`,
          })
        } else if (type === "reflection") {
          setReflectionText(data.text)
          toast({
            title: "File uploaded! ✅",
            description: `Extracted ${data.wordCount} words from ${data.fileName}`,
          })
        } else if (type === "final") {
          setFinalText(data.text)
          toast({
            title: "File uploaded! ✅",
            description: `Extracted ${data.wordCount} words from ${data.fileName}`,
          })
        }
      } else {
        const error = await response.json()
        toast({
          title: "Upload failed",
          description: error.error || "Failed to extract text from file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("File upload error:", error)
      toast({
        title: "Upload error",
        description: "An error occurred while processing your file",
        variant: "destructive",
      })
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDraftSubmit = async () => {
    if (!draftText.trim() && !draftFile) {
      toast({
        title: "Draft required",
        description: "Please write your draft or upload a file.",
        variant: "destructive",
      })
      return
    }

    if (draftText.trim() && draftText.trim().split(/\s+/).length < 50) {
      toast({
        title: "Draft too short",
        description: "Your written draft should be at least 50 words.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    setAnalyzing(true)
    
    try {
      // Analyze draft for AI content
      const detectionResponse = await fetch("/api/detect-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draftText })
      })

      let detection = null
      if (detectionResponse.ok) {
        detection = await detectionResponse.json()
        setDraftDetection(detection)
      }

      // Save draft to database
      const saveResponse = await fetch("/api/update-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: params.id,
          step: "draft",
          content: draftText,
          aiDetection: detection
        })
      })

      if (!saveResponse.ok) {
        throw new Error("Failed to save draft")
      }

      setCurrentStep(2)
      toast({
        title: "Draft submitted! ✅",
        description: "AI assistant is now unlocked. Analysis complete.",
      })
    } catch (error) {
      console.error("Draft submission error:", error)
      toast({
        title: "Submission failed",
        description: "Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
      setAnalyzing(false)
    }
  }

  const handleReflectionSubmit = async () => {
    if (!reflectionText.trim() && !reflectionFile) {
      toast({
        title: "Reflection required",
        description: "Please write your reflection or upload a file.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    
    try {
      // Save reflection to database
      const saveResponse = await fetch("/api/update-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: params.id,
          step: "reflection",
          content: reflectionText
        })
      })

      if (!saveResponse.ok) {
        throw new Error("Failed to save reflection")
      }

      setCurrentStep(4)
      toast({
        title: "Reflection saved! ✅",
        description: "Now submit your final work.",
      })
    } catch (error) {
      console.error("Reflection submission error:", error)
      toast({
        title: "Save failed",
        description: "Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinalSubmit = async () => {
    if (!finalText.trim() && !finalFile) {
      toast({
        title: "Final work required",
        description: "Please write or upload your final work.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    setAnalyzing(true)
    
    try {
      // Analyze final submission for AI content (compare with draft)
      const detectionResponse = await fetch("/api/detect-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: finalText,
          previousText: draftText // Compare with draft to detect AI refinement
        })
      })

      let detection = null
      if (detectionResponse.ok) {
        detection = await detectionResponse.json()
        setFinalDetection(detection)
      }

      // Save the final submission to database
      const submitResponse = await fetch("/api/update-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: params.id,
          step: "final",
          content: finalText,
          aiDetection: detection
        })
      })

      if (!submitResponse.ok) {
        throw new Error("Failed to submit assignment")
      }

      toast({
        title: "Assignment completed! 🎉",
        description: "Your work has been submitted with AI analysis.",
      })
      
      // Redirect back to assignments after short delay
      setTimeout(() => {
        router.push("/student/assignments")
      }, 2000)
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Submission failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
      setAnalyzing(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return null
  }

  const dueDateInfo = getDueDateStatus(assignment.dueDate)
  const progressValue = (currentStep / 4) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/student/assignments">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                <p className="text-sm text-gray-600">
                  {assignment.faculty.name} • Due {formatDate(assignment.dueDate)}
                </p>
              </div>
            </div>
            {hasSubmission && existingSubmission && existingSubmission.status !== "Draft" ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {existingSubmission.status}
              </Badge>
            ) : (
              <Badge variant={dueDateInfo.status === "overdue" ? "destructive" : "default"}>
                {dueDateInfo.text}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6" style={{paddingTop: '4px', paddingBottom: '4px'}}>
        <div className={(hasSubmission && existingSubmission?.status !== "Draft" && !isResubmit) ? "max-w-5xl mx-auto" : "grid lg:grid-cols-3"} style={{gap: '8px'}}>
          {/* Left Column - Assignment Details - Show for new submissions, drafts, and resubmissions */}
          {(!hasSubmission || existingSubmission?.status === "Draft" || isResubmit) && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Assignment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="text-sm mt-1">{assignment.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-sm mt-1">{assignment.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Due Date</p>
                      <p className={`text-sm mt-1 ${dueDateInfo.color}`}>
                        {formatDate(assignment.dueDate)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-500 mb-3">Progress</p>
                    <Progress value={progressValue} className="h-2" />
                    <p className="text-xs text-gray-600 mt-2">
                      Step {currentStep} of 4 completed
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-500 mb-2">Workflow Steps</p>
                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 text-sm ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                        {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2" />}
                        <span>1. Submit Draft</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                        {currentStep > 2 ? <CheckCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        <span>2. Use AI Assistant</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                        {currentStep > 3 ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2" />}
                        <span>3. Write Reflection</span>
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${currentStep >= 4 ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className="h-4 w-4 rounded-full border-2" />
                        <span>4. Submit Final Work</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Right Column - Submission Area */}
          <div className={(hasSubmission && !isResubmit) ? "lg:col-span-2" : "lg:col-span-2"} style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            {/* Resubmit mode banner */}
            {isResubmit && hasSubmission && existingSubmission?.status === "Submitted" && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Resubmission Mode</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        You're editing a previously submitted assignment. Your previous submission has been loaded. 
                        Make your changes and submit again before the due date: <strong>{formatDate(assignment.dueDate)}</strong>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Show existing submission if it exists AND is submitted (not draft) AND not resubmitting */}
            {hasSubmission && existingSubmission && existingSubmission.status !== "Draft" && !isResubmit ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Submission</CardTitle>
                    <CardDescription>
                      Submitted on {existingSubmission.submissionDate ? formatDate(existingSubmission.submissionDate) : 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Status</p>
                        <Badge>{existingSubmission.status}</Badge>
                      </div>
                      {existingSubmission.finalScore > 0 && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Grade</p>
                          <span className="text-2xl font-bold text-primary">{existingSubmission.finalScore}/5</span>
                        </div>
                      )}
                    </div>

                    {existingSubmission.draftContent && (
                      <div>
                        <p className="text-sm font-medium mb-2">Draft Submission</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {existingSubmission.draftContent}
                          </p>
                        </div>
                      </div>
                    )}

                    {existingSubmission.finalContent && (
                      <div>
                        <p className="text-sm font-medium mb-2">Final Submission</p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {existingSubmission.finalContent}
                          </p>
                        </div>
                      </div>
                    )}

                    {existingSubmission.reflection && (
                      <div>
                        <p className="text-sm font-medium mb-2">Reflection</p>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {existingSubmission.reflection.content || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-500">AI Usage</p>
                        <p className="text-sm font-medium">
                          <span className="text-green-600">Allowed</span>
                          {((finalDetection && finalDetection.aiLikelihood > 30) || existingSubmission.usesAi || existingSubmission.aiAccessHours > 0 || existingSubmission.aiDetected) && (
                            <span className="text-blue-600 ml-2">
                              {finalDetection && `(${finalDetection.aiLikelihood}% detected)`}
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Creativity Score</p>
                        <p className="text-sm font-medium">{existingSubmission.creativityScore?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Time Spent</p>
                        <p className="text-sm font-medium">{existingSubmission.timeHours > 0 ? `${existingSubmission.timeHours.toFixed(1)}h` : '0.0h'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Critical Thinking</p>
                        <p className="text-sm font-medium">{existingSubmission.criticalThinkingScore > 0 ? existingSubmission.criticalThinkingScore.toFixed(2) : '0.00'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Show AI Detection Results */}
                {(draftDetection || finalDetection) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Detection Analysis</CardTitle>
                      <CardDescription>
                        Automated analysis of AI usage in your submission
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {draftDetection && (
                        <div>
                          <p className="text-sm font-medium mb-2">Draft Analysis</p>
                          <AIDetectionDisplay result={draftDetection} stage="draft" />
                        </div>
                      )}
                      {finalDetection && (
                        <div>
                          <p className="text-sm font-medium mb-2">Final Analysis</p>
                          <AIDetectionDisplay result={finalDetection} stage="final" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2">
                  <Link href="/student/assignments" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Back to Assignments
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
            {/* Step 1: Draft Submission */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Step 1: Submit Your Draft
                  </CardTitle>
                  <CardDescription>
                    Write your original work or upload a file before accessing AI assistance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      This demonstrates your independent thinking and creativity baseline.
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="draft">Option 1: Write Your Draft</Label>
                    <Textarea
                      id="draft"
                      placeholder="Start writing your draft here... (minimum 50 words)"
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      className="min-h-[250px] mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Word count: {draftText.trim() ? draftText.trim().split(/\s+/).length : 0} words
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="draft-file">Option 2: Upload a File</Label>
                    <p className="text-xs text-gray-500 mt-1 mb-2">Auto-extracts: DOCX, TXT • PDFs: Copy-paste text instead</p>
                    <div className="mt-2">
                      <input
                        id="draft-file"
                        type="file"
                        accept=".doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setDraftFile(file)
                            handleFileUpload(file, "draft")
                          }
                        }}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                      <label
                        htmlFor="draft-file"
                        className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-gray-500">
                            DOCX, TXT
                          </span>
                        </div>
                      </label>
                      {draftFile && (
                        <div className="flex items-center justify-between p-3 mt-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{draftFile.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(draftFile.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDraftFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleDraftSubmit} 
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Draft & Unlock AI"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: AI Assistant */}
            {currentStep === 2 && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                <div className="bg-green-50 border border-green-200 rounded-lg" style={{padding: '8px'}}>
                  <p className="text-sm text-green-900 flex items-center gap-2">
                    <Unlock className="h-4 w-4" />
                    AI assistant unlocked! Use it to improve your work, get feedback, and explore ideas.
                  </p>
                </div>

                {/* Show AI Detection Results for Draft */}
                {draftDetection && (
                  <div className="mb-1">
                    <AIDetectionDisplay 
                      result={draftDetection}
                      stage="draft"
                      showComparison={false}
                    />
                  </div>
                )}

                {/* Two Column Layout: Draft Display (Left) + AI Chat (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-2">
                  {/* Left: Your Draft */}
                  <div className="lg:sticky lg:top-4 lg:h-fit">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Your Draft</CardTitle>
                        <CardDescription className="text-xs">
                          {draftText.split(/\s+/).length} words • {draftText.split(/[.!?]+/).length - 1} sentences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="max-h-[500px] overflow-y-auto p-3 bg-gray-50 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap">
                          {draftText}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right: AI Chat Interface */}
                  <div className="lg:sticky lg:top-4">
                    <ChatInterface
                      assignmentTitle={assignment.title}
                      assignmentDescription={assignment.description}
                      draftContent={draftText}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => setCurrentStep(3)} 
                  className="w-full"
                  size="lg"
                >
                  Continue to Reflection
                </Button>
              </div>
            )}

            {/* Step 3: Reflection */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Step 3: Reflection on AI Usage
                  </CardTitle>
                  <CardDescription>
                    Document how you used AI and what you learned from the process.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-900">
                      Reflection helps you develop metacognitive awareness and understand AI's impact on your learning.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="reflection">Option 1: Write Your Reflection</Label>
                    <div className="text-sm text-gray-600 mt-2 mb-3 space-y-1">
                      <p>• How did you use the AI assistant?</p>
                      <p>• What suggestions did it provide?</p>
                      <p>• How did AI help or limit your creativity?</p>
                      <p>• What would you do differently next time?</p>
                    </div>
                    <Textarea
                      id="reflection"
                      placeholder="Write your reflection here..."
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      className="min-h-[200px]"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Word count: {reflectionText.trim() ? reflectionText.trim().split(/\s+/).length : 0} words
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reflection-file">Option 2: Upload a File (Auto-extracts text)</Label>
                    <div className="mt-2">
                      <input
                        id="reflection-file"
                        type="file"
                        accept=".doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setReflectionFile(file)
                            handleFileUpload(file, "reflection")
                          }
                        }}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                      <label
                        htmlFor="reflection-file"
                        className="flex items-center justify-center w-full h-24 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-purple-400 focus:outline-none"
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-sm text-gray-600">Click to upload</span>
                          <span className="text-xs text-gray-500">PDF, DOC, DOCX, TXT</span>
                        </div>
                      </label>
                      {reflectionFile && (
                        <div className="flex items-center justify-between p-3 mt-2 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">{reflectionFile.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(reflectionFile.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setReflectionFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleReflectionSubmit} 
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save Reflection"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Final Submission */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Step 4: Submit Final Work
                  </CardTitle>
                  <CardDescription>
                    Submit your improved work after using AI assistance.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Almost done! Submit your final work to complete the assignment.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="final">Option 1: Write Your Final Work</Label>
                    <Textarea
                      id="final"
                      placeholder="Paste your final work here..."
                      value={finalText}
                      onChange={(e) => setFinalText(e.target.value)}
                      className="min-h-[250px] mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Word count: {finalText.trim() ? finalText.trim().split(/\s+/).length : 0} words
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="final-file">Option 2: Upload a File (Auto-extracts text)</Label>
                    <div className="mt-2">
                      <input
                        id="final-file"
                        type="file"
                        accept=".doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFinalFile(file)
                            handleFileUpload(file, "final")
                          }
                        }}
                        className="hidden"
                        disabled={uploadingFile}
                      />
                      <label
                        htmlFor="final-file"
                        className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary focus:outline-none"
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </span>
                          <span className="text-xs text-gray-500">
                            DOCX, TXT
                          </span>
                        </div>
                      </label>
                      {finalFile && (
                        <div className="flex items-center justify-between p-3 mt-2 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">{finalFile.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(finalFile.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setFinalFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleFinalSubmit} 
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? (analyzing ? "Analyzing..." : "Submitting...") : "Submit Final Work"}
                  </Button>

                  {/* Show AI Detection Results for Final Submission */}
                  {finalDetection && (
                    <div className="mt-4">
                      <AIDetectionDisplay 
                        result={finalDetection}
                        stage="final"
                        showComparison={true}
                      />
                      
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900 font-semibold mb-2">
                          What's Next?
                        </p>
                        <p className="text-sm text-blue-800">
                          Your submission has been analyzed and recorded. Review the AI content detection above
                          to understand how your work evolved from draft to final. This analysis helps track
                          AI usage patterns in academic work.
                        </p>
                        <Button 
                          onClick={() => router.push("/student/assignments")}
                          className="w-full mt-3"
                          size="sm"
                        >
                          Return to Assignments
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
