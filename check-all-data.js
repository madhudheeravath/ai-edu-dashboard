const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkData() {
  console.log('📊 Database Status:\n')
  
  const counts = {
    students: await prisma.student.count(),
    faculty: await prisma.faculty.count(),
    assignments: await prisma.assignment.count(),
    submissions: await prisma.submission.count(),
    chatMessages: await prisma.chatMessage.count(),
    reflections: await prisma.reflection.count(),
    rubricEvaluations: await prisma.rubricEvaluation.count(),
    facultyActivities: await prisma.facultyActivity.count(),
  }
  
  console.log('✅ Students:', counts.students)
  console.log('✅ Faculty:', counts.faculty)
  console.log('✅ Assignments:', counts.assignments)
  console.log('✅ Submissions:', counts.submissions)
  console.log('💬 Chat Messages:', counts.chatMessages)
  console.log('📝 Reflections:', counts.reflections)
  console.log('📊 Rubric Evaluations:', counts.rubricEvaluations)
  console.log('📈 Faculty Activities:', counts.facultyActivities)
  
  console.log('\n📋 Summary:')
  console.log(`   Total Records: ${Object.values(counts).reduce((a, b) => a + b, 0)}`)
  
  await prisma.$disconnect()
}

checkData()
