import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the student's actual studentId, year, and major
    const student = await prisma.student.findUnique({
      where: { email: session.user.email! },
      select: { studentId: true, year: true, major: true }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const studentId = student.studentId
    const studentYear = student.year
    const studentMajor = student.major

    // Get all submissions for this student
    const submissions = await prisma.submission.findMany({
      where: { studentId },
      include: {
        assignment: {
          select: {
            assignmentId: true,
            title: true,
            type: true,
            dueDate: true,
          }
        },
        reflection: {
          select: { id: true }
        }
      }
    })

    // Get assignments for this student's year AND major, or fallback to any assignments
    let allAssignments = await prisma.assignment.findMany({
      where: {
        year: studentYear,
        major: studentMajor
      }
    })

    // If no assignments found for exact year/major, get assignments for the student's major
    if (allAssignments.length === 0) {
      allAssignments = await prisma.assignment.findMany({
        where: { major: studentMajor }
      })
    }

    // If still no assignments, get any assignments (fallback)
    if (allAssignments.length === 0) {
      allAssignments = await prisma.assignment.findMany({
        take: 20 // Limit to 20 assignments
      })
    }

    // Calculate stats
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const sixWeeksAgo = new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000)

    // Recent submissions (last 6 weeks, newest first, max 6)
    const recentSubmissions = submissions
      .filter((s) => s.submissionDate && s.submissionDate > sixWeeksAgo)
      .sort((a, b) => {
        const aTime = a.submissionDate ? a.submissionDate.getTime() : 0
        const bTime = b.submissionDate ? b.submissionDate.getTime() : 0
        return bTime - aTime
      })
      .slice(0, 6)
      .map((s) => ({
        submissionId: s.submissionId,
        assignmentId: s.assignment.assignmentId,
        title: s.assignment.title,
        status: s.status,
        finalScore: s.finalScore,
        timeHours: s.timeHours,
        submittedAt: s.submissionDate,
      }))

    // Upcoming assignments (future due dates, soonest first, max 6)
    const upcomingAssignments = allAssignments
      .filter((a) => new Date(a.dueDate) > now)
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .slice(0, 6)
      .map((a) => ({
        assignmentId: a.assignmentId,
        title: a.title,
        type: a.type,
        dueDate: a.dueDate,
        aiAllowed: a.aiAllowed,
      }))

    // Active assignments (all assignments with future due dates)
    const activeAssignments = allAssignments.filter(a =>
      new Date(a.dueDate) > now
    ).length

    // Due this week
    const dueThisWeek = allAssignments.filter(a => {
      const dueDate = new Date(a.dueDate)
      return dueDate > now && dueDate <= oneWeekFromNow
    }).length

    // Completed assignments (submitted)
    const completedAssignments = submissions.filter(s =>
      s.status === "Submitted" || s.status === "Graded" || s.status === "completed"
    ).length

    // Average creativity score
    const validCreativityScores = submissions
      .filter(s => s.creativityScore > 0)
      .map(s => s.creativityScore)

    const avgCreativity = validCreativityScores.length > 0
      ? validCreativityScores.reduce((a, b) => a + b, 0) / validCreativityScores.length
      : 0

    // AI usage percentage
    const aiUsedCount = submissions.filter(s => s.usesAi).length
    const aiUsagePercent = submissions.length > 0
      ? Math.min(100, Math.round((aiUsedCount / submissions.length) * 100))
      : 0

    // Total AI hours (all time)
    const totalAiHours = submissions.reduce((sum, s) => sum + s.aiAccessHours, 0)

    // AI hours per week (from earliest submission to now, minimum 1 week)
    let aiHoursPerWeek = 0
    if (submissions.length > 0 && totalAiHours > 0) {
      const datedSubmissions = submissions.filter(s => s.submissionDate)
      if (datedSubmissions.length > 0) {
        const earliestDate = new Date(
          Math.min(...datedSubmissions.map(s => s.submissionDate!.getTime()))
        )
        const diffMs = now.getTime() - earliestDate.getTime()
        const weeks = Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)))
        aiHoursPerWeek = totalAiHours / weeks
      }
    }

    // Reflections count
    const reflectionsCount = submissions.filter(s => s.reflection !== null).length

    // Average grade
    const validGrades = submissions
      .filter(s => s.finalScore > 0)
      .map(s => s.finalScore)

    const avgGrade = validGrades.length > 0
      ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length
      : 0

    // Get enrolled subjects count
    let enrolledSubjectsCount = 0
    try {
      const enrolledSubjects = await prisma.studentSubject.count({
        where: {
          studentId,
          isActive: true
        }
      })
      enrolledSubjectsCount = enrolledSubjects
    } catch (e) {
      // StudentSubject table might not exist yet
      enrolledSubjectsCount = 0
    }

    return NextResponse.json({
      activeAssignments,
      dueThisWeek,
      completedAssignments,
      avgCreativity: parseFloat(avgCreativity.toFixed(2)),
      aiUsagePercent,
      totalAiHours: parseFloat(totalAiHours.toFixed(1)),
      aiHoursPerWeek: parseFloat(aiHoursPerWeek.toFixed(1)),
      reflectionsCount,
      avgGrade: parseFloat(avgGrade.toFixed(2)),
      totalSubmissions: submissions.length,
      studentId,
      enrolledSubjectsCount,
      recentSubmissions,
      upcomingAssignments,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
