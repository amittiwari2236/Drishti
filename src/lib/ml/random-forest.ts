import { prisma } from "@/lib/prisma";
import type { MonitoringIndicators } from "@/lib/monitoring";
import { computeMonitoringIndicators } from "@/lib/monitoring";
import modelData from "./random_forest_model.json";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type RiskFactorContribution = {
  factor: string;
  label: string;
  weightPct: number;
  value: string;
  contribution: string;
};

export type RandomForestPrediction = {
  delayProbability: number; // 0.0 to 1.0 (e.g. 0.78)
  delayProbabilityPct: number; // 0 to 100 (e.g. 78.0)
  riskLevel: RiskLevel;
  modelVersion: string;
  topRiskFactors: RiskFactorContribution[];
  treeVotes: {
    delayed: number;
    onTrack: number;
    total: number;
  };
};

type TreeNode = {
  value?: number;
  feature_idx?: number;
  feature_name?: string;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
};

const FEATURE_INDEX_MAP: Record<string, number> = {
  progress_gap: 0,
  progress_velocity: 1,
  cost_overrun_pct: 2,
  expenditure_pct: 3,
  delayed_milestones: 4,
  total_delay_days: 5,
  delay_flag_count: 6,
};

const FACTOR_LABELS: Record<string, string> = {
  progress_gap: "Schedule Timeline Variance",
  progress_velocity: "Monthly Progress Velocity",
  cost_overrun_pct: "Budget Escalation",
  expenditure_pct: "Fund Utilisation Rate",
  delayed_milestones: "Milestones Overdue",
  total_delay_days: "Reported Delay Duration",
  delay_flag_count: "Obstacle Reporting Frequency",
};

/**
 * Traverses a single decision tree to obtain the class probability.
 */
function evaluateTree(node: TreeNode, featureVector: number[]): number {
  if (node.value !== undefined) {
    return node.value;
  }
  if (node.feature_idx === undefined || node.threshold === undefined) {
    return 0.5;
  }
  const val = featureVector[node.feature_idx];
  if (val <= node.threshold) {
    return node.left ? evaluateTree(node.left, featureVector) : (node.value ?? 0.5);
  } else {
    return node.right ? evaluateTree(node.right, featureVector) : (node.value ?? 0.5);
  }
}

/**
 * Evaluates the 100-tree Random Forest ensemble for a project.
 */
