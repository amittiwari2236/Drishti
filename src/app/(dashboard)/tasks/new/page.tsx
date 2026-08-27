import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/access";
import { can } from "@/lib/permissions";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";
import { TaskForm } from "@/features/tasks/components/task-form";
import { getProjectOptions } from "@/features/tasks/queries";

export const metadata: Metadata = { title: "New Task" };

export default async function NewTaskPage() {
  const user = await requireUser();
  if (!can(user, "task:create") && !can(user, "task:assign")) {
    redirect("/tasks");
  }

  const projects = await getProjectOptions(user);

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
        <TaskForm projects={projects} />
      )}
    </div>
  );
}
