const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugStudentEmails() {
  console.log('🔍 Debugging student email formats...\n')

  try {
    // Check first 10 students and their email formats
    const students = await prisma.student.findMany({
      take: 10,
      select: {
        studentId: true,
        email: true,
        name: true
      }
    })

    console.log('📧 Current student email formats:')
    students.forEach(student => {
      console.log(`  ${student.studentId}: ${student.email}`)
    })

    // Check if stu10004@university.edu exists
    const testStudent = await prisma.student.findUnique({
      where: { email: 'stu10004@university.edu' }
    })

    console.log(`\n🔍 stu10004@university.edu exists: ${testStudent ? 'YES' : 'NO'}`)
    if (testStudent) {
      console.log(`   Student ID: ${testStudent.studentId}`)
      console.log(`   Name: ${testStudent.name}`)
    }

    // Check total count
    const totalStudents = await prisma.student.count()
    console.log(`\n📊 Total students in database: ${totalStudents}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugStudentEmails()
