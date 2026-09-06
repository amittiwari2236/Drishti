"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/access";
import { askOllama } from "@/lib/ai";

export type Insight = {
  title: string;
  detail: string;
  severity: "info" | "warning" | "critical";
};

export type InsightsResult = {
  metrics: {
    totalProjects: number;
    delayedProjects: number;
    criticalProjects: number;
    onTrackProjects: number;
    costOverrunProjects: number;
  };
  insights: Insight[];
  narrative: string | null;
  source: "ollama" | "heuristic";
};

/** Compute infrastructure portfolio health metrics and derive surveillance insights. */
export async function generateInsights(): Promise<InsightsResult> {
  await requirePermission("analytics:read");

  const [
    totalProjects,
    delayedProjects,
    criticalProjects,
    onTrackProjects,
    allProjects,
  ] = await Promise.all([
    prisma.infrastructureProject.count({ where: { deletedAt: null } }),
    prisma.infrastructureProject.count({ where: { projectStatus: "DELAYED", deletedAt: null } }),
    prisma.infrastructureProject.count({ where: { projectStatus: "CRITICAL", deletedAt: null } }),
    prisma.infrastructureProject.count({ where: { projectStatus: "ON_TRACK", deletedAt: null } }),
    prisma.infrastructureProject.findMany({
      where: { deletedAt: null },
      select: { originalCost: true, expenditure: true },
    }),
  ]);

  const costOverrunProjects = allProjects.filter((p) => p.expenditure > p.originalCost).length;

  const metrics = {
    totalProjects,
    delayedProjects,
    criticalProjects,
    onTrackProjects,
    costOverrunProjects,
  };

  // ── Heuristic insights ──
  const insights: Insight[] = [];

  if (criticalProjects > 0) {
    insights.push({
      title: `${criticalProjects} project${criticalProjects > 1 ? "s" : ""} in Critical Status`,
      detail:
        "These projects exhibit severe milestone slippage or escalating physical-financial divergence.",
      severity: "critical",
    });
  }

  if (delayedProjects > 0) {
    insights.push({
      title: `${delayedProjects} project${delayedProjects > 1 ? "s" : ""} marked as Delayed`,
      detail:
        "Milestones have exceeded planned completion dates. Expedited nodal review recommended.",
      severity: "warning",
    });
  }

  if (costOverrunProjects > 0) {
    insights.push({
      title: `${costOverrunProjects} project${costOverrunProjects > 1 ? "s" : ""} with Cost Overruns`,
      detail:
        "Cumulative financial expenditure has exceeded original sanction budgets.",
      severity: "critical",
    });
  }

  if (insights.length === 0) {
    insights.push({
      title: "National Portfolio is Healthy",
      detail:
        "Active projects are executing on schedule and expenditure remains within sanctions.",
      severity: "info",
    });
  }

  // ── Optional LLM narrative ──
  const prompt = [
    "You are an AI infrastructure analyst advising senior government leadership.",
    "Given these national infrastructure tracking metrics, write 3-4 concise, professional sentences summarizing status and priority actions.",
    "",
    `Total Monitored Projects: ${totalProjects}`,
    `On-Track Projects: ${onTrackProjects}`,
    `Delayed Projects: ${delayedProjects}`,
    `Critical Projects: ${criticalProjects}`,
    `Cost Overruns Detected: ${costOverrunProjects}`,
  ].join("\n");

  const narrative = await askOllama(prompt);

  return {
    metrics,
    insights,
    narrative,
    source: narrative ? "ollama" : "heuristic",
  };
}

