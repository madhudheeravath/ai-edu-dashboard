import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET - Get student's enrolled subjects
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get student's ID
    const student = await prisma.student.findUnique({
      where: { email: session.user.email! },
      select: { studentId: true }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get enrolled subjects with details
    const enrolledSubjects = await prisma.studentSubject.findMany({
      where: {
        studentId: student.studentId,
        isActive: true
      },
      include: {
        subject: {
          include: {
            faculty: {
              include: {
                faculty: {
                  select: {
                    name: true,
                    facultyId: true
                  }
                }
              }
            },
            _count: {
              select: {
                assignments: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(enrolledSubjects)
  } catch (error) {
    console.error("Error fetching student subjects:", error)
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}

// POST - Enroll student in subjects (up to 4)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "student") {
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
        { error: "Students must enroll in 1 to 4 subjects" },
        { status: 400 }
      )
    }

    // Get student's ID
    const student = await prisma.student.findUnique({
      where: { email: session.user.email! },
      select: { studentId: true }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Deactivate all current enrollments
    await prisma.studentSubject.updateMany({
      where: { studentId: student.studentId },
      data: { isActive: false }
    })

    // Enroll in new subjects
    const enrollments = await Promise.all(
      subjectIds.map(async (subjectId: string) => {
        return prisma.studentSubject.upsert({
          where: {
            studentId_subjectId: {
              studentId: student.studentId,
              subjectId
            }
          },
          update: { isActive: true, enrolledAt: new Date() },
          create: {
            studentId: student.studentId,
            subjectId,
            isActive: true
          }
        })
      })
    )

    return NextResponse.json({
      message: "Successfully enrolled in subjects",
      enrollments
    })
  } catch (error) {
    console.error("Error enrolling in subjects:", error)
    return NextResponse.json(
      { error: "Failed to enroll in subjects" },
      { status: 500 }
    )
  }
}
