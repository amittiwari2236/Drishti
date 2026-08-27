const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('DELETE FROM "TaskApproval";');
  await prisma.$executeRawUnsafe('DELETE FROM "Task";');
  console.log('Tasks cleared!');
}
main();
