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

    // Get AI detection results with high confidence (>= 50%)
    const aiDetectionResults = await prisma.aIDetectionResult.findMany({
      where: {
        aiLikelihood: {
          gte: 50 // 50% or higher
        }
      },
      select: {
        submissionId: true,
        aiLikelihood: true
      }
    })
    
    // Get submission IDs for flagged detections
    const flaggedSubmissionIds = aiDetectionResults.map(d => d.submissionId)
    
    // Get submissions for this faculty that are flagged
    const flaggedSubmissions = await prisma.submission.findMany({
      where: {
        facultyId: faculty.facultyId,
        submissionId: { in: flaggedSubmissionIds }
      },
      include: {
        student: {
          select: {
            studentId: true,
            name: true
          }
        },
        assignment: {
          select: {
            type: true,
            major: true
          }
        }
      }
    })

    // Map submissions with their AI detection results and sort
    const submissionsWithAI = flaggedSubmissions.map(sub => {
      const detection = aiDetectionResults.find(d => d.submissionId === sub.submissionId)
      return {
        ...sub,
        aiLikelihood: detection ? detection.aiLikelihood : 0
      }
    }).sort((a, b) => b.aiLikelihood - a.aiLikelihood)

    // Count by severity (aiLikelihood is 0-100 scale)
    const critical = submissionsWithAI.filter(s => s.aiLikelihood >= 90).length
    const high = submissionsWithAI.filter(s => s.aiLikelihood >= 70 && s.aiLikelihood < 90).length
    const medium = submissionsWithAI.filter(s => s.aiLikelihood >= 50 && s.aiLikelihood < 70).length

    // Transform submissions
    const alerts = submissionsWithAI.map(sub => {
      const confidence = sub.aiLikelihood
      let severity = 'medium'
      if (confidence >= 90) severity = 'critical'
      else if (confidence >= 70) severity = 'high'

      return {
        id: sub.submissionId,
        student: sub.student.name,
        studentId: sub.student.studentId,
        assignment: `${sub.assignment.type} - ${sub.assignment.major}`,
        submittedAt: sub.submissionDate,
        aiConfidence: Math.round(confidence),
        severity
      }
    })

    return NextResponse.json({
      counts: {
        critical,
        high,
        medium
      },
      alerts
    })
  } catch (error: any) {
    console.error("Error fetching AI detection alerts:", error)
    return NextResponse.json(
      { error: "Failed to fetch alerts: " + error.message },
      { status: 500 }
    )
  }
}
