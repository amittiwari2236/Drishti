import type { Metadata } from "next";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Ministries & Departments" };

export default async function MinistriesPage() {
  await requireUser();

  const ministries = await prisma.ministry.findMany({
    include: {
      departments: {
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
        title="Ministries"
        description="Administrative hierarchy of Ministries and their Departments."
      />

      <div className="space-y-6">
        {ministries.map((ministry) => {
          const totalProjects = ministry.departments.reduce((acc, dept) => acc + dept._count.projects, 0);

          return (
            <Card key={ministry.id} className="shadow-sm border-indigo-100/50 dark:border-indigo-900/20">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Landmark className="size-5 text-indigo-500" />
                    {ministry.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{ministry.code}</Badge>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300">
                      {totalProjects} Projects
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Departments</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ministry.departments.map((dept) => (
                    <div key={dept.id} className="p-3 rounded-md border flex items-start gap-3">
                      <Briefcase className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm leading-tight">{dept.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Code: {dept.code}</p>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                          {dept._count.projects} Projects
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
