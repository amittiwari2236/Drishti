import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const perms = await prisma.dynamicRolePermission.findMany();
  console.log("Dynamic Role Perms:", perms);
  
  const basePerms = await prisma.rolePermission.findMany();
  console.log("Base Role Perms:", basePerms);
}

check().finally(() => prisma.$disconnect());
