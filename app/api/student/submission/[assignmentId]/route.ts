import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
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

    // Find submission for this assignment and student
    const submission = await prisma.submission.findFirst({
      where: {
        assignmentId: params.assignmentId,
        studentId: student.studentId
      },
      include: {
        assignment: {
          select: {
            assignmentId: true,
            title: true,
            description: true,
            type: true,
            dueDate: true,
            aiAllowed: true,
            aiLockedUntilDraft: true,
            faculty: {
              select: {
                name: true,
                major: true
              }
            }
          }
        },
        reflection: true,
        rubricEval: true
      }
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found", hasSubmission: false }, { status: 404 })
    }

    // Get AI detection results for this submission
    const aiDetection = await prisma.aIDetectionResult.findMany({
      where: {
        submissionId: submission.submissionId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      hasSubmission: true,
      submission: {
        ...submission,
        aiDetection
      }
    })
  } catch (error) {
    console.error("Error fetching submission:", error)
    return NextResponse.json(
      { error: "Failed to fetch submission", hasSubmission: false },
      { status: 500 }
    )
  }
}
