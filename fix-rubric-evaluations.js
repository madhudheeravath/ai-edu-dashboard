const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const prisma = new PrismaClient({
  log: ['error'],
})

async function createRubricEvaluations() {
  console.log('📊 Creating rubric evaluations with correct schema...\n')

  try {
    // Get submissions with their student and faculty info
    const submissions = await prisma.submission.findMany({
      include: {
        student: true,
        faculty: true
      },
      take: 150 // Create evaluations for 150 submissions
    })

    console.log(`📊 Creating rubric evaluations for ${submissions.length} submissions...\n`)

    let rubricCount = 0
    for (const submission of submissions) {
      try {
        await prisma.rubricEvaluation.create({
          data: {
            rubricId: `RUB${rubricCount + 1000}`,
            submissionId: submission.submissionId,
            facultyId: submission.facultyId,
            studentId: submission.studentId,
            originality: Math.random() * 4 + 6, // 6-10 range
            effort: Math.random() * 4 + 6, // 6-10 range
            facultyAiIdentified: submission.aiDetected || Math.random() > 0.7,
            assessmentDate: new Date(submission.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
            finalGrade: Math.random() * 30 + 70, // 70-100 range
            confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0 range
            feedback: generateFeedback(),
          }
        })
        
        rubricCount++
        if (rubricCount % 25 === 0) {
          console.log(`   ... ${rubricCount} rubric evaluations created`)
        }

      } catch (e) {
        if (!e.message.includes('Unique constraint')) {
          console.log(`   ⚠️  Skipped ${submission.submissionId}:`, e.message.split('\n')[0])
        }
      }
    }

    console.log(`\n✅ Created ${rubricCount} rubric evaluations`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

function generateFeedback() {
  const feedbacks = [
    "Excellent work! Your analysis demonstrates deep understanding of the topic. Consider expanding on the implications of your findings.",
    "Good effort on this assignment. Your arguments are well-structured, but could benefit from more supporting evidence.",
    "Strong writing and clear organization. The research is thorough and well-integrated into your analysis.",
    "Well done! Your critical thinking skills are evident throughout. Minor improvements needed in citation format.",
    "Solid work overall. Your conclusions are well-supported, though some sections could be more concise.",
    "Impressive depth of analysis. Your use of sources is effective and adds credibility to your arguments.",
    "Good progress! Your writing has improved significantly. Focus on strengthening your thesis statement next time.",
    "Thorough research and thoughtful analysis. Your writing demonstrates good understanding of academic conventions.",
    "Well-organized and clearly written. Your examples effectively support your main points.",
    "Strong effort! Your analysis shows good critical thinking. Consider exploring counterarguments in future work.",
    "Excellent use of evidence to support your claims. Your writing is clear and engaging throughout.",
    "Good work on this challenging topic. Your research is comprehensive and well-presented.",
    "Well-structured response with clear arguments. Minor grammatical issues to address in revision.",
    "Thoughtful analysis with good use of course concepts. Your conclusions are well-reasoned and supported.",
    "Strong academic writing with effective use of sources. Consider varying your sentence structure more."
  ]
  
  return feedbacks[Math.floor(Math.random() * feedbacks.length)]
}

createRubricEvaluations()
