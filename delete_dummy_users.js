const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.deleteMany({
    where: {
      NOT: [
        { email: { startsWith: 'role_' } },
        { email: 'admin@example.com' }
      ]
    }
  });
  console.log('Dummy users deleted');
}
main().catch(console.error).finally(() => prisma.$disconnect());
