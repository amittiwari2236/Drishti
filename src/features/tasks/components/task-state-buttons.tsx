"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markTaskAsReview, completeTask, cancelTask } from "@/features/tasks/actions";
import { toast } from "sonner";
import type { TaskStatus } from "@prisma/client";

export function TaskStateButtons({
  taskId,
  status,
  isAssignee,
  canEdit,
}: {
  taskId: string;
  status: TaskStatus;
  isAssignee: boolean;
  canEdit: boolean;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAction = async (actionFn: () => Promise<void>, successMsg: string) => {
    try {
      setIsUpdating(true);
      await actionFn();
      toast.success(successMsg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      {status === "PENDING" && isAssignee && (
        <Button
          onClick={() => handleAction(() => markTaskAsReview(taskId), "Task submitted for review")}
          disabled={isUpdating}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <ClipboardCheck className="mr-2 size-4" />
          {isUpdating ? "Submitting..." : "Submit for Review"}
        </Button>
      )}

      {status === "REVIEW" && canEdit && (
        <Button
          onClick={() => handleAction(() => completeTask(taskId), "Task completed")}
          disabled={isUpdating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <CheckCircle2 className="mr-2 size-4" />
          {isUpdating ? "Completing..." : "Mark as Completed"}
        </Button>
      )}

      {status !== "CANCELLED" && status !== "COMPLETED" && canEdit && (
        <Button
          onClick={() => handleAction(() => cancelTask(taskId), "Task cancelled")}
          disabled={isUpdating}
          variant="destructive"
        >
          <XCircle className="mr-2 size-4" />
          {isUpdating ? "Cancelling..." : "Cancel Task"}
        </Button>
      )}
    </div>
  );
}
