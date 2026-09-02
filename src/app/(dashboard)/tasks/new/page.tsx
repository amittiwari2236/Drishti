import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/access";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";
import { TaskForm } from "@/features/tasks/components/task-form";
import { getProjectOptions } from "@/features/tasks/queries";

import { fetchPragyaAPI } from "@/lib/pragya-api";

export const metadata: Metadata = { title: "New Task" };

export default async function NewTaskPage() {
  const user = await requireUser();
  if (!can(user, "task:create") && !can(user, "task:assign")) {
    redirect("/tasks");
  }

  const projects = await getProjectOptions(user);
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
    pragyaDepartments = [];
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <PageHeader
        title="New task"
        description="Create a task, assign it to a student, and set a deadline."
      />
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create a project before adding tasks to it."
        />
      ) : (
        <TaskForm 
          projects={projects} 
          pragyaDepartments={pragyaDepartments}
          currentUser={{ id: user.id, role: user.role, designation: user.designation }}
        />
      )}
    </div>
  );
}
