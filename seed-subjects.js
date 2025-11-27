// Seed script to create default subjects
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const defaultSubjects = [
  // Computer Science Department
  { subjectCode: 'CS101', name: 'Introduction to Programming', department: 'CS', semester: 1, credits: 4, description: 'Fundamentals of programming using Python' },
  { subjectCode: 'CS201', name: 'Data Structures', department: 'CS', semester: 2, credits: 4, description: 'Arrays, linked lists, trees, graphs, and algorithms' },
  { subjectCode: 'CS301', name: 'Database Management', department: 'CS', semester: 3, credits: 3, description: 'SQL, NoSQL, and database design principles' },
  { subjectCode: 'CS302', name: 'Web Development', department: 'CS', semester: 3, credits: 3, description: 'HTML, CSS, JavaScript, and modern frameworks' },
  { subjectCode: 'CS401', name: 'Machine Learning', department: 'CS', semester: 4, credits: 4, description: 'Supervised and unsupervised learning algorithms' },
  { subjectCode: 'CS402', name: 'Artificial Intelligence', department: 'CS', semester: 4, credits: 4, description: 'AI principles, search algorithms, and neural networks' },
  { subjectCode: 'CS501', name: 'Cloud Computing', department: 'CS', semester: 5, credits: 3, description: 'AWS, Azure, and cloud architecture' },
  { subjectCode: 'CS502', name: 'Cybersecurity', department: 'CS', semester: 5, credits: 3, description: 'Network security, encryption, and ethical hacking' },
  
  // Business Department
  { subjectCode: 'BUS101', name: 'Introduction to Business', department: 'Business', semester: 1, credits: 3, description: 'Fundamentals of business operations' },
  { subjectCode: 'BUS201', name: 'Marketing Principles', department: 'Business', semester: 2, credits: 3, description: 'Marketing strategies and consumer behavior' },
  { subjectCode: 'BUS301', name: 'Financial Accounting', department: 'Business', semester: 3, credits: 4, description: 'Financial statements and accounting principles' },
  { subjectCode: 'BUS401', name: 'Business Analytics', department: 'Business', semester: 4, credits: 3, description: 'Data-driven decision making in business' },
  
  // Psychology Department
  { subjectCode: 'PSY101', name: 'Introduction to Psychology', department: 'Psychology', semester: 1, credits: 3, description: 'Basic psychological concepts and theories' },
  { subjectCode: 'PSY201', name: 'Cognitive Psychology', department: 'Psychology', semester: 2, credits: 3, description: 'Memory, attention, and decision making' },
  { subjectCode: 'PSY301', name: 'Social Psychology', department: 'Psychology', semester: 3, credits: 3, description: 'Social influence and group dynamics' },
  { subjectCode: 'PSY401', name: 'Research Methods', department: 'Psychology', semester: 4, credits: 4, description: 'Experimental design and statistical analysis' },
  
  // Biology Department
  { subjectCode: 'BIO101', name: 'Introduction to Biology', department: 'Biology', semester: 1, credits: 4, description: 'Cell biology and basic life processes' },
  { subjectCode: 'BIO201', name: 'Genetics', department: 'Biology', semester: 2, credits: 4, description: 'Heredity, DNA, and genetic engineering' },
  { subjectCode: 'BIO301', name: 'Ecology', department: 'Biology', semester: 3, credits: 3, description: 'Ecosystems and environmental biology' },
  { subjectCode: 'BIO401', name: 'Molecular Biology', department: 'Biology', semester: 4, credits: 4, description: 'Proteins, enzymes, and molecular processes' },
  
  // Mathematics Department
  { subjectCode: 'MTH101', name: 'Calculus I', department: 'Math', semester: 1, credits: 4, description: 'Limits, derivatives, and integrals' },
  { subjectCode: 'MTH201', name: 'Linear Algebra', department: 'Math', semester: 2, credits: 3, description: 'Matrices, vectors, and linear transformations' },
  { subjectCode: 'MTH301', name: 'Statistics', department: 'Math', semester: 3, credits: 3, description: 'Probability and statistical inference' },
  { subjectCode: 'MTH401', name: 'Discrete Mathematics', department: 'Math', semester: 4, credits: 3, description: 'Logic, sets, and combinatorics' },
  
  // English Department
  { subjectCode: 'ENG101', name: 'English Composition', department: 'English', semester: 1, credits: 3, description: 'Academic writing and critical thinking' },
  { subjectCode: 'ENG201', name: 'Creative Writing', department: 'English', semester: 2, credits: 3, description: 'Fiction, poetry, and narrative techniques' },
  { subjectCode: 'ENG301', name: 'Literature Studies', department: 'English', semester: 3, credits: 3, description: 'Analysis of classic and modern literature' },
  { subjectCode: 'ENG401', name: 'Technical Writing', department: 'English', semester: 4, credits: 3, description: 'Professional documentation and communication' },
  
  // Physics Department
  { subjectCode: 'PHY101', name: 'Physics I', department: 'Physics', semester: 1, credits: 4, description: 'Mechanics and thermodynamics' },
  { subjectCode: 'PHY201', name: 'Physics II', department: 'Physics', semester: 2, credits: 4, description: 'Electromagnetism and optics' },
  { subjectCode: 'PHY301', name: 'Quantum Mechanics', department: 'Physics', semester: 3, credits: 4, description: 'Wave-particle duality and quantum states' },
  { subjectCode: 'PHY401', name: 'Astrophysics', department: 'Physics', semester: 4, credits: 3, description: 'Stars, galaxies, and cosmology' },
]

async function seedSubjects() {
  console.log('🌱 Seeding subjects...')
  
  for (const subject of defaultSubjects) {
    try {
      const created = await prisma.subject.upsert({
        where: { subjectCode: subject.subjectCode },
        update: subject,
        create: subject
      })
      console.log(`✅ Created/Updated: ${created.subjectCode} - ${created.name}`)
    } catch (error) {
      console.error(`❌ Error with ${subject.subjectCode}:`, error.message)
    }
  }
  
  console.log('\n📊 Subject count by department:')
  const counts = await prisma.subject.groupBy({
    by: ['department'],
    _count: { id: true }
  })
  counts.forEach(c => console.log(`   ${c.department}: ${c._count.id} subjects`))
  
  console.log('\n✨ Seeding complete!')
}

seedSubjects()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
