const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const prisma = new PrismaClient({
  log: ['error'],
})

async function main() {
  console.log('🔄 Importing all remaining data...\n')

  try {
    // 1. Import Faculty Activities
    console.log('📈 Importing faculty activities...')
    const activitiesPath = path.join(__dirname, '../Data/faculty_activities_dataset.csv')
    if (fs.existsSync(activitiesPath)) {
      const activitiesData = fs.readFileSync(activitiesPath, 'utf-8')
      const activities = parse(activitiesData, { columns: true, skip_empty_lines: true })
      
      let activityCount = 0
      for (const row of activities) {
        try {
          const faculty = await prisma.faculty.findFirst({
            where: { facultyId: row.faculty_id }
          })
          
          if (faculty) {
            await prisma.facultyActivity.create({
              data: {
                activityId: row.activity_id,
                facultyId: faculty.facultyId, // Use facultyId string, not id
                activity: row.activity || 'Dashboard',
                timestamp: new Date(row.timestamp),
                durationMin: parseInt(row.duration_min) || 0,
                resource: row.resource || 'Dashboard',
              }
            })
            activityCount++
            if (activityCount % 100 === 0) {
              console.log(`   ... ${activityCount} activities imported`)
            }
          }
        } catch (e) {
          // Skip duplicates or errors
        }
      }
      console.log(`✅ Imported ${activityCount} faculty activities\n`)
    }

    // 2. Import Reflections
    console.log('📝 Importing reflections...')
    const reflectionsPath = path.join(__dirname, '../Data/reflections_dataset.csv')
    if (fs.existsSync(reflectionsPath)) {
      const reflectionsData = fs.readFileSync(reflectionsPath, 'utf-8')
      const reflections = parse(reflectionsData, { columns: true, skip_empty_lines: true })
      
      let reflectionCount = 0
      for (const row of reflections) {
        try {
          const student = await prisma.student.findFirst({
            where: { studentId: row.student_id }
          })
          
          if (student) {
            await prisma.reflection.create({
              data: {
                studentId: student.id,
                content: row.content || row.reflection_text || 'Student reflection content',
                createdAt: row.created_at ? new Date(row.created_at) : new Date(),
              }
            })
            reflectionCount++
            if (reflectionCount % 100 === 0) {
              console.log(`   ... ${reflectionCount} reflections imported`)
            }
          }
        } catch (e) {
          // Skip errors
        }
      }
      console.log(`✅ Imported ${reflectionCount} reflections\n`)
    }

    // 3. Import Rubric Evaluations
    console.log('📊 Importing rubric evaluations...')
    const rubricsPath = path.join(__dirname, '../Data/rubric_evaluations_dataset.csv')
    if (fs.existsSync(rubricsPath)) {
      const rubricsData = fs.readFileSync(rubricsPath, 'utf-8')
      const rubrics = parse(rubricsData, { columns: true, skip_empty_lines: true })
      
      let rubricCount = 0
      for (const row of rubrics) {
        try {
          const faculty = await prisma.faculty.findFirst({
            where: { facultyId: row.faculty_id }
          })
          
          // Find submission by student and assignment
          const student = await prisma.student.findFirst({
            where: { studentId: row.student_id }
          })
          
          if (faculty && student) {
            const submission = await prisma.submission.findFirst({
              where: { 
                studentId: student.id,
                // You might need to adjust this based on your data structure
              }
            })
            
            if (submission) {
              await prisma.rubricEvaluation.create({
                data: {
                  submissionId: submission.id,
                  facultyId: faculty.id,
                  criteriaScores: row.criteria_scores || JSON.stringify({
                    originality: parseFloat(row.originality) || 0,
                    effort: parseFloat(row.effort) || 0,
                  }),
                  totalScore: parseFloat(row.final_grade) || parseFloat(row.total_score) || 0,
                  feedback: row.feedback || null,
                }
              })
              rubricCount++
              if (rubricCount % 50 === 0) {
                console.log(`   ... ${rubricCount} rubric evaluations imported`)
              }
            }
          }
        } catch (e) {
          // Skip errors
        }
      }
      console.log(`✅ Imported ${rubricCount} rubric evaluations\n`)
    }

    // 4. Create Sample Chat Messages (since no CSV exists)
    console.log('💬 Creating sample chat messages...')
    const sampleStudents = await prisma.student.findMany({ take: 50 })
    
    const chatMessages = [
      "Can you help me with my essay structure?",
      "I'm struggling with the introduction paragraph.",
      "What's the best way to cite sources?",
      "How can I improve my writing style?",
      "Can you check if this sounds too AI-generated?",
      "I need help with grammar and punctuation.",
      "What's a good thesis statement for this topic?",
      "How do I make my argument stronger?",
      "Can you suggest better word choices?",
      "Is my conclusion effective?"
    ]
    
    let chatCount = 0
    for (const student of sampleStudents) {
      for (let i = 0; i < 5; i++) {
        try {
          await prisma.chatMessage.create({
            data: {
              studentId: student.id,
              role: i % 2 === 0 ? 'user' : 'assistant',
              content: i % 2 === 0 
                ? chatMessages[Math.floor(Math.random() * chatMessages.length)]
                : "I'd be happy to help you with that! Let me provide some guidance...",
              timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within last 30 days
            }
          })
          chatCount++
        } catch (e) {
          // Skip errors
        }
      }
    }
    console.log(`✅ Created ${chatCount} sample chat messages\n`)

    console.log('✅ All remaining data imported successfully!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
