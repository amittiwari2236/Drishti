import type { Metadata } from "next";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MapPin, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "States" };

export default async function StatesPage() {
  await requireUser();

  const states = await prisma.state.findMany({
    include: {
      zone: true,
      _count: {
        select: { projects: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="States"
        description="State-level monitoring for infrastructure projects."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {states.map((state) => (
          <Link key={state.id} href={`/states/${state.id}`} className="block transition-transform hover:scale-[1.01]">
            <Card className="h-full hover:border-indigo-300 dark:hover:border-indigo-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="size-5 text-indigo-500" />
                    {state.name}
                  </CardTitle>
                  <Badge variant="outline">{state.code}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zone</span>
                    <span className="font-medium text-xs bg-muted px-2 py-0.5 rounded-full">{state.zone.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><FolderKanban className="size-4" /> Projects</span>
                    <span className="font-medium">{state._count.projects}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
