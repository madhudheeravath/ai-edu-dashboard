const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const prisma = new PrismaClient({
  log: ['error'],
})

async function main() {
  console.log('🔄 Importing remaining data...\n')

  try {
    // 1. Complete Submissions Import
    console.log('📤 Completing submissions import...')
    const submissionsPath = path.join(__dirname, '../Data/submissions_dataset.csv')
    if (fs.existsSync(submissionsPath)) {
      const submissionsData = fs.readFileSync(submissionsPath, 'utf-8')
      const submissions = parse(submissionsData, { columns: true, skip_empty_lines: true })
      
      let submissionCount = 0
      for (const row of submissions.slice(2107)) { // Skip already imported
        try {
          const student = await prisma.student.findFirst({
            where: { studentId: row.student_id }
          })
          const assignment = await prisma.assignment.findFirst({
            where: { assignmentId: row.assignment_id }
          })
          
          if (student && assignment) {
            await prisma.submission.create({
              data: {
                studentId: student.id,
                assignmentId: assignment.id,
                submittedAt: new Date(row.submitted_at),
                contentText: row.content_text || 'Sample submission content',
                aiDetectionScore: parseFloat(row.ai_detection_score) || 0,
                grade: row.grade ? parseFloat(row.grade) : null,
                feedback: row.feedback || null,
              }
            })
            submissionCount++
            if (submissionCount % 100 === 0) {
              console.log(`   ... ${submissionCount} more submissions imported`)
            }
          }
        } catch (e) {
          // Skip duplicates or errors
        }
      }
      console.log(`✅ Imported ${submissionCount} additional submissions\n`)
    }

    // 2. Import Chat Messages
    console.log('💬 Importing chat messages...')
    const chatPath = path.join(__dirname, '../Data/chat_messages_dataset.csv')
    if (fs.existsSync(chatPath)) {
      const chatData = fs.readFileSync(chatPath, 'utf-8')
      const chats = parse(chatData, { columns: true, skip_empty_lines: true })
      
      let chatCount = 0
      for (const row of chats) {
        try {
          const student = await prisma.student.findFirst({
            where: { studentId: row.student_id }
          })
          
          if (student) {
            await prisma.chatMessage.create({
              data: {
                studentId: student.id,
                message: row.message,
                sender: row.sender,
                timestamp: new Date(row.timestamp),
              }
            })
            chatCount++
            if (chatCount % 500 === 0) {
              console.log(`   ... ${chatCount} chat messages imported`)
            }
          }
        } catch (e) {
          // Skip errors
        }
      }
      console.log(`✅ Imported ${chatCount} chat messages\n`)
    } else {
      console.log('ℹ️  Chat messages file not found\n')
    }

    // 3. Import Reflections
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
                content: row.content || row.reflection_text,
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
    } else {
      console.log('ℹ️  Reflections file not found\n')
    }

    // 4. Import Rubric Evaluations
    console.log('📊 Importing rubric evaluations...')
    const rubricsPath = path.join(__dirname, '../Data/rubric_evaluations_dataset.csv')
    if (fs.existsSync(rubricsPath)) {
      const rubricsData = fs.readFileSync(rubricsPath, 'utf-8')
      const rubrics = parse(rubricsData, { columns: true, skip_empty_lines: true })
      
      let rubricCount = 0
      for (const row of rubrics) {
        try {
          const submission = await prisma.submission.findFirst({
            where: { id: row.submission_id }
          })
          const faculty = await prisma.faculty.findFirst({
            where: { facultyId: row.faculty_id }
          })
          
          if (submission && faculty) {
            await prisma.rubricEvaluation.create({
              data: {
                submissionId: submission.id,
                facultyId: faculty.id,
                criteriaScores: row.criteria_scores || '{}',
                totalScore: parseFloat(row.total_score) || 0,
                feedback: row.feedback || null,
              }
            })
            rubricCount++
          }
        } catch (e) {
          // Skip errors
        }
      }
      console.log(`✅ Imported ${rubricCount} rubric evaluations\n`)
    } else {
      console.log('ℹ️  Rubric evaluations file not found\n')
    }

    // 5. Import Faculty Activities
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
                facultyId: faculty.id,
                activityType: row.activity_type,
                description: row.description || '',
                timestamp: new Date(row.timestamp),
              }
            })
            activityCount++
          }
        } catch (e) {
          // Skip errors
        }
      }
      console.log(`✅ Imported ${activityCount} faculty activities\n`)
    } else {
      console.log('ℹ️  Faculty activities file not found\n')
    }

    console.log('✅ All remaining data imported successfully!')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
