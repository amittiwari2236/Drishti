import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const PASSWORD = "Password@123";

async function recreateUser(opts: {
  name: string;
  email: string;
  role: "SENIOR_DECISION_MAKER" | "DEPARTMENT" | "AGENCY";
  departmentId?: string | null;
  agencyId?: string | null;
}) {
  // Delete existing sessions, accounts, and user
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (existing) {
    await prisma.session.deleteMany({ where: { userId: existing.id } });
    await prisma.account.deleteMany({ where: { userId: existing.id } });
    await prisma.notification.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }

  // Use better-auth signup so password hashing matches 100%
  const res = await auth.api.signUpEmail({
    body: {
      email: opts.email,
      password: PASSWORD,
      name: opts.name,
    },
  });

  if (!res?.user?.id) {
    throw new Error(`Failed to create user ${opts.email}`);
  }

  // Update role and scoping
  await prisma.user.update({
    where: { id: res.user.id },
    data: {
      role: opts.role,
      emailVerified: true,
      departmentId: opts.departmentId ?? null,
      agencyId: opts.agencyId ?? null,
    },
  });

  console.log(`  ✔ [${opts.role}] ${opts.email} (${opts.name})`);
  return res.user.id;
}

async function main() {
  console.log("\n==================================================");
  console.log("Setting up Demo Department 1 & Department 2");
  console.log("==================================================\n");

  // 1. Ensure Ministry exists
  const ministry1 = await prisma.ministry.upsert({
    where: { code: "MIN-CENTRAL" },
    update: { name: "Ministry of Central Infrastructure" },
    create: { name: "Ministry of Central Infrastructure", code: "MIN-CENTRAL" },
  });

  // 2. Setup Department 1 and Department 2
  const dept1 = await prisma.department.upsert({
    where: { code: "DEPT-1" },
    update: { name: "Department 1", ministryId: ministry1.id },
    create: { name: "Department 1", code: "DEPT-1", ministryId: ministry1.id },
  });
  console.log(`✔ Department 1 (ID: ${dept1.id})`);

  const dept2 = await prisma.department.upsert({
    where: { code: "DEPT-2" },
    update: { name: "Department 2", ministryId: ministry1.id },
    create: { name: "Department 2", code: "DEPT-2", ministryId: ministry1.id },
  });
  console.log(`✔ Department 2 (ID: ${dept2.id})`);

  // Remove other old departments if any to keep only Department 1 & Department 2
  const otherDepts = await prisma.department.findMany({
    where: { NOT: { id: { in: [dept1.id, dept2.id] } } },
    select: { id: true, name: true },
  });

  for (const od of otherDepts) {
    // Re-link agencies of other depts to dept1 or dept2 before deleting
    await prisma.implementingAgency.updateMany({
      where: { departmentId: od.id },
      data: { departmentId: dept1.id },
    });
    // Re-link users if any
    await prisma.user.updateMany({
      where: { departmentId: od.id },
      data: { departmentId: dept1.id },
    });
    // Re-link projects if any
    await prisma.infrastructureProject.updateMany({
      where: { departmentId: od.id },
      data: { departmentId: dept1.id },
    });
    await prisma.department.delete({ where: { id: od.id } });
  }

  // 3. Ensure Implementing Agencies exist and are linked
  let agency = await prisma.implementingAgency.findFirst({
    where: { code: "AG-POLAVARAM" },
  });

  if (!agency) {
    agency = await prisma.implementingAgency.create({
      data: {
        name: "Polavaram Project Authority",
        code: "AG-POLAVARAM",
        departmentId: dept1.id,
      },
    });
  } else {
    agency = await prisma.implementingAgency.update({
      where: { id: agency.id },
      data: { departmentId: dept1.id },
    });
  }

  // Also ensure a second agency linked to Department 2
  let agency2 = await prisma.implementingAgency.findFirst({
    where: { code: "NHAI" },
  });

  if (!agency2) {
    agency2 = await prisma.implementingAgency.create({
      data: {
        name: "National Highways Authority of India",
        code: "NHAI",
        departmentId: dept2.id,
      },
    });
  } else {
    agency2 = await prisma.implementingAgency.update({
      where: { id: agency2.id },
      data: { departmentId: dept2.id },
    });
  }

  // 4. Clean existing projects & notifications to start at 0
  await prisma.projectMilestone.deleteMany({});
  await prisma.projectProgressUpdate.deleteMany({});
  await prisma.infrastructureProject.deleteMany({});
  await prisma.notification.deleteMany({});
  console.log("✔ Cleaned all projects and notifications (0 projects in DB)");

  // 5. Create demo accounts with Password@123
  console.log("\nRecreating accounts via better-auth API:");
  
  // SDM
  await recreateUser({
    name: "Rajesh Kumar (SDM)",
    email: "admin@example.com",
    role: "SENIOR_DECISION_MAKER",
  });

  // Department 1
  await recreateUser({
    name: "Department 1 Officer",
    email: "dept1@example.com",
    role: "DEPARTMENT",
    departmentId: dept1.id,
  });

  // Legacy dept-officer alias mapped to Department 1
  await recreateUser({
    name: "Dr. Priya Sharma (Dept 1)",
    email: "dept-officer@example.com",
    role: "DEPARTMENT",
    departmentId: dept1.id,
  });

  // Department 2
  await recreateUser({
    name: "Department 2 Officer",
    email: "dept2@example.com",
    role: "DEPARTMENT",
    departmentId: dept2.id,
  });

  // Agency Officer
  await recreateUser({
    name: "Amit Verma (Agency Officer)",
    email: "agency-officer@example.com",
    role: "AGENCY",
    agencyId: agency.id,
  });

  console.log("\n==================================================");
  console.log("🎉 Setup complete! All passwords are: Password@123");
  console.log("Departments: Department 1, Department 2");
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("Error during demo setup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
