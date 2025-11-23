const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const prisma = new PrismaClient({
  log: ['error'],
})

async function main() {
  console.log('🔄 Importing missing data with fixed relationships...\n')

  try {
    // 1. Import Faculty Activities (Fixed)
    console.log('📈 Importing faculty activities...')
    const activitiesPath = path.join(__dirname, '../Data/faculty_activities_dataset.csv')
    if (fs.existsSync(activitiesPath)) {
      const activitiesData = fs.readFileSync(activitiesPath, 'utf-8')
      const activities = parse(activitiesData, { columns: true, skip_empty_lines: true })
      
      let activityCount = 0
      for (const row of activities) {
        try {
          // Check if faculty exists
          const faculty = await prisma.faculty.findFirst({
            where: { facultyId: row.faculty_id }
          })
          
          if (faculty) {
            await prisma.facultyActivity.create({
              data: {
                activityId: row.activity_id,
                facultyId: row.faculty_id, // Use the string facultyId directly
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
          if (!e.message.includes('Unique constraint')) {
            console.log(`   ⚠️  Skipped activity ${row.activity_id}:`, e.message.split('\n')[0])
          }
        }
      }
      console.log(`✅ Imported ${activityCount} faculty activities\n`)
    }

    // 2. Create Sample Chat Messages (Fixed relationship)
    console.log('💬 Creating sample chat messages...')
    const sampleStudents = await prisma.student.findMany({ take: 20 })
    
    const chatMessages = [
      "Can you help me with my essay structure?",
      "I'm struggling with the introduction paragraph.",
      "What's the best way to cite sources?",
      "How can I improve my writing style?",
      "Can you check if this sounds too AI-generated?"
    ]
    
    let chatCount = 0
    for (const student of sampleStudents) {
      for (let i = 0; i < 3; i++) {
        try {
          // User message
          await prisma.chatMessage.create({
            data: {
              studentId: student.studentId, // Use studentId string
              role: 'user',
              content: chatMessages[Math.floor(Math.random() * chatMessages.length)],
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            }
          })
          
          // Assistant response
          await prisma.chatMessage.create({
            data: {
              studentId: student.studentId, // Use studentId string
              role: 'assistant',
              content: "I'd be happy to help you with that! Let me provide some guidance on improving your writing.",
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            }
          })
          
          chatCount += 2
        } catch (e) {
          console.log(`   ⚠️  Skipped chat for ${student.studentId}:`, e.message.split('\n')[0])
        }
      }
    }
    console.log(`✅ Created ${chatCount} sample chat messages\n`)

    // 3. Import More Reflections
    console.log('📝 Importing reflections...')
    const reflectionsPath = path.join(__dirname, '../Data/reflections_dataset.csv')
    if (fs.existsSync(reflectionsPath)) {
      const reflectionsData = fs.readFileSync(reflectionsPath, 'utf-8')
      const reflections = parse(reflectionsData, { columns: true, skip_empty_lines: true })
      
      let reflectionCount = 0
      for (const row of reflections.slice(0, 100)) { // Limit to first 100
        try {
          const student = await prisma.student.findFirst({
            where: { studentId: row.student_id }
          })
          
          if (student) {
            await prisma.reflection.create({
              data: {
                studentId: student.id, // Use the cuid id for reflections
                content: row.content || row.reflection_text || 'Student reflection on learning progress and AI usage.',
                createdAt: row.created_at ? new Date(row.created_at) : new Date(),
              }
            })
            reflectionCount++
          }
        } catch (e) {
          // Skip errors
        }
      }
      console.log(`✅ Imported ${reflectionCount} reflections\n`)
    }

    console.log('✅ Missing data import completed!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
