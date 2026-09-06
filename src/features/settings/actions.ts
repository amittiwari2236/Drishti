"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/access";
import { logActivity } from "@/lib/activity";
import { sendEmail, isEmailConfigured } from "@/lib/email/mailer";
import { renderNotificationEmail } from "@/lib/email/templates";
import {
  type HolidayValues,
  type DepartmentValues,
  type TechnologyValues,
  type ReminderSettingValues,
} from "@/features/settings/schemas";

// ─────────────────────────── Email ───────────────────────────

/** Send a test email to the signed-in admin to verify SMTP setup. */
export async function sendTestEmail(): Promise<{ sent: boolean; reason?: string }> {
  const user = await requirePermission("settings:manage");
  if (!isEmailConfigured()) {
    return { sent: false, reason: "SMTP is not configured in the environment." };
  }

  const { subject, html } = await renderNotificationEmail({
    type: "SYSTEM",
    title: "DRISHTI email is working 🎉",
    message:
      "This is a test message confirming your SMTP configuration is correct.",
    link: "/settings",
    recipientName: user.name,
  });

  const { sent } = await sendEmail({ to: user.email, subject, html });
  return sent
    ? { sent: true }
    : { sent: false, reason: "The mail server rejected the message. Check credentials." };
}

// ─────────────────────────── Stubs for legacy settings panels ───────────────────────────

export async function addHoliday(_values: HolidayValues) {
  await requirePermission("settings:manage");
  revalidatePath("/settings");
}

export async function deleteHoliday(_id: string) {
  await requirePermission("settings:manage");
  revalidatePath("/settings");
}

export async function addDepartment(values: DepartmentValues) {
  const user = await requirePermission("settings:manage");
  const firstMinistry = await prisma.ministry.findFirst();
  if (!firstMinistry) throw new Error("No ministry available.");

  await prisma.department.create({
    data: {
      name: values.name,
      code: values.code || `DEPT-${Date.now()}`,
      ministryId: firstMinistry.id,
    },
  });

  await logActivity({
    userId: user.id,
    action: "CREATE",
    entityType: "Department",
    entityName: values.name,
  });
  revalidatePath("/settings");
}

export async function deleteDepartment(id: string) {
  await requirePermission("settings:manage");
  await prisma.department.delete({ where: { id } });
  revalidatePath("/settings");
}

export async function addTechnology(_values: TechnologyValues) {
  await requirePermission("settings:manage");
  revalidatePath("/settings");
}

export async function deleteTechnology(_id: string) {
  await requirePermission("settings:manage");
  revalidatePath("/settings");
}

export async function updateReminderSetting(_values: ReminderSettingValues) {
  await requirePermission("settings:manage");
  revalidatePath("/settings");
}

