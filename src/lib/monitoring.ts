/**
 * src/lib/monitoring.ts
 *
 * Pure functions for deriving project monitoring indicators from historical
 * progress data. These are OBSERVED/DERIVED indicators — NOT ML predictions.
 *
 * Called from RSC pages and server actions. Never exposes fake risk scores.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export const DELAY_CATEGORIES = [
  "Weather / Natural Calamity",
  "Land Acquisition",
  "Funding / Approval Delay",
  "Material Supply",
  "Contractor Delay",
  "Equipment Failure",
  "Labour Shortage",
  "Environmental Clearance",
  "Law & Order",
  "Other",
] as const;

export type DelayCategory = (typeof DELAY_CATEGORIES)[number];

export type ProgressRecord = {
  id: string;
  reportingDate: Date;
  physicalProgress: number;
  expenditure: number;
  remarks: string | null;
  delayCategory: string | null;
  delayReason: string | null;
  delayDays: number | null;
};

export type MilestoneRecord = {
  plannedDate: Date | null;
  actualDate: Date | null;
  status: string;
};

export type MonitoringIndicators = {
  /** Latest physical progress % */
  latestProgress: number;
  /** Previous progress % (second-most-recent update) */
  previousProgress: number | null;
  /** Change in progress between last two reports */
  progressChange: number | null;
  /** Average progress gain per reporting period */
  progressVelocity: number | null;
  /** Linearly interpolated expected progress at today's date */
  expectedProgress: number | null;
  /** Gap: expected − actual (positive = behind schedule) */
  progressGap: number | null;
  /** Cost overrun % = ((revisedCost − originalCost) / originalCost) × 100 */
  costOverrunPct: number;
  /** Expenditure utilisation % = (expenditure / effectiveCost) × 100 */
  expenditurePct: number;
  /** Number of milestones past planned date without actual completion */
  delayedMilestones: number;
  /** Distinct delay categories reported */
  delayCategories: string[];
  /** Total reported delay days across all updates */
  totalDelayDays: number;
  /** Number of reporting periods where a delay was flagged */
  delayFlagCount: number;
  /** true if ≥ 1 indicator suggests the project is at risk */
  hasRiskSignal: boolean;
  /** Human-readable list of triggered risk reasons */
  riskReasons: string[];
};

// ── Core computation ──────────────────────────────────────────────────────────

/**
 * Compute the linearly interpolated "expected progress" for today based on
 * the project's planned timeline.
 *
 * Returns null if start or planned-completion dates are missing.
 */
export function computeExpectedProgress(
  startDate: Date | null,
  plannedCompletionDate: Date | null,
  asOf: Date = new Date()
): number | null {
  if (!startDate || !plannedCompletionDate) return null;

  const total = plannedCompletionDate.getTime() - startDate.getTime();
  if (total <= 0) return null;

  const elapsed = asOf.getTime() - startDate.getTime();
  const pct = (elapsed / total) * 100;

  return Math.max(0, Math.min(100, parseFloat(pct.toFixed(1))));
}

/**
 * Main function — derives all monitoring indicators from a project's
 * raw update history and static attributes.
 *
 * Updates MUST be sorted ascending by reportingDate before calling.
 */
