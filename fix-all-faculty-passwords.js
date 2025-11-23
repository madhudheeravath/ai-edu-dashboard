const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixAllFacultyPasswords() {
  console.log('🔧 Updating ALL faculty passwords to "password123"...\n')
  
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  // Get all faculty
  const allFaculty = await prisma.faculty.findMany()
  console.log(`Found ${allFaculty.length} faculty members`)
  
  let updatedCount = 0
  for (const faculty of allFaculty) {
    try {
      await prisma.faculty.update({
        where: { id: faculty.id },
        data: { password: hashedPassword }
      })
      updatedCount++
      
      if (updatedCount % 10 === 0) {
        console.log(`   ... ${updatedCount} faculty passwords updated`)
      }
    } catch (e) {
      console.log(`   ⚠️  Failed to update ${faculty.email}:`, e.message)
    }
  }
  
  console.log(`\n✅ Updated ${updatedCount} faculty passwords successfully!`)
  console.log('\n🔑 All faculty can now login with:')
  console.log('   Password: password123')
  console.log('\n📧 Faculty emails:')
  console.log('   fac1000@university.edu to fac1149@university.edu')
  
  await prisma.$disconnect()
}

fixAllFacultyPasswords()
