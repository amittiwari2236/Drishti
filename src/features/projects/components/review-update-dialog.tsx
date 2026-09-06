"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewProjectUpdate } from "@/features/projects/actions";

interface ReviewUpdateDialogProps {
  updateId: string;
  projectName: string;
  physicalProgress: number;
  expenditure: number;
  reportingDate: string;
  agencyRemarks?: string | null;
  existingReviewRemarks?: string | null;
  isAlreadyReviewed?: boolean;
}

export function ReviewUpdateDialog({
  updateId,
  projectName,
  physicalProgress,
  expenditure,
  reportingDate,
  agencyRemarks,
  existingReviewRemarks,
  isAlreadyReviewed = false,
}: ReviewUpdateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reviewRemarks, setReviewRemarks] = useState(existingReviewRemarks || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await reviewProjectUpdate(updateId, reviewRemarks.trim());
        toast.success(
          isAlreadyReviewed
            ? "Review remarks updated successfully!"
            : "Progress update reviewed and verified!"
        );
        setOpen(false);
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to record review");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isAlreadyReviewed ? "outline" : "default"}
          size="sm"
          className={`gap-1.5 text-xs ${
            isAlreadyReviewed
              ? "text-muted-foreground hover:text-foreground"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          <CheckCircle2 className="size-3.5" />
          {isAlreadyReviewed ? "Edit Review" : "Review Update"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600" />
            {isAlreadyReviewed ? "Edit Review Remarks" : "Review Progress Update"}
          </DialogTitle>
          <DialogDescription>
            {projectName} · Reported on {reportingDate}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Summary of what agency reported */}
          <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-2 border">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs uppercase font-medium">
                Physical Progress
              </span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {physicalProgress}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-xs uppercase font-medium">
                Cumulative Expenditure
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                ₹{expenditure.toLocaleString()} Cr
              </span>
            </div>
            {agencyRemarks && (
              <div className="pt-2 border-t mt-1">
                <span className="text-muted-foreground text-xs font-medium block mb-0.5">
                  Agency Submission Remarks:
                </span>
                <p className="text-xs italic bg-background p-2 rounded border">
                  &ldquo;{agencyRemarks}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reviewRemarks" className="flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-muted-foreground" />
              Department Review Remarks / Verification Notes
            </Label>
            <Textarea
              id="reviewRemarks"
              rows={3}
              placeholder="e.g., Physical progress verified against ground telemetry; financial bills cleared."
              value={reviewRemarks}
              onChange={(e) => setReviewRemarks(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isPending ? "Saving..." : isAlreadyReviewed ? "Update Review" : "Mark as Reviewed"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
