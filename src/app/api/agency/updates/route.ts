import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { projectScopeFilter } from "@/lib/access";
import { z } from "zod";

const updateSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  reportingDate: z.string().min(1, "Reporting date is required"),
  physicalProgress: z.number().min(0).max(100),
  expenditure: z.number().min(0),
  remarks: z.string().nullable().optional(),
  delayCategory: z.string().nullable().optional(),
  delayReason: z.string().nullable().optional(),
  delayDays: z.number().int().min(0).nullable().optional(),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const u = session.user as unknown as Record<string, unknown>;
  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (u.role as "SENIOR_DECISION_MAKER" | "DEPARTMENT" | "AGENCY") ?? "AGENCY",
    departmentId: (u.departmentId as string | null) ?? null,
    agencyId: (u.agencyId as string | null) ?? null,
  };

  // Only AGENCY role can submit updates
  if (user.role !== "AGENCY") {
    return NextResponse.json(
      { error: "Only Agency officers can submit progress updates." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    projectId,
    reportingDate,
    physicalProgress,
    expenditure,
    remarks,
    delayCategory,
    delayReason,
    delayDays,
  } = parsed.data;

  // Verify the project belongs to this agency (scope enforcement)
  const scopeFilter = projectScopeFilter(user);
  const project = await prisma.infrastructureProject.findFirst({
    where: { id: projectId, ...scopeFilter },
    select: { id: true, projectName: true, projectId: true, departmentId: true },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found or not in your scope." },
      { status: 404 }
    );
  }

  // 1. Create the authoritative ProjectProgressUpdate
  const update = await prisma.projectProgressUpdate.create({
    data: {
      projectId,
      reportingDate: new Date(reportingDate),
      physicalProgress,
      expenditure,
      remarks: remarks ?? null,
      delayCategory: delayCategory || null,
      delayReason: delayReason || null,
      delayDays: delayDays ?? null,
      updatedById: user.id,
      submittedByRole: "AGENCY",
    },
    select: { id: true },
  });

  // 2. Update the authoritative InfrastructureProject
  await prisma.infrastructureProject.update({
    where: { id: projectId },
    data: {
      physicalProgress,
      expenditure,
    },
  });

  // 3. Dispatch notifications to Department Officer(s) and Senior Decision Maker(s)
  try {
    const notifyTargets: string[] = [];

    if (project.departmentId) {
      const deptUsers = await prisma.user.findMany({
        where: { departmentId: project.departmentId, isActive: true },
        select: { id: true },
      });
      notifyTargets.push(...deptUsers.map((u) => u.id));
    }

    const sdmUsers = await prisma.user.findMany({
      where: { role: "SENIOR_DECISION_MAKER", isActive: true },
      select: { id: true },
    });
    notifyTargets.push(...sdmUsers.map((u) => u.id));

    if (notifyTargets.length > 0) {
      const uniqueUserIds = Array.from(new Set(notifyTargets));
      const { notifyMany } = await import("@/lib/notify");
      await notifyMany(uniqueUserIds, {
        type: "UPDATE_SUBMITTED",
        title: "New Progress Update Submitted",
        message: `Agency has submitted an update for "${project.projectName}" (${project.projectId}): ${physicalProgress}% progress, ₹${expenditure.toLocaleString()} Cr expenditure.`,
        link: `/projects/${project.id}`,
      });
    }
  } catch (notifyErr) {
    console.error("Failed to send update notifications:", notifyErr);
  }

  return NextResponse.json({ success: true, updateId: update.id }, { status: 201 });
}
