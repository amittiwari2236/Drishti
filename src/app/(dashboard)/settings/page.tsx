import type { Metadata } from "next";
import { requireUser, requireRole } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Server,
  Database,
  Shield,
  Layers,
  Landmark,
  Building,
  Activity,
  Users,
  CheckCircle2,
} from "lucide-react";
import { ROLE_LABELS, ROLE_BADGE_STYLES } from "@/config/labels";

export const metadata: Metadata = { title: "System Settings — DRISHTI" };

export default async function SettingsPage() {
  await requireRole("SENIOR_DECISION_MAKER");

  const [
    ministries,
    sectors,
    zones,
    users,
    totalProjects,
  ] = await Promise.all([
    prisma.ministry.findMany({
      include: {
        _count: { select: { departments: true, projects: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.sector.findMany({
      include: {
        _count: { select: { projects: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.zone.findMany({
      include: {
        _count: { select: { states: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.infrastructureProject.count(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Platform configuration, administrative registry, and infrastructure surveillance status."
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">System Health</TabsTrigger>
          <TabsTrigger value="ministries">Ministries & Hierarchy</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="users">Authorized Personnel</TabsTrigger>
        </TabsList>

        {/* ── System Health ── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Database Engine</CardTitle>
                <Database className="size-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">PostgreSQL</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-500" /> Port 55432 (Active)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Platform Framework</CardTitle>
                <Server className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Next.js 15</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Turbopack App Router
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Registry</CardTitle>
                <Layers className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects} Projects</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {zones.length} Zones &amp; {ministries.length} Ministries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Security &amp; Auth</CardTitle>
                <Shield className="size-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Better-Auth</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Role-Based Scope Security
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Environment &amp; PAIMANA Integration</CardTitle>
              <CardDescription>
                SIH26103 MoSPI Specification &amp; Platform Architecture Parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                <div className="rounded-lg border p-3">
                  <span className="text-xs text-muted-foreground">Specification Target</span>
                  <p className="font-semibold mt-0.5">SIH26103 MoSPI / PAIMANA</p>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="text-xs text-muted-foreground">App URL</span>
                  <p className="font-semibold mt-0.5">http://localhost:3005</p>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="text-xs text-muted-foreground">Cost Unit</span>
                  <p className="font-semibold mt-0.5">₹ Crores (INR)</p>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="text-xs text-muted-foreground">Geographic Division</span>
                  <p className="font-semibold mt-0.5">{zones.length} National Zones</p>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="text-xs text-muted-foreground">Surveillance Engine</span>
                  <p className="font-semibold mt-0.5">Random Forest ML Boundary (Phase 11)</p>
                </div>
                <div className="rounded-lg border p-3">
                  <span className="text-xs text-muted-foreground">Surveillance Status</span>
                  <p className="font-semibold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <Activity className="size-3.5" /> Operational
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Ministries & Departments ── */}
        <TabsContent value="ministries">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monitored Ministries</CardTitle>
              <CardDescription>
                Central ministries and implementing department hierarchies tracked by DRISHTI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y rounded-lg border">
                {ministries.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Landmark className="size-4 text-primary" />
                        <span className="font-semibold text-sm">{m.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {m.code}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {m._count.departments} Departments · {m._count.projects} Active Infrastructure Projects
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sectors ── */}
        <TabsContent value="sectors">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Infrastructure Sectors</CardTitle>
              <CardDescription>
                Classification sectors defined under national infrastructure development goals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {sectors.map((s) => (
                  <div key={s.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{s.name}</span>
                      <Building className="size-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.description || "Core infrastructure sector"}
                    </p>
                    <p className="text-xs font-medium text-primary pt-1">
                      {s._count.projects} projects tracked
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Authorized Personnel ── */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Authorized Government Personnel</CardTitle>
              <CardDescription>
                Officials with credentialed access to DRISHTI project tracking registries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y rounded-lg border">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={ROLE_BADGE_STYLES[u.role]}>
                        {ROLE_LABELS[u.role]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {u.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

