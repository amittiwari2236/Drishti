import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PASSWORD = "Password@123";
const PASSWORD_HASH =
  "87ddd14dd3f819e908eb31b15d3b5af6:9a1cd9476ae24fd60e3db8484c2dcf6748de5e38778e11cb751e243c95b5d67f40c57ea050bd0505b35cc613c80b3cc328af0e6d37f25bbe599077522bb90c21"; // Password@123

async function createUser(opts) {
  const user = await prisma.user.upsert({
    where: { email: opts.email },
    update: {
      name: opts.name,
      role: opts.role,
      departmentId: opts.departmentId ?? null,
      agencyId: opts.agencyId ?? null,
    },
    create: {
      name: opts.name,
      email: opts.email,
      emailVerified: true,
      role: opts.role,
      departmentId: opts.departmentId ?? null,
      agencyId: opts.agencyId ?? null,
    },
  });

  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: PASSWORD_HASH },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: PASSWORD_HASH,
        issuer: "local:credential",
      },
    });
  }

  return user;
}

async function main() {
  console.log("==================================================");
  console.log("🌱 Seeding DRISHTI with DEMO/PROTOTYPE PAIMANA-inspired Data...");
  console.log("⚠️ Note: This is sample data, NOT live Government of India data.");
  console.log("==================================================");

  // ── 1. Zones ──
  const zonesData = [
    { name: "North Zone", code: "NZ" },
    { name: "South Zone", code: "SZ" },
    { name: "East Zone", code: "EZ" },
    { name: "West Zone", code: "WZ" },
    { name: "Central Zone", code: "CZ" },
    { name: "Northeast Zone", code: "NEZ" },
  ];

  const zones = {};
  for (const z of zonesData) {
    const zone = await prisma.zone.upsert({
      where: { code: z.code },
      update: {},
      create: z,
    });
    zones[z.code] = zone.id;
  }

  // ── 2. States ──
  const statesData = [
    { name: "Delhi", code: "DL", zoneCode: "NZ" },
    { name: "Haryana", code: "HR", zoneCode: "NZ" },
    { name: "Karnataka", code: "KA", zoneCode: "SZ" },
    { name: "Tamil Nadu", code: "TN", zoneCode: "SZ" },
    { name: "Andhra Pradesh", code: "AP", zoneCode: "SZ" },
    { name: "Maharashtra", code: "MH", zoneCode: "WZ" },
    { name: "Gujarat", code: "GJ", zoneCode: "WZ" },
    { name: "Madhya Pradesh", code: "MP", zoneCode: "CZ" },
    { name: "Assam", code: "AS", zoneCode: "NEZ" },
    { name: "Manipur", code: "MN", zoneCode: "NEZ" },
  ];

  const states = {};
  for (const s of statesData) {
    const state = await prisma.state.upsert({
      where: { code: s.code },
      update: {},
      create: { name: s.name, code: s.code, zoneId: zones[s.zoneCode] },
    });
    states[s.code] = state.id;
  }

  // ── 3. Sectors ──
  const sectorsData = [
    "Transport & Logistics",
    "Energy",
    "Water & Sanitation",
    "Irrigation",
    "Roads & Highways",
    "Railways",
    "Urban Infrastructure",
  ];

  const sectors = {};
  for (const s of sectorsData) {
    const sector = await prisma.sector.upsert({
      where: { name: s },
      update: {},
      create: { name: s },
    });
    sectors[s] = sector.id;
  }

  // ── 4. Ministries & Departments ──
  const ministry1 = await prisma.ministry.upsert({
    where: { code: "MIN-WATER" },
    update: {},
    create: { name: "Ministry of Jal Shakti", code: "MIN-WATER" },
  });

  const dept1 = await prisma.department.upsert({
    where: { code: "DEPT-WR" },
    update: {},
    create: { name: "Department of Water Resources", code: "DEPT-WR", ministryId: ministry1.id },
  });

  const ministry2 = await prisma.ministry.upsert({
    where: { code: "MIN-RTH" },
    update: {},
    create: { name: "Ministry of Road Transport and Highways", code: "MIN-RTH" },
  });

  const dept2 = await prisma.department.upsert({
    where: { code: "DEPT-RTH" },
    update: {},
    create: { name: "Department of Road Transport", code: "DEPT-RTH", ministryId: ministry2.id },
  });

  const ministry3 = await prisma.ministry.upsert({
    where: { code: "MIN-POWER" },
    update: {},
    create: { name: "Ministry of Power", code: "MIN-POWER" },
  });

  const dept3 = await prisma.department.upsert({
    where: { code: "DEPT-POWER" },
    update: {},
    create: { name: "Department of Power", code: "DEPT-POWER", ministryId: ministry3.id },
  });

  // ── 5. Implementing Agencies ──
  const agency1 = await prisma.implementingAgency.upsert({
    where: { code: "AG-POLAVARAM" },
    update: {},
    create: {
      name: "Polavaram Project Authority",
      code: "AG-POLAVARAM",
      departmentId: dept1.id,
      stateId: states["AP"],
    },
  });

  const agency2 = await prisma.implementingAgency.upsert({
    where: { code: "NHAI" },
    update: {},
    create: {
      name: "National Highways Authority of India",
      code: "NHAI",
      departmentId: dept2.id,
    },
  });

  const agency3 = await prisma.implementingAgency.upsert({
    where: { code: "PGCIL" },
    update: {},
    create: {
      name: "Power Grid Corporation of India Ltd",
      code: "PGCIL",
      departmentId: dept3.id,
      stateId: states["MH"],
    },
  });

  // ── 6. Demo Users (3 roles) ──
  await createUser({
    name: "Rajesh Kumar (SDM)",
    email: "admin@example.com",
    role: "SENIOR_DECISION_MAKER",
  });

  await createUser({
    name: "Dr. Priya Sharma",
    email: "dept-officer@example.com",
    role: "DEPARTMENT",
    departmentId: dept1.id,
  });

  await createUser({
    name: "Amit Verma (Agency Officer)",
    email: "agency-officer@example.com",
    role: "AGENCY",
    agencyId: agency3.id, // Power Grid Corporation of India Ltd (PGCIL)
  });

  console.log("\n==================================================");
  console.log("🎉 SEED COMPLETE (Master structural data & user accounts only)!");
  console.log("==================================================");
  console.log(`Universal Password: ${PASSWORD}\n`);
  console.log("Demo Accounts:");
  console.log(`  • [SDM]        admin@example.com             — National dashboard, all data`);
  console.log(`  • [DEPARTMENT] dept-officer@example.com      — Dept of Water Resources scope`);
  console.log(`  • [AGENCY]     agency-officer@example.com    — Polavaram Project Authority scope`);
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
