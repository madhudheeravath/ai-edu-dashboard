import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

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

    // Get all submissions for this faculty
    const submissions = await prisma.submission.findMany({
      where: { facultyId: faculty.facultyId },
      include: {
        student: {
          select: {
            studentId: true,
            firstGen: true
          }
        }
      }
    })
    
    // Get AI detection results for these submissions
    const submissionIds = submissions.map(s => s.submissionId)
    const aiDetectionResults = await prisma.aIDetectionResult.findMany({
      where: { submissionId: { in: submissionIds } },
      select: {
        submissionId: true,
        aiLikelihood: true
      }
    })

    // Calculate statistics
    const totalSubmissions = submissions.length
    const uniqueStudents = new Set(submissions.map(s => s.studentId)).size

    // Average AI usage from AI detection results
    const avgAI = aiDetectionResults.length > 0
      ? Math.min(100, Math.round(
          aiDetectionResults.reduce((sum, d) => sum + d.aiLikelihood, 0) / aiDetectionResults.length
        ))
      : 0

    // Average creativity
    const creativityScores = submissions
      .filter(s => s.creativityScore > 0)
      .map(s => s.creativityScore)
    const avgCreativity = creativityScores.length > 0
      ? creativityScores.reduce((a, b) => a + b, 0) / creativityScores.length
      : 0

    // First-gen vs continuing-gen comparison
    const firstGenSubmissions = submissions.filter(s => s.student.firstGen)
    const continuingGenSubmissions = submissions.filter(s => !s.student.firstGen)

    const firstGenSubmissionIds = firstGenSubmissions.map(s => s.submissionId)
    const continuingGenSubmissionIds = continuingGenSubmissions.map(s => s.submissionId)
    
    const firstGenAIResults = aiDetectionResults.filter(d => firstGenSubmissionIds.includes(d.submissionId))
    const continuingGenAIResults = aiDetectionResults.filter(d => continuingGenSubmissionIds.includes(d.submissionId))
    
    const firstGenAI = firstGenAIResults.length > 0
      ? Math.min(100, Math.round(
          firstGenAIResults.reduce((sum, d) => sum + d.aiLikelihood, 0) / firstGenAIResults.length
        ))
      : 0

    const continuingGenAI = continuingGenAIResults.length > 0
      ? Math.min(100, Math.round(
          continuingGenAIResults.reduce((sum, d) => sum + d.aiLikelihood, 0) / continuingGenAIResults.length
        ))
      : 0

    // Creativity by AI usage level (using aiLikelihood 0-100 scale)
    const lowAIUsers = submissions.filter(s => {
      const detection = aiDetectionResults.find(d => d.submissionId === s.submissionId)
      return detection && detection.aiLikelihood <= 30
    })
    const mediumAIUsers = submissions.filter(s => {
      const detection = aiDetectionResults.find(d => d.submissionId === s.submissionId)
      return detection && detection.aiLikelihood > 30 && detection.aiLikelihood <= 60
    })
    const highAIUsers = submissions.filter(s => {
      const detection = aiDetectionResults.find(d => d.submissionId === s.submissionId)
      return detection && detection.aiLikelihood > 60
    })

    const lowAICreativity = lowAIUsers.filter(s => s.creativityScore > 0).length > 0
      ? lowAIUsers.filter(s => s.creativityScore > 0).reduce((sum, s) => sum + s.creativityScore, 0) / lowAIUsers.filter(s => s.creativityScore > 0).length
      : 0

    const mediumAICreativity = mediumAIUsers.filter(s => s.creativityScore > 0).length > 0
      ? mediumAIUsers.filter(s => s.creativityScore > 0).reduce((sum, s) => sum + s.creativityScore, 0) / mediumAIUsers.filter(s => s.creativityScore > 0).length
      : 0

    const highAICreativity = highAIUsers.filter(s => s.creativityScore > 0).length > 0
      ? highAIUsers.filter(s => s.creativityScore > 0).reduce((sum, s) => sum + s.creativityScore, 0) / highAIUsers.filter(s => s.creativityScore > 0).length
      : 0

    return NextResponse.json({
      totalStudents: uniqueStudents,
      avgAI,
      avgCreativity: parseFloat(avgCreativity.toFixed(1)),
      totalSubmissions,
      firstGenComparison: {
        firstGen: firstGenAI,
        continuingGen: continuingGenAI
      },
      creativityByAILevel: {
        low: parseFloat(lowAICreativity.toFixed(1)),
        medium: parseFloat(mediumAICreativity.toFixed(1)),
        high: parseFloat(highAICreativity.toFixed(1))
      }
    })
  } catch (error: any) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics: " + error.message },
      { status: 500 }
    )
  }
}
