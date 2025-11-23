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

    const studentId = params.id
    const facultyEmail = session.user.email
    
    // Find faculty
    const faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail as string }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { studentId },
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
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get all submissions for this student under this faculty
    const submissions = await prisma.submission.findMany({
      where: {
        studentId,
        facultyId: faculty.facultyId
      },
      include: {
        assignment: {
          select: {
            type: true,
            major: true
          }
        }
      },
      orderBy: {
        submissionDate: 'desc'
      }
    })
    
    // Get AI detection results for these submissions
    const submissionIds = submissions.map(s => s.submissionId)
    const aiDetectionResults = await prisma.aIDetectionResult.findMany({
      where: { submissionId: { in: submissionIds } },
      select: {
        submissionId: true,
        aiLikelihood: true
      }
    })

    // Transform submissions
    const transformedSubmissions = submissions.map(sub => {
      const aiDetection = aiDetectionResults.find(d => d.submissionId === sub.submissionId)
      return {
        submissionId: sub.submissionId,
        assignmentType: sub.assignment.type,
        assignmentMajor: sub.assignment.major,
        submittedAt: sub.submissionDate,
        status: sub.status,
        aiConfidence: aiDetection ? Math.min(100, Math.round(aiDetection.aiLikelihood)) : 0,
        creativityScore: sub.creativityScore || 0,
        finalScore: sub.finalScore || 0,
        usesAi: sub.usesAi
      }
    })

    return NextResponse.json({
      student,
      submissions: transformedSubmissions
    })
  } catch (error: any) {
    console.error("Error fetching student details:", error)
    return NextResponse.json(
      { error: "Failed to fetch student: " + error.message },
      { status: 500 }
    )
  }
}
