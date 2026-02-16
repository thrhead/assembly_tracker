const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const logs = await prisma.systemLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Son 5 Log:');
  console.log(JSON.stringify(logs, null, 2));
  await prisma.$disconnect();
}

check();
