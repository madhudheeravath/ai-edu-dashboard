const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createRealisticAIDetection() {
  console.log('🤖 Creating realistic AI detection results based on academic patterns...\n')

  try {
    // First, delete existing unrealistic data
    console.log('🗑️  Removing unrealistic AI detection results...')
    await prisma.aIDetectionResult.deleteMany({})
    console.log('✅ Cleared existing AI detection results\n')

    // Get submissions with their content and scores
    const submissions = await prisma.submission.findMany({
      where: {
        finalScore: { gt: 0 }
      },
      include: {
        student: true,
        assignment: true
      },
      take: 200
    })

    console.log(`📊 Processing ${submissions.length} submissions for realistic AI detection...\n`)

    let createdCount = 0
    
    for (const submission of submissions) {
      try {
        // Create realistic AI detection patterns based on academic research
        const patterns = generateRealisticAIPattern(submission)
        
        // Create draft detection (usually lower AI likelihood)
        await prisma.aIDetectionResult.create({
          data: {
            submissionId: submission.submissionId,
            stage: 'draft',
            aiLikelihood: patterns.draft.aiLikelihood,
            humanLikelihood: patterns.draft.humanLikelihood,
            confidence: patterns.draft.confidence,
            verdict: patterns.draft.verdict,
            wordCount: patterns.draft.wordCount,
            sentenceCount: patterns.draft.sentenceCount,
            avgWordsPerSentence: patterns.draft.avgWordsPerSentence,
            vocabularyRichness: patterns.draft.vocabularyRichness,
            readabilityScore: patterns.draft.readabilityScore,
            hasAIMarkers: patterns.draft.hasAIMarkers,
            formalityLevel: patterns.draft.formalityLevel,
            sentenceVariation: patterns.draft.sentenceVariation,
            hasPersonalTouch: patterns.draft.hasPersonalTouch,
            wordsAdded: 0,
            wordsRemoved: 0,
            percentageChange: 0,
            significantlyModified: false,
            analyzedAt: new Date(submission.createdAt.getTime() + Math.random() * 12 * 60 * 60 * 1000),
          }
        })

        // Create final detection (may be higher if AI-refined)
        await prisma.aIDetectionResult.create({
          data: {
            submissionId: submission.submissionId,
            stage: 'final',
            aiLikelihood: patterns.final.aiLikelihood,
            humanLikelihood: patterns.final.humanLikelihood,
            confidence: patterns.final.confidence,
            verdict: patterns.final.verdict,
            wordCount: patterns.final.wordCount,
            sentenceCount: patterns.final.sentenceCount,
            avgWordsPerSentence: patterns.final.avgWordsPerSentence,
            vocabularyRichness: patterns.final.vocabularyRichness,
            readabilityScore: patterns.final.readabilityScore,
            hasAIMarkers: patterns.final.hasAIMarkers,
            formalityLevel: patterns.final.formalityLevel,
            sentenceVariation: patterns.final.sentenceVariation,
            hasPersonalTouch: patterns.final.hasPersonalTouch,
            wordsAdded: patterns.changes.wordsAdded,
            wordsRemoved: patterns.changes.wordsRemoved,
            percentageChange: patterns.changes.percentageChange,
            significantlyModified: patterns.changes.significantlyModified,
            analyzedAt: new Date(submission.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
          }
        })

        createdCount += 2
        if (createdCount % 20 === 0) {
          console.log(`   ... ${createdCount} realistic AI detection results created`)
        }

      } catch (e) {
        if (!e.message.includes('Unique constraint')) {
          console.log(`   ⚠️  Skipped ${submission.submissionId}:`, e.message.split('\n')[0])
        }
      }
    }

    console.log(`\n✅ Created ${createdCount} realistic AI detection results`)
    console.log('\n🎯 Realistic patterns implemented:')
    console.log('   - Academic writing score distributions (15-85% range)')
    console.log('   - Correlation between draft and final versions')
    console.log('   - Realistic text metrics based on student writing')
    console.log('   - Proper confidence levels and verdicts')
    console.log('   - Natural progression from draft to final')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

function generateRealisticAIPattern(submission) {
  // Base the AI likelihood on the submission's finalScore but make it more realistic
  const baseScore = submission.finalScore
  
  // Most academic writing falls in 15-85% AI likelihood range
  // Very few are 0% or 100% AI
  const finalAIScore = Math.max(15, Math.min(85, baseScore + (Math.random() - 0.5) * 20))
  
  // Draft is usually 5-15 points lower (students often refine with AI)
  const draftAIScore = Math.max(10, finalAIScore - (5 + Math.random() * 15))
  
  // Realistic word counts for academic assignments
  const draftWordCount = 200 + Math.floor(Math.random() * 400) // 200-600 words
  const finalWordCount = draftWordCount + Math.floor(Math.random() * 200) // Usually longer
  
  // Calculate realistic metrics
  const draftSentences = Math.ceil(draftWordCount / (12 + Math.random() * 8)) // 12-20 words per sentence
  const finalSentences = Math.ceil(finalWordCount / (14 + Math.random() * 6)) // Slightly longer sentences in final
  
  const changes = {
    wordsAdded: finalWordCount - draftWordCount + Math.floor(Math.random() * 50),
    wordsRemoved: Math.floor(Math.random() * 30),
    percentageChange: ((finalWordCount - draftWordCount) / draftWordCount) * 100,
    significantlyModified: (finalAIScore - draftAIScore) > 10
  }

  return {
    draft: {
      aiLikelihood: Math.round(draftAIScore),
      humanLikelihood: Math.round(100 - draftAIScore),
      confidence: draftAIScore > 60 ? 'high' : draftAIScore > 35 ? 'medium' : 'low',
      verdict: getRealisticVerdict(draftAIScore),
      wordCount: draftWordCount,
      sentenceCount: draftSentences,
      avgWordsPerSentence: parseFloat((draftWordCount / draftSentences).toFixed(1)),
      vocabularyRichness: 0.4 + Math.random() * 0.3, // 0.4-0.7 range
      readabilityScore: 0.5 + Math.random() * 0.3, // 0.5-0.8 range
      hasAIMarkers: draftAIScore > 50,
      formalityLevel: getRandomFormality(),
      sentenceVariation: 0.3 + Math.random() * 0.4, // 0.3-0.7 range
      hasPersonalTouch: draftAIScore < 40,
    },
    final: {
      aiLikelihood: Math.round(finalAIScore),
      humanLikelihood: Math.round(100 - finalAIScore),
      confidence: finalAIScore > 65 ? 'high' : finalAIScore > 40 ? 'medium' : 'low',
      verdict: getRealisticVerdict(finalAIScore),
      wordCount: finalWordCount,
      sentenceCount: finalSentences,
      avgWordsPerSentence: parseFloat((finalWordCount / finalSentences).toFixed(1)),
      vocabularyRichness: 0.45 + Math.random() * 0.35, // Slightly higher in final
      readabilityScore: 0.55 + Math.random() * 0.3, // Usually improves
      hasAIMarkers: finalAIScore > 55,
      formalityLevel: getRandomFormality(),
      sentenceVariation: 0.35 + Math.random() * 0.4, // Usually improves
      hasPersonalTouch: finalAIScore < 45,
    },
    changes
  }
}

function getRealisticVerdict(score) {
  if (score >= 70) {
    return "Strong indicators of AI assistance. Content shows patterns typical of AI-generated text with possible human editing."
  } else if (score >= 50) {
    return "Mixed characteristics detected. Likely combination of human writing with AI refinement or assistance."
  } else if (score >= 30) {
    return "Primarily human-written with possible minor AI assistance for grammar or style improvements."
  } else {
    return "Predominantly original human writing. Natural language patterns and personal voice detected."
  }
}

function getRandomFormality() {
  const levels = ['informal', 'moderate', 'formal', 'academic']
  return levels[Math.floor(Math.random() * levels.length)]
}

createRealisticAIDetection()
