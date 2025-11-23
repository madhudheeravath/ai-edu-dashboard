const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixFac1053Reflections() {
  console.log('🔧 Creating reflections for FAC1053 submissions...\n')

  try {
    // Get all submissions for FAC1053 that don't have reflections
    const submissionsWithoutReflections = await prisma.submission.findMany({
      where: {
        facultyId: 'FAC1053',
        reflection: null
      },
      include: {
        assignment: { select: { type: true } },
        student: { select: { studentId: true } }
      }
    })

    console.log(`📝 Found ${submissionsWithoutReflections.length} FAC1053 submissions without reflections`)

    let reflectionsCreated = 0

    for (const submission of submissionsWithoutReflections) {
      try {
        const reflectionId = `REF_FAC1053_${submission.submissionId}_${Date.now()}_${reflectionsCreated}`
        
        await prisma.reflection.create({
          data: {
            reflectionId: reflectionId,
            submissionId: submission.submissionId,
            studentId: submission.studentId,
            type: ['learning', 'process', 'outcome', 'improvement'][Math.floor(Math.random() * 4)],
            depthScore: Math.random() * 3 + 2, // 2-5
            words: Math.floor(Math.random() * 200) + 150, // 150-350 words
            content: generateReflectionContent(submission.assignment.type),
            date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Within last 10 days
          }
        })
        
        reflectionsCreated++
        console.log(`   ✅ Created reflection for ${submission.submissionId} (${submission.student.studentId})`)
        
      } catch (e) {
        console.log(`   ❌ Error creating reflection for ${submission.submissionId}: ${e.message.split('\n')[0]}`)
      }
    }

    console.log(`\n🎉 Created ${reflectionsCreated} reflections for FAC1053 submissions`)

    // Verify the fix
    const updatedSubmissions = await prisma.submission.findMany({
      where: {
        facultyId: 'FAC1053'
      },
      include: {
        reflection: true,
        student: { select: { studentId: true } }
      },
      take: 5
    })

    console.log(`\n🔍 Verification - FAC1053 submissions now:`)
    updatedSubmissions.forEach(sub => {
      console.log(`   ${sub.submissionId} (${sub.student.studentId}): Reflection = ${sub.reflection ? 'YES' : 'NO'}`)
      if (sub.reflection) {
        console.log(`     Content: ${sub.reflection.content.substring(0, 80)}...`)
      }
    })

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

function generateReflectionContent(assignmentType) {
  const reflectionsByType = {
    'ProbSet': [
      "Working on this problem set challenged me to apply theoretical concepts to practical scenarios. I learned to break down complex problems into manageable steps and develop systematic approaches to finding solutions. The process helped me understand the importance of careful analysis and logical reasoning.",
      
      "This problem set pushed me to think more critically about mathematical concepts and their applications. I found myself developing better problem-solving strategies and learning to verify my solutions through multiple approaches. The experience enhanced my analytical thinking skills.",
      
      "Through this assignment, I gained confidence in tackling challenging problems independently. I learned to identify key information, formulate appropriate strategies, and persist through difficult calculations. The reflection process helped me understand my learning patterns better."
    ],
    'Research': [
      "This research assignment taught me valuable skills in source evaluation and information synthesis. I learned to critically assess the credibility of different sources and develop well-supported arguments. The process enhanced my understanding of academic research methodologies.",
      
      "Working on this research project helped me develop better organizational skills and time management strategies. I learned to plan my research systematically and integrate findings from multiple sources effectively. The experience improved my academic writing abilities.",
      
      "This assignment challenged me to explore topics beyond surface-level understanding. I developed skills in critical analysis and learned to present complex ideas clearly and coherently. The research process broadened my perspective on the subject matter."
    ],
    'Essay': [
      "Writing this essay helped me develop stronger argumentation skills and learn to support my ideas with evidence. I gained experience in structuring complex thoughts and presenting them in a logical, persuasive manner. The process improved my critical thinking abilities.",
      
      "This essay assignment challenged me to analyze different perspectives and develop my own informed viewpoint. I learned to craft compelling arguments while maintaining academic objectivity. The experience enhanced my writing fluency and analytical skills.",
      
      "Through this essay, I learned to synthesize information from multiple sources and present original insights. The writing process helped me clarify my thoughts and develop more sophisticated analytical approaches to complex topics."
    ],
    'Project': [
      "This project provided hands-on experience in applying theoretical knowledge to real-world scenarios. I learned valuable skills in project planning, execution, and presentation. The collaborative aspects helped me develop better teamwork and communication abilities.",
      
      "Working on this project challenged me to integrate knowledge from different areas and develop creative solutions. I gained experience in independent research and learned to manage complex, multi-faceted assignments effectively. The process enhanced my problem-solving capabilities.",
      
      "This project assignment helped me develop practical skills while deepening my theoretical understanding. I learned to balance creativity with academic rigor and gained confidence in presenting my work to others. The experience was both challenging and rewarding."
    ]
  }
  
  const typeReflections = reflectionsByType[assignmentType] || reflectionsByType['Research']
  return typeReflections[Math.floor(Math.random() * typeReflections.length)]
}

fixFac1053Reflections()
