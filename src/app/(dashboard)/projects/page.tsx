import type { Metadata } from "next";
import { requireUser, projectScopeFilter } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABELS, STATUS_BADGE_STYLES } from "@/config/labels";
import { FileText, FolderKanban, Building2, Landmark } from "lucide-react";
import { AssignProjectDialog } from "@/features/projects/components/assign-project-dialog";
import { AssignAgencyDialog } from "@/features/projects/components/assign-agency-dialog";
import { getProjectFormData, getDepartmentAgencies } from "@/features/projects/actions";

export const metadata: Metadata = { title: "Projects — DRISHTI" };

export default async function ProjectsPage() {
  const user = await requireUser();
  const scopeFilter = projectScopeFilter(user);

  const isAgency = user.role === "AGENCY";
  const isDept = user.role === "DEPARTMENT";
  const isSdm = user.role === "SENIOR_DECISION_MAKER";

  const [projects, sdmFormData, deptAgencies] = await Promise.all([
    prisma.infrastructureProject.findMany({
      where: { ...scopeFilter },
      include: {
        state: true,
        agency: true,
        sector: true,
        department: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    isSdm ? getProjectFormData() : Promise.resolve(null),
    isDept ? getDepartmentAgencies(user.departmentId ?? undefined) : Promise.resolve([]),
  ]);

  const pageTitle = isSdm
    ? "All Infrastructure Projects"
    : isAgency
      ? "My Agency's Projects"
      : "Department Projects";

  const pageDesc = isSdm
    ? "National registry of infrastructure projects across all states and sectors."
    : isAgency
      ? "Projects under your agency's portfolio. Submit progress updates to keep records current."
      : "Projects under your department's oversight. Assign to implementing agencies and monitor progress.";

  return (
    <>
      <PageHeader
        title={pageTitle}
        description={pageDesc}
        actions={
          <div className="flex items-center gap-2">
            {isSdm && sdmFormData && (
              <AssignProjectDialog
                states={sdmFormData.states}
                sectors={sdmFormData.sectors}
                departments={sdmFormData.departments}
              />
            )}
            {isAgency && (
              <Link
                href="/updates/new"
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
              >
                <FileText className="size-4" />
                Submit Update
              </Link>
            )}
          </div>
        }
      />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-4 text-center bg-muted/10">
          <FolderKanban className="size-12 text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-base">
            {isSdm
              ? "No infrastructure projects registered yet"
              : isDept
                ? "No projects assigned to your department yet"
                : "No projects assigned to your agency yet"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mt-1">
            {isSdm
              ? "Start by creating an authoritative infrastructure project and assigning it to a Department."
              : isDept
                ? "When Senior Decision Makers assign national projects to your department, they will appear here for agency allocation and monitoring."
                : "Projects assigned by the Department will appear here for progress monitoring and reporting."}
          </p>
          {isSdm && sdmFormData && (
            <div className="mt-5">
              <AssignProjectDialog
                states={sdmFormData.states}
                sectors={sdmFormData.sectors}
                departments={sdmFormData.departments}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-2">
          {projects.map((p) => (
            <Card
              key={p.id}
              className="flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-sm"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-base font-semibold line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {p.projectName}
                  </Link>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={STATUS_BADGE_STYLES[p.projectStatus] || ""}
                  >
                    {PROJECT_STATUS_LABELS[p.projectStatus]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">ID: {p.projectId}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="mt-1 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">
                        State
                      </p>
                      <p className="font-medium truncate">{p.state.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">
                        Sector
                      </p>
                      <p className="font-medium truncate">{p.sector.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">
                        Cost (Cr)
                      </p>
                      <p className="font-medium">₹{p.originalCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">
                        Progress
                      </p>
                      <p className="font-medium text-indigo-600 dark:text-indigo-400">
                        {p.physicalProgress}%
                      </p>
                    </div>
                  </div>

                  {/* Scope allocation labels */}
                  <div className="mt-3 pt-2 border-t text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Landmark className="size-3.5 shrink-0" />
                      <span className="truncate">
                        Dept: <span className="text-foreground font-medium">{p.department?.name || "Unassigned"}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Building2 className="size-3.5 shrink-0" />
                      <span className="truncate">
                        Agency:{" "}
                        <span className={p.agency?.name ? "text-foreground font-medium" : "text-amber-600 dark:text-amber-400 font-medium italic"}>
                          {p.agency?.name || "Pending Agency Assignment"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${Math.min(p.physicalProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions footer */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs gap-2">
                  <Link
                    href={`/projects/${p.id}`}
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Details →
                  </Link>

                  {/* Department officer quick assign */}
                  {isDept && !p.agencyId && deptAgencies.length > 0 && (
                    <AssignAgencyDialog
                      projectId={p.id}
                      projectName={p.projectName}
                      agencies={deptAgencies}
                      triggerSize="sm"
                    />
                  )}

                  {isAgency && (
                    <Link
                      href={`/updates/new?projectId=${p.id}`}
                      className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <FileText className="size-3" />
                      Submit Update
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
