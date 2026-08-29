import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FolderKanban, Plus, Users, CalendarRange } from "lucide-react";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { requireUser, companyFilter } from "@/lib/access";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import {
  DIFFICULTY_LABELS,
  PRIORITY_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/config/labels";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const user = await requireUser();
  if (!can(user, "feature:projects") && !can(user, "project:read")) {
    redirect("/dashboard");
  }
  const scope = await companyFilter(user);

  const projects = await prisma.project.findMany({
    where: {
      ...scope,
      // Students only see their own projects.
      ...(user.role === "INTERN"
        ? { students: { some: { userId: user.id } } }
        : {}),
    },
    include: {
      company: { select: { name: true, themeColor: true } },
      batch: { select: { name: true } },
      _count: {
        select: {
          students: true,
          tasks: { where: { deletedAt: null } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const canCreate =
    user.role === "MANAGER";

  return (
    <>
      <PageHeader
        title="Projects"
        description={
          user.role === "INTERN"
            ? "Projects you are working on."
            : "Internship projects across teams and batches."
        }
        actions={
          canCreate && (
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="size-4" /> New project
              </Link>
            </Button>
          )
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description={
            user.role === "INTERN"
              ? "You will see projects here once a mentor assigns you."
              : "Create a project and assign mentors and students to it."
          }
          action={
            canCreate && (
              <Button asChild size="sm">
                <Link href="/projects/new">
                  <Plus className="size-4" /> New project
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
                {project.imageUrl ? (
                  <div className="relative h-32 w-full">
                    <Image
                      src={project.imageUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="h-1.5 w-full"
                    style={{ backgroundColor: project.company.themeColor }}
                  />
                )}
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium leading-tight group-hover:underline">
                        {project.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project.company.name}
                        {project.batch && ` · ${project.batch.name}`}
                      </p>
                    </div>
                    <StatusBadge
                      status={project.status}
                      label={PROJECT_STATUS_LABELS[project.status]}
                    />
                  </div>

                  {project.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge
                      status={project.priority}
                      label={PRIORITY_LABELS[project.priority]}
                    />
                    <Badge variant="outline" className="text-xs">
                      {DIFFICULTY_LABELS[project.difficulty]}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" />
                      {project._count.students}
                    </span>
                    {project.endDate && (
                      <span className="flex items-center gap-1">
                        <CalendarRange className="size-3.5" />
                        {format(project.endDate, "d MMM")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
