const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugStudentData() {
  console.log('🔍 Debugging student dashboard data...\n')

  try {
    // Check the logged-in student (STU10054 based on the image)
    const studentId = 'STU10054'
    
    const student = await prisma.student.findUnique({
      where: { studentId: studentId },
      include: {
        submissions: {
          include: {
            assignment: true
          }
        },
        reflections: true,
        chatMessages: true
      }
    })

    if (!student) {
      console.log(`❌ Student ${studentId} not found`)
      return
    }

    console.log(`👤 Student: ${student.name} (${student.email})`)
    console.log(`📊 Data Summary:`)
    console.log(`   Submissions: ${student.submissions.length}`)
    console.log(`   Reflections: ${student.reflections.length}`)
    console.log(`   Chat Messages: ${student.chatMessages.length}`)

    if (student.submissions.length > 0) {
      console.log(`\n📝 Submissions:`)
      student.submissions.forEach(sub => {
        console.log(`   - ${sub.submissionId}: ${sub.assignment.type} (Score: ${sub.finalScore})`)
      })
    }

    if (student.reflections.length > 0) {
      console.log(`\n💭 Reflections:`)
      student.reflections.slice(0, 3).forEach(ref => {
        console.log(`   - ${ref.reflectionId}: ${ref.type} (${ref.words} words)`)
      })
    }

    // Check if there are assignments this student should have
    const allAssignments = await prisma.assignment.findMany({
      take: 5
    })
    console.log(`\n📋 Available assignments: ${allAssignments.length}`)
    allAssignments.forEach(assign => {
      console.log(`   - ${assign.assignmentId}: ${assign.type} (${assign.major})`)
    })

    // Check if other students have data
    const studentsWithSubmissions = await prisma.student.findMany({
      where: {
        submissions: {
          some: {}
        }
      },
      take: 5,
      include: {
        submissions: true
      }
    })

    console.log(`\n✅ Students with submissions: ${studentsWithSubmissions.length}`)
    studentsWithSubmissions.forEach(s => {
      console.log(`   - ${s.studentId}: ${s.submissions.length} submissions`)
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugStudentData()
