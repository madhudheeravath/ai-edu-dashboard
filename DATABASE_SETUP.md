# 🗄️ Database Setup & Seed Data

## 📋 Quick Setup Steps

### **Step 1: Initialize Database**

```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

---

### **Step 2: Create Seed Script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Faculty
  const faculty = await prisma.faculty.upsert({
    where: { email: 'faculty@university.edu' },
    update: {},
    create: {
      facultyId: 'F12345',
      email: 'faculty@university.edu',
      password: await bcrypt.hash('password123', 10),
      name: 'Dr. Sarah Johnson',
      department: 'Computer Science',
      expYears: 10.5,
      aiLiteracy: 4.5,
      dashboardAdoption: new Date(),
      numCourses: 3
    }
  })

  console.log('✅ Faculty created:', faculty.email)

  // Create Students
  const student1 = await prisma.student.upsert({
    where: { email: 'student@university.edu' },
    update: {},
    create: {
      studentId: 'S12345',
      email: 'student@university.edu',
      password: await bcrypt.hash('password123', 10),
      name: 'Alex Johnson',
      year: 3,
      major: 'Computer Science',
      firstGen: true,
      priorGpa: 3.45,
      gender: 'Non-binary',
      aiAwareness: 3.8,
      enrollmentDate: new Date('2022-08-15'),
      semester: 'Fall 2024'
    }
  })

  const student2 = await prisma.student.upsert({
    where: { email: 'maria@university.edu' },
    update: {},
    create: {
      studentId: 'S12346',
      email: 'maria@university.edu',
      password: await bcrypt.hash('password123', 10),
      name: 'Maria Garcia',
      year: 2,
      major: 'Biology',
      firstGen: false,
      priorGpa: 3.85,
      gender: 'Female',
      aiAwareness: 4.2,
      enrollmentDate: new Date('2023-08-15'),
      semester: 'Fall 2024'
    }
  })

  console.log('✅ Students created')

  // Create Assignment
  const assignment = await prisma.assignment.upsert({
    where: { assignmentId: 'ASSIGN-001' },
    update: {},
    create: {
      assignmentId: 'ASSIGN-001',
      facultyId: faculty.facultyId,
      type: 'Essay',
      department: 'Computer Science',
      dueDate: new Date('2024-11-30'),
      aiAllowed: true,
      aiLockedUntilDraft: true,
      createdDate: new Date()
    }
  })

  console.log('✅ Assignment created')

  // Create Submission
  const submission = await prisma.submission.upsert({
    where: { submissionId: 'SUB-001' },
    update: {},
    create: {
      submissionId: 'SUB-001',
      assignmentId: assignment.assignmentId,
      studentId: student1.studentId,
      facultyId: faculty.facultyId,
      submissionDate: new Date(),
      usesAi: true,
      aiAccessHours: 2.5,
      draftScore: 3.2,
      finalScore: 4.1,
      creativityScore: 3.8,
      aiDetected: true,
      aiConfidence: 0.85,
      timeHours: 8.5,
      status: 'pending',
      aiAssistanceType: 'Text Generation',
      criticalThinkingScore: 87.5,
      satisfactionLevel: 4.2
    }
  })

  console.log('✅ Submission created')

  // Create Reflection
  await prisma.reflection.upsert({
    where: { submissionId: submission.submissionId },
    update: {},
    create: {
      reflectionId: 'REF-001',
      submissionId: submission.submissionId,
      studentId: student1.studentId,
      type: 'Changes',
      depthScore: 4.2,
      words: 175,
      content: 'I used AI to help restructure my arguments and improve the flow. The AI suggested better transitions and helped identify weak points in my reasoning.',
      date: new Date()
    }
  })

  console.log('✅ Reflection created')

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

### **Step 3: Update package.json**

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Install dependencies:

```bash
npm install -D ts-node
npm install bcryptjs
npm install -D @types/bcryptjs
```

---

### **Step 4: Run Seed**

```bash
npx prisma db seed
```

---

## 🔐 Test Credentials

### **Faculty Login:**
- Email: `faculty@university.edu`
- Password: `password123`
- Role: Faculty

### **Student Login:**
- Email: `student@university.edu`
- Password: `password123`
- Role: Student

---

## ✅ Verify Database

```bash
# Open Prisma Studio to view data
npx prisma studio
```

Visit http://localhost:5555 to see your data visually.

---

## 📊 What's Created:

- ✅ 1 Faculty (Dr. Sarah Johnson)
- ✅ 2 Students (Alex Johnson, Maria Garcia)
- ✅ 1 Assignment (Essay assignment)
- ✅ 1 Submission with AI detection
- ✅ 1 Reflection

---

## 🚀 Next Steps:

1. Run seed script
2. Login as student to test
3. Login as faculty to grade
4. Export data to verify

---

## 🔧 Troubleshooting:

### **Error: "Can't reach database"**
```bash
# Check DATABASE_URL in .env
# Should be: postgresql://user:password@localhost:5432/dbname
```

### **Error: "Table doesn't exist"**
```bash
# Run migrations first
npx prisma migrate dev
```

### **Want to reset database:**
```bash
npx prisma migrate reset
npx prisma db seed
```

---

**Ready to test with real data!** 🎉
