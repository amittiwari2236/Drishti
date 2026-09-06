"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { assignProjectToAgency } from "@/features/projects/actions";

interface AgencyOption {
  id: string;
  name: string;
  code: string;
  state?: { name: string } | null;
  department?: { name: string } | null;
}

interface AssignAgencyDialogProps {
  projectId: string;
  projectName: string;
  agencies: AgencyOption[];
  triggerVariant?: "default" | "outline" | "secondary";
  triggerSize?: "default" | "sm" | "lg";
  triggerText?: string;
}

export function AssignAgencyDialog({
  projectId,
  projectName,
  agencies,
  triggerVariant = "default",
  triggerSize = "default",
  triggerText = "Assign to Agency",
}: AssignAgencyDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedAgencyId, setSelectedAgencyId] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredAgencies = agencies.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      (a.state?.name && a.state.name.toLowerCase().includes(q))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgencyId) {
      toast.error("Please select an implementing agency.");
      return;
    }

    startTransition(async () => {
      try {
        await assignProjectToAgency(projectId, selectedAgencyId);
        const selectedAgency = agencies.find((a) => a.id === selectedAgencyId);
        toast.success(
          `Project assigned to ${selectedAgency?.name || "agency"} successfully!`
        );
        setOpen(false);
        router.refresh();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to assign agency");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className="gap-2 shadow-sm bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Building2 className="size-4" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-indigo-600" />
            Assign Implementing Agency
          </DialogTitle>
          <DialogDescription>
            Assign <span className="font-semibold text-foreground">{projectName}</span> to a verified implementing agency.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="agencySearch">Search Agency</Label>
            <Input
              id="agencySearch"
              placeholder="Search by agency name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Agency <span className="text-red-500">*</span></Label>
            <div className="max-h-60 overflow-y-auto rounded-md border p-1 space-y-1">
              {filteredAgencies.length === 0 ? (
                <p className="p-3 text-center text-xs text-muted-foreground">
                  No agencies found matching &quot;{search}&quot;.
                </p>
              ) : (
                filteredAgencies.map((agency) => (
                  <button
                    type="button"
                    key={agency.id}
                    onClick={() => setSelectedAgencyId(agency.id)}
                    className={`w-full text-left p-2.5 rounded text-sm transition-colors flex items-center justify-between ${
                      selectedAgencyId === agency.id
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-medium border border-indigo-200 dark:border-indigo-800"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{agency.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Code: {agency.code} {agency.state?.name ? `· State: ${agency.state.name}` : ""}
                      </p>
                    </div>
                    {selectedAgencyId === agency.id && (
                      <ArrowRight className="size-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
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
              disabled={isPending || !selectedAgencyId}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPending ? "Assigning..." : "Confirm Agency Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
