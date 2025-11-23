import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "faculty") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the faculty's actual facultyId
    const faculty = await prisma.faculty.findUnique({
      where: { email: session.user.email! },
      select: { facultyId: true, name: true }
    })

    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    const facultyId = faculty.facultyId

    // Get assignments created by this faculty
    const assignments = await prisma.assignment.findMany({
      where: { facultyId }
    })

    const assignmentIds = assignments.map(a => a.assignmentId)

    // Get all submissions for this faculty's assignments
    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: { in: assignmentIds }
      },
      include: {
        student: {
          select: {
            studentId: true,
            name: true
          }
        }
      }
    })

    // Calculate stats
    const now = new Date()
    
    // Total unique students (who have submitted work)
    const uniqueStudentIds = new Set(submissions.map(s => s.studentId))
    const totalStudents = uniqueStudentIds.size
    
    // Count courses (assignments)
    const totalCourses = assignments.length
    
    // Pending reviews (submissions that are submitted but not graded)
    const pendingReviews = submissions.filter(s => s.status === "Submitted").length
    
    // Due this week (submissions pending and assignments due within 7 days)
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const dueThisWeek = submissions.filter(s => {
      const assignment = assignments.find(a => a.assignmentId === s.assignmentId)
      if (!assignment) return false
      const dueDate = new Date(assignment.dueDate)
      return s.status === "Submitted" && dueDate > now && dueDate <= oneWeekFromNow
    }).length
    
    // Average creativity score
    const validCreativityScores = submissions
      .filter(s => s.creativityScore > 0)
      .map(s => s.creativityScore)
    
    const avgCreativity = validCreativityScores.length > 0
      ? validCreativityScores.reduce((a, b) => a + b, 0) / validCreativityScores.length
      : 0
    
    // AI usage rate (percentage of students using AI)
    const aiUsedCount = submissions.filter(s => s.usesAi).length
    const aiUsageRate = submissions.length > 0
      ? Math.min(100, Math.round((aiUsedCount / submissions.length) * 100))
      : 0
    
    // Graded submissions
    const gradedSubmissions = submissions.filter(s => s.status === "Graded").length
    
    // Average grade
    const validGrades = submissions
      .filter(s => s.finalScore > 0)
      .map(s => s.finalScore)
    
    const avgGrade = validGrades.length > 0
      ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
      : 0

    return NextResponse.json({
      totalStudents,
      totalCourses,
      pendingReviews,
      dueThisWeek,
      avgCreativity: parseFloat(avgCreativity.toFixed(2)),
      aiUsageRate,
      gradedSubmissions,
      avgGrade: parseFloat(avgGrade.toFixed(2)),
      totalSubmissions: submissions.length,
      facultyId,
      facultyName: faculty.name
    })
  } catch (error) {
    console.error("Error fetching faculty dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
