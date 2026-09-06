"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/access";

import { prisma } from "@/lib/prisma";

/** Mark a single notification as read. */
export async function markNotificationRead(id: string) {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  });
  revalidatePath("/notifications");
}

/** Mark every unread notification as read. */
export async function markAllNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/notifications");
}

/** Delete a notification. */
export async function deleteNotification(id: string) {
  const user = await requireUser();
  await prisma.notification.deleteMany({
    where: { id, userId: user.id },
  });
  revalidatePath("/notifications");
}

