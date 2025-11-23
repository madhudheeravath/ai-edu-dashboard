const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function showSampleResults() {
  console.log('📊 Sample Realistic AI Detection Results:\n')

  const samples = await prisma.aIDetectionResult.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  })

  for (const result of samples) {
    console.log(`📊 Submission ID: ${result.submissionId}`)
    console.log(`📊 Stage: ${result.stage.toUpperCase()}`)
    console.log(`🤖 AI Likelihood: ${result.aiLikelihood}% (${result.confidence} confidence)`)
    console.log(`👤 Human Likelihood: ${result.humanLikelihood}%`)
    console.log(`📖 Words: ${result.wordCount} | Sentences: ${result.sentenceCount} | Avg: ${result.avgWordsPerSentence}`)
    console.log(`💭 Verdict: ${result.verdict}`)
    console.log(`🎯 AI Markers: ${result.hasAIMarkers ? 'Yes' : 'No'} | Personal Touch: ${result.hasPersonalTouch ? 'Yes' : 'No'}`)
    console.log(`📝 Formality: ${result.formalityLevel} | Vocab Richness: ${(result.vocabularyRichness * 100).toFixed(0)}%`)
    if (result.stage === 'final') {
      console.log(`🔄 Changes: +${result.wordsAdded} words, -${result.wordsRemoved} words (${result.percentageChange.toFixed(1)}% change)`)
    }
    console.log('─'.repeat(80))
  }

  await prisma.$disconnect()
}

showSampleResults()
