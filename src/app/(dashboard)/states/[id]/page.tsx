import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FolderKanban, IndianRupee, MapPin, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABELS, STATUS_BADGE_STYLES } from "@/config/labels";

export const metadata: Metadata = { title: "State Details" };

export default async function StateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const state = await prisma.state.findUnique({
    where: { id },
    include: {
      zone: true,
      projects: {
        include: {
          sector: true,
          agency: true,
        },
      },
    },
  });

  if (!state) notFound();

  let ongoingProjects = 0;
  let delayedProjects = 0;
  let totalOriginalCost = 0;
  let totalRevisedCost = 0;
  let totalExpenditure = 0;
  let totalPhysicalProgress = 0;

  for (const p of state.projects) {
    if (p.projectStatus === "UNDER_IMPLEMENTATION") ongoingProjects++;
    if (p.projectStatus === "DELAYED") delayedProjects++;
    
    totalOriginalCost += p.originalCost;
    totalRevisedCost += p.revisedCost ?? p.originalCost;
    totalExpenditure += p.expenditure;
    totalPhysicalProgress += p.physicalProgress;
  }

  const avgPhysicalProgress =
    state.projects.length > 0
      ? (totalPhysicalProgress / state.projects.length).toFixed(1)
      : "0.0";

  return (
    <>
      <PageHeader
        title={`${state.name} Projects`}
        description={`Monitoring ${state.projects.length} infrastructure projects in ${state.name} (${state.zone.name}).`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Projects" value={state.projects.length} icon={FolderKanban} />
        <StatCard title="Ongoing Projects" value={ongoingProjects} icon={Activity} />
        <StatCard title="Total Expenditure" value={`₹${totalExpenditure.toLocaleString()} Cr`} icon={IndianRupee} />
        <StatCard title="Avg. Progress" value={`${avgPhysicalProgress}%`} icon={Activity} />
      </div>

      <h3 className="mt-8 mb-4 text-xl font-semibold tracking-tight">Project List</h3>
      <div className="grid gap-4 xl:grid-cols-2">
        {state.projects.length === 0 ? (
          <p className="text-muted-foreground text-sm">No projects found in this state.</p>
        ) : (
          state.projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="block transition-transform hover:scale-[1.01]">
              <Card className="h-full hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base font-semibold line-clamp-2">
                      {p.projectName}
                    </CardTitle>
                    <Badge variant="outline" className={STATUS_BADGE_STYLES[p.projectStatus] || ""}>
                      {PROJECT_STATUS_LABELS[p.projectStatus]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">ID: {p.projectId}</p>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Sector</p>
                      <p className="font-medium truncate">{p.sector.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Agency</p>
                      <p className="font-medium truncate">{p.agency?.code ?? "Pending"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Cost</p>
                      <p className="font-medium">₹{p.originalCost.toLocaleString()} Cr</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Progress</p>
                      <p className="font-medium text-indigo-600 dark:text-indigo-400">{p.physicalProgress}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
