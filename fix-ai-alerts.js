const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixAIAlerts() {
  console.log('🚨 Creating high-confidence AI alerts for faculty dashboards...\n')

  try {
    // Get all faculty
    const allFaculty = await prisma.faculty.findMany()
    console.log(`👨‍🏫 Found ${allFaculty.length} faculty members`)

    let totalUpdated = 0

    for (const faculty of allFaculty) {
      // Get submissions for this faculty
      const submissions = await prisma.submission.findMany({
        where: { facultyId: faculty.facultyId },
        take: 10 // Update up to 10 submissions per faculty
      })

      if (submissions.length === 0) continue

      // Create high-confidence AI detections for some submissions
      const numHighConfidence = Math.min(3, submissions.length) // 3 high-confidence per faculty
      const selectedSubmissions = submissions.slice(0, numHighConfidence)

      for (let i = 0; i < selectedSubmissions.length; i++) {
        const submission = selectedSubmissions[i]
        
        // Create different confidence levels
        let aiLikelihood, confidence, severity
        if (i === 0) {
          // Critical alert
          aiLikelihood = 85 + Math.floor(Math.random() * 10) // 85-95%
          confidence = 'high'
          severity = 'critical'
        } else if (i === 1) {
          // High priority alert
          aiLikelihood = 70 + Math.floor(Math.random() * 15) // 70-85%
          confidence = 'high'
          severity = 'high'
        } else {
          // Medium priority alert
          aiLikelihood = 55 + Math.floor(Math.random() * 10) // 55-65%
          confidence = 'medium'
          severity = 'medium'
        }

        try {
          // Update or create AI detection result for final stage
          await prisma.aIDetectionResult.upsert({
            where: {
              submissionId_stage: {
                submissionId: submission.submissionId,
                stage: 'final'
              }
            },
            update: {
              aiLikelihood: aiLikelihood,
              humanLikelihood: 100 - aiLikelihood,
              confidence: confidence,
              verdict: getVerdict(aiLikelihood),
              hasAIMarkers: aiLikelihood > 60,
              hasPersonalTouch: aiLikelihood < 70,
            },
            create: {
              submissionId: submission.submissionId,
              stage: 'final',
              aiLikelihood: aiLikelihood,
              humanLikelihood: 100 - aiLikelihood,
              confidence: confidence,
              verdict: getVerdict(aiLikelihood),
              wordCount: 300 + Math.floor(Math.random() * 400),
              sentenceCount: 15 + Math.floor(Math.random() * 20),
              avgWordsPerSentence: 15 + Math.random() * 5,
              vocabularyRichness: 0.4 + Math.random() * 0.3,
              readabilityScore: 0.5 + Math.random() * 0.3,
              hasAIMarkers: aiLikelihood > 60,
              formalityLevel: ['formal', 'academic', 'moderate'][Math.floor(Math.random() * 3)],
              sentenceVariation: 0.4 + Math.random() * 0.3,
              hasPersonalTouch: aiLikelihood < 70,
              wordsAdded: Math.floor(Math.random() * 100),
              wordsRemoved: Math.floor(Math.random() * 50),
              percentageChange: Math.random() * 20 + 5,
              significantlyModified: Math.random() > 0.6,
              analyzedAt: new Date(),
            }
          })

          totalUpdated++
        } catch (e) {
          console.log(`   ⚠️  Skipped ${submission.submissionId}:`, e.message.split('\n')[0])
        }
      }

      if (totalUpdated % 20 === 0) {
        console.log(`   ... ${totalUpdated} AI detections updated`)
      }
    }

    console.log(`\n✅ Updated ${totalUpdated} AI detection results with high confidence`)
    
    // Show summary by confidence level
    const summary = await prisma.aIDetectionResult.groupBy({
      by: ['confidence'],
      where: { 
        stage: 'final',
        aiLikelihood: { gte: 50 }
      },
      _count: { confidence: true }
    })
    
    console.log('\n📊 AI Detection Summary (>= 50%):')
    summary.forEach(item => {
      console.log(`   ${item.confidence}: ${item._count.confidence} detections`)
    })

    // Show critical alerts count
    const criticalCount = await prisma.aIDetectionResult.count({
      where: {
        stage: 'final',
        aiLikelihood: { gte: 85 }
      }
    })
    console.log(`\n🚨 Critical alerts (>= 85%): ${criticalCount}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

function getVerdict(aiLikelihood) {
  if (aiLikelihood >= 85) {
    return "Critical: Very high likelihood of AI generation detected. Immediate review recommended."
  } else if (aiLikelihood >= 70) {
    return "High confidence: Strong indicators of AI assistance detected in this submission."
  } else if (aiLikelihood >= 55) {
    return "Moderate confidence: Mixed AI and human characteristics detected."
  } else {
    return "Low confidence: Primarily human-written content with possible minor AI assistance."
  }
}

fixAIAlerts()
