"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  requirePermission,
  requireRole,
  resolveCompanyForWrite,
  assertCompanyAccess,
} from "@/lib/access";
import { logActivity } from "@/lib/activity";
import { provisionUser, generatePassword } from "@/features/users/create-user";
import { mentorSchema, type MentorValues } from "@/features/mentors/schemas";

export async function createStaffUser(values: MentorValues) {
  const user = await requirePermission("user:create");
  const data = mentorSchema.parse(values);

  // Only admins may create company admins.
  if (data.role === "COMPANY_ADMIN") {
    await requireRole("SUPER_ADMIN", "COMPANY_ADMIN");
  }

  const companyId = await resolveCompanyForWrite(user, data.companyId);
  const password = data.password || generatePassword();

  const created = await provisionUser({
    name: data.name,
    email: data.email,
    password,
    role: data.role,
    companyId,
    phone: data.phone,
    designation: data.designation,
  });

  await logActivity({
    userId: user.id,
    companyId,
    action: "CREATE",
    entityType: "Mentor",
    entityId: created.id,
    entityName: created.name,
    details: { role: data.role },
  });

  revalidatePath("/mentors");
  redirect(`/mentors?created=${encodeURIComponent(created.email)}&password=${encodeURIComponent(password)}`);
}

export async function setStaffActive(userId: string, isActive: boolean) {
  const actor = await requirePermission("user:update");
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "STUDENT" || target.role === "SUPER_ADMIN") {
    throw new Error("User not found");
  }
  assertCompanyAccess(actor, target.companyId);

  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  await logActivity({
    userId: actor.id,
    companyId: target.companyId,
    action: "UPDATE",
    entityType: "Mentor",
    entityId: userId,
    entityName: target.name,
    details: { isActive },
  });

  revalidatePath("/mentors");
}

/** Soft-delete a staff user (mentor/coordinator/company admin). SUPER_ADMIN only. */
export async function deleteStaffUser(userId: string) {
  const actor = await requirePermission("user:delete");
  if (actor.role !== "SUPER_ADMIN") {
    throw new Error("Only Super Admin can delete users.");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found.");
  if (target.role === "STUDENT" || target.role === "SUPER_ADMIN") {
    throw new Error("Cannot delete this user type here.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date(), isActive: false },
  });

  await prisma.session.deleteMany({ where: { userId } });

  await logActivity({
    userId: actor.id,
    companyId: target.companyId,
    action: "DELETE",
    entityType: "Mentor",
    entityId: userId,
    entityName: target.name,
  });

  revalidatePath("/mentors");
}

