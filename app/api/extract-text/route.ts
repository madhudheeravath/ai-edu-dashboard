import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Force Node.js runtime for file processing
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let extractedText = ""

    // Extract text based on file type
    if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      // DOCX extraction
      try {
        // @ts-ignore - Dynamic import for Node.js compatibility
        const mammoth = await import("mammoth")
        const result = await mammoth.extractRawText({ buffer })
        extractedText = result.value
      } catch (docError) {
        console.error("DOCX extraction error:", docError)
        return NextResponse.json(
          { error: "Failed to extract text from Word document." },
          { status: 400 }
        )
      }
    } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      // Plain text file
      extractedText = buffer.toString("utf-8")
    } else if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      // PDF files: suggest copy-paste
      return NextResponse.json(
        { 
          error: "PDF text extraction is not supported yet. Please:\n1. Open your PDF\n2. Select and copy all text (Ctrl+A, Ctrl+C)\n3. Paste into the text box below\n\nOR convert to DOCX first.",
          isPDF: true
        },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload DOCX or TXT files, or copy-paste text from PDFs." },
        { status: 400 }
      )
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\r\n/g, "\n") // Normalize line breaks
      .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
      .replace(/\s+/g, " ") // Normalize spaces
      .trim()

    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from file. The file may be empty or image-based." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      text: extractedText,
      fileName: file.name,
      fileType: fileType,
      wordCount: extractedText.split(/\s+/).length,
    })
  } catch (error: any) {
    console.error("File extraction error:", error)
    return NextResponse.json(
      { error: "Failed to extract text from file: " + error.message },
      { status: 500 }
    )
  }
}