export function predictProjectDelay(indicators: MonitoringIndicators): RandomForestPrediction {
  const featureVector: number[] = [
    indicators.progressGap ?? 0,
    indicators.progressVelocity ?? 1.5,
    indicators.costOverrunPct,
    indicators.expenditurePct,
    indicators.delayedMilestones,
    indicators.totalDelayDays,
    indicators.delayFlagCount,
  ];

  const trees = modelData.trees as TreeNode[];
  let delayedVotes = 0;
  let onTrackVotes = 0;
  let probSum = 0;

  for (const tree of trees) {
    const leafProb = evaluateTree(tree, featureVector);
    probSum += leafProb;
    if (leafProb >= 0.5) {
      delayedVotes++;
    } else {
      onTrackVotes++;
    }
  }

  const avgProb = trees.length > 0 ? probSum / trees.length : 0.5;
  const delayProbabilityPct = parseFloat((avgProb * 100).toFixed(1));

  let riskLevel: RiskLevel = "LOW";
  if (avgProb >= 0.6) {
    riskLevel = "HIGH";
  } else if (avgProb >= 0.35) {
    riskLevel = "MEDIUM";
  }

  // Determine top contributing risk factors based on feature values and Gini weights
  const importances = (modelData.feature_importances as Record<string, number>) || {};
  const factors: RiskFactorContribution[] = [];

  if (indicators.totalDelayDays > 0) {
    factors.push({
      factor: "total_delay_days",
      label: FACTOR_LABELS["total_delay_days"],
      weightPct: Math.round((importances["total_delay_days"] || 0.23) * 100),
      value: `${indicators.totalDelayDays} days logged`,
      contribution: `${indicators.totalDelayDays} days of documented impediments`,
    });
  }

  if (indicators.progressGap !== null && indicators.progressGap > 2) {
    factors.push({
      factor: "progress_gap",
      label: FACTOR_LABELS["progress_gap"],
      weightPct: Math.round((importances["progress_gap"] || 0.22) * 100),
      value: `+${indicators.progressGap.toFixed(1)}pp behind`,
      contribution: `Actual pace lags expected timeline by ${indicators.progressGap.toFixed(1)} percentage points`,
    });
  }

  if (indicators.progressVelocity !== null && indicators.progressVelocity < 1.2) {
    factors.push({
      factor: "progress_velocity",
      label: FACTOR_LABELS["progress_velocity"],
      weightPct: Math.round((importances["progress_velocity"] || 0.20) * 100),
      value: `+${indicators.progressVelocity}% / mo`,
      contribution: `Advancement rate below 1.2% per monthly reporting cycle`,
    });
  }

  if (indicators.delayedMilestones > 0) {
    factors.push({
      factor: "delayed_milestones",
      label: FACTOR_LABELS["delayed_milestones"],
      weightPct: Math.round((importances["delayed_milestones"] || 0.05) * 100),
      value: `${indicators.delayedMilestones} overdue`,
      contribution: `${indicators.delayedMilestones} critical milestone(s) past planned date`,
    });
  }

  if (indicators.costOverrunPct > 10) {
    factors.push({
      factor: "cost_overrun_pct",
      label: FACTOR_LABELS["cost_overrun_pct"],
      weightPct: Math.round((importances["cost_overrun_pct"] || 0.11) * 100),
      value: `+${indicators.costOverrunPct.toFixed(1)}%`,
      contribution: `Sanctioned cost revised upwards by ${indicators.costOverrunPct.toFixed(1)}%`,
    });
  }

  // Sort factors by importance weight
  factors.sort((a, b) => b.weightPct - a.weightPct);

  return {
    delayProbability: parseFloat(avgProb.toFixed(3)),
    delayProbabilityPct,
    riskLevel,
    modelVersion: modelData.model_version || "rf-v1.0",
    topRiskFactors: factors,
    treeVotes: {
      delayed: delayedVotes,
      onTrack: onTrackVotes,
      total: trees.length,
    },
  };
}

/**
 * Batch evaluates all projects in the database and updates their RiskPrediction records.
 */
export async function syncAllProjectPredictions() {
  const projects = await prisma.infrastructureProject.findMany({
    include: {
      milestones: true,
      progressUpdates: {
        where: { deletedAt: null },
        orderBy: { reportingDate: "asc" },
      },
    },
  });

  for (const project of projects) {
    const indicators = computeMonitoringIndicators({
      updates: project.progressUpdates,
      milestones: project.milestones,
      originalCost: project.originalCost,
      revisedCost: project.revisedCost,
      expenditure: project.expenditure,
      startDate: project.startDate,
      plannedCompletionDate: project.plannedCompletionDate,
    });

    const prediction = predictProjectDelay(indicators);

    const existing = await prisma.riskPrediction.findFirst({
      where: { projectId: project.id },
    });

    const predictionPayload = {
      projectId: project.id,
      predictionDate: new Date(),
      delayProbability: prediction.delayProbability,
      riskLevel: prediction.riskLevel,
      modelVersion: prediction.modelVersion,
      indicators: {
        delayProbabilityPct: prediction.delayProbabilityPct,
        topRiskFactors: prediction.topRiskFactors,
        treeVotes: prediction.treeVotes,
        featureVector: {
          progress_gap: indicators.progressGap,
          progress_velocity: indicators.progressVelocity,
          cost_overrun_pct: indicators.costOverrunPct,
          expenditure_pct: indicators.expenditurePct,
          delayed_milestones: indicators.delayedMilestones,
          total_delay_days: indicators.totalDelayDays,
          delay_flag_count: indicators.delayFlagCount,
        },
      },
    };

    if (existing) {
      await prisma.riskPrediction.update({
        where: { id: existing.id },
        data: predictionPayload,
      });
    } else {
      await prisma.riskPrediction.create({
        data: predictionPayload,
      });
    }
  }

  return { success: true, count: projects.length };
}
