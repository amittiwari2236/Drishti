import { PrismaClient, ProjectStatus, MilestoneStatus } from "@prisma/client";
import { computeMonitoringIndicators, computeFeatureVector } from "../src/lib/monitoring";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding 5 PAIMANA-style projects with historical updates...");

  // Find or pick dependencies
  const sdmUser = await prisma.user.findFirst({ where: { role: "SENIOR_DECISION_MAKER" } });
  const deptUser = await prisma.user.findFirst({ where: { role: "DEPARTMENT" } });
  const agencyUser = await prisma.user.findFirst({ where: { role: "AGENCY" } });

  const states = await prisma.state.findMany();
  const stateByCode = Object.fromEntries(states.map((s) => [s.code, s.id]));

  const ministries = await prisma.ministry.findMany();
  const waterMinistry = ministries.find((m) => m.code === "MIN-WATER") || ministries[0];

  const departments = await prisma.department.findMany();
  const waterDept = departments.find((d) => d.code === "DEPT-WR") || departments[0];

  const agencies = await prisma.implementingAgency.findMany();
  const pgcil = agencies.find((a) => a.code === "PGCIL") || agencies[0];
  const polavaramAgency = agencies.find((a) => a.code === "AG-POLAVARAM") || pgcil;

  const sectors = await prisma.sector.findMany();
  const irrigationSector = sectors.find((s) => s.name.toLowerCase().includes("irrigation")) || sectors[0];
  const waterSector = sectors.find((s) => s.name.toLowerCase().includes("water")) || sectors[0];

  const demoProjects = [
    {
      projectId: "701415",
      projectName: "Polavaram Major Multi-Purpose Irrigation Project",
      description: "[DEMO] National irrigation and hydroelectric project on the Godavari River.",
      stateId: stateByCode["AP"] || states[0].id,
      ministryId: waterMinistry.id,
      departmentId: waterDept.id,
      agencyId: polavaramAgency.id,
      sectorId: irrigationSector.id,
      originalCost: 35000,
      revisedCost: 55548,
      startDate: new Date("2019-01-01"),
      plannedCompletionDate: new Date("2026-03-31"),
      milestones: [
        { name: "Spillway & Coffer Dam Erection", plannedDate: new Date("2022-06-30"), actualDate: new Date("2022-08-15"), status: MilestoneStatus.COMPLETED },
        { name: "Earth-cum-Rock Fill (ECRF) Dam Base", plannedDate: new Date("2024-03-31"), actualDate: null, status: MilestoneStatus.DELAYED },
        { name: "Powerhouse Structural Works", plannedDate: new Date("2025-06-30"), actualDate: null, status: MilestoneStatus.IN_PROGRESS },
        { name: "Canal Distribution Network Phase 1", plannedDate: new Date("2026-03-31"), actualDate: null, status: MilestoneStatus.PENDING },
      ],
      updates: [
        { date: "2025-01-15", progress: 68.2, exp: 39500, delayCategory: "Land Acquisition", delayDays: 45, delayReason: "Rehabilitation & resettlement negotiations in submergence zone", remarks: "[DEMO] Monthly progress report - January 2025" },
        { date: "2025-02-15", progress: 69.0, exp: 40200, delayCategory: "Weather / Natural Calamity", delayDays: 30, delayReason: "Unseasonal flash flooding in upper Godavari basin hampered excavation", remarks: "[DEMO] Monthly progress report - February 2025" },
        { date: "2025-03-15", progress: 69.8, exp: 41100, delayCategory: "Funding / Approval Delay", delayDays: 20, delayReason: "Inter-state environmental clearance and revised cost committee approval", remarks: "[DEMO] Monthly progress report - March 2025" },
        { date: "2025-04-15", progress: 70.4, exp: 42000, delayCategory: "Contractor Delay", delayDays: 15, delayReason: "Subcontractor machinery mobilization delay at gap-1", remarks: "[DEMO] Monthly progress report - April 2025" },
      ],
    },
    {
      projectId: "701372",
      projectName: "Sardar Sarovar Narmada Dam & Canal Project",
      description: "[DEMO] Concrete gravity dam and canal network on Narmada River.",
      stateId: stateByCode["GJ"] || states[0].id,
      ministryId: waterMinistry.id,
      departmentId: waterDept.id,
      agencyId: pgcil.id,
      sectorId: waterSector.id,
      originalCost: 45000,
      revisedCost: 52000,
      startDate: new Date("2018-06-01"),
      plannedCompletionDate: new Date("2025-12-31"),
      milestones: [
        { name: "Main Dam Gate Installation", plannedDate: new Date("2021-12-31"), actualDate: new Date("2021-12-20"), status: MilestoneStatus.COMPLETED },
        { name: "Main Canal Reach 0 to 458 km", plannedDate: new Date("2023-09-30"), actualDate: new Date("2023-11-10"), status: MilestoneStatus.COMPLETED },
        { name: "Branch Canal Distribution Network", plannedDate: new Date("2024-12-31"), actualDate: null, status: MilestoneStatus.DELAYED },
        { name: "Micro-irrigation Command Area Integration", plannedDate: new Date("2025-12-31"), actualDate: null, status: MilestoneStatus.IN_PROGRESS },
      ],
      updates: [
        { date: "2025-01-15", progress: 88.0, exp: 46000, delayCategory: null, delayDays: null, delayReason: null, remarks: "[DEMO] Steady canal lining progress" },
        { date: "2025-02-15", progress: 89.5, exp: 47200, delayCategory: "Material Supply", delayDays: 10, delayReason: "Cement batching plant scheduled maintenance", remarks: "[DEMO] Branch canal reaches 12-14 in progress" },
        { date: "2025-03-15", progress: 91.0, exp: 48500, delayCategory: null, delayDays: null, delayReason: null, remarks: "[DEMO] Good progress on minor distributaries" },
        { date: "2025-04-15", progress: 92.4, exp: 49800, delayCategory: null, delayDays: null, delayReason: null, remarks: "[DEMO] Approaching completion of major distributary heads" },
      ],
    },
    {
      projectId: "701373",
      projectName: "Ken-Betwa River Interlinking National Project",
      description: "[DEMO] First river interlinking project transferring water from Ken to Betwa basin.",
      stateId: stateByCode["MP"] || states[0].id,
      ministryId: waterMinistry.id,
      departmentId: waterDept.id,
      agencyId: pgcil.id,
      sectorId: irrigationSector.id,
      originalCost: 44605,
      revisedCost: null,
      startDate: new Date("2022-01-01"),
      plannedCompletionDate: new Date("2029-12-31"),
      milestones: [
        { name: "Daudhan Dam Foundation Preparation", plannedDate: new Date("2023-12-31"), actualDate: new Date("2024-03-15"), status: MilestoneStatus.COMPLETED },
        { name: "Panna Tiger Reserve Wildlife Clearance Stage II", plannedDate: new Date("2024-06-30"), actualDate: null, status: MilestoneStatus.DELAYED },
        { name: "Link Canal Tunnel Excavation (221 km)", plannedDate: new Date("2026-12-31"), actualDate: null, status: MilestoneStatus.IN_PROGRESS },
        { name: "Powerhouse Installation 72 MW", plannedDate: new Date("2028-06-30"), actualDate: null, status: MilestoneStatus.PENDING },
      ],
      updates: [
        { date: "2025-01-15", progress: 18.0, exp: 8200, delayCategory: "Environmental Clearance", delayDays: 60, delayReason: "Pending wildlife monitoring clearance for diversion channel near buffer zone", remarks: "[DEMO] Initial site survey and camp construction underway" },
        { date: "2025-02-15", progress: 18.5, exp: 8600, delayCategory: "Land Acquisition", delayDays: 45, delayReason: "District land acquisition tribunal awards under review in 12 villages", remarks: "[DEMO] Slow physical advancement due to pending parcel handovers" },
        { date: "2025-03-15", progress: 19.2, exp: 9100, delayCategory: "Environmental Clearance", delayDays: 30, delayReason: "Afforestation compliance verification visit pending from central team", remarks: "[DEMO] Access road construction proceeding on non-forest parcels" },
        { date: "2025-04-15", progress: 19.8, exp: 9700, delayCategory: "Labour Shortage", delayDays: 15, delayReason: "Harvest season seasonal labour attrition across Bundelkhand region", remarks: "[DEMO] Tunnel portal preparatory works started" },
      ],
    },
    {
      projectId: "701374",
      projectName: "Devadula Lift Irrigation Scheme",
      description: "[DEMO] Staged lift irrigation scheme lifting water from Godavari River in three phases.",
      stateId: stateByCode["AP"] || states[0].id,
      ministryId: waterMinistry.id,
      departmentId: waterDept.id,
      agencyId: polavaramAgency.id,
      sectorId: irrigationSector.id,
      originalCost: 13445,
      revisedCost: 18200,
      startDate: new Date("2020-03-01"),
      plannedCompletionDate: new Date("2025-09-30"),
      milestones: [
        { name: "Phase 1 Pump House Commissioning", plannedDate: new Date("2022-03-31"), actualDate: new Date("2022-04-10"), status: MilestoneStatus.COMPLETED },
        { name: "Phase 2 Pipeline (Bhimghanpur to Salivagu)", plannedDate: new Date("2023-10-31"), actualDate: new Date("2023-11-20"), status: MilestoneStatus.COMPLETED },
        { name: "Phase 3 High-Head Pump Motors Installation", plannedDate: new Date("2024-09-30"), actualDate: null, status: MilestoneStatus.DELAYED },
        { name: "Full System Operational Commissioning", plannedDate: new Date("2025-09-30"), actualDate: null, status: MilestoneStatus.IN_PROGRESS },
      ],
      updates: [
        { date: "2025-01-15", progress: 81.0, exp: 14900, delayCategory: "Equipment Failure", delayDays: 25, delayReason: "Impeller rotor vibration detected during dry test run of pump unit 4", remarks: "[DEMO] Replacement rotor ordered under warranty" },
        { date: "2025-02-15", progress: 82.2, exp: 15300, delayCategory: "Contractor Delay", delayDays: 20, delayReason: "OEM technical engineers delayed arrival for alignment inspection", remarks: "[DEMO] Alignment completed on units 1-3" },
        { date: "2025-03-15", progress: 83.1, exp: 15800, delayCategory: "Material Supply", delayDays: 15, delayReason: "Specialized high-pressure valves delivery from European vendor delayed", remarks: "[DEMO] Pipeline pressure tests underway" },
        { date: "2025-04-15", progress: 84.0, exp: 16200, delayCategory: null, delayDays: null, delayReason: null, remarks: "[DEMO] Valves delivered and installed on stage 2 header" },
      ],
    },
    {
      projectId: "701375",
      projectName: "Jigaon Major Irrigation Project",
      description: "[DEMO] Large irrigation dam on Purna River in Vidarbha, Maharashtra.",
      stateId: stateByCode["MH"] || states[0].id,
      ministryId: waterMinistry.id,
      departmentId: waterDept.id,
      agencyId: pgcil.id,
      sectorId: irrigationSector.id,
      originalCost: 11200,
      revisedCost: 14500,
      startDate: new Date("2019-07-01"),
      plannedCompletionDate: new Date("2026-06-30"),
      milestones: [
        { name: "Right Bank Canal Earthwork 0-30 km", plannedDate: new Date("2022-12-31"), actualDate: new Date("2023-03-15"), status: MilestoneStatus.COMPLETED },
        { name: "Dam Central Spillway Sluice Construction", plannedDate: new Date("2024-05-31"), actualDate: null, status: MilestoneStatus.DELAYED },
        { name: "Left Bank High Level Canal Reach 1", plannedDate: new Date("2025-04-30"), actualDate: null, status: MilestoneStatus.IN_PROGRESS },
        { name: "Reservoir Impoundment Readiness", plannedDate: new Date("2026-06-30"), actualDate: null, status: MilestoneStatus.PENDING },
      ],
      updates: [
        { date: "2025-01-15", progress: 52.0, exp: 7800, delayCategory: "Land Acquisition", delayDays: 90, delayReason: "Compensation litigation pending before High Court Nagpur bench", remarks: "[DEMO] Restrained from non-consensual possession on 4 key plots" },
        { date: "2025-02-15", progress: 52.4, exp: 8050, delayCategory: "Funding / Approval Delay", delayDays: 45, delayReason: "Delayed release of state share matching funds under AIBP", remarks: "[DEMO] Work slowed down to conserve working capital" },
        { date: "2025-03-15", progress: 52.9, exp: 8300, delayCategory: "Weather / Natural Calamity", delayDays: 30, delayReason: "Unseasonal hailstorms damaged temporary diversion embankments", remarks: "[DEMO] Embankment restoration in progress" },
        { date: "2025-04-15", progress: 53.5, exp: 8600, delayCategory: "Contractor Delay", delayDays: 25, delayReason: "Contractor financial stress resulted in sub-optimal site staffing", remarks: "[DEMO] Formal cure notice issued to primary EPC contractor" },
      ],
    },
  ];

  for (const dp of demoProjects) {
    const latestUpdate = dp.updates[dp.updates.length - 1];

    // 1. Upsert Project
    const project = await prisma.infrastructureProject.upsert({
      where: { projectId: dp.projectId },
      update: {
        projectName: dp.projectName,
        description: dp.description,
        stateId: dp.stateId,
        ministryId: dp.ministryId,
        departmentId: dp.departmentId,
        agencyId: dp.agencyId,
        sectorId: dp.sectorId,
        originalCost: dp.originalCost,
        revisedCost: dp.revisedCost,
        expenditure: latestUpdate.exp,
        physicalProgress: latestUpdate.progress,
        projectStatus: ProjectStatus.UNDER_IMPLEMENTATION,
        startDate: dp.startDate,
        plannedCompletionDate: dp.plannedCompletionDate,
      },
      create: {
        projectId: dp.projectId,
        projectName: dp.projectName,
        description: dp.description,
        stateId: dp.stateId,
        ministryId: dp.ministryId,
        departmentId: dp.departmentId,
        agencyId: dp.agencyId,
        sectorId: dp.sectorId,
        originalCost: dp.originalCost,
        revisedCost: dp.revisedCost,
        expenditure: latestUpdate.exp,
        physicalProgress: latestUpdate.progress,
        projectStatus: ProjectStatus.UNDER_IMPLEMENTATION,
        startDate: dp.startDate,
        plannedCompletionDate: dp.plannedCompletionDate,
      },
    });

    console.log(`  ✓ Project upserted: ${project.projectName} (${project.projectId})`);

    // 2. Milestones
    for (const m of dp.milestones) {
      const existing = await prisma.projectMilestone.findFirst({
        where: { projectId: project.id, name: m.name },
      });
      if (existing) {
        await prisma.projectMilestone.update({
          where: { id: existing.id },
          data: {
            plannedDate: m.plannedDate,
            actualDate: m.actualDate,
            status: m.status,
          },
        });
      } else {
        await prisma.projectMilestone.create({
          data: {
            projectId: project.id,
            name: m.name,
            plannedDate: m.plannedDate,
            actualDate: m.actualDate,
            status: m.status,
          },
        });
      }
    }

    // 3. Progress Updates (delete existing demo ones for clean replay or upsert)
    // To ensure idempotency without duplicates, find updates by project and reporting date
    for (const u of dp.updates) {
      const reportingDate = new Date(u.date);
      const existingUpdate = await prisma.projectProgressUpdate.findFirst({
        where: {
          projectId: project.id,
          reportingDate: {
            gte: new Date(reportingDate.setHours(0, 0, 0, 0)),
            lte: new Date(reportingDate.setHours(23, 59, 59, 999)),
          },
        },
      });

      const updateData = {
        projectId: project.id,
        reportingDate: new Date(u.date),
        physicalProgress: u.progress,
        expenditure: u.exp,
        remarks: u.remarks,
        delayCategory: u.delayCategory,
        delayReason: u.delayReason,
        delayDays: u.delayDays,
        updatedById: agencyUser?.id ?? null,
        submittedByRole: "AGENCY" as const,
        reviewedById: deptUser?.id ?? null,
        reviewedAt: new Date(u.date),
        reviewRemarks: "[DEMO] Verified against field inspection report",
      };

      if (existingUpdate) {
        await prisma.projectProgressUpdate.update({
          where: { id: existingUpdate.id },
          data: updateData,
        });
      } else {
        await prisma.projectProgressUpdate.create({
          data: updateData,
        });
      }
    }

    // 4. Create / Update RiskPrediction stub (with indicators feature vector, delayProbability = null)
    const allUpdates = await prisma.projectProgressUpdate.findMany({
      where: { projectId: project.id },
      orderBy: { reportingDate: "asc" },
    });
    const allMilestones = await prisma.projectMilestone.findMany({
      where: { projectId: project.id },
    });

    const indicators = computeMonitoringIndicators({
      updates: allUpdates,
      milestones: allMilestones,
      originalCost: project.originalCost,
      revisedCost: project.revisedCost,
      expenditure: project.expenditure,
      startDate: project.startDate,
      plannedCompletionDate: project.plannedCompletionDate,
    });

    const featureVector = computeFeatureVector(indicators, allUpdates.length);

    // Upsert or create risk prediction record
    const existingPrediction = await prisma.riskPrediction.findFirst({
      where: { projectId: project.id },
    });

    if (existingPrediction) {
      await prisma.riskPrediction.update({
        where: { id: existingPrediction.id },
        data: {
          predictionDate: new Date(),
          delayProbability: null, // Model Not Connected
          riskLevel: indicators.hasRiskSignal ? "EVALUATING" : null,
          modelVersion: "v0.1-stub",
          indicators: featureVector,
        },
      });
    } else {
      await prisma.riskPrediction.create({
        data: {
          projectId: project.id,
          predictionDate: new Date(),
          delayProbability: null, // Model Not Connected
          riskLevel: indicators.hasRiskSignal ? "EVALUATING" : null,
          modelVersion: "v0.1-stub",
          indicators: featureVector,
        },
      });
    }
  }

  console.log("✅ Seed complete: 5 projects, 20 progress updates, milestones, and risk prediction stubs created!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
