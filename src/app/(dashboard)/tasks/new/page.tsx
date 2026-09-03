import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireUser, companyFilter } from "@/lib/access";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";
import { TaskForm } from "@/features/tasks/components/task-form";
import { getProjectOptions } from "@/features/tasks/queries";

import { fetchPragyaAPI, syncRolesToUsers } from "@/lib/pragya-api";

export const metadata: Metadata = { title: "New Task" };

export default async function NewTaskPage() {
  const user = await requireUser();
  if (!can(user, "task:create") && !can(user, "task:assign")) {
    redirect("/tasks");
  }

  const projects = await getProjectOptions(user);
  const scope = await companyFilter(user);
  await syncRolesToUsers();
  const allUsers = await prisma.user.findMany({
    where: { 
      ...scope, 
      deletedAt: null, 
      isActive: true,
      OR: [
        { email: { startsWith: 'role_' } },
        { email: 'admin@example.com' } // include Super Admin
      ]
    },
    select: { id: true, name: true, designation: true, hierarchyLevel: true, role: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        title="New task"
        description="Create a task, assign it to a student, and set a deadline."
      />
      <TaskForm 
        projects={projects} 
        currentUser={{ id: user.id, role: user.role, designation: user.designation, hierarchyLevel: user.hierarchyLevel }}
        allUsers={allUsers}
      />
    </div>
  );
}
