import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET faculty settings
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

    return NextResponse.json({
      facultyId: faculty.facultyId,
      name: faculty.name,
      email: faculty.email,
      major: faculty.major,
      bio: "", // Bio not in schema, using empty string
      // Default notification preferences
      notifications: {
        newSubmissions: true,
        highAI: true,
        studentQuestions: false,
        weeklySummary: true
      },
      // Default grading preferences
      grading: {
        showAIFirst: true,
        autoSave: true,
        requireFeedback: true
      }
    })
  } catch (error: any) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings: " + error.message },
      { status: 500 }
    )
  }
}

// UPDATE faculty settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const facultyEmail = session.user.email
    const body = await req.json()
    const { name, department } = body

    const updatedFaculty = await prisma.faculty.update({
      where: { email: facultyEmail as string },
      data: {
        name: name || undefined,
        major: department || undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      faculty: {
        facultyId: updatedFaculty.facultyId,
        name: updatedFaculty.name,
        email: updatedFaculty.email,
        major: updatedFaculty.major
      }
    })
  } catch (error: any) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings: " + error.message },
      { status: 500 }
    )
  }
}
