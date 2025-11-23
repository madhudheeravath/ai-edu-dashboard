const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const prisma = new PrismaClient()

async function importSubmissionsDataset() {
  console.log('📊 Importing submissions dataset...\n')

  try {
    // Read the CSV file
    const csvPath = path.join('..', 'Data', 'submissions_dataset.csv')
    const csvData = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvData.trim().split('\n')
    const headers = lines[0].split(',')
    
    console.log(`📁 Found ${lines.length - 1} submissions in CSV`)
    console.log(`📋 Headers: ${headers.join(', ')}`)

    // Check current submissions count
    const currentCount = await prisma.submission.count()
    console.log(`📊 Current submissions in database: ${currentCount}`)

    if (currentCount > 100) {
      console.log('⚠️  Database already has many submissions. Clearing existing submissions first...')
      
      // Delete existing submissions (this will cascade to related data)
      await prisma.aIDetectionResult.deleteMany({})
      await prisma.reflection.deleteMany({})
      await prisma.rubricEvaluation.deleteMany({})
      await prisma.submission.deleteMany({})
      
      console.log('✅ Cleared existing submissions')
    }

    let imported = 0
    let skipped = 0
    const batchSize = 100

    // Process submissions in batches
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize)
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1} (${batch.length} submissions)...`)

      for (const line of batch) {
        try {
          const values = line.split(',')
          
          // Parse CSV values
          const submissionData = {
            submissionId: values[0],
            assignmentId: values[1], 
            studentId: values[2],
            facultyId: values[3],
            // Map original CSV date to a recent date around October 2025
            submissionDate: toRecentOctober2025(values[4]),
            usesAi: values[5] === '1',
            aiAccessHours: parseFloat(values[6]) || 0,
            draftScore: parseFloat(values[7]) || 0,
            finalScore: parseFloat(values[8]) || 0,
            creativityScore: parseFloat(values[9]) || 0,
            aiDetected: values[10] === '1',
            aiConfidence: parseFloat(values[11]) || 0,
            timeHours: parseFloat(values[12]) || 0,
            status: values[13] || 'Submitted',
            aiAssistanceType: values[14] || null,
            criticalThinkingScore: parseFloat(values[15]) || 100,
            satisfactionLevel: parseFloat(values[16]) || 100,
            createdAt: new Date(),
            updatedAt: new Date()
          }

          // Verify that student, assignment, and faculty exist
          const [student, assignment, faculty] = await Promise.all([
            prisma.student.findUnique({ where: { studentId: submissionData.studentId } }),
            prisma.assignment.findUnique({ where: { assignmentId: submissionData.assignmentId } }),
            prisma.faculty.findUnique({ where: { facultyId: submissionData.facultyId } })
          ])

          if (!student) {
            console.log(`   ⚠️  Skipped ${submissionData.submissionId}: Student ${submissionData.studentId} not found`)
            skipped++
            continue
          }

          if (!assignment) {
            console.log(`   ⚠️  Skipped ${submissionData.submissionId}: Assignment ${submissionData.assignmentId} not found`)
            skipped++
            continue
          }

          if (!faculty) {
            console.log(`   ⚠️  Skipped ${submissionData.submissionId}: Faculty ${submissionData.facultyId} not found`)
            skipped++
            continue
          }

          // Create submission
          await prisma.submission.create({
            data: submissionData
          })

          imported++

          // Create AI detection result for this submission
          const aiLikelihood = Math.floor(submissionData.aiConfidence * 100)
          
          await prisma.aIDetectionResult.create({
            data: {
              submissionId: submissionData.submissionId,
              stage: 'final',
              aiLikelihood: aiLikelihood,
              humanLikelihood: 100 - aiLikelihood,
              confidence: aiLikelihood > 60 ? 'high' : aiLikelihood > 40 ? 'medium' : 'low',
              verdict: getVerdict(aiLikelihood),
              wordCount: Math.floor(Math.random() * 400) + 300,
              sentenceCount: Math.floor((Math.random() * 400 + 300) / 16),
              avgWordsPerSentence: 14 + Math.random() * 4,
              vocabularyRichness: 0.4 + Math.random() * 0.3,
              readabilityScore: 0.5 + Math.random() * 0.3,
              hasAIMarkers: submissionData.aiDetected,
              formalityLevel: ['formal', 'academic', 'moderate'][Math.floor(Math.random() * 3)],
              sentenceVariation: 0.4 + Math.random() * 0.3,
              hasPersonalTouch: !submissionData.aiDetected,
              wordsAdded: Math.floor(Math.random() * 80),
              wordsRemoved: Math.floor(Math.random() * 40),
              percentageChange: Math.random() * 15 + 5,
              significantlyModified: Math.random() > 0.5,
              analyzedAt: new Date(),
            }
          })

        } catch (e) {
          console.log(`   ❌ Error importing submission: ${e.message.split('\n')[0]}`)
          skipped++
        }
      }

      console.log(`   ✅ Imported ${imported} submissions so far`)
    }

    console.log(`\n🎉 Import complete!`)
    console.log(`   ✅ Successfully imported: ${imported} submissions`)
    console.log(`   ⚠️  Skipped: ${skipped} submissions`)
    console.log(`   🤖 Created ${imported} AI detection results`)

    // Verify the import
    const finalCount = await prisma.submission.count()
    console.log(`\n📊 Final submissions count: ${finalCount}`)

    // Show some sample data
    const sampleSubmissions = await prisma.submission.findMany({
      take: 5,
      include: {
        student: { select: { name: true } },
        assignment: { select: { type: true } }
      }
    })

    console.log(`\n📝 Sample submissions:`)
    sampleSubmissions.forEach(sub => {
      console.log(`   - ${sub.submissionId}: ${sub.student.name} - ${sub.assignment.type} (Score: ${sub.finalScore})`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

function getVerdict(aiLikelihood) {
  if (aiLikelihood >= 60) {
    return "Moderate to high confidence: Some indicators of AI assistance detected in this submission."
  } else if (aiLikelihood >= 40) {
    return "Moderate confidence: Mixed AI and human characteristics detected."
  } else {
    return "Low confidence: Primarily human-written content with minimal AI assistance detected."
  }
}

// Helper to map any date into October 2025 while keeping day-of-month reasonable
function toRecentOctober2025(dateValue) {
  const original = new Date(dateValue)
  if (isNaN(original.getTime())) {
    return new Date(2025, 9, 15) // Fallback: 15 Oct 2025
  }
  const day = Math.min(original.getDate(), 28) // avoid month overflow
  return new Date(2025, 9, day)
}

importSubmissionsDataset()
