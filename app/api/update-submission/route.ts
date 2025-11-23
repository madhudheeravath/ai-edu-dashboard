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

    const { assignmentId, step, content, aiDetection } = await req.json()

    if (!assignmentId || !step) {
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

    // Find or create the submission
    let submission = await prisma.submission.findFirst({
      where: {
        assignmentId: assignmentId,
        studentId: student.studentId
      }
    })

    if (!submission) {
      // Create new submission if it doesn't exist
      const assignment = await prisma.assignment.findUnique({
        where: { assignmentId: assignmentId },
        select: { facultyId: true }
      })

      if (!assignment) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
      }

      submission = await prisma.submission.create({
        data: {
          submissionId: `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          assignmentId: assignmentId,
          studentId: student.studentId,
          facultyId: assignment.facultyId,
          submissionDate: new Date(),
          status: "Draft",
          usesAi: false,
          aiAccessHours: 0,
          draftScore: 0,
          finalScore: 0,
          creativityScore: 0,
          aiDetected: false,
          aiConfidence: 0,
          timeHours: 0,
          criticalThinkingScore: 0,
          satisfactionLevel: 0
        }
      })
    }

    // Update based on step
    const updateData: any = {}
    
    if (step === "draft") {
      updateData.draftContent = content
      updateData.status = "Draft"
      // Update AI usage based on detection results
      if (aiDetection) {
        updateData.usesAi = aiDetection.aiLikelihood >= 40
        updateData.aiDetected = aiDetection.aiLikelihood >= 40
        updateData.aiConfidence = aiDetection.aiLikelihood / 100
      }
    } else if (step === "reflection") {
      // Create or update reflection
      const existingReflection = await prisma.reflection.findFirst({
        where: { submissionId: submission.submissionId }
      })

      if (existingReflection) {
        await prisma.reflection.update({
          where: { reflectionId: existingReflection.reflectionId },
          data: { content: content }
        })
      } else {
        await prisma.reflection.create({
          data: {
            reflectionId: `REF_${Date.now()}`,
            submissionId: submission.submissionId,
            studentId: student.studentId,
            type: "General",
            content: content,
            depthScore: 0,
            words: content.split(/\s+/).length,
            date: new Date(),
            createdAt: new Date()
          }
        })
      }
    } else if (step === "final") {
      updateData.finalContent = content
      updateData.status = "Submitted"
      updateData.submissionDate = new Date()
      // Update AI usage based on detection results
      if (aiDetection) {
        updateData.usesAi = aiDetection.aiLikelihood >= 40
        updateData.aiDetected = aiDetection.aiLikelihood >= 40
        updateData.aiConfidence = aiDetection.aiLikelihood / 100
      }
    }

    // Update the submission
    if (Object.keys(updateData).length > 0) {
      submission = await prisma.submission.update({
        where: { submissionId: submission.submissionId },
        data: updateData
      })
    }

    // Save AI detection results if available
    if (aiDetection && (step === "draft" || step === "final")) {
      try {
        await prisma.aIDetectionResult.create({
          data: {
            submissionId: submission.submissionId,
            stage: step,
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
      submission
    })

  } catch (error: any) {
    console.error("Update submission error:", error)
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    )
  }
}