export function computeMonitoringIndicators(params: {
  updates: ProgressRecord[];
  milestones: MilestoneRecord[];
  originalCost: number;
  revisedCost: number | null;
  expenditure: number;
  startDate: Date | null;
  plannedCompletionDate: Date | null;
  asOf?: Date;
}): MonitoringIndicators {
  const {
    updates,
    milestones,
    originalCost,
    revisedCost,
    expenditure,
    startDate,
    plannedCompletionDate,
    asOf = new Date(),
  } = params;

  const effectiveCost = revisedCost ?? originalCost;

  // ── Progress metrics ──
  const sorted = [...updates].sort(
    (a, b) => a.reportingDate.getTime() - b.reportingDate.getTime()
  );

  const latestUpdate = sorted.at(-1);
  const previousUpdate = sorted.at(-2);

  const latestProgress = latestUpdate?.physicalProgress ?? 0;
  const previousProgress = previousUpdate?.physicalProgress ?? null;

  const progressChange =
    previousProgress !== null ? latestProgress - previousProgress : null;

  const progressVelocity =
    sorted.length >= 2
      ? parseFloat(
          (
            (latestProgress - (sorted[0]?.physicalProgress ?? 0)) /
            (sorted.length - 1)
          ).toFixed(2)
        )
      : null;

  // ── Expected progress ──
  const expectedProgress = computeExpectedProgress(
    startDate,
    plannedCompletionDate,
    asOf
  );

  const progressGap =
    expectedProgress !== null
      ? parseFloat((expectedProgress - latestProgress).toFixed(1))
      : null;

  // ── Financial ──
  const costOverrunPct =
    originalCost > 0
      ? parseFloat(
          (((effectiveCost - originalCost) / originalCost) * 100).toFixed(2)
        )
      : 0;

  const expenditurePct =
    effectiveCost > 0
      ? parseFloat(((expenditure / effectiveCost) * 100).toFixed(1))
      : 0;

  // ── Milestone delays ──
  const today = asOf;
  const delayedMilestones = milestones.filter(
    (m) =>
      m.plannedDate &&
      m.plannedDate < today &&
      m.status !== "COMPLETED" &&
      !m.actualDate
  ).length;

  // ── Delay reason analytics ──
  const delayCategories = [
    ...new Set(
      updates
        .filter((u) => u.delayCategory)
        .map((u) => u.delayCategory as string)
    ),
  ];

  const totalDelayDays = updates.reduce((sum, u) => sum + (u.delayDays ?? 0), 0);
  const delayFlagCount = updates.filter(
    (u) => u.delayCategory || (u.delayDays ?? 0) > 0
  ).length;

  // ── Risk signal heuristics ──
  const riskReasons: string[] = [];

  if (progressGap !== null && progressGap > 10)
    riskReasons.push(`Progress gap of ${progressGap.toFixed(1)}pp (behind schedule)`);

  if (progressChange !== null && progressChange < 1)
    riskReasons.push("Progress stalled (< 1pp change last period)");

  if (costOverrunPct > 10)
    riskReasons.push(`Cost overrun of ${costOverrunPct.toFixed(1)}%`);

  if (delayedMilestones > 0)
    riskReasons.push(`${delayedMilestones} milestone(s) past planned date`);

  if (totalDelayDays > 30)
    riskReasons.push(`${totalDelayDays} total reported delay days`);

  return {
    latestProgress,
    previousProgress,
    progressChange,
    progressVelocity,
    expectedProgress,
    progressGap,
    costOverrunPct,
    expenditurePct,
    delayedMilestones,
    delayCategories,
    totalDelayDays,
    delayFlagCount,
    hasRiskSignal: riskReasons.length > 0,
    riskReasons,
  };
}

/**
 * Compute a serialisable feature vector for eventual Random Forest input.
 * Returns a plain object ready to be stored in RiskPrediction.indicators JSON.
 *
 * NOTE: This is a STUB — the actual feature engineering should be done
 * by the data science team once the historical dataset is available.
 */
export function computeFeatureVector(
  indicators: MonitoringIndicators,
  numUpdates: number
): Record<string, number | null> {
  return {
    latest_progress: indicators.latestProgress,
    progress_change: indicators.progressChange,
    progress_velocity: indicators.progressVelocity,
    progress_gap: indicators.progressGap,
    expected_progress: indicators.expectedProgress,
    cost_overrun_pct: indicators.costOverrunPct,
    expenditure_pct: indicators.expenditurePct,
    delayed_milestones: indicators.delayedMilestones,
    total_delay_days: indicators.totalDelayDays,
    delay_flag_count: indicators.delayFlagCount,
    num_updates: numUpdates,
    // target: delayed (0/1) — to be labelled by the data science team
  };
}
