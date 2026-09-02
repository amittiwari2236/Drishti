import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    data: { role: 'MANAGER', hierarchyLevel: 1 }
  });
  console.log('Done updating users to MANAGER');
}

main().catch(console.error).finally(() => prisma.$disconnect());
