const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixAllStudentPasswords() {
  console.log('🔧 Updating ALL student passwords to "password123"...\n')
  
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  // Update in batches to avoid timeout
  const batchSize = 500
  let offset = 0
  let totalUpdated = 0
  
  while (true) {
    const students = await prisma.student.findMany({
      skip: offset,
      take: batchSize
    })
    
    if (students.length === 0) break
    
    console.log(`Updating batch ${Math.floor(offset/batchSize) + 1} (${students.length} students)...`)
    
    for (const student of students) {
      try {
        await prisma.student.update({
          where: { id: student.id },
          data: { password: hashedPassword }
        })
        totalUpdated++
      } catch (e) {
        // Skip errors
      }
    }
    
    offset += batchSize
    console.log(`   ... ${totalUpdated} students updated so far`)
  }
  
  console.log(`\n✅ Updated ${totalUpdated} student passwords successfully!`)
  console.log('\n🔑 All students can now login with:')
  console.log('   Password: password123')
  console.log('\n📧 Student emails:')
  console.log('   stu1000@university.edu to stu13499@university.edu')
  
  await prisma.$disconnect()
}

fixAllStudentPasswords()
