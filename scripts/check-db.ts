import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, agencyId: true, departmentId: true, isActive: true },
    orderBy: { role: "asc" }
  });
  console.log("\n=== USERS ===");
  users.forEach(u => console.log(JSON.stringify(u)));

  const depts = await prisma.department.findMany({
    select: { id: true, name: true, code: true, agencies: { select: { id: true, name: true, code: true } } }
  });
  console.log("\n=== DEPARTMENTS & AGENCIES ===");
  depts.forEach(d => console.log(JSON.stringify(d)));

  const projects = await prisma.infrastructureProject.findMany({
    select: { id: true, projectName: true, agencyId: true, projectStatus: true },
    where: { agencyId: { not: null } }
  });
  console.log("\n=== ASSIGNED PROJECTS ===");
  projects.forEach(p => console.log(JSON.stringify(p)));
  const states = await prisma.state.findMany({ select: { id: true, name: true, code: true } });
  console.log("\n=== STATES ===");
  states.forEach(s => console.log(JSON.stringify(s)));

  const sectors = await prisma.sector.findMany({ select: { id: true, name: true } });
  console.log("\n=== SECTORS ===");
  sectors.forEach(s => console.log(JSON.stringify(s)));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
