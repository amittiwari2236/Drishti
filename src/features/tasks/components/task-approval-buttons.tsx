"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveTask, declineTask } from "@/features/tasks/actions";
import { toast } from "sonner";

export function TaskApprovalButtons({ taskId }: { taskId: string }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await approveTask(taskId);
      toast.success("Task approved and is now active.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve task.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsDeclining(true);
      await declineTask(taskId);
      toast.success("Task declined.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to decline task.");
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <>
      <Button
        variant="default"
        className="bg-emerald-600 hover:bg-emerald-700"
        onClick={handleApprove}
        disabled={isApproving || isDeclining}
      >
        <CheckCircle className="mr-2 size-4" />
        {isApproving ? "Approving..." : "Approve"}
      </Button>
      <Button
        variant="destructive"
        onClick={handleDecline}
        disabled={isApproving || isDeclining}
      >
        <XCircle className="mr-2 size-4" />
        {isDeclining ? "Declining..." : "Decline"}
      </Button>
    </>
  );
}
