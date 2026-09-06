"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DELAY_CATEGORIES } from "@/lib/monitoring";

function SubmitUpdateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProjectId = searchParams.get("projectId") ?? "";

  const [projects, setProjects] = useState<{ id: string; projectName: string; projectId: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    projectId: preselectedProjectId,
    reportingDate: new Date().toISOString().split("T")[0],
    physicalProgress: "",
    expenditure: "",
    remarks: "",
    delayCategory: "",
    delayDays: "",
    delayReason: "",
  });

  useEffect(() => {
    fetch("/api/agency/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => setProjects([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/agency/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: form.projectId,
          reportingDate: form.reportingDate,
          physicalProgress: parseFloat(form.physicalProgress),
          expenditure: parseFloat(form.expenditure),
          remarks: form.remarks || null,
          delayCategory: form.delayCategory || null,
          delayDays: form.delayDays ? parseInt(form.delayDays, 10) : null,
          delayReason: form.delayReason || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to submit update.");
      }

      setSuccess(true);
      setTimeout(() => router.push("/updates"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <CheckCircle2 className="size-16 text-emerald-500" />
        <h2 className="text-xl font-semibold">Update Submitted Successfully!</h2>
        <p className="text-muted-foreground text-sm">Redirecting to your submissions...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/updates"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Updates
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <FileText className="size-6 text-emerald-600" />
          Submit Progress Update
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Report the latest physical progress and expenditure for a project.
        </p>
      </div>

      <Card className="max-w-2xl border-emerald-200/60 dark:border-emerald-900/40">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-base">Update Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Project */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="projectId">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                id="projectId"
                required
                value={form.projectId}
                onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">— Select a project —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.projectId})
                  </option>
                ))}
              </select>
              {projects.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Loading projects... or you have no projects assigned.
                </p>
              )}
            </div>

            {/* Reporting Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="reportingDate">
                Reporting Date <span className="text-red-500">*</span>
              </label>
              <input
                id="reportingDate"
                type="date"
                required
                value={form.reportingDate}
                onChange={(e) => setForm((f) => ({ ...f, reportingDate: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Physical Progress */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="physicalProgress">
                Physical Progress (%) <span className="text-red-500">*</span>
              </label>
              <input
                id="physicalProgress"
                type="number"
                required
                min={0}
                max={100}
                step={0.01}
                placeholder="e.g. 75.5"
                value={form.physicalProgress}
                onChange={(e) => setForm((f) => ({ ...f, physicalProgress: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Expenditure */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="expenditure">
                Cumulative Expenditure (₹ Crores) <span className="text-red-500">*</span>
              </label>
              <input
                id="expenditure"
                type="number"
                required
                min={0}
                step={0.01}
                placeholder="e.g. 12500"
                value={form.expenditure}
                onChange={(e) => setForm((f) => ({ ...f, expenditure: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="remarks">
                Remarks / Notes
              </label>
              <textarea
                id="remarks"
                rows={3}
                placeholder="Any notable observations, issues, or highlights..."
                value={form.remarks}
                onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Delay & Risk Reporting (Optional) */}
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                    Delay & Impediment Tracking (Optional)
                  </h3>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                    If this reporting period encountered obstacles or schedule variance, capture the details below for predictive monitoring.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground" htmlFor="delayCategory">
                    Primary Delay Reason / Category
                  </label>
                  <select
                    id="delayCategory"
                    value={form.delayCategory}
                    onChange={(e) => setForm((f) => ({ ...f, delayCategory: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">— No Delay / Normal Progress —</option>
                    {DELAY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground" htmlFor="delayDays">
                    Estimated Delay Impact (Days)
                  </label>
                  <input
                    id="delayDays"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="e.g. 15"
                    value={form.delayDays}
                    onChange={(e) => setForm((f) => ({ ...f, delayDays: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {form.delayCategory && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground" htmlFor="delayReason">
                    Delay Specifics & Corrective Measures Taken
                  </label>
                  <input
                    id="delayReason"
                    type="text"
                    placeholder="e.g. Subcontractor machinery breakdown at pier 4; spares expedited"
                    value={form.delayReason}
                    onChange={(e) => setForm((f) => ({ ...f, delayReason: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Submitting..." : "Submit Update"}
              </button>
              <Link
                href="/updates"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export default function SubmitUpdatePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading...</div>}>
      <SubmitUpdateForm />
    </Suspense>
  );
}
