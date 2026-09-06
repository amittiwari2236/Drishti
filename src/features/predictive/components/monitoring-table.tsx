"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export type ProjectMonitoringRow = {
  id: string;
  projectId: string; // Code e.g. 701415
  projectName: string;
  stateName: string;
  sectorName: string;
  departmentName: string | null;
  agencyName: string | null;
  startDate: string | null;
  plannedCompletionDate: string | null;
  originalCost: number;
  revisedCost: number | null;
  expenditure: number;
  physicalProgress: number;
  expectedProgress: number | null;
  progressGap: number | null;
  progressVelocity: number | null;
  costOverrunPct: number;
  expenditurePct: number;
  delayedMilestones: number;
  totalDelayDays: number;
  delayCategories: string[];
  hasRiskSignal: boolean;
  riskReasons: string[];
  updatesCount: number;
  delayProbability: number | null;
  delayProbabilityPct: number | null;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | null;
  topRiskFactors: Array<{ factor: string; label: string; weightPct: number; value: string; contribution: string }> | null;
};

export function MonitoringTable({ projects }: { projects: ProjectMonitoringRow[] }) {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SIGNAL" | "ON_TRACK" | "NO_DATA">("ALL");

  const sectors = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.sectorName))).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.projectName.toLowerCase().includes(q) ||
        p.projectId.toLowerCase().includes(q) ||
        p.stateName.toLowerCase().includes(q) ||
        (p.agencyName && p.agencyName.toLowerCase().includes(q));

      const matchesSector = sectorFilter === "ALL" || p.sectorName === sectorFilter;

      let matchesStatus = true;
      if (statusFilter === "SIGNAL") {
        matchesStatus = p.hasRiskSignal;
      } else if (statusFilter === "ON_TRACK") {
        matchesStatus = !p.hasRiskSignal && p.updatesCount > 0;
      } else if (statusFilter === "NO_DATA") {
        matchesStatus = p.updatesCount === 0;
      }

      return matchesSearch && matchesSector && matchesStatus;
    });
  }, [projects, search, sectorFilter, statusFilter]);

  return (
    <Card className="border-border">
      <CardHeader className="border-b bg-muted/20 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-base">Project Predictive Monitoring Matrix</CardTitle>
            <CardDescription className="text-xs">
              Derived progress velocity, timeline variance, and schedule impediment metrics
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search project, code, state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* Sector Filter */}
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              aria-label="Filter by Sector"
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Sectors</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Risk / Signal Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter by Schedule Signal"
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="ALL">All Statuses ({projects.length})</option>
              <option value="SIGNAL">Schedule Variance Alert ({projects.filter((p) => p.hasRiskSignal).length})</option>
              <option value="ON_TRACK">On Track ({projects.filter((p) => !p.hasRiskSignal && p.updatesCount > 0).length})</option>
              <option value="NO_DATA">Awaiting Updates ({projects.filter((p) => p.updatesCount === 0).length})</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground font-medium border-b uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Project / Code</th>
                <th className="py-3 px-3">Sector & State</th>
                <th className="py-3 px-3">Actual vs Expected</th>
                <th className="py-3 px-3">Schedule Gap</th>
                <th className="py-3 px-3">Velocity</th>
                <th className="py-3 px-3">Cost Overrun</th>
                <th className="py-3 px-3">Milestone Delays</th>
                <th className="py-3 px-3">Monitoring Signal</th>
                <th className="py-3 px-3">ML Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    No matching projects found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isBehind = p.progressGap !== null && p.progressGap > 5;
                  const isOnTrack = p.progressGap !== null && p.progressGap <= 5 && p.progressGap >= -5;
                  const isAhead = p.progressGap !== null && p.progressGap < -5;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Project Name & Code */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-semibold text-foreground truncate" title={p.projectName}>
                          {p.projectName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                          <span className="font-mono bg-muted px-1.5 py-0.2 rounded text-[10px]">
                            {p.projectId}
                          </span>
                          {p.agencyName && <span>• {p.agencyName}</span>}
                        </div>
                      </td>

                      {/* Sector & State */}
                      <td className="py-3 px-3">
                        <div className="text-foreground">{p.sectorName}</div>
                        <div className="text-muted-foreground text-[11px]">{p.stateName}</div>
                      </td>

                      {/* Actual vs Expected */}
                      <td className="py-3 px-3 min-w-[130px]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-foreground">{p.physicalProgress.toFixed(1)}%</span>
                          {p.expectedProgress !== null ? (
                            <span className="text-muted-foreground text-[10px]">
                              Exp: {p.expectedProgress.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">No timeline</span>
                          )}
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isBehind ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, p.physicalProgress)}%` }}
                          />
                        </div>
                      </td>

                      {/* Schedule Gap */}
                      <td className="py-3 px-3">
                        {p.progressGap !== null ? (
                          <div className="flex items-center gap-1">
                            {p.progressGap > 0 ? (
                              <span className="inline-flex items-center text-amber-600 dark:text-amber-400 font-medium">
                                <TrendingDown className="size-3.5 mr-0.5" />
                                -{p.progressGap.toFixed(1)}pp
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                                <TrendingUp className="size-3.5 mr-0.5" />
                                +{Math.abs(p.progressGap).toFixed(1)}pp
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Velocity */}
                      <td className="py-3 px-3">
                        {p.progressVelocity !== null ? (
                          <span className="font-mono text-foreground font-medium">
                            {p.progressVelocity > 0 ? `+${p.progressVelocity}` : p.progressVelocity}% / mo
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Cost Overrun */}
                      <td className="py-3 px-3">
                        {p.costOverrunPct > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium font-mono">
                            +{p.costOverrunPct.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono">0%</span>
                        )}
                      </td>

                      {/* Milestone Delays */}
                      <td className="py-3 px-3">
                        {p.delayedMilestones > 0 ? (
                          <Badge variant="outline" className="text-rose-600 border-rose-300 bg-rose-50/50 dark:border-rose-900/60 dark:bg-rose-950/20 text-[10px]">
                            {p.delayedMilestones} Delayed
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">None</span>
                        )}
                      </td>

                      {/* Monitoring Signal */}
                      <td className="py-3 px-3">
                        {p.hasRiskSignal ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="size-3.5 text-amber-500" />
                              Variance Alert
                            </span>
                            <span className="text-[10px] text-muted-foreground leading-tight">
                              {p.riskReasons[0]}
                            </span>
                          </div>
                        ) : p.updatesCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle className="size-3.5" />
                            On Track
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Awaiting Update</span>
                        )}
                      </td>

                      {/* ML Status */}
                      <td className="py-3 px-3">
                        {p.riskLevel ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold flex items-center gap-1 w-fit ${
                                p.riskLevel === "HIGH"
                                  ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                                  : p.riskLevel === "MEDIUM"
                                  ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                                  : "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                              }`}
                              title={p.topRiskFactors?.[0]?.contribution || `Random Forest Probability: ${p.delayProbabilityPct}%`}
                            >
                              <Cpu className="size-3" />
                              {p.delayProbabilityPct}% {p.riskLevel}
                            </Badge>
                            {p.topRiskFactors && p.topRiskFactors.length > 0 && (
                              <span className="text-[9px] text-muted-foreground truncate max-w-[125px]" title={p.topRiskFactors[0].contribution}>
                                {p.topRiskFactors[0].label}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] font-mono text-muted-foreground">
                            Evaluating
                          </Badge>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/projects/${p.id}#predictive`}
                          className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
                        >
                          Details
                          <ExternalLink className="size-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
