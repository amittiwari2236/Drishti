import type { Metadata } from "next";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import {
  NotificationsList,
  type NotificationItem,
} from "@/features/notifications/components/notifications-list";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();

  const records = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const items: NotificationItem[] = records.map((r) => ({
    id: r.id,
    type: "info",
    title: r.title,
    message: r.message,
    link: r.link,
    isRead: r.isRead,
    createdAt: r.createdAt.toISOString(),
  }));

  const unread = items.filter((i) => !i.isRead).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={
          unread > 0
            ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}.`
            : "You're all caught up."
        }
      />
      <NotificationsList notifications={items} />
    </>
  );
}
