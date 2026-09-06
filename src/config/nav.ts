import {
  LayoutDashboard,
  Building2,
  MapPin,
  Map,
  Landmark,
  FolderKanban,
  Settings,
  type LucideIcon,
  PieChart,
  FileText,
  ClipboardList,
  Globe,
  TrendingUp,
} from "lucide-react";
import type { Role } from "@prisma/client";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

const SDM: Role[] = ["SENIOR_DECISION_MAKER"];
const DEPT: Role[] = ["DEPARTMENT"];
const AGENCY: Role[] = ["AGENCY"];
const SDM_DEPT: Role[] = ["SENIOR_DECISION_MAKER", "DEPARTMENT"];
const ALL_ROLES: Role[] = ["SENIOR_DECISION_MAKER", "DEPARTMENT", "AGENCY"];

export const NAV_GROUPS: NavGroup[] = [
  // ── Overview (all roles, different label per role — handled in sidebar) ──
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ALL_ROLES,
      },
    ],
  },

  // ── National Monitoring (SDM only — zone/state geographic view) ──
  {
    label: "National Monitoring",
    items: [
      {
        title: "Zones",
        href: "/zones",
        icon: Globe,
        roles: SDM,
      },
      {
        title: "States",
        href: "/states",
        icon: MapPin,
        roles: SDM,
      },
    ],
  },

  // ── Projects (all roles — scoped by backend) ──
  {
    label: "Projects",
    items: [
      {
        title: "All Projects",
        href: "/projects",
        icon: FolderKanban,
        roles: SDM,
      },
      {
        title: "My Projects",
        href: "/projects",
        icon: FolderKanban,
        roles: DEPT,
      },
      {
        title: "My Projects",
        href: "/projects",
        icon: FolderKanban,
        roles: AGENCY,
      },
    ],
  },

  // ── Progress Updates (Agency submits, SDM/Dept reviews) ──
  {
    label: "Progress Updates",
    items: [
      {
        title: "Submit Update",
        href: "/updates/new",
        icon: FileText,
        roles: AGENCY,
      },
      {
        title: "My Submissions",
        href: "/updates",
        icon: ClipboardList,
        roles: AGENCY,
      },
      {
        title: "Progress Updates",
        href: "/updates",
        icon: ClipboardList,
        roles: SDM_DEPT,
      },
    ],
  },

  // ── Administration (SDM & Dept) ──
  {
    label: "Administration",
    items: [
      {
        title: "Ministries",
        href: "/ministries",
        icon: Landmark,
        roles: SDM,
      },
      {
        title: "Departments",
        href: "/departments",
        icon: Map,
        roles: SDM,
      },
      {
        title: "Agencies",
        href: "/agencies",
        icon: Building2,
        roles: SDM_DEPT,
      },
    ],
  },

  // ── Insights ──
  {
    label: "Insights",
    items: [
      {
        title: "Analytics",
        href: "/analytics",
        icon: PieChart,
        roles: ALL_ROLES,
      },
      {
        title: "Predictive Monitoring",
        href: "/predictive-monitoring",
        icon: TrendingUp,
        roles: SDM_DEPT,
      },
    ],
  },

  // ── System (SDM only) ──
  {
    label: "System",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        roles: SDM,
      },
    ],
  },
];

/** Returns nav groups containing only the items visible to the given role. */
export function navForRole(role: Role): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}
