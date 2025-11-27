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

    const { searchParams } = new URL(req.url)
    const subjectFilter = searchParams.get('subject')

    // Get the student's info for filtering
    let studentIdToFilter: string | undefined = undefined
    let studentYear: number | undefined = undefined
    let studentMajor: string | undefined = undefined
    let enrolledSubjectIds: string[] = []
    
    if (session.user.role === "student") {
      const student = await prisma.student.findUnique({
        where: { email: session.user.email! },
        select: { studentId: true, year: true, major: true }
      })
      studentIdToFilter = student?.studentId
      studentYear = student?.year
      studentMajor = student?.major

      // Get enrolled subjects
      try {
        const enrolledSubjects = await prisma.studentSubject.findMany({
          where: {
            studentId: student?.studentId,
            isActive: true
          },
          select: { subjectId: true }
        })
        enrolledSubjectIds = enrolledSubjects.map(e => e.subjectId)
      } catch (e) {
        // StudentSubject table might not exist yet
        enrolledSubjectIds = []
      }
      
      console.log('Student info:', {
        studentId: studentIdToFilter,
        year: studentYear,
        major: studentMajor,
        enrolledSubjects: enrolledSubjectIds.length,
        email: session.user.email
      })
    }

    // Build where clause for assignments
    let whereClause: any = {}
    
    if (session.user.role === "student") {
      // Only show assignments for enrolled subjects
      if (enrolledSubjectIds.length > 0) {
        whereClause = {
          subjectId: { in: enrolledSubjectIds }
        }
      } else {
        // No enrolled subjects - return empty
        return NextResponse.json([])
      }
    }

    // Add subject filter if provided
    if (subjectFilter) {
      const subject = await prisma.subject.findUnique({
        where: { subjectCode: subjectFilter }
      })
      if (subject) {
        whereClause = { subjectId: subject.id }
      }
    }

    // Fetch assignments
    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        faculty: {
          select: {
            name: true,
            major: true,
          },
        },
        subject: {
          select: {
            id: true,
            subjectCode: true,
            name: true,
            department: true
          }
        },
        submissions: {
          where: studentIdToFilter ? {
            studentId: studentIdToFilter
          } : undefined,
          select: {
            id: true,
            status: true,
            finalScore: true,
            submissionDate: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    })

    console.log(`Found ${assignments.length} assignments for ${session.user.role}`)

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}
