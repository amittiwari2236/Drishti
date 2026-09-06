"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderPlus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { assignProjectToDepartment } from "@/features/projects/actions";

interface OptionItem {
  id: string;
  name: string;
  code?: string;
  ministry?: { name: string };
}

interface AssignProjectDialogProps {
  states: OptionItem[];
  sectors: OptionItem[];
  departments: OptionItem[];
  triggerVariant?: "default" | "outline";
}

export function AssignProjectDialog({
  states,
  sectors,
  departments,
  triggerVariant = "default",
}: AssignProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    projectName: "",
    projectId: "",
    description: "",
    stateId: "",
    sectorId: "",
    departmentId: "",
    originalCost: "",
    startDate: "",
    plannedCompletionDate: "",
  });

  const resetForm = () => {
    setForm({
      projectName: "",
      projectId: "",
      description: "",
      stateId: "",
      sectorId: "",
      departmentId: "",
      originalCost: "",
      startDate: "",
      plannedCompletionDate: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectName || !form.projectId || !form.stateId || !form.sectorId || !form.departmentId || !form.originalCost) {
      toast.error("Please fill in all required fields.");
      return;
    }

    startTransition(async () => {
      try {
        await assignProjectToDepartment({
          projectName: form.projectName.trim(),
          projectId: form.projectId.trim(),
          description: form.description.trim() || undefined,
          stateId: form.stateId,
          sectorId: form.sectorId,
          departmentId: form.departmentId,
          originalCost: parseFloat(form.originalCost),
          startDate: form.startDate || undefined,
          plannedCompletionDate: form.plannedCompletionDate || undefined,
        });

        toast.success(`Project "${form.projectName}" assigned to Department successfully!`);
        resetForm();
        setOpen(false);
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to assign project");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className="gap-2 shadow-sm">
          <FolderPlus className="size-4" />
          Assign Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-indigo-600" />
            Assign New Project to Department
          </DialogTitle>
          <DialogDescription>
            Enter real project specifications and assign oversight to a Central/State Department.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="projectName">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectName"
                placeholder="e.g., Delhi-Varanasi High Speed Rail Corridor"
                value={form.projectName}
                onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                required
              />
            </div>

            {/* External / PAIMANA ID */}
            <div className="space-y-1.5">
              <Label htmlFor="projectId">
                Project Code / ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectId"
                placeholder="e.g., HSR-DV-001"
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                required
              />
            </div>

            {/* Original Cost (Cr) */}
            <div className="space-y-1.5">
              <Label htmlFor="originalCost">
                Sanctioned Cost (₹ Crores) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="originalCost"
                type="number"
                step="0.01"
                min="0.1"
                placeholder="e.g., 52400.00"
                value={form.originalCost}
                onChange={(e) => setForm({ ...form, originalCost: e.target.value })}
                required
              />
            </div>

            {/* Department Assignment */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="departmentId">
                Assign to Department <span className="text-red-500">*</span>
              </Label>
              <select
                id="departmentId"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                required
              >
                <option value="">— Select Department —</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} {dept.ministry?.name ? `(${dept.ministry.name})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <Label htmlFor="stateId">
                State / Location <span className="text-red-500">*</span>
              </Label>
              <select
                id="stateId"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.stateId}
                onChange={(e) => setForm({ ...form, stateId: e.target.value })}
                required
              >
                <option value="">— Select State —</option>
                {states.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Sector */}
            <div className="space-y-1.5">
              <Label htmlFor="sectorId">
                Sector <span className="text-red-500">*</span>
              </Label>
              <select
                id="sectorId"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.sectorId}
                onChange={(e) => setForm({ ...form, sectorId: e.target.value })}
                required
              >
                <option value="">— Select Sector —</option>
                {sectors.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Sanction / Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plannedCompletionDate">Target Completion Date</Label>
              <Input
                id="plannedCompletionDate"
                type="date"
                value={form.plannedCompletionDate}
                onChange={(e) => setForm({ ...form, plannedCompletionDate: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="description">Project Description / Scope</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Scope details, strategic significance, and key deliverables..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
              {isPending ? "Assigning Project..." : "Assign Project to Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
