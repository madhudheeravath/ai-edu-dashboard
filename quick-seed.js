const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with essential test data...\n')

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create test students
  console.log('Creating students...')
  const students = await Promise.all([
    prisma.student.create({
      data: {
        studentId: 'STU10004',
        email: 'stu10004@university.edu',
        password: hashedPassword,
        name: 'Sarah Johnson',
        year: 2,
        major: 'Computer Science',
        firstGen: true,
        priorGpa: 3.8,
        gender: 'female',
        aiAwareness: 3.5,
        enrollmentDate: new Date('2023-08-15'),
        semester: 'Fall 2024',
      }
    }),
    prisma.student.create({
      data: {
        studentId: 'STU10005',
        email: 'stu10005@university.edu',
        password: hashedPassword,
        name: 'Michael Chen',
        year: 3,
        major: 'Data Science',
        firstGen: false,
        priorGpa: 3.6,
        gender: 'male',
        aiAwareness: 4.2,
        enrollmentDate: new Date('2022-08-15'),
        semester: 'Fall 2024',
      }
    }),
  ])
  console.log(`✓ Created ${students.length} students`)

  // Create test faculty
  console.log('Creating faculty...')
  const faculty = await Promise.all([
    prisma.faculty.create({
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
    }),
    prisma.faculty.create({
      data: {
        facultyId: 'FAC1001',
        email: 'fac1001@university.edu',
        password: hashedPassword,
        name: 'Prof. James Wilson',
        major: 'Data Science',
        expYears: 12.0,
        aiLiteracy: 3.8,
        dashboardAdoption: new Date('2024-02-01'),
        numCourses: 2,
      }
    }),
  ])
  console.log(`✓ Created ${faculty.length} faculty members`)

  // Create test assignments
  console.log('Creating assignments...')
  const assignments = await Promise.all([
    prisma.assignment.create({
      data: {
        assignmentId: 'ASSIGN001',
        facultyId: faculty[0].id,
        title: 'Introduction to Programming - Essay',
        description: 'Write an essay about the history of programming languages',
        dueDate: new Date('2024-12-31'),
        maxPoints: 100,
        rubric: JSON.stringify({
          criteria: [
            { name: 'Content', points: 40 },
            { name: 'Organization', points: 30 },
            { name: 'Grammar', points: 30 },
          ],
        }),
      }
    }),
    prisma.assignment.create({
      data: {
        assignmentId: 'ASSIGN002',
        facultyId: faculty[0].id,
        title: 'Data Structures Project',
        description: 'Implement a binary search tree with documentation',
        dueDate: new Date('2024-12-25'),
        maxPoints: 150,
        rubric: JSON.stringify({
          criteria: [
            { name: 'Implementation', points: 60 },
            { name: 'Documentation', points: 40 },
            { name: 'Testing', points: 50 },
          ],
        }),
      }
    }),
  ])
  console.log(`✓ Created ${assignments.length} assignments`)

  // Create test submissions
  console.log('Creating submissions...')
  const submissions = await prisma.submission.create({
    data: {
      studentId: students[0].id,
      assignmentId: assignments[0].id,
      submittedAt: new Date(),
      contentText: 'Programming languages have evolved significantly over the past decades. From early assembly languages to modern high-level languages like Python and JavaScript, the field has grown tremendously. This essay explores the key milestones in programming language development.',
      aiDetectionScore: 25,
      grade: 85,
      feedback: 'Good work! Your essay shows understanding of the topic.',
    }
  })
  console.log(`✓ Created 1 submission`)

  console.log('\n✅ Database seeded successfully!')
  console.log('\n📝 Test credentials:')
  console.log('   Student: stu10004@university.edu / password123')
  console.log('   Faculty: fac1000@university.edu / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
