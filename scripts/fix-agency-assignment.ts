/**
 * Fix: Reassign Amit Verma (agency-officer@example.com) to PGCIL
 * and retroactively send notifications for the 2 already-assigned projects.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const PGCIL_ID = "cmtotd8ux001btsncmfd7erzw";
const AMIT_EMAIL = "agency-officer@example.com";

async function main() {
  // 1. Update Amit Verma's agencyId to PGCIL
  const updated = await prisma.user.update({
    where: { email: AMIT_EMAIL },
    data: { agencyId: PGCIL_ID },
    select: { id: true, name: true, agencyId: true },
  });
  console.log("✅ Updated user agencyId:", JSON.stringify(updated));

  // 2. Find all PGCIL-assigned projects
  const projects = await prisma.infrastructureProject.findMany({
    where: { agencyId: PGCIL_ID },
    select: { id: true, projectName: true, projectId: true },
  });
  console.log(`\n📋 Found ${projects.length} project(s) assigned to PGCIL`);

  // 3. Send missed notifications for each project
  for (const project of projects) {
    // Avoid duplicates — skip if already notified
    const alreadyNotified = await prisma.notification.findFirst({
      where: {
        userId: updated.id,
        link: `/projects/${project.id}`,
        title: "Project Assigned to Your Agency",
      },
    });

    if (alreadyNotified) {
      console.log(`  ⏭  Notification already exists for "${project.projectName}" — skipping`);
      continue;
    }

    await prisma.notification.create({
      data: {
        userId: updated.id,
        title: "Project Assigned to Your Agency",
        message: `Department has assigned project "${project.projectName}" (${project.projectId}) to Power Grid Corporation of India Ltd. You may now submit progress updates.`,
        link: `/projects/${project.id}`,
        isRead: false,
      },
    });
    console.log(`  🔔 Notification sent for "${project.projectName}"`);
  }

  console.log("\n✅ Fix complete! Amit Verma is now linked to PGCIL and has notifications for all assigned projects.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
