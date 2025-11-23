const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkReflectionData() {
  console.log('🔍 Checking reflection data...\n')

  try {
    // Look for submissions related to ProbSet assignments (from the image)
    const probSetSubmissions = await prisma.submission.findMany({
      where: {
        assignment: {
          type: 'ProbSet'
        }
      },
      include: {
        assignment: {
          select: {
            title: true,
            type: true,
            faculty: {
              select: { name: true, facultyId: true }
            }
          }
        },
        reflection: true,
        student: {
          select: { name: true, studentId: true }
        }
      },
      take: 10
    })

    console.log(`📝 Found ${probSetSubmissions.length} ProbSet submissions`)

    probSetSubmissions.forEach(sub => {
      console.log(`\n📋 Submission: ${sub.submissionId}`)
      console.log(`   Student: ${sub.student.name} (${sub.student.studentId})`)
      console.log(`   Assignment: ${sub.assignment.title || 'ProbSet Assignment'}`)
      console.log(`   Faculty: ${sub.assignment.faculty.name} (${sub.assignment.faculty.facultyId})`)
      console.log(`   Has Reflection: ${sub.reflection ? 'YES' : 'NO'}`)
      
      if (sub.reflection) {
        console.log(`   Reflection Type: ${sub.reflection.type}`)
        console.log(`   Reflection Words: ${sub.reflection.words}`)
        console.log(`   Reflection Content: ${sub.reflection.content.substring(0, 100)}...`)
      }
    })

    // Check if there are any reflections for FAC1053 specifically
    const fac1053Submissions = await prisma.submission.findMany({
      where: {
        facultyId: 'FAC1053'
      },
      include: {
        reflection: true,
        student: { select: { studentId: true } },
        assignment: { select: { type: true } }
      },
      take: 5
    })

    console.log(`\n🎯 FAC1053 submissions: ${fac1053Submissions.length}`)
    fac1053Submissions.forEach(sub => {
      console.log(`   ${sub.submissionId} (${sub.student.studentId}): Reflection = ${sub.reflection ? 'YES' : 'NO'}`)
    })

    // Check total reflections count
    const totalReflections = await prisma.reflection.count()
    console.log(`\n💭 Total reflections in database: ${totalReflections}`)

    // Show sample reflection content
    const sampleReflection = await prisma.reflection.findFirst({
      include: {
        submission: {
          include: {
            student: { select: { studentId: true } },
            assignment: { select: { type: true } }
          }
        }
      }
    })

    if (sampleReflection) {
      console.log(`\n📖 Sample reflection:`)
      console.log(`   Student: ${sampleReflection.submission.student.studentId}`)
      console.log(`   Assignment: ${sampleReflection.submission.assignment.type}`)
      console.log(`   Content: ${sampleReflection.content}`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkReflectionData()
