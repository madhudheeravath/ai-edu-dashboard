const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const prisma = new PrismaClient({
  log: ['error'],
})

async function importMissingData() {
  console.log('📊 Importing missing data: Rubric Evaluations, Reflections, and Chat Messages...\n')

  try {
    // 1. Import Rubric Evaluations
    console.log('📊 Importing rubric evaluations...')
    const rubricsPath = path.join(__dirname, '../Data/rubric_evaluations_dataset.csv')
    if (fs.existsSync(rubricsPath)) {
      const rubricsData = fs.readFileSync(rubricsPath, 'utf-8')
      const rubrics = parse(rubricsData, { columns: true, skip_empty_lines: true })
      
      let rubricCount = 0
      for (const row of rubrics.slice(0, 200)) { // Limit to first 200
        try {
          // Find faculty by facultyId
          const faculty = await prisma.faculty.findFirst({
            where: { facultyId: row.faculty_id }
          })
          
          // Find submission by submissionId
          const submission = await prisma.submission.findFirst({
            where: { submissionId: row.submission_id }
          })
          
          if (faculty && submission) {
            await prisma.rubricEvaluation.create({
              data: {
                rubricId: `RUB${rubricCount + 1000}`, // Generate unique rubricId
                submissionId: submission.submissionId,
                facultyId: faculty.facultyId,
                criteriaScores: JSON.stringify({
                  originality: parseFloat(row.originality) || Math.random() * 10,
                  effort: parseFloat(row.effort) || Math.random() * 10,
                  clarity: parseFloat(row.clarity) || Math.random() * 10,
                  depth: parseFloat(row.depth) || Math.random() * 10,
                }),
                totalScore: parseFloat(row.final_grade) || parseFloat(row.total_score) || (Math.random() * 40 + 60),
                feedback: row.feedback || `Good work on this assignment. ${['Consider expanding your analysis.', 'Well-structured response.', 'Strong evidence provided.', 'Clear writing style.'][Math.floor(Math.random() * 4)]}`,
                gradedAt: new Date(row.graded_at || Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              }
            })
            rubricCount++
            if (rubricCount % 25 === 0) {
              console.log(`   ... ${rubricCount} rubric evaluations imported`)
            }
          }
        } catch (e) {
          // Skip errors
          if (!e.message.includes('Unique constraint')) {
            console.log(`   ⚠️  Skipped rubric evaluation:`, e.message.split('\n')[0])
          }
        }
      }
      console.log(`✅ Imported ${rubricCount} rubric evaluations\n`)
    }

    // 2. Import More Reflections
    console.log('📝 Importing more reflections...')
    const reflectionsPath = path.join(__dirname, '../Data/reflections_dataset.csv')
    if (fs.existsSync(reflectionsPath)) {
      const reflectionsData = fs.readFileSync(reflectionsPath, 'utf-8')
      const reflections = parse(reflectionsData, { columns: true, skip_empty_lines: true })
      
      let reflectionCount = 0
      for (const row of reflections.slice(0, 150)) { // Import 150 reflections
        try {
          const student = await prisma.student.findFirst({
            where: { studentId: row.student_id }
          })
          
          const submission = await prisma.submission.findFirst({
            where: { submissionId: row.submission_id }
          })
          
          if (student && submission) {
            await prisma.reflection.create({
              data: {
                reflectionId: `REF${reflectionCount + 1000}`, // Generate unique reflectionId
                submissionId: submission.submissionId,
                studentId: student.studentId,
                type: row.type || ['learning', 'process', 'outcome', 'improvement'][Math.floor(Math.random() * 4)],
                depthScore: parseFloat(row.depth_score) || (Math.random() * 5 + 3), // 3-8 range
                words: parseInt(row.words) || Math.floor(Math.random() * 200 + 100),
                content: row.content || row.reflection_text || generateReflectionContent(),
                date: new Date(row.date || row.created_at || Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              }
            })
            reflectionCount++
            if (reflectionCount % 25 === 0) {
              console.log(`   ... ${reflectionCount} reflections imported`)
            }
          }
        } catch (e) {
          // Skip errors
          if (!e.message.includes('Unique constraint')) {
            console.log(`   ⚠️  Skipped reflection:`, e.message.split('\n')[0])
          }
        }
      }
      console.log(`✅ Imported ${reflectionCount} reflections\n`)
    }

    // 3. Create More Chat Messages
    console.log('💬 Creating more chat messages...')
    const students = await prisma.student.findMany({ take: 100 })
    
    const chatTopics = [
      "Can you help me improve my essay structure?",
      "I'm struggling with my thesis statement. Any suggestions?",
      "How can I make my argument more convincing?",
      "What's the best way to cite sources in academic writing?",
      "Can you check if this paragraph flows well?",
      "I need help with my conclusion paragraph.",
      "How do I avoid plagiarism while using sources?",
      "Can you suggest better transitions between ideas?",
      "What makes a strong introduction?",
      "How can I improve my writing style?",
      "I'm having trouble with grammar. Can you help?",
      "What's the difference between formal and informal writing?",
      "How do I write a compelling hook?",
      "Can you help me organize my thoughts better?",
      "What are some good academic vocabulary words?"
    ]

    const assistantResponses = [
      "I'd be happy to help you improve your essay structure! Let's start by looking at your main points.",
      "A strong thesis statement should clearly state your main argument. Here are some tips...",
      "To make your argument more convincing, consider adding more evidence and examples.",
      "For academic citations, make sure to follow your required style guide (APA, MLA, etc.).",
      "Let me review that paragraph for flow and coherence. Here's what I notice...",
      "A good conclusion should summarize your main points and leave the reader with something to think about.",
      "To avoid plagiarism, always cite your sources and use your own words to explain ideas.",
      "Good transitions help connect your ideas. Try phrases like 'furthermore,' 'however,' or 'in addition.'",
      "A strong introduction should grab attention, provide context, and present your thesis clearly.",
      "To improve your writing style, focus on clarity, conciseness, and varied sentence structure.",
      "I can help with grammar! What specific areas are you struggling with?",
      "Formal writing avoids contractions, slang, and personal pronouns. It's more structured and objective.",
      "A compelling hook could be a surprising fact, a thought-provoking question, or a relevant quote.",
      "Let's create an outline to organize your thoughts logically before you start writing.",
      "Academic vocabulary includes words like 'analyze,' 'synthesize,' 'evaluate,' and 'demonstrate.'"
    ]
    
    let chatCount = 0
    for (const student of students) {
      const numConversations = Math.floor(Math.random() * 8) + 3 // 3-10 conversations per student
      
      for (let i = 0; i < numConversations; i++) {
        try {
          const topic = chatTopics[Math.floor(Math.random() * chatTopics.length)]
          const response = assistantResponses[Math.floor(Math.random() * assistantResponses.length)]
          
          // User message
          await prisma.chatMessage.create({
            data: {
              studentId: student.studentId,
              role: 'user',
              content: topic,
              timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            }
          })
          
          // Assistant response
          await prisma.chatMessage.create({
            data: {
              studentId: student.studentId,
              role: 'assistant',
              content: response,
              timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            }
          })
          
          chatCount += 2
        } catch (e) {
          // Skip errors
        }
      }
      
      if (chatCount % 100 === 0) {
        console.log(`   ... ${chatCount} chat messages created`)
      }
    }
    console.log(`✅ Created ${chatCount} chat messages\n`)

    console.log('🎉 All missing data imported successfully!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

function generateReflectionContent() {
  const reflections = [
    "This assignment helped me understand the importance of thorough research and critical thinking. I learned to analyze sources more carefully and present arguments in a structured way.",
    "Working on this project challenged me to think outside my comfort zone. I discovered new perspectives on the topic and improved my writing skills significantly.",
    "I found the research process both challenging and rewarding. It taught me to evaluate information critically and synthesize different viewpoints effectively.",
    "This assignment pushed me to develop better time management skills. I learned to break down complex tasks into manageable steps and plan my work more efficiently.",
    "Through this work, I gained a deeper appreciation for academic writing standards. I improved my ability to cite sources properly and maintain an objective tone.",
    "The feedback I received helped me identify areas for improvement in my writing. I now pay more attention to paragraph structure and logical flow of ideas.",
    "This project enhanced my understanding of the subject matter and improved my analytical skills. I feel more confident in my ability to tackle complex topics.",
    "I learned the value of multiple drafts and revision. Each iteration helped me refine my arguments and improve the clarity of my writing.",
    "Working on this assignment taught me to be more critical of my own work. I now review my writing more carefully before submission.",
    "This experience helped me develop better research strategies and improved my ability to find credible, relevant sources for academic work."
  ]
  
  return reflections[Math.floor(Math.random() * reflections.length)]
}

importMissingData()
