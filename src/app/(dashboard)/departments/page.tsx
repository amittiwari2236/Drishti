import type { Metadata } from "next";
import { requireUser } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Landmark, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddDepartmentDialog } from "@/features/departments/components/add-department-dialog";

export const metadata: Metadata = { title: "Departments" };

export default async function DepartmentsPage() {
  const user = await requireUser();

  const [departments, ministries] = await Promise.all([
    prisma.department.findMany({
      include: {
        ministry: true,
        _count: {
          select: {
            projects: true,
            agencies: true,
            users: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    // Ministries are only needed for the Add dialog (SDM-only action)
    user.role === "SENIOR_DECISION_MAKER"
      ? prisma.ministry.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, code: true } })
      : Promise.resolve([]),
  ]);

  return (
    <>
      <PageHeader
        title="Departments"
        description="Government departments overseeing infrastructure projects."
        actions={
          user.role === "SENIOR_DECISION_MAKER" ? (
            <AddDepartmentDialog ministries={ministries} />
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {departments.map((dept) => (
          <Card
            key={dept.id}
            className="h-full border-indigo-100/50 dark:border-indigo-900/20"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
                  {dept.name}
                </CardTitle>
                <Badge variant="outline" className="shrink-0">
                  {dept.code}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Ministry */}
                <div className="flex gap-2 text-sm">
                  <Landmark className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground text-xs leading-none">
                      Ministry
                    </p>
                    <p className="font-medium mt-1 leading-tight">
                      {dept.ministry.name}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="pt-3 border-t grid grid-cols-3 divide-x text-center">
                  <div className="px-2">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                      <Map className="size-3" /> Projects
                    </p>
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300">
                      {dept._count.projects}
                    </Badge>
                  </div>
                  <div className="px-2">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                      <Building2 className="size-3" /> Agencies
                    </p>
                    <Badge variant="secondary">{dept._count.agencies}</Badge>
                  </div>
                  <div className="px-2">
                    <p className="text-xs text-muted-foreground mb-1">Officers</p>
                    <Badge variant="outline">{dept._count.users}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {departments.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-12">
            No departments found. Click &quot;Add Department&quot; to create one.
          </p>
        )}
      </div>
    </>
  );
}
