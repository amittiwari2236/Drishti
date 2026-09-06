import type {
  Role,
  ProjectStatus,
  MilestoneStatus,
} from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  SENIOR_DECISION_MAKER: "Senior Decision Maker",
  DEPARTMENT: "Department Officer",
  AGENCY: "Agency Officer",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  APPROVED: "Approved",
  UNDER_IMPLEMENTATION: "Under Implementation",
  ON_TRACK: "On Track",
  DELAYED: "Delayed",
  CRITICAL: "Critical",
  COMPLETED: "Completed",
  SUSPENDED: "Suspended",
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  DELAYED: "Delayed",
};

/** Tailwind classes for status-badge variants. */
export const STATUS_BADGE_STYLES: Record<string, string> = {
  // project statuses
  PLANNING: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  APPROVED: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  UNDER_IMPLEMENTATION: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  ON_TRACK: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  DELAYED: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  CRITICAL: "bg-red-500/10 text-red-600 border-red-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  SUSPENDED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  
  // milestones
  PENDING: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

/** Role badge colors for UI */
export const ROLE_BADGE_STYLES: Record<Role, string> = {
  SENIOR_DECISION_MAKER: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  DEPARTMENT: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  AGENCY: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};
