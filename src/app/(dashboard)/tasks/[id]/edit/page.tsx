import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireUser, assertCompanyAccess, companyFilter } from "@/lib/access";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { TaskForm } from "@/features/tasks/components/task-form";
import { getProjectOptions } from "@/features/tasks/queries";
import type { TaskValues } from "@/features/tasks/schemas";

import { fetchPragyaAPI } from "@/lib/pragya-api";

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

  // Full task managers (MANAGER + roles with task:assign like SENIOR, EXECUTIVE,
  // EXECUTIVE, SENIOR, MANAGER) can edit any task in their company scope.
  const isFullManager = user.role === "MANAGER" || can(user, "task:assign");
  if (!isFullManager && task.createdById !== user.id && task.assigneeId !== user.id) {
    redirect("/tasks");
  }

  const projects = await getProjectOptions(user);
  const scope = await companyFilter(user);
  const allUsers = await prisma.user.findMany({
    where: { ...scope, deletedAt: null, isActive: true },
    select: { id: true, name: true, role: true, designation: true },
    orderBy: { name: 'asc' }
  });

  const token = (await cookies()).get('pragya_jwt')?.value;

  let pragyaDepartments = [];
  try {
    if (token === "DUMMY_TOKEN_FOR_DEMO") {
      pragyaDepartments = [
        { id: 1, name: 'Technology', code: 'TECH', roles: [{id: 1, name: 'Developer', hierarchy_level: 3}, {id: 2, name: 'Tech Lead', hierarchy_level: 2}] },
        { id: 2, name: 'Finance', code: 'FIN', roles: [] },
        { id: 5, name: 'Teaching', code: 'TEACHING', roles: [{id: 3, name: 'Instructor', hierarchy_level: 3}] }
      ];
    } else {
      const res = await fetchPragyaAPI('departments');
      if (res.status && Array.isArray(res.data)) {
        pragyaDepartments = res.data;
      }
    }
  } catch (error) {
    console.error("Failed to fetch pragya departments", error);
  }

  const initial: TaskValues = {
    title: task.title,
    description: task.description ?? "",
    projectId: task.projectId ?? "",
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
      <TaskForm 
        projects={projects} 
        initial={initial} 
        taskId={task.id} 
        pragyaDepartments={pragyaDepartments}
        currentUser={{ id: user.id, role: user.role, designation: user.designation }}
        allUsers={allUsers}
      />
    </div>
  );
}
