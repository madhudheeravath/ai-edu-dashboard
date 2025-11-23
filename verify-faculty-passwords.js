const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyFacultyPasswords() {
  console.log('🔍 Verifying faculty passwords...\n')
  
  const testFaculty = [
    'fac1000@university.edu',
    'fac1001@university.edu', 
    'fac1002@university.edu',
    'fac1010@university.edu',
    'fac1050@university.edu',
    'fac1100@university.edu',
    'fac1149@university.edu'
  ]
  
  for (const email of testFaculty) {
    const faculty = await prisma.faculty.findUnique({ where: { email } })
    
    if (faculty) {
      const match = await bcrypt.compare('password123', faculty.password)
      console.log(`${email}: ${match ? '✅ CORRECT' : '❌ WRONG'}`)
    } else {
      console.log(`${email}: ❌ NOT FOUND`)
    }
  }
  
  await prisma.$disconnect()
}

verifyFacultyPasswords()
