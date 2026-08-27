const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.dailyLog.updateMany({ data: { taskId: null } });
  
  await prisma.taskDependency.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskAcknowledgement.deleteMany();
  await prisma.taskApproval.deleteMany();
  await prisma.attachment.deleteMany(); // Since attachment might relate to task
  
  await prisma.task.deleteMany();
  console.log('Tasks cleared!');
}
main();
