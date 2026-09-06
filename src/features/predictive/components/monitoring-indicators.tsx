import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Clock,
  Coins,
  Gauge,
  CalendarDays,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MonitoringIndicators } from "@/lib/monitoring";
import type { RandomForestPrediction } from "@/lib/ml/random-forest";

export function MonitoringIndicatorsPanel({
  indicators,
  projectCode,
  delayHistory,
  prediction,
}: {
  indicators: MonitoringIndicators;
  projectCode: string;
  delayHistory: Array<{
    date: string;
    progress: number;
    delayCategory: string | null;
    delayDays: number | null;
    delayReason: string | null;
  }>;
  prediction?: RandomForestPrediction | null;
}) {
  const isDelayed = indicators.progressGap !== null && indicators.progressGap > 0;

  return (
    <div className="space-y-6">
      {/* Random Forest Prediction Banner / Status */}
      {prediction ? (
        <div className={`rounded-xl border p-5 ${
          prediction.riskLevel === "HIGH"
            ? "border-rose-300/80 bg-rose-50/50 dark:border-rose-900/60 dark:bg-rose-950/20"
            : prediction.riskLevel === "MEDIUM"
            ? "border-amber-300/80 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/20"
            : "border-emerald-300/80 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-lg ${
                prediction.riskLevel === "HIGH"
                  ? "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300"
                  : prediction.riskLevel === "MEDIUM"
                  ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
              }`}>
                <Cpu className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-foreground">
                    Random Forest Delay Risk Assessment
                  </h4>
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold px-2.5 py-0.5 ${
                      prediction.riskLevel === "HIGH"
                        ? "border-rose-400 bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200"
                        : prediction.riskLevel === "MEDIUM"
                        ? "border-amber-400 bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                        : "border-emerald-400 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                    }`}
                  >
                    {prediction.delayProbabilityPct}% {prediction.riskLevel} RISK
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  100-Tree ensemble consensus: <span className="font-semibold text-foreground">{prediction.treeVotes.delayed}</span> of {prediction.treeVotes.total} trees predicted significant schedule delay.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 flex flex-col items-end">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-background border border-border text-foreground">
                Model: {prediction.modelVersion}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1">
                Evaluated with 7 project telemetry features
              </span>
            </div>
          </div>

          {/* Top Contributing Risk Drivers */}
          {prediction.topRiskFactors.length > 0 && (
            <div className="pt-3.5 space-y-2">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Key Factors Influencing Random Forest Probability:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {prediction.topRiskFactors.slice(0, 3).map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-background/80 border border-border text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{factor.label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {factor.weightPct}% weight
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-tight">
                      {factor.contribution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-muted/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-background border border-border text-muted-foreground">
              <Cpu className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Predictive Analytics Engine Status
                </h4>
                <Badge variant="outline" className="text-[11px] font-mono border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                  Model: Initializing
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                Random Forest predictive model evaluation in progress.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Variance Warnings if applicable */}
      {indicators.hasRiskSignal && (
        <div className="rounded-lg border border-amber-300/80 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Active Schedule & Resource Variance Signals ({indicators.riskReasons.length})
            </h4>
          </div>
          <ul className="space-y-1">
            {indicators.riskReasons.map((reason, i) => (
              <li key={i} className="text-xs text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-500" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Schedule Gap */}
        <Card className="border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              Schedule Gap
            </span>
            <div className="text-lg font-bold">
              {indicators.progressGap !== null ? (
                <span className={isDelayed ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"}>
                  {indicators.progressGap > 0 ? `-${indicators.progressGap.toFixed(1)}pp` : `+${Math.abs(indicators.progressGap).toFixed(1)}pp`}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {indicators.expectedProgress !== null ? `Exp: ${indicators.expectedProgress}%` : "No baseline"}
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Progress Velocity */}
        <Card className="border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Gauge className="size-3.5" />
              Velocity
            </span>
            <div className="text-lg font-bold">
              {indicators.progressVelocity !== null ? (
                <span>+{indicators.progressVelocity}%</span>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Avg gain / cycle</p>
          </CardContent>
        </Card>

        {/* Metric 3: Cost Variance */}
        <Card className="border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Coins className="size-3.5" />
              Cost Variance
            </span>
            <div className="text-lg font-bold">
              {indicators.costOverrunPct > 0 ? (
                <span className="text-amber-600 dark:text-amber-400">+{indicators.costOverrunPct.toFixed(1)}%</span>
              ) : (
                <span className="text-emerald-600">0.0%</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Revised vs original</p>
          </CardContent>
        </Card>

        {/* Metric 4: Financial Burn */}
        <Card className="border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Coins className="size-3.5" />
              Fund Utilised
            </span>
            <div className="text-lg font-bold">{indicators.expenditurePct.toFixed(1)}%</div>
            <p className="text-[10px] text-muted-foreground">Of effective cost</p>
          </CardContent>
        </Card>

        {/* Metric 5: Delayed Milestones */}
        <Card className="border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Clock className="size-3.5" />
              Overdue Milestones
            </span>
            <div className="text-lg font-bold">
              {indicators.delayedMilestones > 0 ? (
                <span className="text-rose-600">{indicators.delayedMilestones}</span>
              ) : (
                <span className="text-emerald-600">0</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">Past planned date</p>
          </CardContent>
        </Card>

        {/* Metric 6: Total Delay Days */}
        <Card className="border-border">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <ShieldAlert className="size-3.5" />
              Logged Delays
            </span>
            <div className="text-lg font-bold">
              {indicators.totalDelayDays > 0 ? (
                <span className="text-amber-600 dark:text-amber-400">{indicators.totalDelayDays}d</span>
              ) : (
                <span className="text-emerald-600">0d</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">{indicators.delayFlagCount} reported events</p>
          </CardContent>
        </Card>
      </div>

      {/* Delay History Log */}
      {delayHistory.some((h) => h.delayCategory || (h.delayDays ?? 0) > 0) && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Reported Impediments & Delay Log</CardTitle>
            <CardDescription className="text-xs">
              Historical obstacles and impact estimates captured during monthly progress updates
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Reporting Date</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3">Delay Category</th>
                  <th className="py-2.5 px-3">Impact</th>
                  <th className="py-2.5 px-4">Specifics & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {delayHistory
                  .filter((h) => h.delayCategory || (h.delayDays ?? 0) > 0)
                  .map((h, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="py-2.5 px-4 font-mono text-[11px]">{h.date}</td>
                      <td className="py-2.5 px-3 font-medium">{h.progress.toFixed(1)}%</td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30">
                          {h.delayCategory || "Unspecified"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-amber-600">
                        {h.delayDays ? `${h.delayDays} days` : "—"}
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground">
                        {h.delayReason || "No details provided"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
