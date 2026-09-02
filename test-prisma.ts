import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  try {
    const email = "demo-teacher@example.com";
    
    let dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email,
          name: "Demo Teacher",
          phone: "1111111111",
          designation: "Demo Staff Member",
          departmentId: null,
          hierarchyLevel: 3,
          role: "EXECUTIVE", 
        }
      });
      console.log("Created", dbUser.id);
    } else {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { hierarchyLevel: 3, role: "EXECUTIVE" }
      });
      console.log("Updated", dbUser.id);
    }
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
