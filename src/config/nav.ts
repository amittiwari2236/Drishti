import {
  LayoutDashboard,
  Building2,
  Layers,
  FolderKanban,
  GraduationCap,
  UserCog,
  ListTodo,
  Compass,
  CalendarDays,
  KanbanSquare,
  NotebookPen,
  CalendarCheck,
  ClipboardCheck,
  BarChart3,
  FileText,
  FileBox,
  History,
  Settings,
  Sparkles,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@prisma/client";
import type { Permission } from "@/lib/permission-constants";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
  permission?: Permission;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "feature:dashboard",
      },
    ],
  },
  {
    label: "Work & Tracking",
    items: [
      {
        title: "Event Track (Kanban)",
        href: "/kanban",
        icon: KanbanSquare,
        permission: "feature:kanban",
      },
      {
        title: "Tasks",
        href: "/tasks",
        icon: ListTodo,
        permission: "feature:tasks",
      },
      {
        title: "Events",
        href: "/propose",
        icon: Compass,
        permission: "feature:propose",
      },
      {
        title: "Reviews",
        href: "/reviews",
        icon: ClipboardCheck,
        permission: "feature:reviews",
      },
    ],
  },
  {
    label: "Super Admin & System",
    items: [
      {
        title: "Roles & Permissions",
        href: "/settings?tab=permissions",
        icon: ShieldCheck,
        permission: "feature:permissions",
      },
      {
        title: "Activity Log",
        href: "/activity",
        icon: History,
        permission: "feature:activity",
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "feature:settings",
      },
    ],
  },
];
