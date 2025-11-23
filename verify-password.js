const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verify() {
  console.log('🔍 Verifying user passwords...\n')
  
  const testUsers = [
    'stu1000@university.edu',
    'stu10004@university.edu',
    'fac1000@university.edu',
  ]
  
  for (const email of testUsers) {
    const user = await prisma.student.findUnique({ where: { email } })
      || await prisma.faculty.findUnique({ where: { email } })
    
    if (user) {
      const match = await bcrypt.compare('password123', user.password)
      console.log(`${email}: ${match ? '✅ CORRECT' : '❌ WRONG'}`)
    } else {
      console.log(`${email}: ❌ NOT FOUND`)
    }
  }
  
  await prisma.$disconnect()
}

verify()
