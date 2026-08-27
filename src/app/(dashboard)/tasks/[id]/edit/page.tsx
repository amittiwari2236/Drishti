import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser, assertCompanyAccess } from "@/lib/access";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { TaskForm } from "@/features/tasks/components/task-form";
import { getProjectOptions } from "@/features/tasks/queries";
import type { TaskValues } from "@/features/tasks/schemas";

export const metadata: Metadata = { title: "Edit Task" };

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!can(user, "task:update")) redirect("/tasks");
  const { id } = await params;

  const task = await prisma.task.findFirst({
    where: { id, deletedAt: null },
    include: { dependencies: { select: { dependsOnId: true } } },
  });
  if (!task) notFound();
  assertCompanyAccess(user, task.companyId);

  // Full task managers (SUPER_ADMIN + roles with task:assign like TEACHER, MENTOR,
  // INSTRUCTOR, COORDINATOR, COMPANY_ADMIN) can edit any task in their company scope.
  const isFullManager = user.role === "SUPER_ADMIN" || can(user, "task:assign");
  if (!isFullManager && task.createdById !== user.id && task.assigneeId !== user.id) {
    redirect("/tasks");
  }

  const projects = await getProjectOptions(user);

  const initial: TaskValues = {
    title: task.title,
    description: task.description ?? "",
    projectId: task.projectId,
    parentId: task.parentId ?? "",
    milestoneId: task.milestoneId ?? "",
    assigneeId: task.assigneeId ?? "",
    status: task.status,
    priority: task.priority,
    deadline: task.deadline?.toISOString().slice(0, 10) ?? "",
    estimatedHours: task.estimatedHours ?? null,
    actualHours: task.actualHours ?? null,
    dependencyIds: task.dependencies.map((d) => d.dependsOnId),
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader title="Edit task" description={task.title} />
      <TaskForm projects={projects} initial={initial} taskId={task.id} />
    </div>
  );
}
