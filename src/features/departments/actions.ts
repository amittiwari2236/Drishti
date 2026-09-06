"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access";
import { z } from "zod";

const createDepartmentSchema = z.object({
  name: z.string().min(3, "Department name must be at least 3 characters"),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, hyphens and underscores"),
  ministryId: z.string().min(1, "Ministry is required"),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

import { auth } from "@/lib/auth";

export async function ensureDepartmentOfficer(dept: { id: string; name: string; code: string }) {
  const existingUser = await prisma.user.findFirst({
    where: {
      departmentId: dept.id,
      role: "DEPARTMENT",
      isActive: true,
    },
    select: { id: true, name: true, email: true },
  });

  if (existingUser) {
    return { id: dept.id, name: dept.name, code: dept.code, email: existingUser.email };
  }

  const cleanCode = dept.code.toLowerCase().replace(/[^a-z0-9]/g, "");
  let targetEmail = `dept-${cleanCode}@example.com`;

  if (dept.code.toUpperCase() === "DEPT-1") targetEmail = "dept1@example.com";
  if (dept.code.toUpperCase() === "DEPT-2") targetEmail = "dept2@example.com";

  const emailExists = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (emailExists) {
    targetEmail = `dept-${cleanCode}-${dept.id.slice(-4)}@example.com`;
  }

  const res = await auth.api.signUpEmail({
    body: {
      email: targetEmail,
      password: "Password@123",
      name: `${dept.name} Officer`,
    },
  });

  if (res?.user?.id) {
    await prisma.user.update({
      where: { id: res.user.id },
      data: {
        role: "DEPARTMENT",
        emailVerified: true,
        departmentId: dept.id,
      },
    });
  }

  return { id: dept.id, name: dept.name, code: dept.code, email: targetEmail };
}

/** Fetch all departments with guaranteed officer credentials for login auto-fill */
export async function getLoginDepartments() {
  try {
    const depts = await prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });

    const list = await Promise.all(
      depts.map(async (d) => {
        try {
          return await ensureDepartmentOfficer(d);
        } catch (e) {
          console.error(`Failed to ensure officer for dept ${d.code}:`, e);
          const cleanCode = d.code.toLowerCase().replace(/[^a-z0-9]/g, "");
          return { id: d.id, name: d.name, code: d.code, email: `dept-${cleanCode}@example.com` };
        }
      })
    );
    return list;
  } catch (err) {
    console.error("Failed to get login departments:", err);
    return [];
  }
}

/** SENIOR_DECISION_MAKER only: create a new department under a ministry. */
export async function createDepartment(input: CreateDepartmentInput) {
  await requireRole("SENIOR_DECISION_MAKER");

  const parsed = createDepartmentSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { name, code, ministryId } = parsed.data;

  // Check uniqueness
  const existing = await prisma.department.findFirst({
    where: { OR: [{ name }, { code: code.toUpperCase() }] },
    select: { id: true, name: true, code: true },
  });

  if (existing) {
    if (existing.name === name) throw new Error(`A department named "${name}" already exists.`);
    throw new Error(`Department code "${code.toUpperCase()}" is already in use.`);
  }

  // Verify ministry exists
  const ministry = await prisma.ministry.findUnique({
    where: { id: ministryId },
    select: { id: true },
  });
  if (!ministry) throw new Error("Selected ministry does not exist.");

  const dept = await prisma.department.create({
    data: {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      ministryId,
    },
  });

  // Automatically provision default Department Officer account
  await ensureDepartmentOfficer(dept);

  revalidatePath("/departments");
  revalidatePath("/ministries");
  revalidatePath("/login");
}

