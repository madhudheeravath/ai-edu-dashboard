const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugAIDetectionAPI() {
  console.log('🔍 Debugging AI Detection API...\n')

  try {
    // Check AI detection results
    const aiResults = await prisma.aIDetectionResult.findMany({
      where: {
        aiLikelihood: { gte: 50 }
      },
      take: 10
    })
    console.log(`📊 AI Detection Results >= 50%: ${aiResults.length}`)
    if (aiResults.length > 0) {
      console.log('Sample results:')
      aiResults.slice(0, 3).forEach(result => {
        console.log(`  - ${result.submissionId}: ${result.aiLikelihood}% (${result.confidence})`)
      })
    }
    console.log()

    // Check faculty
    const faculty = await prisma.faculty.findFirst({
      where: { email: 'fac1000@university.edu' }
    })
    console.log(`👨‍🏫 Faculty FAC1000: ${faculty ? faculty.facultyId : 'Not found'}`)
    console.log()

    // Check submissions for this faculty
    if (faculty) {
      const submissions = await prisma.submission.findMany({
        where: { facultyId: faculty.facultyId },
        take: 5
      })
      console.log(`📝 Submissions for ${faculty.facultyId}: ${submissions.length}`)
      if (submissions.length > 0) {
        console.log('Sample submissions:')
        submissions.slice(0, 3).forEach(sub => {
          console.log(`  - ${sub.submissionId}: Faculty ${sub.facultyId}`)
        })
      }
      console.log()

      // Check if any submissions have AI detection results
      const submissionIds = submissions.map(s => s.submissionId)
      const matchingAI = await prisma.aIDetectionResult.findMany({
        where: {
          submissionId: { in: submissionIds },
          aiLikelihood: { gte: 50 }
        }
      })
      console.log(`🤖 AI Results for this faculty's submissions: ${matchingAI.length}`)
      if (matchingAI.length > 0) {
        console.log('Matching AI results:')
        matchingAI.slice(0, 3).forEach(ai => {
          console.log(`  - ${ai.submissionId}: ${ai.aiLikelihood}%`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugAIDetectionAPI()
