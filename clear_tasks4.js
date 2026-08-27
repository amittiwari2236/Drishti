const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.dailyLog.updateMany({ data: { taskId: null } });
  await prisma.taskAcknowledgement.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.taskActivity.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.taskApproval.deleteMany();
  await prisma.task.deleteMany();
  console.log('Tasks safely cleared!');
}
main();
