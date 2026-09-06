"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationBell({
  userId,
  initialCount,
}: {
  userId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Poll every 30 seconds so the badge updates when new notifications arrive
    const fetchCount = () => {
      startTransition(async () => {
        try {
          const res = await fetch("/api/notifications/unread-count", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            setCount(data.count ?? 0);
          }
        } catch {
          // silent — don't break UI on network error
        }
      });
    };

    const interval = setInterval(fetchCount, 30_000);
    // Also fetch once immediately in case it changed since SSR
    fetchCount();
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-9 text-muted-foreground hover:text-foreground"
      asChild
    >
      <Link href="/notifications" aria-label="Notifications">
        <Bell className="size-4" />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground shadow-sm animate-in zoom-in-50 duration-200">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
