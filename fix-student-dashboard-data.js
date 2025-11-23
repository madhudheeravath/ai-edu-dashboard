const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixStudentDashboardData() {
  console.log('🔧 Fixing student dashboard data for STU10054...\n')

  try {
    const studentId = 'STU10054'
    
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { studentId: studentId }
    })

    if (!student) {
      console.log(`❌ Student ${studentId} not found`)
      return
    }

    console.log(`👤 Found student: ${student.name}`)

    // Get some assignments to create submissions for
    const assignments = await prisma.assignment.findMany({
      take: 3
    })

    console.log(`📋 Found ${assignments.length} assignments`)

    let submissionsCreated = 0
    let reflectionsCreated = 0

    // Create submissions for this student
    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i]
      
      try {
        // Create submission
        const submissionId = `SUB_${studentId}_${Date.now()}_${i}`
        
        const submission = await prisma.submission.create({
          data: {
            submissionId: submissionId,
            studentId: studentId,
            assignmentId: assignment.assignmentId,
            facultyId: assignment.facultyId,
            submissionDate: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000), // 1, 2, 3 weeks ago
            usesAi: Math.random() > 0.3, // 70% chance of AI usage
            aiAccessHours: Math.random() * 5 + 1, // 1-6 hours
            draftScore: Math.random() * 30 + 70, // 70-100
            finalScore: Math.random() * 30 + 70, // 70-100
            creativityScore: Math.random() * 1.5 + 3.5, // 3.5-5.0 (out of 5)
            aiDetected: Math.random() > 0.4, // 60% chance of AI detected
            aiConfidence: Math.random() * 0.5 + 0.5, // 0.5-1.0
            timeHours: Math.random() * 8 + 2, // 2-10 hours
            status: 'Submitted',
            aiAssistanceType: ['grammar', 'research', 'brainstorming', 'none'][Math.floor(Math.random() * 4)],
            criticalThinkingScore: Math.random() * 30 + 70, // 70-100
            satisfactionLevel: Math.random() * 30 + 70, // 70-100
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })

        submissionsCreated++
        console.log(`   ✅ Created submission: ${submissionId}`)

        // Create reflection for this submission
        const reflectionId = `REF_${studentId}_${Date.now()}_${i}`
        
        await prisma.reflection.create({
          data: {
            reflectionId: reflectionId,
            submissionId: submissionId,
            studentId: studentId,
            type: ['learning', 'process', 'outcome', 'improvement'][Math.floor(Math.random() * 4)],
            depthScore: Math.random() * 3 + 2, // 2-5
            words: Math.floor(Math.random() * 200) + 150, // 150-350 words
            content: generateReflectionContent(i),
            date: new Date(Date.now() - (i + 1) * 6 * 24 * 60 * 60 * 1000), // Slightly after submission
          }
        })

        reflectionsCreated++
        console.log(`   ✅ Created reflection: ${reflectionId}`)

        // Create AI detection result
        const aiLikelihood = Math.floor(Math.random() * 50) + 25 // 25-75%
        
        await prisma.aIDetectionResult.create({
          data: {
            submissionId: submissionId,
            stage: 'final',
            aiLikelihood: aiLikelihood,
            humanLikelihood: 100 - aiLikelihood,
            confidence: aiLikelihood > 60 ? 'high' : aiLikelihood > 40 ? 'medium' : 'low',
            verdict: getVerdict(aiLikelihood),
            wordCount: Math.floor(Math.random() * 400) + 300, // 300-700 words
            sentenceCount: Math.floor((Math.random() * 400 + 300) / 16), // ~16 words per sentence
            avgWordsPerSentence: 14 + Math.random() * 4,
            vocabularyRichness: 0.4 + Math.random() * 0.3,
            readabilityScore: 0.5 + Math.random() * 0.3,
            hasAIMarkers: aiLikelihood > 50,
            formalityLevel: ['formal', 'academic', 'moderate'][Math.floor(Math.random() * 3)],
            sentenceVariation: 0.4 + Math.random() * 0.3,
            hasPersonalTouch: aiLikelihood < 60,
            wordsAdded: Math.floor(Math.random() * 80),
            wordsRemoved: Math.floor(Math.random() * 40),
            percentageChange: Math.random() * 15 + 5,
            significantlyModified: Math.random() > 0.5,
            analyzedAt: new Date(),
          }
        })

        console.log(`   ✅ Created AI detection result`)

      } catch (e) {
        console.log(`   ❌ Error creating submission ${i}: ${e.message.split('\n')[0]}`)
      }
    }

    // Create some additional chat messages
    const chatMessages = [
      "Can you help me improve my essay structure?",
      "I'm working on my research paper and need some guidance on citations.",
      "How can I make my argument more convincing?",
      "What's the best way to organize my thoughts for this assignment?",
      "Can you review my draft and provide feedback?"
    ]

    for (const message of chatMessages) {
      try {
        await prisma.chatMessage.create({
          data: {
            studentId: studentId,
            role: 'user',
            content: message,
            timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000), // Within last 2 weeks
          }
        })
      } catch (e) {
        // Skip if already exists
      }
    }

    console.log(`\n🎉 Successfully created data for ${studentId}:`)
    console.log(`   📝 Submissions: ${submissionsCreated}`)
    console.log(`   💭 Reflections: ${reflectionsCreated}`)
    console.log(`   💬 Chat messages: ${chatMessages.length}`)
    console.log(`\n🔄 Student dashboard should now show data!`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

function generateReflectionContent(index) {
  const reflections = [
    "This assignment challenged me to think more critically about the subject matter. I learned to analyze information from multiple perspectives and develop stronger arguments. The research process was particularly valuable in helping me understand how to evaluate sources effectively.",
    
    "Working on this project helped me improve my time management skills significantly. I learned to break down complex tasks into manageable steps and create a realistic timeline. The feedback I received was constructive and helped me identify areas for improvement.",
    
    "I found this assignment both challenging and rewarding. It pushed me to explore topics I hadn't considered before and develop new research strategies. The writing process helped me organize my thoughts more clearly and present ideas in a logical sequence."
  ]
  
  return reflections[index] || reflections[0]
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

fixStudentDashboardData()
