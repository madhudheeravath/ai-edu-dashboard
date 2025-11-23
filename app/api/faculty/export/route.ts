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
    const format = searchParams.get("format") || "csv"
    const type = searchParams.get("type") || "submissions"

    // Fetch data based on type
    let data: any[] = []

    if (type === "submissions") {
      data = await prisma.submission.findMany({
        include: {
          student: {
            select: {
              studentId: true,
              name: true,
              email: true,
              year: true,
              major: true,
              priorGpa: true,
              firstGen: true,
              gender: true,
            }
          },
          assignment: {
            select: {
              assignmentId: true,
              type: true,
              major: true,
              aiAllowed: true,
            }
          },
          reflection: {
            select: {
              type: true,
              depthScore: true,
              words: true,
            }
          },
          rubricEval: {
            select: {
              originality: true,
              effort: true,
              finalGrade: true,
              facultyAiIdentified: true,
              confidence: true,
            }
          }
        }
      })
    } else if (type === "students") {
      data = await prisma.student.findMany({
        include: {
          submissions: {
            select: {
              submissionId: true,
              usesAi: true,
              aiAccessHours: true,
              creativityScore: true,
              aiDetected: true,
              aiConfidence: true,
            }
          }
        }
      })
    } else if (type === "analytics") {
      // Aggregate analytics data
      const submissions = await prisma.submission.findMany({
        select: {
          studentId: true,
          usesAi: true,
          aiAccessHours: true,
          draftScore: true,
          finalScore: true,
          creativityScore: true,
          aiDetected: true,
          aiConfidence: true,
          timeHours: true,
          criticalThinkingScore: true,
          satisfactionLevel: true,
        }
      })
      
      data = submissions
    }

    if (format === "csv") {
      const csv = convertToCSV(data, type)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}_export_${Date.now()}.csv"`,
        },
      })
    } else if (format === "json") {
      return NextResponse.json(data, {
        headers: {
          "Content-Disposition": `attachment; filename="${type}_export_${Date.now()}.json"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error: any) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export data: " + error.message },
      { status: 500 }
    )
  }
}

function convertToCSV(data: any[], type: string): string {
  if (data.length === 0) return ""

  let headers: string[] = []
  let rows: string[][] = []

  if (type === "submissions") {
    headers = [
      "Submission ID",
      "Student ID",
      "Student Name",
      "Year",
      "Major",
      "First Gen",
      "Gender",
      "Prior GPA",
      "Assignment Type",
      "Department",
      "AI Allowed",
      "Submission Date",
      "Uses AI",
      "AI Access Hours",
      "Draft Score",
      "Final Score",
      "Creativity Score",
      "AI Detected",
      "AI Confidence",
      "Time Hours",
      "Critical Thinking",
      "Satisfaction",
      "Reflection Type",
      "Reflection Depth",
      "Reflection Words",
      "Faculty Originality",
      "Faculty Effort",
      "Final Grade",
      "Faculty AI Identified",
    ]

    rows = data.map((item) => [
      item.submissionId,
      item.student.studentId,
      item.student.name,
      item.student.year?.toString() || "",
      item.student.major || "",
      item.student.firstGen ? "Yes" : "No",
      item.student.gender || "",
      item.student.priorGpa?.toString() || "",
      item.assignment.type || "",
      item.assignment.major || "",
      item.assignment.aiAllowed ? "Yes" : "No",
      item.submissionDate?.toISOString() || "",
      item.usesAi ? "Yes" : "No",
      item.aiAccessHours?.toString() || "",
      item.draftScore?.toString() || "",
      item.finalScore?.toString() || "",
      item.creativityScore?.toString() || "",
      item.aiDetected ? "Yes" : "No",
      item.aiConfidence?.toString() || "",
      item.timeHours?.toString() || "",
      item.criticalThinkingScore?.toString() || "",
      item.satisfactionLevel?.toString() || "",
      item.reflection?.type || "",
      item.reflection?.depthScore?.toString() || "",
      item.reflection?.words?.toString() || "",
      item.rubricEval?.originality?.toString() || "",
      item.rubricEval?.effort?.toString() || "",
      item.rubricEval?.finalGrade?.toString() || "",
      item.rubricEval?.facultyAiIdentified ? "Yes" : "No",
    ])
  } else if (type === "analytics") {
    headers = [
      "Student ID",
      "Uses AI",
      "AI Access Hours",
      "Draft Score",
      "Final Score",
      "Creativity Score",
      "AI Detected",
      "AI Confidence",
      "Time Hours",
      "Critical Thinking",
      "Satisfaction",
    ]

    rows = data.map((item) => [
      item.studentId,
      item.usesAi ? "Yes" : "No",
      item.aiAccessHours?.toString() || "",
      item.draftScore?.toString() || "",
      item.finalScore?.toString() || "",
      item.creativityScore?.toString() || "",
      item.aiDetected ? "Yes" : "No",
      item.aiConfidence?.toString() || "",
      item.timeHours?.toString() || "",
      item.criticalThinkingScore?.toString() || "",
      item.satisfactionLevel?.toString() || "",
    ])
  }

  // Escape and format CSV
  const escapeCSV = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const csvRows = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ]

  return csvRows.join("\n")
}
