import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const facultyEmail = session.user.email
    
    // Find faculty
    const faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail as string }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    // Get request body
    const {
      submissionId,
      originality,
      effort,
      finalGrade,
      facultyAiIdentified,
      feedback,
      confidence
    } = await req.json()

    // Validate inputs
    if (!submissionId || originality === undefined || effort === undefined || !feedback) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if submission exists
    const submission = await prisma.submission.findUnique({
      where: { submissionId },
      include: { student: true }
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Create or update rubric evaluation
    const rubricData = {
      rubricId: `RUB-${submissionId}-${Date.now()}`,
      submissionId,
      facultyId: faculty.facultyId,
      studentId: submission.studentId,
      originality: parseFloat(originality),
      effort: parseFloat(effort),
      facultyAiIdentified: facultyAiIdentified || false,
      assessmentDate: new Date(),
      finalGrade: parseFloat(finalGrade),
      confidence: parseFloat(confidence) || 0.85,
      feedback
    }

    // Check if rubric already exists
    const existingRubric = await prisma.rubricEvaluation.findUnique({
      where: { submissionId }
    })

    let rubric
    if (existingRubric) {
      // Update existing
      rubric = await prisma.rubricEvaluation.update({
        where: { submissionId },
        data: {
          originality: rubricData.originality,
          effort: rubricData.effort,
          facultyAiIdentified: rubricData.facultyAiIdentified,
          assessmentDate: rubricData.assessmentDate,
          finalGrade: rubricData.finalGrade,
          confidence: rubricData.confidence,
          feedback: rubricData.feedback
        }
      })
    } else {
      // Create new
      rubric = await prisma.rubricEvaluation.create({
        data: rubricData
      })
    }

    // Update submission status to Graded
    await prisma.submission.update({
      where: { submissionId },
      data: {
        status: 'Graded',
        finalScore: parseFloat(finalGrade),
        creativityScore: parseFloat(finalGrade) // Also update creativity score
      }
    })

    // Log faculty activity
    await prisma.facultyActivity.create({
      data: {
        activityId: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        facultyId: faculty.facultyId,
        activity: 'graded_submission',
        timestamp: new Date(),
        durationMin: 5, // Default estimate of 5 minutes per grading
        resource: submissionId
      }
    })

    return NextResponse.json({
      success: true,
      rubric,
      message: "Grade submitted successfully"
    })
  } catch (error: any) {
    console.error("Error submitting grade:", error)
    return NextResponse.json(
      { error: "Failed to submit grade: " + error.message },
      { status: 500 }
    )
  }
}

// Get a specific submission for grading
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const submissionId = searchParams.get('submissionId')

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID required" }, { status: 400 })
    }

    // Fetch submission with all related data
    const submission = await prisma.submission.findUnique({
      where: { submissionId },
      include: {
        student: {
          select: {
            studentId: true,
            name: true,
            email: true,
            year: true,
            major: true,
            priorGpa: true,
            firstGen: true,
            gender: true
          }
        },
        assignment: {
          select: {
            assignmentId: true,
            type: true,
            major: true,
            dueDate: true,
            aiAllowed: true
          }
        },
        reflection: {
          select: {
            type: true,
            content: true,
            depthScore: true,
            words: true
          }
        },
        rubricEval: true
      }
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json({
      submission: {
        id: submission.submissionId,
        student: submission.student,
        assignment: submission.assignment,
        draftText: "Draft content here...", // TODO: Store actual draft content
        finalText: "Final submission content here...", // TODO: Store actual final content
        submittedAt: submission.submissionDate,
        aiUsed: submission.usesAi,
        aiAccessHours: submission.aiAccessHours,
        aiDetection: {
          draftScore: submission.draftScore || 0,
          finalScore: Math.round((submission.aiConfidence || 0) * 100),
          confidence: submission.aiConfidence || 0,
          method: "DetectGPT"
        },
        reflection: submission.reflection,
        metrics: {
          wordCount: 0, // TODO: Calculate from content
          timeHours: submission.timeHours || 0,
          criticalThinkingScore: submission.criticalThinkingScore || 0
        },
        rubricEval: submission.rubricEval
      }
    })
  } catch (error: any) {
    console.error("Error fetching submission:", error)
    return NextResponse.json(
      { error: "Failed to fetch submission: " + error.message },
      { status: 500 }
    )
  }
}
