import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      password,
      role,
      // Student fields
      studentId,
      major,
      semester,
      aiAwareness,
      // Faculty fields
      facultyId,
      department,
      expYears,
      aiLiteracy,
      dashboardAdoption,
      numCourses
    } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.student.findUnique({
      where: { email }
    }).catch(() => null)

    const existingFaculty = await prisma.faculty.findUnique({
      where: { email }
    }).catch(() => null)

    if (existingUser || existingFaculty) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    if (role === "student") {
      // Validate student-specific fields
      if (!studentId || !major || !semester) {
        return NextResponse.json(
          { error: "Missing required student information" },
          { status: 400 }
        )
      }

      // Check if studentId already exists
      const existingStudent = await prisma.student.findUnique({
        where: { studentId }
      }).catch(() => null)

      if (existingStudent) {
        return NextResponse.json(
          { error: "Student ID already exists" },
          { status: 400 }
        )
      }

      // Create student
      const student = await prisma.student.create({
        data: {
          studentId,
          name,
          email,
          password: hashedPassword,
          major,
          semester: semester,
          year: parseInt(semester) || 1, // Use semester as year approximation
          firstGen: false, // Default value
          priorGpa: 3.0, // Default GPA
          gender: "Not specified", // Default value
          aiAwareness: aiAwareness ? parseFloat(aiAwareness) : 3.0,
          enrollmentDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        message: "Student account created successfully",
        user: {
          id: student.studentId,
          name: student.name,
          email: student.email,
          role: "student"
        }
      })

    } else if (role === "faculty") {
      // Validate faculty-specific fields
      if (!facultyId || !department || !expYears) {
        return NextResponse.json(
          { error: "Missing required faculty information" },
          { status: 400 }
        )
      }

      // Check if facultyId already exists
      const existingFaculty = await prisma.faculty.findUnique({
        where: { facultyId }
      }).catch(() => null)

      if (existingFaculty) {
        return NextResponse.json(
          { error: "Faculty ID already exists" },
          { status: 400 }
        )
      }

      // Create faculty
      const faculty = await prisma.faculty.create({
        data: {
          facultyId,
          name,
          email,
          password: hashedPassword,
          major: department, // Using department as major field
          expYears: parseInt(expYears),
          aiLiteracy: aiLiteracy ? parseFloat(aiLiteracy) : 3.0,
          dashboardAdoption: new Date(),
          numCourses: numCourses ? parseInt(numCourses) : 2,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        message: "Faculty account created successfully",
        user: {
          id: faculty.facultyId,
          name: faculty.name,
          email: faculty.email,
          role: "faculty"
        }
      })

    } else {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error("Signup error:", error)

    // Handle Prisma unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
