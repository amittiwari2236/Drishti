import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MapPin, IndianRupee, Activity, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Zone Details" };

export default async function ZoneDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const zone = await prisma.zone.findUnique({
    where: { id },
    include: {
      states: {
        include: {
          projects: true,
        },
      },
    },
  });

  if (!zone) notFound();

  let totalProjects = 0;
  let ongoingProjects = 0;
  let delayedProjects = 0;
  let totalOriginalCost = 0;
  let totalRevisedCost = 0;
  let totalExpenditure = 0;
  let totalPhysicalProgress = 0;

  for (const state of zone.states) {
    totalProjects += state.projects.length;
    for (const p of state.projects) {
      if (p.projectStatus === "UNDER_IMPLEMENTATION") ongoingProjects++;
      if (p.projectStatus === "DELAYED") delayedProjects++;
      
      totalOriginalCost += p.originalCost;
      totalRevisedCost += p.revisedCost ?? p.originalCost;
      totalExpenditure += p.expenditure;
      totalPhysicalProgress += p.physicalProgress;
    }
  }

  const avgPhysicalProgress =
    totalProjects > 0 ? (totalPhysicalProgress / totalProjects).toFixed(1) : "0.0";

  return (
    <>
      <PageHeader
        title={`${zone.name} Zone`}
        description={`Monitoring infrastructure across ${zone.states.length} states in ${zone.code}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Projects" value={totalProjects} icon={FolderKanban} />
        <StatCard title="Ongoing Projects" value={ongoingProjects} icon={Activity} />
        <StatCard title="Total Expenditure" value={`₹${totalExpenditure.toLocaleString()} Cr`} icon={IndianRupee} />
        <StatCard title="Avg. Progress" value={`${avgPhysicalProgress}%`} icon={Activity} />
      </div>

      <h3 className="mt-8 mb-4 text-xl font-semibold tracking-tight">States in {zone.name}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zone.states.map((state) => {
          let sOriginal = 0;
          let sExp = 0;
          for (const p of state.projects) {
            sOriginal += p.originalCost;
            sExp += p.expenditure;
          }

          return (
            <Link key={state.id} href={`/states/${state.id}`} className="block transition-transform hover:scale-[1.01]">
              <Card className="h-full hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="size-5 text-indigo-500" />
                      {state.name}
                    </CardTitle>
                    <Badge variant="secondary">{state.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Projects</span>
                      <span className="font-medium">{state.projects.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Investment</span>
                      <span className="font-medium">₹{sOriginal.toLocaleString()} Cr</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expenditure</span>
                      <span className="font-medium">₹{sExp.toLocaleString()} Cr</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
