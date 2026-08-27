const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try { await prisma.$executeRawUnsafe('DELETE FROM "DailyLogTask";'); } catch(e){}
  try { await prisma.$executeRawUnsafe('DELETE FROM "Task";'); } catch(e){}
  console.log('Tasks cleared!');
}
main();
