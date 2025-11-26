import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const facultyEmail = session.user.email

    // Find faculty
    const faculty = await prisma.faculty.findUnique({
      where: { email: facultyEmail as string }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count rubric evaluations created today by this faculty
    const gradedTodayCount = await prisma.rubricEvaluation.count({
      where: {
        facultyId: faculty.facultyId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Get grading activities today to calculate average time
    const gradingActivities = await prisma.facultyActivity.findMany({
      where: {
        facultyId: faculty.facultyId,
        activity: 'graded_submission',
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        durationMin: true
      }
    })

    // Calculate average time (if we have duration data)
    let avgTime = null
    if (gradingActivities.length > 0) {
      const totalMinutes = gradingActivities.reduce((sum, act) => sum + (act.durationMin || 5), 0)
      avgTime = Math.round(totalMinutes / gradingActivities.length)
    } else if (gradedTodayCount > 0) {
      // Default estimate: 5 minutes per grade if no tracking
      avgTime = 5
    }

    return NextResponse.json({
      count: gradedTodayCount,
      avgTimeMinutes: avgTime
    })
  } catch (error: any) {
    console.error("Error fetching graded today count:", error)
    return NextResponse.json(
      { error: "Failed to fetch count: " + error.message },
      { status: 500 }
    )
  }
}
