import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const submissionId = params.id

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
            firstGen: true
          }
        },
        assignment: {
          select: {
            assignmentId: true,
            title: true,
            type: true,
            dueDate: true,
            major: true
          }
        },
        reflection: {
          select: {
            reflectionId: true,
            type: true,
            content: true,
            depthScore: true,
            words: true
          }
        },
        rubricEval: {
          select: {
            originality: true,
            effort: true,
            finalGrade: true,
            feedback: true,
            facultyAiIdentified: true,
            confidence: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Verify this submission belongs to this faculty
    const faculty = await prisma.faculty.findUnique({
      where: { email: session.user.email! }
    })

    if (!faculty || submission.facultyId !== faculty.facultyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get AI detection results
    const aiDetectionResults = await prisma.aIDetectionResult.findMany({
      where: { submissionId },
      orderBy: { createdAt: 'desc' }
    })

    const draftDetection = aiDetectionResults.find(r => r.stage === 'draft')
    const finalDetection = aiDetectionResults.find(r => r.stage === 'final')

    // Transform for frontend
    const transformedSubmission = {
      id: submission.submissionId,
      student: {
        name: submission.student.name,
        studentId: submission.student.studentId,
        email: submission.student.email,
        year: submission.student.year,
        major: submission.student.major,
        priorGpa: submission.student.priorGpa,
        firstGen: submission.student.firstGen
      },
      assignment: {
        title: submission.assignment.title,
        type: submission.assignment.type,
        dueDate: submission.assignment.dueDate,
        major: submission.assignment.major
      },
      draftText: submission.draftContent || "",
      finalText: submission.finalContent || "",
      submittedAt: submission.submissionDate,
      aiUsed: submission.usesAi,
      aiAccessHours: submission.aiAccessHours,
      aiDetection: {
        draftScore: draftDetection?.aiLikelihood || 0,
        finalScore: finalDetection?.aiLikelihood || 0,
        confidence: finalDetection?.aiLikelihood || 0,  // Keep as 0-100 scale for consistency
        method: "DetectGPT",
        verdict: finalDetection?.verdict || "Unknown"
      },
      reflection: submission.reflection ? {
        type: submission.reflection.type,
        content: submission.reflection.content,
        depthScore: submission.reflection.depthScore,
        words: submission.reflection.words
      } : null,
      metrics: {
        wordCount: finalDetection?.wordCount || 0,
        timeHours: submission.timeHours,
        criticalThinkingScore: submission.criticalThinkingScore
      },
      rubric: submission.rubricEval,
      status: submission.status,
      creativityScore: submission.creativityScore,
      finalScore: submission.finalScore
    }

    return NextResponse.json(transformedSubmission)
  } catch (error: any) {
    console.error("Error fetching submission:", error)
    return NextResponse.json(
      { error: "Failed to fetch submission: " + error.message },
      { status: 500 }
    )
  }
}
