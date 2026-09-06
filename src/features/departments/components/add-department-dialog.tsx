"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Landmark } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDepartment } from "@/features/departments/actions";

interface MinistryOption {
  id: string;
  name: string;
  code: string;
}

interface AddDepartmentDialogProps {
  ministries: MinistryOption[];
}

const EMPTY_FORM = { name: "", code: "", ministryId: "" };

export function AddDepartmentDialog({ ministries }: AddDepartmentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.ministryId) {
      toast.error("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        await createDepartment({
          name: form.name.trim(),
          code: form.code.trim(),
          ministryId: form.ministryId,
        });
        toast.success(`Department "${form.name}" created successfully!`);
        setForm(EMPTY_FORM);
        setOpen(false);
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to create department");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Plus className="size-4" />
          Add Department
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="size-5 text-indigo-600" />
            Add New Department
          </DialogTitle>
          <DialogDescription>
            Create a government department and assign it to a Ministry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Department Name */}
          <div className="space-y-1.5">
            <Label htmlFor="dept-name">
              Department Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dept-name"
              placeholder="e.g., Ministry of Road Transport"
              value={form.name}
              onChange={set("name")}
              required
              disabled={isPending}
            />
          </div>

          {/* Department Code */}
          <div className="space-y-1.5">
            <Label htmlFor="dept-code">
              Department Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dept-code"
              placeholder="e.g., MRT"
              value={form.code}
              onChange={set("code")}
              className="uppercase"
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Short unique code — letters, numbers, hyphens only. Auto-uppercased.
            </p>
          </div>

          {/* Ministry */}
          <div className="space-y-1.5">
            <Label htmlFor="dept-ministry">
              Ministry <span className="text-red-500">*</span>
            </Label>
            <select
              id="dept-ministry"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.ministryId}
              onChange={set("ministryId")}
              required
              disabled={isPending}
            >
              <option value="">— Select Ministry —</option>
              {ministries.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(EMPTY_FORM);
                setOpen(false);
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.name || !form.code || !form.ministryId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPending ? "Creating…" : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
