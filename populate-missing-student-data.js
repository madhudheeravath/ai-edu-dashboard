const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function populateMissingStudentData() {
  console.log('📊 Populating missing student data...\n')

  try {
    // Find students without submissions
    const studentsWithoutSubmissions = await prisma.student.findMany({
      where: {
        submissions: {
          none: {}
        }
      },
      take: 100 // Process 100 students at a time
    })

    console.log(`📝 Found ${studentsWithoutSubmissions.length} students without submissions`)

    // Get available assignments
    const assignments = await prisma.assignment.findMany({
      take: 20
    })

    console.log(`📋 Available assignments: ${assignments.length}`)

    let submissionsCreated = 0
    let reflectionsCreated = 0

    for (const student of studentsWithoutSubmissions) {
      try {
        // Create 1-3 submissions per student
        const numSubmissions = Math.floor(Math.random() * 3) + 1
        
        for (let i = 0; i < numSubmissions; i++) {
          const assignment = assignments[Math.floor(Math.random() * assignments.length)]
          
          // Create submission
          const submission = await prisma.submission.create({
            data: {
              submissionId: `SUB${Date.now()}_${student.studentId}_${i}`,
              studentId: student.studentId,
              assignmentId: assignment.assignmentId,
              facultyId: assignment.facultyId,
              submissionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
              draftScore: Math.random() * 40 + 60, // 60-100
              finalScore: Math.random() * 40 + 60, // 60-100
              aiDetected: Math.random() > 0.7, // 30% chance
              aiConfidence: Math.random() * 0.5 + 0.5, // 0.5-1.0
              wordCount: Math.floor(Math.random() * 400) + 200, // 200-600 words
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })

          submissionsCreated++

          // Create reflection for this submission (50% chance)
          if (Math.random() > 0.5) {
            await prisma.reflection.create({
              data: {
                reflectionId: `REF${Date.now()}_${student.studentId}_${i}`,
                submissionId: submission.submissionId,
                studentId: student.studentId,
                type: ['learning', 'process', 'outcome', 'improvement'][Math.floor(Math.random() * 4)],
                depthScore: Math.random() * 3 + 2, // 2-5
                words: Math.floor(Math.random() * 200) + 100, // 100-300 words
                content: generateReflectionContent(),
                date: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000), // Random date within last 20 days
              }
            })
            reflectionsCreated++
          }
        }

        if (submissionsCreated % 50 === 0) {
          console.log(`   ... Created ${submissionsCreated} submissions so far`)
        }

      } catch (e) {
        console.log(`   ⚠️  Skipped ${student.studentId}: ${e.message.split('\n')[0]}`)
      }
    }

    console.log(`\n✅ Created ${submissionsCreated} submissions`)
    console.log(`✅ Created ${reflectionsCreated} reflections`)

    // Now create AI detection results for new submissions
    console.log('\n🤖 Creating AI detection results for new submissions...')
    
    const newSubmissions = await prisma.submission.findMany({
      where: {
        aIDetectionResults: {
          none: {}
        }
      },
      take: 200
    })

    let aiResultsCreated = 0
    for (const submission of newSubmissions) {
      try {
        // Create AI detection result for final stage
        const aiLikelihood = Math.floor(Math.random() * 60) + 20 // 20-80%
        
        await prisma.aIDetectionResult.create({
          data: {
            submissionId: submission.submissionId,
            stage: 'final',
            aiLikelihood: aiLikelihood,
            humanLikelihood: 100 - aiLikelihood,
            confidence: aiLikelihood > 60 ? 'high' : aiLikelihood > 40 ? 'medium' : 'low',
            verdict: getVerdict(aiLikelihood),
            wordCount: submission.wordCount,
            sentenceCount: Math.floor(submission.wordCount / 15), // ~15 words per sentence
            avgWordsPerSentence: 15 + Math.random() * 5,
            vocabularyRichness: 0.4 + Math.random() * 0.3,
            readabilityScore: 0.5 + Math.random() * 0.3,
            hasAIMarkers: aiLikelihood > 50,
            formalityLevel: ['formal', 'academic', 'moderate'][Math.floor(Math.random() * 3)],
            sentenceVariation: 0.4 + Math.random() * 0.3,
            hasPersonalTouch: aiLikelihood < 60,
            wordsAdded: Math.floor(Math.random() * 100),
            wordsRemoved: Math.floor(Math.random() * 50),
            percentageChange: Math.random() * 20 + 5,
            significantlyModified: Math.random() > 0.5,
            analyzedAt: new Date(),
          }
        })
        aiResultsCreated++
      } catch (e) {
        // Skip errors
      }
    }

    console.log(`✅ Created ${aiResultsCreated} AI detection results`)

    console.log('\n🎉 Student data population complete!')
    console.log('🔄 Students should now see data on their dashboards.')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

function generateReflectionContent() {
  const reflections = [
    "This assignment helped me understand the importance of thorough research and critical analysis. I learned to evaluate sources more carefully.",
    "Working on this project challenged me to think creatively and approach problems from different angles. I improved my analytical skills.",
    "I found the research process both challenging and rewarding. It taught me to synthesize information from multiple sources effectively.",
    "This assignment pushed me to develop better time management skills and plan my work more systematically.",
    "Through this work, I gained confidence in my writing abilities and learned to present arguments more clearly and persuasively.",
    "The feedback I received helped me identify areas for improvement and develop strategies for better academic writing.",
    "This project enhanced my understanding of the subject matter and helped me connect theoretical concepts to real-world applications.",
    "I learned the value of revision and multiple drafts in producing high-quality work that meets academic standards.",
    "Working on this assignment taught me to be more critical of my own work and seek continuous improvement.",
    "This experience helped me develop research strategies that I can apply to future academic and professional projects."
  ]
  
  return reflections[Math.floor(Math.random() * reflections.length)]
}

function getVerdict(aiLikelihood) {
  if (aiLikelihood >= 70) {
    return "High confidence: Strong indicators of AI assistance detected in this submission."
  } else if (aiLikelihood >= 50) {
    return "Moderate confidence: Mixed AI and human characteristics detected."
  } else {
    return "Low confidence: Primarily human-written content with minimal AI assistance."
  }
}

populateMissingStudentData()
