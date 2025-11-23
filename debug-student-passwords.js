const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function debugStudentPasswords() {
  console.log('🔍 Debugging student passwords...\n')

  try {
    // Check a few students and their password hashes
    const students = await prisma.student.findMany({
      where: {
        studentId: { in: ['STU10004', 'STU10005', 'STU10006', 'STU10007', 'STU10008'] }
      },
      select: {
        studentId: true,
        email: true,
        password: true
      }
    })

    console.log('🔐 Testing password verification for students:')
    
    for (const student of students) {
      try {
        const isValid = await bcrypt.compare('password123', student.password)
        console.log(`  ${student.email}: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
        
        // Show first few characters of hash for debugging
        console.log(`    Hash starts with: ${student.password.substring(0, 20)}...`)
      } catch (e) {
        console.log(`  ${student.email}: ❌ ERROR - ${e.message}`)
      }
    }

    // Check if there are any students with plain text passwords
    const plainTextStudents = await prisma.student.findMany({
      where: {
        password: 'password123'
      },
      take: 5
    })

    console.log(`\n🚨 Students with plain text passwords: ${plainTextStudents.length}`)
    if (plainTextStudents.length > 0) {
      console.log('   These need to be hashed!')
      plainTextStudents.forEach(s => console.log(`   - ${s.email}`))
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

debugStudentPasswords()
