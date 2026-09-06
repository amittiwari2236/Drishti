import type { Metadata } from "next";
import {
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  IndianRupee,
  Clock,
  Map,
  Building2,
  FileText,
} from "lucide-react";
import { requireUser, projectScopeFilter, scopeLabel } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/config/labels";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABELS, STATUS_BADGE_STYLES } from "@/config/labels";
import { AssignProjectDialog } from "@/features/projects/components/assign-project-dialog";
import { getProjectFormData } from "@/features/projects/actions";

export const metadata: Metadata = { title: "Dashboard — DRISHTI" };

export default async function DashboardPage() {
  const user = await requireUser();
  const scopeFilter = projectScopeFilter(user);

  const isAgency = user.role === "AGENCY";
  const isDept = user.role === "DEPARTMENT";
  const isSdm = user.role === "SENIOR_DECISION_MAKER";

  const [
    totalProjects,
    ongoingProjects,
    completedProjects,
    delayedProjects,
    projects,
    recentUpdates,
    sdmFormData,
  ] = await Promise.all([
    prisma.infrastructureProject.count({ where: { ...scopeFilter } }),
    prisma.infrastructureProject.count({
      where: { ...scopeFilter, projectStatus: "UNDER_IMPLEMENTATION" },
    }),
    prisma.infrastructureProject.count({
      where: { ...scopeFilter, projectStatus: "COMPLETED" },
    }),
    prisma.infrastructureProject.count({
      where: {
        ...scopeFilter,
        projectStatus: { in: ["DELAYED", "CRITICAL"] },
      },
    }),
    prisma.infrastructureProject.findMany({
      where: { ...scopeFilter },
      select: {
        id: true,
        projectName: true,
        projectId: true,
        originalCost: true,
        revisedCost: true,
        expenditure: true,
        physicalProgress: true,
        projectStatus: true,
        state: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.projectProgressUpdate.findMany({
      where: { project: { ...scopeFilter } },
      select: {
        id: true,
        reportingDate: true,
        physicalProgress: true,
        expenditure: true,
        remarks: true,
        submittedByRole: true,
        project: { select: { projectName: true, id: true } },
        updatedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    isSdm ? getProjectFormData() : Promise.resolve(null),
  ]);

  let totalOriginalCost = 0;
  let totalExpenditure = 0;
  let totalPhysicalProgress = 0;

  for (const p of projects) {
    totalOriginalCost += p.originalCost;
    totalExpenditure += p.expenditure;
    totalPhysicalProgress += p.physicalProgress;
  }

  const avgPhysicalProgress =
    projects.length > 0
      ? (totalPhysicalProgress / projects.length).toFixed(1)
      : "0.0";

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  const scope = scopeLabel(user);

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user.name.split(" ")[0]}`}
        description={`${scope} · ${ROLE_LABELS[user.role]} — Infrastructure Project Monitoring`}
        actions={
          isSdm && sdmFormData ? (
            <AssignProjectDialog
              states={sdmFormData.states}
              sectors={sdmFormData.sectors}
              departments={sdmFormData.departments}
            />
          ) : undefined
        }
      />

      {/* ── KPI Row 1 ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Projects" value={totalProjects} icon={FolderKanban} />
        <StatCard title="Ongoing Projects" value={ongoingProjects} icon={Activity} />
        <StatCard title="Completed Projects" value={completedProjects} icon={CheckCircle2} />
        <StatCard title="At Risk / Delayed" value={delayedProjects} icon={AlertTriangle} />
      </div>

      {/* ── KPI Row 2 ── */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Project Cost"
          value={`₹${totalOriginalCost.toLocaleString()} Cr`}
          icon={IndianRupee}
        />
        <StatCard
          title="Total Expenditure"
          value={`₹${totalExpenditure.toLocaleString()} Cr`}
          icon={IndianRupee}
        />
        <StatCard
          title="Avg. Physical Progress"
          value={`${avgPhysicalProgress}%`}
          icon={TrendingUp}
        />
      </div>

      {/* ── SDM Quick Actions ── */}
      {isSdm && sdmFormData && (
        <div className="mt-6">
          <Card className="border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderKanban className="size-4 text-indigo-600" />
                Senior Decision Maker Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <AssignProjectDialog
                  states={sdmFormData.states}
                  sectors={sdmFormData.sectors}
                  departments={sdmFormData.departments}
                />
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-md border border-indigo-300 dark:border-indigo-700 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  View All National Projects
                </Link>
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-2 rounded-md border border-indigo-300 dark:border-indigo-700 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  National Analytics
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Department Quick Actions ── */}
      {isDept && (
        <div className="mt-6">
          <Card className="border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4 text-indigo-600" />
                Department Officer Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Manage Department Projects & Agencies
                </Link>
                <Link
                  href="/updates"
                  className="inline-flex items-center gap-2 rounded-md border border-indigo-300 dark:border-indigo-700 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                >
                  Review Agency Progress Submissions
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Agency: Quick Actions ── */}
      {isAgency && (
        <div className="mt-6">
          <Card className="border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4 text-emerald-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/updates/new"
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  <FileText className="size-4" />
                  Submit Progress Update
                </Link>
                <Link
                  href="/updates"
                  className="inline-flex items-center gap-2 rounded-md border border-emerald-300 dark:border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  View My Submissions
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Bottom Row ── */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Recent Projects */}
        <Card className="border-indigo-100 dark:border-indigo-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="size-4 text-indigo-500" />
              {isAgency ? "My Projects" : "Recent Projects"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isSdm
                  ? "No projects registered yet. Click 'Assign Project' above to create one."
                  : isDept
                    ? "No projects currently assigned to your department."
                    : "No projects currently assigned to your agency."}
              </p>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between gap-4 rounded-md p-2 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {p.projectName}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.state.name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {p.physicalProgress}%
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${STATUS_BADGE_STYLES[p.projectStatus] ?? ""}`}
                      >
                        {PROJECT_STATUS_LABELS[p.projectStatus]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-3">
              <Link
                href="/projects"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all projects →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Progress Updates */}
        <Card className="border-indigo-100 dark:border-indigo-900/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-indigo-500" />
              Recent Progress Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentUpdates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isAgency
                  ? "No updates submitted yet. Submit your first update above."
                  : "No progress updates recorded yet."}
              </p>
            ) : (
              <div className="space-y-3">
                {recentUpdates.map((u) => (
                  <Link
                    key={u.id}
                    href={`/projects/${u.project.id}`}
                    className="flex flex-col gap-1 rounded-md p-2 hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-sm font-medium truncate">{u.project.projectName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{u.physicalProgress}% progress</span>
                      <span>₹{u.expenditure.toLocaleString()} Cr spent</span>
                      <span>
                        {new Date(u.reportingDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {u.remarks && (
                      <p className="text-xs text-muted-foreground truncate italic">
                        {u.remarks}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
            {isAgency && (
              <div className="mt-3">
                <Link
                  href="/updates"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View all my submissions →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SDM only: Geographic overview placeholder */}
      {user.role === "SENIOR_DECISION_MAKER" && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="border-indigo-100 dark:border-indigo-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Map className="size-4 text-indigo-500" />
                Zone-wise Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Navigate to{" "}
                <Link href="/zones" className="text-indigo-600 underline">
                  Zones
                </Link>{" "}
                for geographic drill-down across all 6 national zones.
              </p>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 dark:border-indigo-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4 text-indigo-500" />
                Ministry Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Navigate to{" "}
                <Link href="/ministries" className="text-indigo-600 underline">
                  Ministries
                </Link>{" "}
                for ministry-wise and department-wise project breakdown.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
