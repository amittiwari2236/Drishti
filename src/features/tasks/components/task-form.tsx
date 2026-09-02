"use client";

import { useMemo, useTransition, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { taskSchema, type TaskValues } from "@/features/tasks/schemas";
import { createTask, updateTask } from "@/features/tasks/actions";
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/config/labels";
import { MultiSelect } from "@/components/shared/multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProjectOptions = {
  id: string;
  name: string;
  students: { id: string; name: string; designation?: string | null }[];
  milestones: { id: string; title: string }[];
  tasks: { id: string; title: string }[];
};

export function TaskForm({
  projects,
  initial,
  taskId,
  parentId,
  onDone,
  currentUser,
  allUsers,
}: {
  projects: ProjectOptions[];
  initial?: TaskValues;
  taskId?: string;
  parentId?: string;
  onDone?: () => void;
  currentUser?: { id: string; role: string; designation?: string | null; hierarchyLevel?: number | null };
  allUsers?: { id: string; name: string; designation?: string | null; hierarchyLevel?: number | null }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<TaskValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(taskSchema) as any,
    defaultValues: initial ?? {
      title: "",
      description: "",
      projectId: "",
      parentId: parentId ?? "",
      milestoneId: "",
      assigneeId: "",
      status: "PENDING",
      priority: "MEDIUM",
      deadline: "",

      dependencyIds: [],
    },
  });

  const projectId = form.watch("projectId");
  const project = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projects, projectId]
  );

  const assignableUsers = useMemo(() => {
    if (!allUsers) return [];
    if (!currentUser) return allUsers;
    
    // Admin (MANAGER or hierarchyLevel 1) can assign to anyone
    if (currentUser.hierarchyLevel === 1 || currentUser.role === "MANAGER") return allUsers;

    const currLevel = currentUser.hierarchyLevel || 4;

    return allUsers.filter(u => {
      const uLevel = u.hierarchyLevel || 4;
      return currLevel <= uLevel;
    });
  }, [currentUser, allUsers]);

  function onSubmit(values: TaskValues) {
    startTransition(async () => {
      try {
        if (taskId) {
          await updateTask(taskId, values);
          toast.success("Task updated");
          onDone?.();
          router.refresh();
        } else {
          const { id } = await createTask(values);
          toast.success("Task created");
          onDone?.();
          router.push(`/tasks/${id}`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  if (!isMounted) {
    return null; // Prevent hydration mismatch errors for Shadcn form IDs
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Implement login screen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="What needs to be done, acceptance criteria..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    onValueChange={(v) => {
                      field.onChange(v === "none" ? "" : v);
                      form.setValue("assigneeId", "");
                      form.setValue("milestoneId", "");
                      form.setValue("dependencyIds", []);
                    }}
                    value={field.value || "none"}
                    disabled={!!taskId || !!parentId}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None / General Task</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {assignableUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} {u.designation ? `(${u.designation})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {project && project.milestones.length > 0 && (
              <FormField
                control={form.control}
                name="milestoneId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No milestone</SelectItem>
                        {project.milestones.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {project && project.tasks.length > 0 && (
              <FormField
                control={form.control}
                name="dependencyIds"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Depends on</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={project.tasks
                          .filter((t) => t.id !== taskId)
                          .map((t) => ({ value: t.id, label: t.title }))}
                        selected={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="Select blocking tasks..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex items-end justify-end md:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                {taskId ? "Save changes" : parentId ? "Add subtask" : "Create task"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
