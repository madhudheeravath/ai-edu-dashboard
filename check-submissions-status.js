const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSubmissionsStatus() {
  console.log('🔍 Checking submissions status...\n')

  try {
    // Check current submissions count
    const totalSubmissions = await prisma.submission.count()
    console.log(`📊 Total submissions in database: ${totalSubmissions}`)

    // Check submissions by student
    const submissionsByStudent = await prisma.submission.groupBy({
      by: ['studentId'],
      _count: {
        submissionId: true
      },
      take: 10
    })

    console.log(`\n📝 Submissions by student (sample):`)
    for (const group of submissionsByStudent) {
      console.log(`   ${group.studentId}: ${group._count.submissionId} submissions`)
    }

    // Check specific students mentioned in the CSV
    const testStudents = ['STU12195', 'STU10424', 'STU12280', 'STU10054']
    
    console.log(`\n🎯 Checking specific students:`)
    for (const studentId of testStudents) {
      const submissions = await prisma.submission.findMany({
        where: { studentId: studentId },
        include: {
          assignment: { select: { type: true } }
        }
      })
      
      console.log(`   ${studentId}: ${submissions.length} submissions`)
      submissions.forEach(sub => {
        console.log(`     - ${sub.submissionId}: ${sub.assignment.type} (Score: ${sub.finalScore})`)
      })
    }

    // Check AI detection results
    const aiResults = await prisma.aIDetectionResult.count()
    console.log(`\n🤖 AI detection results: ${aiResults}`)

    // Check reflections
    const reflections = await prisma.reflection.count()
    console.log(`💭 Reflections: ${reflections}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubmissionsStatus()
