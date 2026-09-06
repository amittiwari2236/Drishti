import type { Metadata } from "next";
import Link from "next/link";
import { requireUser, requireProjectAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Building2, 
  MapPin, 
  Landmark, 
  Settings, 
  IndianRupee, 
  TrendingUp, 
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  FileCode2,
} from "lucide-react";
import { PROJECT_STATUS_LABELS, STATUS_BADGE_STYLES, MILESTONE_STATUS_LABELS } from "@/config/labels";
import { AssignAgencyDialog } from "@/features/projects/components/assign-agency-dialog";
import { ReviewUpdateDialog } from "@/features/projects/components/review-update-dialog";
import { getDepartmentAgencies } from "@/features/projects/actions";
import { computeMonitoringIndicators, computeExpectedProgress } from "@/lib/monitoring";
import { predictProjectDelay } from "@/lib/ml/random-forest";
import { ProgressTrendChart } from "@/features/predictive/components/progress-trend-chart";
import { MonitoringIndicatorsPanel } from "@/features/predictive/components/monitoring-indicators";

export const metadata: Metadata = { title: "Project Details" };

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  // Authorization enforcement: throws 404 if project not found or not in user's scope
  const projectBase = await requireProjectAccess(id, user);

  // Fetch complete project details with relations
  const project = await prisma.infrastructureProject.findUniqueOrThrow({
    where: { id },
    include: {
      state: { include: { zone: true } },
      ministry: true,
      department: true,
      agency: true,
      sector: true,
      milestones: { orderBy: { plannedDate: "asc" } },
      progressUpdates: {
        orderBy: { reportingDate: "desc" },
        take: 20,
        include: {
          updatedBy: { select: { name: true } },
          reviewedBy: { select: { name: true } },
        },
      },
    },
  });

  const isAgency = user.role === "AGENCY";
  const isDept = user.role === "DEPARTMENT";
  const isSdm = user.role === "SENIOR_DECISION_MAKER";

  const deptAgencies = isDept
    ? await getDepartmentAgencies(user.departmentId ?? undefined)
    : [];

  // Derived Financial Analytics
  const currentRevisedCost = project.revisedCost ?? project.originalCost;
  const costOverrun = ((currentRevisedCost - project.originalCost) / project.originalCost) * 100;
  const expenditurePct = currentRevisedCost > 0 ? (project.expenditure / currentRevisedCost) * 100 : 0;
  
  // Predictive Monitoring & Schedule Variance Analytics
  const chronologicalUpdates = [...project.progressUpdates].sort(
    (a, b) => a.reportingDate.getTime() - b.reportingDate.getTime()
  );

  const monitoringIndicators = computeMonitoringIndicators({
    updates: chronologicalUpdates,
    milestones: project.milestones,
    originalCost: project.originalCost,
    revisedCost: project.revisedCost,
    expenditure: project.expenditure,
    startDate: project.startDate,
    plannedCompletionDate: project.plannedCompletionDate,
  });

  const trendPoints = chronologicalUpdates.map((u) => ({
    date: format(u.reportingDate, "MMM yyyy"),
    actualProgress: u.physicalProgress,
    expectedProgress: computeExpectedProgress(
      project.startDate,
      project.plannedCompletionDate,
      u.reportingDate
    ),
    expenditure: u.expenditure,
    delayDays: u.delayDays,
  }));

  const delayHistory = chronologicalUpdates.map((u) => ({
    date: format(u.reportingDate, "PP"),
    progress: u.physicalProgress,
    delayCategory: u.delayCategory,
    delayDays: u.delayDays,
    delayReason: u.delayReason,
  }));

  const rfPrediction = predictProjectDelay(monitoringIndicators);
  
  return (
    <>
      <PageHeader
        title={project.projectName}
        description={`Project ID: ${project.projectId} | Registered on ${format(project.createdAt, "PPP")}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={`text-sm px-3 py-1 ${STATUS_BADGE_STYLES[project.projectStatus] || ""}`}>
              {PROJECT_STATUS_LABELS[project.projectStatus]}
            </Badge>

            {/* Department Officer: Assign to Agency if unassigned */}
            {isDept && !project.agencyId && deptAgencies.length > 0 && (
              <AssignAgencyDialog
                projectId={project.id}
                projectName={project.projectName}
                agencies={deptAgencies}
              />
            )}

            {/* Agency Officer: Submit Update if assigned */}
            {isAgency && project.agencyId === user.agencyId && (
              <Link
                href={`/updates/new?projectId=${id}`}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                <FileText className="size-4" />
                Submit Progress Update
              </Link>
            )}
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Project Overview */}
        <Card className="xl:col-span-2 shadow-sm border-indigo-100/50 dark:border-indigo-900/20">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg">Authoritative Project Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Settings className="size-4" /> Sector
                </p>
                <p className="font-medium">{project.sector.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="size-4" /> Location & Zone
                </p>
                <p className="font-medium">{project.state.name}, {project.state.zone.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Landmark className="size-4" /> Ministry & Department
                </p>
                <p className="font-medium leading-tight">{project.ministry.name}</p>
                <p className="text-sm text-muted-foreground">{project.department?.name || "Unassigned"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Building2 className="size-4" /> Implementing Agency
                </p>
                {project.agency ? (
                  <p className="font-medium text-foreground">{project.agency.name}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400 italic">
                      Pending Agency Assignment
                    </span>
                    {isDept && deptAgencies.length > 0 && (
                      <AssignAgencyDialog
                        projectId={project.id}
                        projectName={project.projectName}
                        agencies={deptAgencies}
                        triggerSize="sm"
                        triggerVariant="outline"
                        triggerText="Assign"
                      />
                    )}
                  </div>
                )}
              </div>

              {project.description && (
                <div className="sm:col-span-2 space-y-1 pt-2 border-t">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileCode2 className="size-4" /> Project Description
                  </p>
                  <p className="text-sm leading-relaxed">{project.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Monitoring */}
        <Card className="shadow-sm border-indigo-100/50 dark:border-indigo-900/20">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="size-5 text-indigo-500" />
              Financial Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Original Cost</span>
                <span className="font-medium">₹{project.originalCost.toLocaleString()} Cr</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Revised Cost</span>
                <span className="font-medium">₹{currentRevisedCost.toLocaleString()} Cr</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <span className="text-sm text-muted-foreground">Cost Overrun</span>
                <span className={`font-semibold ${costOverrun > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {costOverrun.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Expenditure Progress</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {expenditurePct.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full" 
                  style={{ width: `${Math.min(expenditurePct, 100)}%` }} 
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                ₹{project.expenditure.toLocaleString()} Cr spent
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Physical Progress & Timeline */}
        <Card className="shadow-sm border-indigo-100/50 dark:border-indigo-900/20">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="size-5 text-indigo-500" />
              Physical Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-5xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">
                {project.physicalProgress}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">Authoritative Physical Completion</p>
            </div>
            
            <div className="mt-4 pt-4 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><CalendarDays className="size-4"/> Start Date</span>
                <span className="font-medium">{project.startDate ? format(project.startDate, "PP") : "TBD"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><CalendarDays className="size-4"/> Planned Completion</span>
                <span className="font-medium">{project.plannedCompletionDate ? format(project.plannedCompletionDate, "PP") : "TBD"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card className="xl:col-span-2 shadow-sm border-indigo-100/50 dark:border-indigo-900/20">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="size-5 text-indigo-500" />
              Project Milestones
            </CardTitle>
            <CardDescription>Major phases and completion status</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {project.milestones.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No milestones defined for this project yet.
              </div>
            ) : (
              <div className="divide-y">
                {project.milestones.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div>
                      <h4 className="font-medium text-sm">{m.name}</h4>
                      {m.remarks && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{m.remarks}</p>}
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="text-xs">
                        <p className="text-muted-foreground">Planned: {m.plannedDate ? format(m.plannedDate, "PP") : "-"}</p>
                        {m.actualDate && <p className="font-medium text-emerald-600">Actual: {format(m.actualDate, "PP")}</p>}
                      </div>
                      <Badge variant="outline" className={STATUS_BADGE_STYLES[m.status] || ""}>
                        {MILESTONE_STATUS_LABELS[m.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Authoritative Progress Updates & Department Review */}
        <Card className="xl:col-span-3 shadow-sm border-indigo-100/50 dark:border-indigo-900/20">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="size-5 text-indigo-500" />
                Authoritative Progress Update History
              </CardTitle>
              <CardDescription>
                Progress updates submitted by the implementing agency and reviewed by the department
              </CardDescription>
            </div>
            {isAgency && project.agencyId === user.agencyId && (
              <Link
                href={`/updates/new?projectId=${id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 underline"
              >
                <FileText className="size-3.5" />
                Submit Update
              </Link>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {project.progressUpdates.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <p>No progress updates submitted for this project yet.</p>
                {isAgency && project.agencyId === user.agencyId && (
                  <Link
                    href={`/updates/new?projectId=${id}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                  >
                    <FileText className="size-3.5" />
                    Submit First Progress Update
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y">
                {project.progressUpdates.map((update) => (
                  <div key={update.id} className="p-4 space-y-3 hover:bg-muted/10 transition-colors text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="grid grid-cols-3 sm:flex sm:items-center gap-4">
                        <div>
                          <p className="text-muted-foreground text-xs uppercase font-medium">Reporting Date</p>
                          <p className="font-semibold">{format(update.reportingDate, "PPP")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs uppercase font-medium">Physical</p>
                          <p className="font-semibold text-indigo-600 dark:text-indigo-400">{update.physicalProgress}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs uppercase font-medium">Expenditure</p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">₹{update.expenditure.toLocaleString()} Cr</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Review Status Badge */}
                        {update.reviewedById ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1 text-xs"
                          >
                            <CheckCircle2 className="size-3" />
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1 text-xs"
                          >
                            <Clock className="size-3" />
                            Pending Review
                          </Badge>
                        )}

                        {/* Department Officer Review Dialog */}
                        {isDept && (
                          <ReviewUpdateDialog
                            updateId={update.id}
                            projectName={project.projectName}
                            physicalProgress={update.physicalProgress}
                            expenditure={update.expenditure}
                            reportingDate={format(update.reportingDate, "PPP")}
                            agencyRemarks={update.remarks}
                            existingReviewRemarks={update.reviewRemarks}
                            isAlreadyReviewed={!!update.reviewedById}
                          />
                        )}
                      </div>
                    </div>

                    {/* Agency Remarks */}
                    {update.remarks && (
                      <div className="bg-muted/30 p-2.5 rounded text-xs text-muted-foreground italic">
                        &ldquo;{update.remarks}&rdquo;
                      </div>
                    )}

                    {/* Submitter & Reviewer Audit Trail */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                      <span>
                        Submitted by <span className="font-medium text-foreground">{update.updatedBy?.name || "Agency Officer"}</span>
                      </span>
                      {update.reviewedBy && update.reviewedAt && (
                        <div className="text-right">
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Reviewed by {update.reviewedBy.name} on {format(update.reviewedAt, "PPP")}
                          </span>
                          {update.reviewRemarks && (
                            <p className="text-foreground italic mt-0.5">
                              Review note: &quot;{update.reviewRemarks}&quot;
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Predictive Monitoring & Schedule Analytics Section */}
        <div id="predictive" className="xl:col-span-3 space-y-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-indigo-500" />
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Predictive Monitoring & Schedule Variance Analytics
              </h2>
              <p className="text-xs text-muted-foreground">
                Empirical progress velocity, timeline divergence, and early schedule risk indicators
              </p>
            </div>
          </div>

          <MonitoringIndicatorsPanel
            indicators={monitoringIndicators}
            projectCode={project.projectId}
            delayHistory={delayHistory}
            prediction={rfPrediction}
          />

          <ProgressTrendChart
            data={trendPoints}
            totalCost={currentRevisedCost}
          />
        </div>
      </div>
    </>
  );
}

