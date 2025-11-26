import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "faculty") {
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

    // Get all submissions for this faculty to find unique students
    const submissions = await prisma.submission.findMany({
      where: { facultyId: faculty.facultyId },
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
        }
      }
    })

    // Get AI detection results for these submissions
    const submissionIds = submissions.map(s => s.submissionId)
    const aiDetectionResults = await prisma.aIDetectionResult.findMany({
      where: {
        submissionId: { in: submissionIds }
      },
      select: {
        submissionId: true,
        aiLikelihood: true,
        humanLikelihood: true
      }
    })

    // Group by student and calculate stats
    const studentMap = new Map()

    submissions.forEach(sub => {
      const studentId = sub.student.studentId

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId: sub.student.studentId,
          name: sub.student.name,
          email: sub.student.email,
          year: sub.student.year,
          major: sub.student.major,
          priorGpa: sub.student.priorGpa,
          firstGen: sub.student.firstGen,
          submissions: [],
          aiUsageCount: 0
        })
      }

      const studentData = studentMap.get(studentId)
      studentData.submissions.push(sub)
      if (sub.usesAi) {
        studentData.aiUsageCount++
      }
    })

    // Transform to final format
    const studentsData = Array.from(studentMap.values()).map(student => {
      const totalSubmissions = student.submissions.length

      // Calculate average AI likelihood from AI detection results
      const studentSubmissionIds = student.submissions.map((s: any) => s.submissionId)
      const studentAiDetections = aiDetectionResults.filter(d =>
        studentSubmissionIds.includes(d.submissionId)
      )

      const avgAI = studentAiDetections.length > 0
        ? Math.min(100, Math.round(
          studentAiDetections.reduce((sum, d) => sum + d.aiLikelihood, 0) / studentAiDetections.length
        ))
        : 0

      const creativityScores = student.submissions
        .filter((s: any) => s.creativityScore > 0)
        .map((s: any) => s.creativityScore)

      const avgCreativity = creativityScores.length > 0
        ? creativityScores.reduce((a: number, b: number) => a + b, 0) / creativityScores.length
        : 0

      return {
        id: student.studentId,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        year: student.year,
        major: student.major,
        priorGpa: student.priorGpa,
        firstGen: student.firstGen,
        submissions: totalSubmissions,
        avgAI,
        avgCreativity: parseFloat(avgCreativity.toFixed(1))
      }
    })

    // Sort by name
    studentsData.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      students: studentsData,
      total: studentsData.length
    })
  } catch (error: any) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Failed to fetch students: " + error.message },
      { status: 500 }
    )
  }
}
