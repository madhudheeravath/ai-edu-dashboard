import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

// GET - Get all students enrolled in faculty's subjects
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

    // Get all subjects this faculty teaches with enrolled students
    const facultySubjects = await prisma.facultySubject.findMany({
      where: {
        facultyId: faculty.facultyId,
        isActive: true
      },
      include: {
        subject: {
          include: {
            students: {
              where: { isActive: true },
              include: {
                student: {
                  select: {
                    studentId: true,
                    name: true,
                    email: true,
                    major: true,
                    year: true
                  }
                }
              }
            },
            _count: {
              select: {
                students: true
              }
            }
          }
        }
      }
    })

    // Transform data for the frontend
    const result = facultySubjects.map(fs => ({
      id: fs.id,
      subjectId: fs.subjectId,
      subjectCode: fs.subject.subjectCode,
      name: fs.subject.name,
      department: fs.subject.department,
      credits: fs.subject.credits,
      assignedAt: fs.assignedAt.toISOString(),
      students: fs.subject.students.map(ss => ({
        studentId: ss.student.studentId,
        name: ss.student.name,
        email: ss.student.email,
        major: ss.student.major,
        year: ss.student.year,
        enrolledAt: ss.enrolledAt.toISOString()
      })),
      _count: fs.subject._count
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching enrolled students:", error)
    return NextResponse.json(
      { error: "Failed to fetch enrolled students" },
      { status: 500 }
    )
  }
}
