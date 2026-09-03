import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Prisma, TaskStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { requireUser, companyFilter } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { TasksTable, type TaskRow } from "@/features/tasks/components/tasks-table";
import { TasksFilters } from "@/features/tasks/components/tasks-filters";
import { TASK_STATUSES } from "@/features/tasks/schemas";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; status?: string }>;
}) {
  const user = await requireUser();
  if (!can(user, "feature:tasks") && !can(user, "task:read")) {
    redirect("/dashboard");
  }
  const scope = await companyFilter(user);
  const { project: projectId, status } = await searchParams;

  const isPendingFilter = status === "pending_approval";
  const statusFilter = TASK_STATUSES.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : undefined;

  const isAdmin = user.hierarchyLevel === 1 || user.role === "MANAGER";

  const baseWhere: Prisma.TaskWhereInput = {
    deletedAt: null,
    ...(projectId ? { projectId } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(isPendingFilter
      ? { approval: { status: "PENDING" } }
      : {
          OR: [
            { approval: null },
            { approval: { status: "APPROVED" } },
          ],
        }),
  };

  const where: Prisma.TaskWhereInput = {
    ...baseWhere,
    ...(isAdmin 
      ? {} 
      : { 
          OR: [
            { assigneeId: user.id },
            { createdById: user.id }
          ]
        } 
      ),
  };

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: {
        ...scope,
        deletedAt: null,
        ...(user.role === "INTERN"
          ? { students: { some: { userId: user.id } } }
          : {}),
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true, image: true } },
        _count: { select: { subtasks: { where: { deletedAt: null } } } },
      },
      orderBy: [{ status: "asc" }, { order: "asc" }],
    }),
  ]);

  const mapToRow = (t: any): TaskRow => ({
    id: t.id,
    title: t.title,
    projectName: t.project?.name ?? "General Task",
    status: t.status,
    priority: t.priority,
    assigneeName: t.assignee?.name ?? null,
    assigneeImage: t.assignee?.image ?? null,
    deadline: t.deadline?.toISOString() ?? null,
    subtaskCount: t._count.subtasks,
  });

  const allRows = tasks.map(mapToRow);
  const myRows = tasks.filter(t => t.assigneeId === user.id).map(mapToRow);
  const assignedRows = tasks.filter(t => t.createdById === user.id && t.assigneeId !== user.id).map(mapToRow);

  const canCreate = can(user, "task:create") || can(user, "task:assign");

  return (
    <>
      <PageHeader
        title="Tasks"
        description="View and manage tasks across your projects."
        actions={
          <>
            <TasksFilters
              projects={projects}
              project={projectId ?? ""}
              status={statusFilter ?? (isPendingFilter ? "pending_approval" : "")}
              showPendingOption={isAdmin}
            />
            {canCreate && (
              <Button asChild>
                <Link href="/tasks/new">
                  <Plus className="size-4" /> New task
                </Link>
              </Button>
            )}
          </>
        }
      />
      
      {isAdmin ? (
        <TasksTable data={allRows} />
      ) : (
        <div className="space-y-4">
          <Tabs defaultValue="my_tasks">
            <TabsList>
              <TabsTrigger value="my_tasks">My Tasks ({myRows.length})</TabsTrigger>
              <TabsTrigger value="assigned_tasks">Tasks I Assigned ({assignedRows.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="my_tasks" className="mt-4">
              <TasksTable data={myRows} />
            </TabsContent>
            <TabsContent value="assigned_tasks" className="mt-4">
              <TasksTable data={assignedRows} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}
