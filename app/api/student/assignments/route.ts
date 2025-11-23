import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get student ID from session
    const studentEmail = session.user.email
    
    // Find student
    const student = await prisma.student.findUnique({
      where: { email: studentEmail as string }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Fetch assignments for student's year and major
    const assignments = await prisma.assignment.findMany({
      where: {
        year: student.year,
        major: student.major
      },
      include: {
        faculty: {
          select: {
            name: true,
            email: true
          }
        },
        submissions: {
          where: {
            studentId: student.studentId
          },
          select: {
            submissionId: true,
            status: true,
            usesAi: true,
            aiDetected: true,
            submissionDate: true,
            draftScore: true,
            finalScore: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    // Transform data for frontend
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = assignment.submissions[0] // Get student's submission if exists
      
      return {
        id: assignment.assignmentId,
        assignmentId: assignment.assignmentId,
        title: `${assignment.type} Assignment`,
        description: `${assignment.major} - ${assignment.type}`,
        type: assignment.type,
        dueDate: assignment.dueDate,
        aiAllowed: assignment.aiAllowed,
        aiLockedUntilDraft: assignment.aiLockedUntilDraft,
        faculty: {
          name: assignment.faculty.name,
          email: assignment.faculty.email
        },
        submission: submission ? {
          id: submission.submissionId,
          status: submission.status,
          usesAi: submission.usesAi,
          aiDetected: submission.aiDetected,
          submittedAt: submission.submissionDate,
          draftScore: submission.draftScore,
          finalScore: submission.finalScore
        } : null
      }
    })

    return NextResponse.json({
      assignments: assignmentsWithStatus,
      studentId: student.studentId
    })
  } catch (error: any) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments: " + error.message },
      { status: 500 }
    )
  }
}
