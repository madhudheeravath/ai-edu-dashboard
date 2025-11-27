import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get faculty email from session
    const facultyEmail = session.user.email

    // Find faculty
    const faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail as string }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    // Get faculty's subjects
    let facultySubjects: any[] = []
    try {
      const fs = await prisma.facultySubject.findMany({
        where: {
          facultyId: faculty.facultyId,
          isActive: true
        },
        include: {
          subject: true
        }
      })
      facultySubjects = fs.map(f => f.subject)
    } catch (e) {
      // FacultySubject table might not exist
    }

    // Get query params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // pending, graded, flagged
    const search = searchParams.get('search')

    // Build where clause - get all submissions for this faculty
    const where: any = {
      facultyId: faculty.facultyId
    }

    if (status && status !== 'all') {
      where.status = status
    }

    // Fetch submissions
    let submissions = await prisma.submission.findMany({
      where,
      include: {
        student: {
          select: {
            studentId: true,
            name: true,
            email: true,
            year: true,
            major: true,
            firstGen: true,
            priorGpa: true
          }
        },
        assignment: {
          select: {
            assignmentId: true,
            title: true,
            type: true,
            major: true,
            aiAllowed: true,
            subjectId: true,
            subject: {
              select: {
                id: true,
                subjectCode: true,
                name: true
              }
            }
          }
        },
        rubricEval: {
          select: {
            originality: true,
            effort: true,
            finalGrade: true
          }
        }
      },
      orderBy: {
        submissionDate: 'desc'
      }
    })

    // Fetch AI detection results for these submissions
    const submissionIds = submissions.map(s => s.submissionId)
    const aiDetectionResults = await prisma.aIDetectionResult.findMany({
      where: {
        submissionId: { in: submissionIds }
      },
      select: {
        submissionId: true,
        aiLikelihood: true
      }
    })

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase()
      submissions = submissions.filter(sub =>
        sub.student.name.toLowerCase().includes(searchLower) ||
        sub.assignment.type.toLowerCase().includes(searchLower)
      )
    }

    // Transform for frontend
    const transformedSubmissions = submissions.map(sub => {
      // Get AI detection result for this submission
      // Prioritize the confidence score stored on the submission itself as it reflects the latest state
      let aiDetected = sub.aiConfidence ? Math.round(sub.aiConfidence * 100) : 0

      // Fallback: If 0, check if we have a detection result record (could be from draft)
      if (aiDetected === 0) {
        const aiDetection = aiDetectionResults.find(d => d.submissionId === sub.submissionId)
        if (aiDetection) {
          // Only use this if we really don't have a score on the submission
          // But be careful as this might be a draft score
          aiDetected = aiDetection.aiLikelihood
        }
      }

      return {
        id: sub.submissionId,
        submissionId: sub.submissionId,
        student: sub.student.name,
        studentId: sub.student.studentId,
        studentEmail: sub.student.email,
        assignment: sub.assignment.title || `${sub.assignment.type} - ${sub.assignment.major}`,
        assignmentType: sub.assignment.type,
        type: sub.assignment.type,
        subjectId: sub.assignment.subjectId,
        subject: sub.assignment.subject,
        submittedAt: sub.submissionDate,
        aiDetected: Math.min(100, Math.round(aiDetected)),
        aiConfidence: aiDetected,
        status: sub.status,
        usesAi: sub.usesAi,
        draftScore: sub.draftScore,
        finalScore: sub.finalScore,
        creativityScore: sub.creativityScore,
        graded: sub.rubricEval !== null,
        rubric: sub.rubricEval
      }
    })

    return NextResponse.json({
      submissions: transformedSubmissions,
      subjects: facultySubjects,
      total: transformedSubmissions.length
    })
  } catch (error: any) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json(
      { error: "Failed to fetch submissions: " + error.message },
      { status: 500 }
    )
  }
}
