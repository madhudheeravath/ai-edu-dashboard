const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugDashboardAPI() {
  console.log('🔍 Debugging dashboard API logic...\n')

  try {
    // Check the student from the image (STU10424)
    const studentId = 'STU10424'
    
    const student = await prisma.student.findUnique({
      where: { studentId: studentId },
      select: { studentId: true, year: true, major: true, email: true, name: true }
    })

    if (!student) {
      console.log(`❌ Student ${studentId} not found`)
      return
    }

    console.log(`👤 Student: ${student.name} (${student.email})`)
    console.log(`📊 Year: ${student.year}, Major: ${student.major}`)

    // Check submissions for this student
    const submissions = await prisma.submission.findMany({
      where: { studentId: studentId },
      include: {
        assignment: {
          select: {
            dueDate: true,
            type: true,
            assignmentId: true,
            year: true,
            major: true
          }
        },
        reflection: {
          select: { id: true }
        }
      }
    })

    console.log(`\n📝 Submissions for ${studentId}: ${submissions.length}`)
    submissions.slice(0, 5).forEach(sub => {
      console.log(`   - ${sub.submissionId}: ${sub.assignment.type} (Score: ${sub.finalScore})`)
      console.log(`     Assignment Year: ${sub.assignment.year}, Major: ${sub.assignment.major}`)
      console.log(`     Due Date: ${sub.assignment.dueDate}`)
    })

    // Check all assignments for this student's year and major
    const allAssignments = await prisma.assignment.findMany({
      where: { 
        year: student.year,
        major: student.major
      }
    })

    console.log(`\n📋 Assignments for Year ${student.year}, Major ${student.major}: ${allAssignments.length}`)
    allAssignments.slice(0, 5).forEach(assign => {
      console.log(`   - ${assign.assignmentId}: ${assign.type} (Due: ${assign.dueDate})`)
    })

    // Check ALL assignments regardless of year/major
    const allAssignmentsTotal = await prisma.assignment.findMany()
    console.log(`\n📋 Total assignments in database: ${allAssignmentsTotal.length}`)
    
    // Show sample assignments with their year/major
    console.log(`\n📋 Sample assignments:`)
    allAssignmentsTotal.slice(0, 10).forEach(assign => {
      console.log(`   - ${assign.assignmentId}: ${assign.type} (Year: ${assign.year}, Major: ${assign.major})`)
    })

    // Calculate stats like the API does
    const now = new Date()
    const activeAssignments = allAssignments.filter(a => 
      new Date(a.dueDate) > now
    ).length

    const completedAssignments = submissions.filter(s => 
      s.status === "Submitted" || s.status === "completed"
    ).length

    const reflectionsCount = submissions.filter(s => s.reflection !== null).length

    console.log(`\n📊 Calculated Stats:`)
    console.log(`   Active Assignments: ${activeAssignments}`)
    console.log(`   Completed Assignments: ${completedAssignments}`)
    console.log(`   Reflections: ${reflectionsCount}`)
    console.log(`   Total Submissions: ${submissions.length}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugDashboardAPI()
