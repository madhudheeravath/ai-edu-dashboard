import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { assignmentId, finalContent, aiDetection, stage } = await req.json()

    if (!assignmentId || !finalContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the student's actual studentId
    const student = await prisma.student.findUnique({
      where: { email: session.user.email! },
      select: { studentId: true }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Find the submission
    const submission = await prisma.submission.findFirst({
      where: {
        assignmentId: assignmentId,
        studentId: student.studentId
      }
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Update the submission with final content and status
    const updatedSubmission = await prisma.submission.update({
      where: {
        submissionId: submission.submissionId
      },
      data: {
        finalContent: finalContent,
        status: "Submitted",
        submissionDate: new Date(),
        usesAi: aiDetection ? (aiDetection.aiLikelihood >= 40) : false,
        aiDetected: aiDetection ? (aiDetection.aiLikelihood >= 40) : false,
        aiConfidence: aiDetection ? (aiDetection.aiLikelihood / 100) : 0
      }
    })

    // Save AI detection results if available
    if (aiDetection && stage) {
      try {
        await prisma.aIDetectionResult.create({
          data: {
            submissionId: submission.submissionId,
            stage: stage,
            aiLikelihood: aiDetection.aiLikelihood || 0,
            humanLikelihood: aiDetection.humanLikelihood || 0,
            confidence: aiDetection.confidence || "low",
            verdict: aiDetection.verdict || "Unknown",
            wordCount: aiDetection.wordCount || 0,
            sentenceCount: aiDetection.sentenceCount || 0,
            avgWordsPerSentence: aiDetection.avgWordsPerSentence || 0,
            vocabularyRichness: aiDetection.vocabularyRichness || 0,
            readabilityScore: aiDetection.readabilityScore || 0,
            hasAIMarkers: aiDetection.hasAIMarkers || false,
            hasPersonalTouch: aiDetection.hasPersonalTouch || false,
            formalityLevel: aiDetection.formalityLevel || "moderate",
            sentenceVariation: aiDetection.sentenceVariation || 0,
            wordsAdded: aiDetection.wordsAdded || 0,
            wordsRemoved: aiDetection.wordsRemoved || 0,
            percentageChange: aiDetection.percentageChange || 0,
            significantlyModified: aiDetection.significantlyModified || false,
            createdAt: new Date()
          }
        })
      } catch (detectionError) {
        console.error("Failed to save AI detection:", detectionError)
        // Continue even if AI detection save fails
      }
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission
    })

  } catch (error: any) {
    console.error("Submit final error:", error)
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    )
  }
}
