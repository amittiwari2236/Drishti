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

  await prisma.department.create({
    data: {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      ministryId,
    },
  });

  revalidatePath("/departments");
  revalidatePath("/ministries");
}
