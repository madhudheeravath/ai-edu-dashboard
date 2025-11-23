const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Restoring all CSV data...\n')

  try {
    // Import Students
    console.log('📚 Importing 3,500 students...')
    const studentsPath = path.join(__dirname, '../Data/students_dataset.csv')
    const studentsData = fs.readFileSync(studentsPath, 'utf-8')
    const students = parse(studentsData, { columns: true, skip_empty_lines: true })

    let studentCount = 0
    for (const row of students) {
      await prisma.student.upsert({
        where: { studentId: row.student_id },
        update: {},
        create: {
          studentId: row.student_id,
          email: `${row.student_id.toLowerCase()}@university.edu`,
          password: 'password123',
          name: `Student ${row.student_id}`,
          year: parseInt(row.year),
          major: row.major,
          firstGen: parseInt(row.first_gen) === 1,
          priorGpa: parseFloat(row.prior_gpa),
          gender: row.gender,
          aiAwareness: parseFloat(row.ai_awareness),
          enrollmentDate: new Date(row.enrollment_date),
          semester: row.semester
        }
      })
      studentCount++
      if (studentCount % 500 === 0) console.log(`   ... ${studentCount} students imported`)
    }
    console.log(`✅ Imported ${studentCount} students\n`)

    // Import Faculty
    console.log('👨‍🏫 Importing 150 faculty...')
    const facultyPath = path.join(__dirname, '../Data/faculty_dataset.csv')
    const facultyData = fs.readFileSync(facultyPath, 'utf-8')
    const faculty = parse(facultyData, { columns: true, skip_empty_lines: true })

    let facultyCount = 0
    for (const row of faculty) {
      await prisma.faculty.upsert({
        where: { facultyId: row.faculty_id },
        update: {},
        create: {
          facultyId: row.faculty_id,
          email: `${row.faculty_id.toLowerCase()}@university.edu`,
          password: 'password123',
          name: `Dr. Faculty ${row.faculty_id}`,
          major: row.department,
          expYears: parseFloat(row.exp_years),
          aiLiteracy: parseFloat(row.ai_literacy),
          dashboardAdoption: new Date(row.dashboard_adoption),
          numCourses: parseInt(row.num_courses)
        }
      })
      facultyCount++
    }
    console.log(`✅ Imported ${facultyCount} faculty\n`)

    // Import Assignments
    console.log('📝 Importing 500 assignments...')
    const assignmentsPath = path.join(__dirname, '../Data/assignments_dataset.csv')
    if (fs.existsSync(assignmentsPath)) {
      const assignmentsData = fs.readFileSync(assignmentsPath, 'utf-8')
      const assignments = parse(assignmentsData, { columns: true, skip_empty_lines: true })

      // Map faculty departments to random student majors
      const DEPARTMENT_MAJORS = {
        'CS': ['CS'],
        'Sciences': ['Biology', 'Chemistry', 'Math', 'Physics'],
        'Arts': ['English', 'History', 'Psychology'],
        'Business': ['Business', 'Economics']
      }

      let assignmentCount = 0
      for (const row of assignments) {
        const columns = Object.keys(row)
        const assignmentId = row[columns[0]]
        const facultyId = row[columns[1]]
        const type = row[columns[2]]
        const department = row[columns[3]]
        const dueDate = row[columns[4]]
        const aiAllowed = row[columns[5]]
        const aiLocked = row[columns[6]]

        // Convert department to a specific major
        const majorOptions = DEPARTMENT_MAJORS[department] || ['CS']
        const major = majorOptions[Math.floor(Math.random() * majorOptions.length)]
        
        // Assign random student year level (1-4)
        const year = Math.floor(Math.random() * 4) + 1  // 1, 2, 3, or 4

        await prisma.assignment.upsert({
          where: { assignmentId },
          update: {},
          create: {
            assignmentId,
            facultyId,
            title: `${type} Assignment`,
            description: `${major} - ${type}`,
            type,
            major,
            year: year, 
            dueDate: new Date(dueDate),
            aiAllowed: parseInt(aiAllowed) === 1,
            aiLockedUntilDraft: parseInt(aiLocked) === 1,
            createdDate: new Date()
          }
        })
        assignmentCount++
      }
      console.log(`✅ Imported ${assignmentCount} assignments\n`)
    }

    // Import Submissions
    console.log('📤 Importing 3,500+ submissions...')
    const submissionsPath = path.join(__dirname, '../Data/submissions_dataset.csv')
    if (fs.existsSync(submissionsPath)) {
      const submissionsData = fs.readFileSync(submissionsPath, 'utf-8')
      const submissions = parse(submissionsData, { columns: true, skip_empty_lines: true })

      let submissionCount = 0
      for (const row of submissions) {
        const columns = Object.keys(row)
        
        await prisma.submission.upsert({
          where: { submissionId: row[columns[0]] },
          update: {},
          create: {
            submissionId: row[columns[0]],        // submission_id
            assignmentId: row[columns[1]],        // assignment_id
            studentId: row[columns[2]],           // student_id
            facultyId: row[columns[3]],           // faculty_id
            // Map original CSV date to a recent date around October 2025
            submissionDate: toRecentOctober2025(row[columns[4]]),  // submission_date
            status: row[columns[13]],             // status
            usesAi: parseInt(row[columns[5]]) === 1,  // uses_ai
            aiDetected: parseInt(row[columns[10]]) === 1,  // ai_detected
            aiConfidence: parseFloat(row[columns[11]]) || 0,  // ai_confidence
            draftScore: parseFloat(row[columns[7]]) || 0,  // draft_score
            finalScore: parseFloat(row[columns[8]]) || 0,  // final_score
            creativityScore: parseFloat(row[columns[9]]) || 0,  // creativity_score
            aiAccessHours: parseFloat(row[columns[6]]) || 0,  // ai_access_hours
            timeHours: parseFloat(row[columns[12]]) || 0,  // time_hours
            criticalThinkingScore: parseFloat(row[columns[15]]) || 0,  // Critical_Thinking_Score
            satisfactionLevel: parseFloat(row[columns[16]]) || 0  // Satisfaction_Level
          }
        })
        submissionCount++
        if (submissionCount % 500 === 0) console.log(`   ... ${submissionCount} submissions imported`)
      }
      console.log(`✅ Imported ${submissionCount} submissions\n`)
    }

    // Import Reflections
    console.log('💭 Importing reflections...')
    const reflectionsPath = path.join(__dirname, '../Data/reflections_dataset.csv')
    if (fs.existsSync(reflectionsPath)) {
      const reflectionsData = fs.readFileSync(reflectionsPath, 'utf-8')
      const reflections = parse(reflectionsData, { columns: true, skip_empty_lines: true })

      let reflectionCount = 0
      let skipped = 0
      for (const row of reflections) {
        const columns = Object.keys(row)
        
        try {
          await prisma.reflection.upsert({
            where: { reflectionId: row[columns[0]] },
            update: {},
            create: {
              reflectionId: row[columns[0]],  // reflection_id
              submissionId: row[columns[1]],  // submission_id
              studentId: row[columns[2]],     // student_id
              type: row[columns[3]],          // type
              depthScore: parseFloat(row[columns[4]]) || 0,  // depth_score
              words: parseInt(row[columns[5]]) || 0,         // words
              content: `Student reflection on ${row[columns[3]]}`,  // content (placeholder)
              date: new Date(row[columns[6]])               // date
            }
          })
          reflectionCount++
          if (reflectionCount % 500 === 0) console.log(`   ... ${reflectionCount} reflections imported`)
        } catch (err) {
          // Skip reflections with missing foreign keys
          skipped++
        }
      }
      console.log(`✅ Imported ${reflectionCount} reflections (skipped ${skipped} with missing references)\n`)
    }

    // Import Rubric Evaluations
    console.log('📊 Importing rubric evaluations...')
    const rubricsPath = path.join(__dirname, '../Data/rubric_evaluations_dataset.csv')
    if (fs.existsSync(rubricsPath)) {
      const rubricsData = fs.readFileSync(rubricsPath, 'utf-8')
      const rubrics = parse(rubricsData, { columns: true, skip_empty_lines: true })

      let rubricCount = 0
      let skipped = 0
      for (const row of rubrics) {
        const columns = Object.keys(row)
        
        try {
          await prisma.rubricEvaluation.upsert({
            where: { rubricId: row[columns[0]] },
            update: {},
            create: {
              rubricId: row[columns[0]],      // rubric_id
              submissionId: row[columns[1]],   // submission_id
              facultyId: row[columns[2]],      // faculty_id
              studentId: row[columns[3]],      // student_id
              originality: parseFloat(row[columns[4]]) || 0,  // originality
              effort: parseFloat(row[columns[5]]) || 0,       // effort
              facultyAiIdentified: parseInt(row[columns[6]]) === 1,  // faculty_ai_identified
              assessmentDate: new Date(row[columns[7]]),      // assessment_date
              finalGrade: parseFloat(row[columns[8]]) || 0,   // final_grade
              confidence: parseFloat(row[columns[9]]) || 0    // confidence
            }
          })
          rubricCount++
          if (rubricCount % 500 === 0) console.log(`   ... ${rubricCount} rubrics imported`)
        } catch (err) {
          // Skip rubrics with missing foreign keys
          skipped++
        }
      }
      console.log(`✅ Imported ${rubricCount} rubric evaluations (skipped ${skipped} with missing references)\n`)
    }

    console.log('🎉 ALL DATA RESTORED!\n')
    console.log('✅ You can now login with:')
    console.log('   Faculty: fac1001@university.edu / password123')
    console.log('   Faculty: fac1002@university.edu / password123')
    console.log('   Student: stu10004@university.edu / password123')
    console.log('   Student: stu10108@university.edu / password123')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
  }

// Helper to map any date into October 2025 while keeping day-of-month reasonable
function toRecentOctober2025(dateValue) {
  const original = new Date(dateValue)
  if (isNaN(original.getTime())) {
    return new Date(2025, 9, 15) // Fallback: 15 Oct 2025
  }
  const day = Math.min(original.getDate(), 28) // avoid month overflow
  return new Date(2025, 9, day)
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
