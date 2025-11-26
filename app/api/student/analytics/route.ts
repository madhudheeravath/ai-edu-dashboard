import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the student's actual studentId
    const student = await prisma.student.findUnique({
      where: { email: session.user.email! },
      select: { studentId: true }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Fetch all submissions for the student
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: student.studentId
      },
      include: {
        assignment: {
          select: {
            title: true,
            assignmentId: true
          }
        }
      },
      orderBy: {
        submissionDate: "desc"
      }
    })

    // Fetch AI detection results separately
    const submissionIds = submissions.map(s => s.submissionId)
    const aiDetectionResults = await prisma.aIDetectionResult.findMany({
      where: {
        submissionId: { in: submissionIds },
        stage: "final"
      }
    })

    // Get reflections count
    const reflectionsCount = await prisma.reflection.count({
      where: {
        studentId: student.studentId
      }
    })

    // Calculate statistics
    const totalSubmissions = submissions.length
    const completedAssignments = submissions.filter(s => s.status === "Submitted" || s.status === "Graded").length

    const avgCreativity = submissions.length > 0
      ? submissions.reduce((sum, s) => sum + s.creativityScore, 0) / submissions.length
      : 0

    const avgGrade = submissions.length > 0
      ? submissions.reduce((sum, s) => sum + s.finalScore, 0) / submissions.length
      : 0

    const aiUsageCount = submissions.filter(s => s.usesAi).length
    const aiUsagePercent = submissions.length > 0
      ? Math.min(100, Math.round((aiUsageCount / submissions.length) * 100))
      : 0

    const totalAiHours = submissions.reduce((sum, s) => sum + s.aiAccessHours, 0)

    // Format assignment data
    const assignments = submissions.map(s => ({
      assignmentId: s.assignment.assignmentId,
      title: s.assignment.title,
      creativityScore: s.creativityScore,
      finalScore: s.finalScore,
      usesAi: s.usesAi,
      aiConfidence: s.aiConfidence,
      submissionDate: s.submissionDate.toISOString()
    }))

    // Format AI usage data
    const aiUsageByAssignment = submissions
      .map(s => {
        const detection = aiDetectionResults.find(d => d.submissionId === s.submissionId)
        return detection ? {
          title: s.assignment.title,
          aiLikelihood: detection.aiLikelihood,
          humanLikelihood: detection.humanLikelihood
        } : null
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    return NextResponse.json({
      studentId: student.studentId,
      totalSubmissions,
      completedAssignments,
      avgCreativity,
      avgGrade,
      aiUsagePercent,
      totalAiHours,
      reflectionsCount,
      assignments,
      aiUsageByAssignment
    })

  } catch (error: any) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
