"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeTask } from "@/features/tasks/actions";
import { toast } from "sonner";
import type { TaskStatus } from "@prisma/client";

export function TaskStateButtons({
  taskId,
  status,
}: {
  taskId: string;
  status: TaskStatus;
}) {
  const [isUpdating, setIsUpdating] = useState(false);


  const handleComplete = async () => {
    try {
      setIsUpdating(true);
      await completeTask(taskId);
      toast.success("Event completed successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete task.");
    } finally {
      setIsUpdating(false);
    }
  };



  if (status === "REVIEW") {
    return (
      <Button
        variant="default"
        onClick={handleComplete}
        disabled={isUpdating}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <CheckCircle2 className="mr-2 size-4" />
        {isUpdating ? "Updating..." : "Complete Event"}
      </Button>
    );
  }

  return null;
}
