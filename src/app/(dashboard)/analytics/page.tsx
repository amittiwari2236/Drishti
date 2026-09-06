import type { Metadata } from "next";
import { requireUser, projectScopeFilter, scopeLabel } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Activity, IndianRupee, PieChart, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { PROJECT_STATUS_LABELS } from "@/config/labels";

export const metadata: Metadata = { title: "Analytics — DRISHTI" };

export default async function AnalyticsPage() {
  const user = await requireUser();
  const scopeFilter = projectScopeFilter(user);

  const [totalProjects, projects] = await Promise.all([
    prisma.infrastructureProject.count({ where: { ...scopeFilter } }),
    prisma.infrastructureProject.findMany({
      where: { ...scopeFilter },
      select: {
        projectName: true,
        projectId: true,
        originalCost: true,
        revisedCost: true,
        expenditure: true,
        physicalProgress: true,
        projectStatus: true,
      },
    }),
  ]);

  let totalOriginalCost = 0;
  let totalRevisedCost = 0;
  let totalExpenditure = 0;
  let totalPhysicalProgress = 0;
  
  const statusCounts: Record<string, number> = {};

  for (const p of projects) {
    totalOriginalCost += p.originalCost;
    totalRevisedCost += p.revisedCost ?? p.originalCost;
    totalExpenditure += p.expenditure;
    totalPhysicalProgress += p.physicalProgress;
    
    statusCounts[p.projectStatus] = (statusCounts[p.projectStatus] || 0) + 1;
  }

  const avgPhysicalProgress =
    projects.length > 0 ? (totalPhysicalProgress / projects.length).toFixed(1) : "0.0";
    
  const overallCostOverrun = totalOriginalCost > 0 
    ? (((totalRevisedCost - totalOriginalCost) / totalOriginalCost) * 100).toFixed(2)
    : "0.0";

  const isSdm = user.role === "SENIOR_DECISION_MAKER";
  const title = isSdm
    ? "National Infrastructure Analytics"
    : `${scopeLabel(user)} Analytics`;

  return (
    <>
      <PageHeader
        title={title}
        description={`Macro-level metrics and performance indicators across your scope.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Cost Overrun" value={`${overallCostOverrun}%`} icon={TrendingUp} />
        <StatCard title="Avg. Completion" value={`${avgPhysicalProgress}%`} icon={Activity} />
        <StatCard title="Delayed Projects" value={statusCounts["DELAYED"] || 0} icon={BarChart3} />
        <StatCard title="Total Expenditure" value={`₹${totalExpenditure.toLocaleString()} Cr`} icon={IndianRupee} />
      </div>

      {totalProjects === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-4 text-center bg-muted/10">
          <BarChart3 className="size-12 text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-base">No analytics data available</h3>
          <p className="text-muted-foreground text-sm max-w-md mt-1">
            No projects have been assigned in your scope yet. Once projects are registered and progress updates are submitted, analytics indicators will calculate here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {/* Status Breakdown */}
          <Card className="border-indigo-100/50 dark:border-indigo-900/20 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="size-4 text-indigo-500" />
                Project Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {Object.entries(PROJECT_STATUS_LABELS).map(([statusKey, label]) => {
                const count = statusCounts[statusKey] || 0;
                const pct = totalProjects > 0 ? ((count / totalProjects) * 100).toFixed(0) : "0";
                return (
                  <div key={statusKey} className="space-y-1 text-sm">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="border-indigo-100/50 dark:border-indigo-900/20 shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="size-4 text-indigo-500" />
                Financial Progress Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Sanctioned Cost (Original)</span>
                <span className="font-semibold">₹{totalOriginalCost.toLocaleString()} Cr</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Revised Sanction Cost</span>
                <span className="font-semibold">₹{totalRevisedCost.toLocaleString()} Cr</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Total Expenditure Incurred</span>
                <span className="font-semibold text-emerald-600">₹{totalExpenditure.toLocaleString()} Cr</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Financial Utilization Rate</span>
                <span className="font-semibold text-indigo-600">
                  {totalOriginalCost > 0 ? ((totalExpenditure / totalOriginalCost) * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

