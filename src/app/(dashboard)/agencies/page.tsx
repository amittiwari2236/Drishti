import type { Metadata } from "next";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Implementing Agencies" };

export default async function AgenciesPage() {
  await requireUser();

  const agencies = await prisma.implementingAgency.findMany({
    include: {
      department: { include: { ministry: true } },
      state: true,
      _count: {
        select: { projects: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Implementing Agencies"
        description="Agencies responsible for executing infrastructure projects."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agencies.map((agency) => (
          <Card key={agency.id} className="h-full border-indigo-100/50 dark:border-indigo-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                  {agency.name}
                </CardTitle>
                <Badge variant="outline" className="shrink-0">{agency.code}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2 text-sm">
                  <Landmark className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground text-xs leading-none">Ministry / Dept</p>
                    <p className="font-medium mt-1 leading-tight">{agency.department.ministry.name}</p>
                    <p className="text-xs text-muted-foreground">{agency.department.name}</p>
                  </div>
                </div>
                
                {agency.state && (
                  <div className="flex gap-2 text-sm items-center">
                    <MapPin className="size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground text-xs mr-2">State Node:</span>
                      <span className="font-medium">{agency.state.name}</span>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Managed Projects</span>
                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {agency._count.projects}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
