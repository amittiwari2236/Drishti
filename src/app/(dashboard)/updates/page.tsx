import type { Metadata } from "next";
import Link from "next/link";
import { requireRole, projectScopeFilter } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ROLE_LABELS } from "@/config/labels";

export const metadata: Metadata = { title: "Progress Updates — DRISHTI" };

export default async function UpdatesPage() {
  // Both AGENCY (their submissions) and SDM/DEPT (all updates in scope) can see this
  const user = await requireRole("AGENCY", "DEPARTMENT", "SENIOR_DECISION_MAKER");
  const scopeFilter = projectScopeFilter(user);

  const updates = await prisma.projectProgressUpdate.findMany({
    where: {
      // For AGENCY: only their own submissions
      ...(user.role === "AGENCY" ? { updatedById: user.id } : {}),
      // Scope filter via project
      project: { ...scopeFilter },
    },
    include: {
      project: {
        select: {
          id: true,
          projectName: true,
          projectId: true,
          state: { select: { name: true } },
        },
      },
      updatedBy: { select: { name: true, role: true } },
      reviewedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const isAgency = user.role === "AGENCY";

  return (
    <>
      <PageHeader
        title={isAgency ? "My Progress Submissions" : "All Progress Updates"}
        description={
          isAgency
            ? "History of all progress updates you have submitted for your agency's projects."
            : "All progress updates submitted by implementing agencies across your scope."
        }
        actions={
          isAgency ? (
            <Link
              href="/updates/new"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              <FileText className="size-4" />
              Submit New Update
            </Link>
          ) : undefined
        }
      />

      {updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <FileText className="size-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">
            {isAgency
              ? "You haven't submitted any updates yet."
              : "No progress updates found in your scope."}
          </p>
          {isAgency && (
            <Link
              href="/updates/new"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Submit First Update
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((u) => (
            <Card
              key={u.id}
              className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Project info */}
                  <div className="min-w-0">
                    <Link
                      href={`/projects/${u.project.id}`}
                      className="font-medium text-sm hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                    >
                      {u.project.projectName}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {u.project.state.name} · ID: {u.project.projectId}
                    </p>
                  </div>

                  {/* Right: Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-sm shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Physical</p>
                      <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {u.physicalProgress}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Expenditure</p>
                      <p className="font-semibold">₹{u.expenditure.toLocaleString()} Cr</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Reported On</p>
                      <p className="font-medium">
                        {format(u.reportingDate, "dd MMM yyyy")}
                      </p>
                    </div>
                    {/* Review status */}
                    {u.reviewedById ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1"
                      >
                        <CheckCircle2 className="size-3" />
                        Reviewed
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1"
                      >
                        <Clock className="size-3" />
                        Pending Review
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                {u.remarks && (
                  <p className="mt-2 text-xs text-muted-foreground italic border-t pt-2">
                    &ldquo;{u.remarks}&rdquo;
                  </p>
                )}

                {/* Reviewer info */}
                {u.reviewedBy && u.reviewedAt && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Reviewed by {u.reviewedBy.name} on {format(u.reviewedAt, "dd MMM yyyy")}
                  </p>
                )}

                {/* Submitter info (for non-agency views) */}
                {!isAgency && u.updatedBy && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted by {u.updatedBy.name} · {u.submittedByRole ? ROLE_LABELS[u.submittedByRole] : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
