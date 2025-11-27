import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET all assignments for faculty
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const facultyEmail = session.user.email
    
    const faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail as string }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    // Get all assignments created by this faculty
    const assignments = await prisma.assignment.findMany({
      where: { facultyId: faculty.facultyId },
      include: {
        subject: {
          select: {
            id: true,
            subjectCode: true,
            name: true,
            department: true
          }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdDate: 'desc' }
    })

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.assignmentId,
      assignmentId: assignment.assignmentId,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      major: assignment.major,
      year: assignment.year,
      subjectId: assignment.subjectId,
      subject: assignment.subject,
      dueDate: assignment.dueDate,
      aiAllowed: assignment.aiAllowed,
      aiLockedUntilDraft: assignment.aiLockedUntilDraft,
      createdDate: assignment.createdDate,
      submissionCount: assignment._count.submissions
    }))

    return NextResponse.json({
      assignments: formattedAssignments,
      total: formattedAssignments.length
    })
  } catch (error: any) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments: " + error.message },
      { status: 500 }
    )
  }
}

// POST create new assignment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const facultyEmail = session.user.email
    
    const faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail as string }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    const body = await req.json()
    const { title, description, type, major, year, dueDate, aiAllowed, aiLockedUntilDraft, subjectId } = body

    // Log received data for debugging
    console.log('Received assignment data:', { title, type, major, year: typeof year, yearValue: year, dueDate, subjectId })

    // Validate required fields
    if (!title || !type || !dueDate) {
      return NextResponse.json(
        { error: "Missing required fields (title, type, dueDate)" },
        { status: 400 }
      )
    }

    // Parse year to integer (default to 1 if not provided)
    const yearInt = parseInt(year) || 1
    if (yearInt < 1 || yearInt > 8) {
      return NextResponse.json(
        { error: "Invalid year value. Must be 1-4." },
        { status: 400 }
      )
    }

    console.log('Parsed year:', yearInt)

    // Generate assignment ID
    const assignmentId = `ASN${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Determine major from subject if not provided
    let assignmentMajor = major
    if (!assignmentMajor && subjectId) {
      try {
        const subject = await prisma.subject.findUnique({
          where: { id: subjectId },
          select: { department: true }
        })
        assignmentMajor = subject?.department || "General"
      } catch (e) {
        assignmentMajor = "General"
      }
    }
    assignmentMajor = assignmentMajor || "General"

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        assignmentId,
        facultyId: faculty.facultyId,
        subjectId: subjectId || null,
        title,
        description: description || "",
        type,
        major: assignmentMajor,
        year: yearInt,
        dueDate: new Date(dueDate),
        aiAllowed: aiAllowed || false,
        aiLockedUntilDraft: aiLockedUntilDraft || false,
        createdDate: new Date()
      }
    })

    console.log('Created assignment with year:', assignment.year)

    return NextResponse.json({
      success: true,
      message: "Assignment created successfully",
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
        aiLockedUntilDraft: assignment.aiLockedUntilDraft
      }
    })
  } catch (error: any) {
    console.error("Error creating assignment:", error)
    return NextResponse.json(
      { error: "Failed to create assignment: " + error.message },
      { status: 500 }
    )
  }
}
