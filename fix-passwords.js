const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixPasswords() {
  console.log('🔧 Updating test user passwords...\n')
  
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  // Update student
  const student = await prisma.student.update({
    where: { email: 'stu10004@university.edu' },
    data: { password: hashedPassword }
  })
  console.log('✅ Updated student:', student.email)
  
  // Update or create faculty
  try {
    const faculty = await prisma.faculty.update({
      where: { email: 'fac1000@university.edu' },
      data: { password: hashedPassword }
    })
    console.log('✅ Updated faculty:', faculty.email)
  } catch (e) {
    // Faculty doesn't exist, create it
    const faculty = await prisma.faculty.create({
      data: {
        facultyId: 'FAC1000',
        email: 'fac1000@university.edu',
        password: hashedPassword,
        name: 'Dr. Emily Rodriguez',
        major: 'Computer Science',
        expYears: 8.5,
        aiLiteracy: 4.2,
        dashboardAdoption: new Date('2024-01-15'),
        numCourses: 3,
      }
    })
    console.log('✅ Created faculty:', faculty.email)
  }
  
  console.log('\n✨ Passwords updated successfully!')
  console.log('\nTest credentials:')
  console.log('  Student: stu10004@university.edu / password123')
  console.log('  Faculty: fac1000@university.edu / password123')
  
  await prisma.$disconnect()
}

fixPasswords()
