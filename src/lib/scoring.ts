import "server-only";

export type Band = "GREEN" | "YELLOW" | "RED";

export function bandFor(score: number): Band {
  if (score >= 75) return "GREEN";
  if (score >= 50) return "YELLOW";
  return "RED";
}

export type ProjectHealthScore = {
  projectId: string;
  progressScore: number;
  financialScore: number;
  overallScore: number;
  band: Band;
};

/**
 * Computes a composite health score (0–100) for an infrastructure project.
 */
export function computeProjectScore(project: {
  originalCost: number;
  expenditure: number;
  physicalProgress: number;
}): ProjectHealthScore {
  const financialRatio = project.originalCost > 0 ? project.expenditure / project.originalCost : 1;
  const financialScore = Math.max(0, Math.min(100, Math.round((1 - Math.max(0, financialRatio - 1)) * 100)));
  const progressScore = Math.max(0, Math.min(100, Math.round(project.physicalProgress)));
  const overallScore = Math.round(progressScore * 0.6 + financialScore * 0.4);

  return {
    projectId: "",
    progressScore,
    financialScore,
    overallScore,
    band: bandFor(overallScore),
  };
}

export async function snapshotAllStudents(): Promise<number> {
  return 0;
}

export async function computeStudentScore(_studentId: string, _companyId: string) {
  return {
    overallScore: 85,
    band: "GREEN" as Band,
  };
}
