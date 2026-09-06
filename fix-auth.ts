import { auth } from "./src/lib/auth";
import { prisma } from "./src/lib/prisma";

const PASSWORD = "Password@123";

async function recreateUser(opts: {
  name: string;
  email: string;
  role: "SENIOR_DECISION_MAKER" | "DEPARTMENT" | "AGENCY";
  departmentId?: string;
  agencyId?: string;
}) {
  // Delete existing user completely
  await prisma.user.deleteMany({ where: { email: opts.email } });

  // Use better-auth's own signup so password is hashed correctly
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

  // Now update the role and scope fields
  await prisma.user.update({
    where: { id: res.user.id },
    data: {
      role: opts.role,
      emailVerified: true,
      departmentId: opts.departmentId ?? null,
      agencyId: opts.agencyId ?? null,
    },
  });

  console.log(`✅ ${opts.role}: ${opts.email}`);
  return res.user.id;
}

async function main() {
  console.log("\n🔧 Recreating demo user accounts via better-auth...\n");

  // Get dept and agency IDs
  const dept = await prisma.department.findFirst({ where: { code: "DEPT-WR" } });
  const agency = await prisma.implementingAgency.findFirst({ where: { code: "AG-POLAVARAM" } });

  if (!dept || !agency) {
    console.error("❌ Department or Agency not found. Run seed first.");
    process.exit(1);
  }

  await recreateUser({
    name: "Rajesh Kumar (SDM)",
    email: "admin@example.com",
    role: "SENIOR_DECISION_MAKER",
  });

  await recreateUser({
    name: "Dr. Priya Sharma",
    email: "dept-officer@example.com",
    role: "DEPARTMENT",
    departmentId: dept.id,
  });

  await recreateUser({
    name: "Amit Verma",
    email: "agency-officer@example.com",
    role: "AGENCY",
    agencyId: agency.id,
  });

  console.log("\n==================================================");
  console.log("🎉 All accounts fixed!");
  console.log("==================================================");
  console.log(`Password for all accounts: ${PASSWORD}\n`);
  console.log("  • admin@example.com             → SENIOR_DECISION_MAKER");
  console.log("  • dept-officer@example.com      → DEPARTMENT (Water Resources)");
  console.log("  • agency-officer@example.com    → AGENCY (Polavaram)");
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
