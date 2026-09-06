"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser } from "@/lib/access";
import { notify, notifyMany } from "@/lib/notify";
import { z } from "zod";

const createProjectSchema = z.object({
  projectName: z.string().min(3, "Project name must be at least 3 characters"),
  projectId: z.string().min(2, "External Project ID is required"),
  description: z.string().optional(),
  stateId: z.string().min(1, "State is required"),
  sectorId: z.string().min(1, "Sector is required"),
  departmentId: z.string().min(1, "Department is required"),
  originalCost: z.number().positive("Original cost must be positive"),
  startDate: z.string().optional(),
  plannedCompletionDate: z.string().optional(),
});

/**
 * SENIOR DECISION MAKER ONLY:
 * Creates an authoritative project and assigns it to a Department.
 * Agency remains unassigned (null) until Department assigns it.
 */
export async function assignProjectToDepartment(formData: z.infer<typeof createProjectSchema>) {
  const user = await requireRole("SENIOR_DECISION_MAKER");
  const parsed = createProjectSchema.safeParse(formData);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid project data");
  }

  const data = parsed.data;

  // Verify external projectId uniqueness
  const existing = await prisma.infrastructureProject.findUnique({
    where: { projectId: data.projectId },
    select: { id: true },
  });

  if (existing) {
    throw new Error(`A project with ID "${data.projectId}" already exists.`);
  }

  // Lookup department to get its ministry
  const dept = await prisma.department.findUnique({
    where: { id: data.departmentId },
    select: { id: true, name: true, ministryId: true },
  });

  if (!dept) {
    throw new Error("Selected department does not exist.");
  }

  const project = await prisma.infrastructureProject.create({
    data: {
      projectId: data.projectId,
      projectName: data.projectName,
      description: data.description || null,
      stateId: data.stateId,
      sectorId: data.sectorId,
      departmentId: dept.id,
      ministryId: dept.ministryId,
      agencyId: null, // Agency is unassigned initially
      originalCost: data.originalCost,
      revisedCost: data.originalCost,
      expenditure: 0,
      physicalProgress: 0,
      projectStatus: "PLANNING",
      startDate: data.startDate ? new Date(data.startDate) : null,
      plannedCompletionDate: data.plannedCompletionDate ? new Date(data.plannedCompletionDate) : null,
    },
  });

  // Notify all active department officers in this department
  const deptOfficers = await prisma.user.findMany({
    where: { departmentId: dept.id, isActive: true },
    select: { id: true },
  });

  if (deptOfficers.length > 0) {
    await notifyMany(
      deptOfficers.map((u) => u.id),
      {
        type: "PROJECT_ASSIGNED",
        title: "New Project Assigned to Your Department",
        message: `SDM has assigned "${project.projectName}" (${project.projectId}) to ${dept.name}. Please review and assign to an implementing agency.`,
        link: `/projects/${project.id}`,
      }
    );
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: true, project };
}

/**
 * DEPARTMENT ONLY:
 * Assigns an authoritative project within their department to an Implementing Agency.
 */
export async function assignProjectToAgency(projectId: string, agencyId: string) {
  const user = await requireRole("DEPARTMENT");

  if (!user.departmentId) {
    throw new Error("You do not have an assigned department.");
  }

  const project = await prisma.infrastructureProject.findUnique({
    where: { id: projectId },
    include: { department: true },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (project.departmentId !== user.departmentId) {
    throw new Error("You are not authorized to assign agencies to this project.");
  }

  // Verify agency
  const agency = await prisma.implementingAgency.findUnique({
    where: { id: agencyId },
    select: { id: true, name: true },
  });

  if (!agency) {
    throw new Error("Selected agency does not exist.");
  }

  const updatedProject = await prisma.infrastructureProject.update({
    where: { id: projectId },
    data: {
      agencyId: agency.id,
      projectStatus: "UNDER_IMPLEMENTATION",
    },
  });

  // Notify agency officers
  const agencyOfficers = await prisma.user.findMany({
    where: { agencyId: agency.id, isActive: true },
    select: { id: true },
  });

  if (agencyOfficers.length > 0) {
    await notifyMany(
      agencyOfficers.map((u) => u.id),
      {
        type: "PROJECT_ASSIGNED",
        title: "Project Assigned to Your Agency",
        message: `Department has assigned project "${project.projectName}" (${project.projectId}) to ${agency.name}. You may now submit progress updates.`,
        link: `/projects/${project.id}`,
      }
    );
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/dashboard");
  return { success: true, project: updatedProject };
}

/**
 * DEPARTMENT ONLY:
 * Reviews a progress update submitted by an agency.
 */
export async function reviewProjectUpdate(updateId: string, reviewRemarks?: string) {
  const user = await requireRole("DEPARTMENT");

  if (!user.departmentId) {
    throw new Error("You do not have an assigned department.");
  }

  const update = await prisma.projectProgressUpdate.findUnique({
    where: { id: updateId },
    include: {
      project: { select: { id: true, projectName: true, departmentId: true } },
    },
  });

  if (!update) {
    throw new Error("Progress update not found.");
  }

  if (update.project.departmentId !== user.departmentId) {
    throw new Error("You are not authorized to review this update.");
  }

  const reviewed = await prisma.projectProgressUpdate.update({
    where: { id: updateId },
    data: {
      reviewedById: user.id,
      reviewedAt: new Date(),
      reviewRemarks: reviewRemarks || null,
    },
  });

  // Notify the submitting agency officer if known
  if (update.updatedById) {
    await notify({
      userId: update.updatedById,
      type: "UPDATE_REVIEWED",
      title: "Progress Update Reviewed",
      message: `Your progress update for "${update.project.projectName}" has been reviewed by the Department.`,
      link: `/projects/${update.project.id}`,
    });
  }

  revalidatePath(`/projects/${update.project.id}`);
  revalidatePath("/updates");
  revalidatePath("/dashboard");
  return { success: true, update: reviewed };
}

/**
 * Fetch reference data needed for project creation (States, Sectors, Departments).
 */
export async function getProjectFormData() {
  await requireRole("SENIOR_DECISION_MAKER");

  const [states, sectors, departments] = await Promise.all([
    prisma.state.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
    prisma.sector.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, ministry: { select: { name: true } } },
    }),
  ]);

  return { states, sectors, departments };
}

/**
 * Fetch agencies available for assignment by Department officer.
 */
export async function getDepartmentAgencies(departmentId?: string) {
  const user = await requireRole("DEPARTMENT");
  const deptId = departmentId || user.departmentId;

  const agencies = await prisma.implementingAgency.findMany({
    where: deptId ? { departmentId: deptId } : {},
    include: {
      department: { select: { name: true } },
      state: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  // If no agencies directly linked to department, fetch all agencies as options
  if (agencies.length === 0) {
    return prisma.implementingAgency.findMany({
      include: {
        department: { select: { name: true } },
        state: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  return agencies;
}
