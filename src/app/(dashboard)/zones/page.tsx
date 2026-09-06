import type { Metadata } from "next";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Map, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Zones" };

export default async function ZonesPage() {
  await requireUser();

  const zones = await prisma.zone.findMany({
    include: {
      states: {
        include: {
          _count: {
            select: { projects: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Zones"
        description="Geographical zones for infrastructure monitoring."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => {
          const totalProjects = zone.states.reduce(
            (acc, state) => acc + state._count.projects,
            0
          );
          
          return (
            <Link key={zone.id} href={`/zones/${zone.id}`} className="block transition-transform hover:scale-[1.01]">
              <Card className="h-full hover:border-indigo-300 dark:hover:border-indigo-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Map className="size-5 text-indigo-500" />
                      {zone.name}
                    </CardTitle>
                    <Badge variant="outline">{zone.code}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><MapPin className="size-4" /> States</span>
                      <span className="font-medium">{zone.states.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Projects</span>
                      <span className="font-medium">{totalProjects}</span>
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
