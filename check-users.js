const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  const students = await prisma.student.findMany()
  const faculty = await prisma.faculty.findMany()
  
  console.log('\n📊 Database Status:')
  console.log(`   Students: ${students.length}`)
  console.log(`   Faculty: ${faculty.length}`)
  
  if (students.length > 0) {
    console.log('\n👤 Students:')
    students.forEach(s => console.log(`   - ${s.email} (${s.studentId})`))
  }
  
  if (faculty.length > 0) {
    console.log('\n👨‍🏫 Faculty:')
    faculty.forEach(f => console.log(`   - ${f.email} (${f.facultyId})`))
  }
  
  await prisma.$disconnect()
}

check()
