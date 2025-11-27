import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET - Get faculty's assigned subjects
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get faculty's ID
    const faculty = await prisma.faculty.findUnique({
      where: { email: session.user.email! },
      select: { facultyId: true }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    // Get assigned subjects with details
    const assignedSubjects = await prisma.facultySubject.findMany({
      where: {
        facultyId: faculty.facultyId,
        isActive: true
      },
      include: {
        subject: {
          include: {
            students: {
              where: { isActive: true },
              select: {
                student: {
                  select: {
                    studentId: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
            _count: {
              select: {
                students: true,
                assignments: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(assignedSubjects)
  } catch (error) {
    console.error("Error fetching faculty subjects:", error)
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}

// POST - Assign subjects to faculty (up to 4)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { subjectIds } = body

    if (!subjectIds || !Array.isArray(subjectIds)) {
      return NextResponse.json(
        { error: "Subject IDs array is required" },
        { status: 400 }
      )
    }

    // Validate: 1-4 subjects (flexible for testing, recommended 3-4)
    if (subjectIds.length < 1 || subjectIds.length > 4) {
      return NextResponse.json(
        { error: "Faculty must teach 1 to 4 subjects" },
        { status: 400 }
      )
    }

    // Get faculty's ID
    const faculty = await prisma.faculty.findUnique({
      where: { email: session.user.email! },
      select: { facultyId: true }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    // Deactivate all current assignments
    await prisma.facultySubject.updateMany({
      where: { facultyId: faculty.facultyId },
      data: { isActive: false }
    })

    // Assign new subjects
    const assignments = await Promise.all(
      subjectIds.map(async (subjectId: string) => {
        return prisma.facultySubject.upsert({
          where: {
            facultyId_subjectId: {
              facultyId: faculty.facultyId,
              subjectId
            }
          },
          update: { isActive: true, assignedAt: new Date() },
          create: {
            facultyId: faculty.facultyId,
            subjectId,
            isActive: true
          }
        })
      })
    )

    return NextResponse.json({
      message: "Successfully assigned subjects",
      assignments
    })
  } catch (error) {
    console.error("Error assigning subjects:", error)
    return NextResponse.json(
      { error: "Failed to assign subjects" },
      { status: 500 }
    )
  }
}
