import type { ReactNode } from "react";
import { requireUser } from "@/lib/access";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { RealtimeListener } from "@/components/layout/realtime-listener";
import { getAllowedHrefs } from "@/lib/nav-server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const allowedHrefs = getAllowedHrefs({ role: user.role, id: user.id });

  return (
    <SidebarProvider>
      <RealtimeListener role={user.role} userId={user.id} />
      <AppSidebar allowedHrefs={allowedHrefs} />
      <SidebarInset>
        <Topbar user={user} />
        <main className="flex-1 space-y-6 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
