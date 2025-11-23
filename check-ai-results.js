const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAIResults() {
  const count = await prisma.aIDetectionResult.count()
  console.log('AI Detection Results:', count)
  await prisma.$disconnect()
}

checkAIResults()
