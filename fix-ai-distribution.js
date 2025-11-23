const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixAIDistribution() {
  console.log('🎯 Creating more realistic AI detection distribution...\n')

  try {
    // Delete existing data
    await prisma.aIDetectionResult.deleteMany({})
    console.log('🗑️  Cleared existing results\n')

    // Get submissions
    const submissions = await prisma.submission.findMany({
      where: { finalScore: { gt: 0 } },
      take: 200
    })

    console.log(`📊 Creating varied AI detection for ${submissions.length} submissions...\n`)

    let createdCount = 0
    
    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i]
      
      try {
        // Create realistic distribution:
        // 20% - Low AI (10-30%)
        // 40% - Medium AI (30-60%) 
        // 30% - High AI (60-80%)
        // 10% - Very High AI (80-95%)
        
        let aiCategory
        const rand = Math.random()
        if (rand < 0.2) aiCategory = 'low'
        else if (rand < 0.6) aiCategory = 'medium'
        else if (rand < 0.9) aiCategory = 'high'
        else aiCategory = 'very_high'
        
        const patterns = generateVariedPattern(submission, aiCategory, i)
        
        // Create draft
        await prisma.aIDetectionResult.create({
          data: {
            submissionId: submission.submissionId,
            stage: 'draft',
            ...patterns.draft
          }
        })

        // Create final
        await prisma.aIDetectionResult.create({
          data: {
            submissionId: submission.submissionId,
            stage: 'final',
            ...patterns.final
          }
        })

        createdCount += 2
        if (createdCount % 40 === 0) {
          console.log(`   ... ${createdCount} results created`)
        }

      } catch (e) {
        if (!e.message.includes('Unique constraint')) {
          console.log(`   ⚠️  Skipped ${submission.submissionId}`)
        }
      }
    }

    console.log(`\n✅ Created ${createdCount} realistic AI detection results`)
    
    // Show distribution
    const stats = await prisma.aIDetectionResult.groupBy({
      by: ['confidence'],
      where: { stage: 'final' },
      _count: { confidence: true }
    })
    
    console.log('\n📊 Final Distribution:')
    stats.forEach(stat => {
      console.log(`   ${stat.confidence}: ${stat._count.confidence} submissions`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

function generateVariedPattern(submission, category, index) {
  let draftAI, finalAI
  
  switch (category) {
    case 'low':
      draftAI = 10 + Math.random() * 20 // 10-30%
      finalAI = draftAI + Math.random() * 10 // Slightly higher
      break
    case 'medium':
      draftAI = 25 + Math.random() * 25 // 25-50%
      finalAI = draftAI + Math.random() * 15 // 25-65%
      break
    case 'high':
      draftAI = 45 + Math.random() * 25 // 45-70%
      finalAI = draftAI + Math.random() * 15 // 45-85%
      break
    case 'very_high':
      draftAI = 65 + Math.random() * 20 // 65-85%
      finalAI = draftAI + Math.random() * 10 // 65-95%
      break
  }

  // Ensure realistic bounds
  draftAI = Math.max(8, Math.min(88, draftAI))
  finalAI = Math.max(10, Math.min(92, finalAI))

  const draftWords = 200 + Math.floor(Math.random() * 400)
  const finalWords = draftWords + Math.floor(Math.random() * 200)
  
  const draftSentences = Math.ceil(draftWords / (12 + Math.random() * 8))
  const finalSentences = Math.ceil(finalWords / (14 + Math.random() * 6))

  return {
    draft: {
      aiLikelihood: Math.round(draftAI),
      humanLikelihood: Math.round(100 - draftAI),
      confidence: draftAI > 65 ? 'high' : draftAI > 35 ? 'medium' : 'low',
      verdict: getVerdict(draftAI),
      wordCount: draftWords,
      sentenceCount: draftSentences,
      avgWordsPerSentence: parseFloat((draftWords / draftSentences).toFixed(1)),
      vocabularyRichness: 0.3 + Math.random() * 0.4,
      readabilityScore: 0.4 + Math.random() * 0.4,
      hasAIMarkers: draftAI > 50,
      formalityLevel: ['informal', 'moderate', 'formal', 'academic'][Math.floor(Math.random() * 4)],
      sentenceVariation: 0.3 + Math.random() * 0.4,
      hasPersonalTouch: draftAI < 45,
      wordsAdded: 0,
      wordsRemoved: 0,
      percentageChange: 0,
      significantlyModified: false,
      analyzedAt: new Date(submission.createdAt.getTime() + Math.random() * 12 * 60 * 60 * 1000),
    },
    final: {
      aiLikelihood: Math.round(finalAI),
      humanLikelihood: Math.round(100 - finalAI),
      confidence: finalAI > 70 ? 'high' : finalAI > 40 ? 'medium' : 'low',
      verdict: getVerdict(finalAI),
      wordCount: finalWords,
      sentenceCount: finalSentences,
      avgWordsPerSentence: parseFloat((finalWords / finalSentences).toFixed(1)),
      vocabularyRichness: 0.35 + Math.random() * 0.4,
      readabilityScore: 0.45 + Math.random() * 0.4,
      hasAIMarkers: finalAI > 55,
      formalityLevel: ['informal', 'moderate', 'formal', 'academic'][Math.floor(Math.random() * 4)],
      sentenceVariation: 0.35 + Math.random() * 0.4,
      hasPersonalTouch: finalAI < 50,
      wordsAdded: finalWords - draftWords + Math.floor(Math.random() * 50),
      wordsRemoved: Math.floor(Math.random() * 30),
      percentageChange: ((finalWords - draftWords) / draftWords) * 100,
      significantlyModified: (finalAI - draftAI) > 12,
      analyzedAt: new Date(submission.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
    }
  }
}

function getVerdict(score) {
  if (score >= 75) {
    return "High likelihood of AI generation. Content exhibits strong patterns consistent with AI-generated text."
  } else if (score >= 55) {
    return "Moderate AI assistance detected. Likely combination of human writing with significant AI refinement."
  } else if (score >= 35) {
    return "Mixed characteristics. Some AI assistance possible, but primarily human-authored content."
  } else {
    return "Predominantly human-written. Natural language patterns and authentic voice detected."
  }
}

fixAIDistribution()
