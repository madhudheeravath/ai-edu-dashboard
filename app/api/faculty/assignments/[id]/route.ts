import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET single assignment
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assignmentId = params.id
    const facultyEmail = session.user.email
    
    const faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail as string }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    const assignment = await prisma.assignment.findFirst({
      where: {
        assignmentId,
        facultyId: faculty.facultyId
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    return NextResponse.json({
      assignment: {
        id: assignment.assignmentId,
        assignmentId: assignment.assignmentId,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        major: assignment.major,
        year: assignment.year,
        dueDate: assignment.dueDate,
        aiAllowed: assignment.aiAllowed,
        aiLockedUntilDraft: assignment.aiLockedUntilDraft,
        createdDate: assignment.createdDate,
        submissionCount: assignment._count.submissions
      }
    })
  } catch (error: any) {
    console.error("Error fetching assignment:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignment: " + error.message },
      { status: 500 }
    )
  }
}

// PUT update assignment
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assignmentId = params.id
    const facultyEmail = session.user.email
    
    const faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail as string }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    // Verify assignment belongs to this faculty
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        assignmentId,
        facultyId: faculty.facultyId
      }
    })

    if (!existingAssignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const body = await req.json()
    const { title, description, type, major, year, dueDate, aiAllowed, aiLockedUntilDraft } = body

    // Update assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { assignmentId },
      data: {
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        type: type || undefined,
        major: major || undefined,
        year: year ? parseInt(year) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        aiAllowed: aiAllowed !== undefined ? aiAllowed : undefined,
        aiLockedUntilDraft: aiLockedUntilDraft !== undefined ? aiLockedUntilDraft : undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
      assignment: {
        id: updatedAssignment.assignmentId,
        title: updatedAssignment.title,
        description: updatedAssignment.description,
        type: updatedAssignment.type,
        major: updatedAssignment.major,
        year: updatedAssignment.year,
        dueDate: updatedAssignment.dueDate,
        aiAllowed: updatedAssignment.aiAllowed,
        aiLockedUntilDraft: updatedAssignment.aiLockedUntilDraft
      }
    })
  } catch (error: any) {
    console.error("Error updating assignment:", error)
    return NextResponse.json(
      { error: "Failed to update assignment: " + error.message },
      { status: 500 }
    )
  }
}

// DELETE assignment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const assignmentId = params.id
    const facultyEmail = session.user.email
    
    const faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail as string }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    // Verify assignment belongs to this faculty
    const assignment = await prisma.assignment.findFirst({
      where: {
        assignmentId,
        facultyId: faculty.facultyId
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    // Warn if there are submissions
    if (assignment._count.submissions > 0) {
      return NextResponse.json({
        error: `Cannot delete assignment with ${assignment._count.submissions} submissions`,
        canDelete: false
      }, { status: 400 })
    }

    // Delete assignment
    await prisma.assignment.delete({
      where: { assignmentId }
    })

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully"
    })
  } catch (error: any) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json(
      { error: "Failed to delete assignment: " + error.message },
      { status: 500 }
    )
  }
}
