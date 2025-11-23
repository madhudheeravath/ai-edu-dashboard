import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the student's info for filtering
    let studentIdToFilter: string | undefined = undefined
    let studentYear: number | undefined = undefined
    let studentMajor: string | undefined = undefined
    
    if (session.user.role === "student") {
      const student = await prisma.student.findUnique({
        where: { email: session.user.email! },
        select: { studentId: true, year: true, major: true }
      })
      studentIdToFilter = student?.studentId
      studentYear = student?.year
      studentMajor = student?.major
      
      console.log('Student info:', {
        studentId: studentIdToFilter,
        year: studentYear,
        major: studentMajor,
        email: session.user.email
      })
    }

    // Fetch assignments (filtered by student's year and major if student)
    const assignments = await prisma.assignment.findMany({
      where: session.user.role === "student" ? {
        year: studentYear,
        major: studentMajor
      } : undefined,
      include: {
        faculty: {
          select: {
            name: true,
            major: true,
          },
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
    if (session.user.role === "student") {
      console.log('Filtering criteria:', { year: studentYear, major: studentMajor })
      console.log('Assignments found:', assignments.map(a => ({
        id: a.id,
        title: a.title,
        year: a.year,
        major: a.major
      })))
    }

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}
