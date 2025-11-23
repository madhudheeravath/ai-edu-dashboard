const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createAIDetectionResults() {
  console.log('🤖 Creating AI detection results for existing submissions...\n')

  try {
    // Get all submissions that have AI detection scores
    const submissions = await prisma.submission.findMany({
      where: {
        finalScore: {
          gt: 0
        }
      },
      take: 100 // Limit to first 100 for testing
    })

    console.log(`Found ${submissions.length} submissions with AI detection scores`)

    let createdCount = 0
    for (const submission of submissions) {
      try {
        // Create draft detection result
        const draftScore = Math.max(0, submission.finalScore - Math.random() * 20) // Slightly lower for draft
        await prisma.aIDetectionResult.create({
          data: {
            submissionId: submission.submissionId,
            stage: 'draft',
            aiLikelihood: Math.round(draftScore),
            humanLikelihood: Math.round(100 - draftScore),
            confidence: draftScore > 70 ? 'high' : draftScore > 40 ? 'medium' : 'low',
            verdict: draftScore > 70 ? 'Likely AI-generated content detected' : 
                    draftScore > 40 ? 'Mixed AI and human characteristics' : 
                    'Primarily human-written content',
            wordCount: Math.floor(Math.random() * 500) + 200,
            sentenceCount: Math.floor(Math.random() * 30) + 10,
            avgWordsPerSentence: 15 + Math.random() * 10,
            vocabularyRichness: 0.3 + Math.random() * 0.4,
            readabilityScore: 0.5 + Math.random() * 0.3,
            hasAIMarkers: draftScore > 60,
            formalityLevel: ['formal', 'moderate', 'informal'][Math.floor(Math.random() * 3)],
            sentenceVariation: 0.4 + Math.random() * 0.4,
            hasPersonalTouch: draftScore < 50,
            wordsAdded: 0,
            wordsRemoved: 0,
            percentageChange: 0,
            significantlyModified: false,
            analyzedAt: new Date(submission.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
          }
        })

        // Create final detection result
        const finalScore = submission.finalScore
        await prisma.aIDetectionResult.create({
          data: {
            submissionId: submission.submissionId,
            stage: 'final',
            aiLikelihood: Math.round(finalScore),
            humanLikelihood: Math.round(100 - finalScore),
            confidence: finalScore > 70 ? 'high' : finalScore > 40 ? 'medium' : 'low',
            verdict: finalScore > 70 ? 'Likely AI-generated content detected' : 
                    finalScore > 40 ? 'Mixed AI and human characteristics' : 
                    'Primarily human-written content',
            wordCount: Math.floor(Math.random() * 600) + 250,
            sentenceCount: Math.floor(Math.random() * 35) + 12,
            avgWordsPerSentence: 16 + Math.random() * 8,
            vocabularyRichness: 0.35 + Math.random() * 0.35,
            readabilityScore: 0.55 + Math.random() * 0.25,
            hasAIMarkers: finalScore > 60,
            formalityLevel: ['formal', 'moderate', 'informal'][Math.floor(Math.random() * 3)],
            sentenceVariation: 0.45 + Math.random() * 0.35,
            hasPersonalTouch: finalScore < 50,
            wordsAdded: Math.floor(Math.random() * 100) + 20,
            wordsRemoved: Math.floor(Math.random() * 50) + 5,
            percentageChange: Math.random() * 30 + 5,
            significantlyModified: Math.random() > 0.7,
            analyzedAt: new Date(submission.createdAt.getTime() + Math.random() * 48 * 60 * 60 * 1000),
          }
        })

        createdCount += 2 // Created both draft and final
        if (createdCount % 20 === 0) {
          console.log(`   ... ${createdCount} AI detection results created`)
        }

      } catch (e) {
        // Skip duplicates or errors
        if (!e.message.includes('Unique constraint')) {
          console.log(`   ⚠️  Skipped submission ${submission.submissionId}:`, e.message.split('\n')[0])
        }
      }
    }

    console.log(`\n✅ Created ${createdCount} AI detection results`)
    console.log('\n🎯 AI detection results are now available for:')
    console.log('   - Student assignment submissions')
    console.log('   - Faculty grading interface')
    console.log('   - Detailed AI analysis displays')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createAIDetectionResults()
