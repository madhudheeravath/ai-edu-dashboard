import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET - Fetch all subjects or filter by department
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const department = searchParams.get('department')
    const semester = searchParams.get('semester')
    const forEnrollment = searchParams.get('forEnrollment') === 'true'

    // Build where clause
    const whereClause: any = {
      isActive: true
    }

    if (department) {
      whereClause.department = department
    }

    if (semester) {
      whereClause.semester = parseInt(semester)
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        faculty: {
          include: {
            faculty: {
              select: {
                facultyId: true,
                name: true
              }
            }
          }
        },
        students: forEnrollment ? {
          select: {
            studentId: true
          }
        } : false,
        _count: {
          select: {
            students: true,
            assignments: true
          }
        }
      },
      orderBy: [
        { department: 'asc' },
        { semester: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(subjects)
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}

// POST - Create a new subject (admin/faculty only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { subjectCode, name, description, credits, department, semester } = body

    // Validate required fields
    if (!subjectCode || !name || !department) {
      return NextResponse.json(
        { error: "Subject code, name, and department are required" },
        { status: 400 }
      )
    }

    // Check if subject code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { subjectCode }
    })

    if (existingSubject) {
      return NextResponse.json(
        { error: "Subject code already exists" },
        { status: 400 }
      )
    }

    // Create the subject
    const subject = await prisma.subject.create({
      data: {
        subjectCode,
        name,
        description: description || null,
        credits: credits || 3,
        department,
        semester: semester || 1,
        isActive: true
      }
    })

    return NextResponse.json({
      message: "Subject created successfully",
      subject
    })
  } catch (error) {
    console.error("Error creating subject:", error)
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    )
  }
}
