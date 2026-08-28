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
      {
        title: "Companies",
        href: "/companies",
        icon: Building2,
        permission: "feature:companies",
      },
    ],
  },
  {
    label: "Internship & Teams",
    items: [
      {
        title: "Batches",
        href: "/batches",
        icon: Layers,
        permission: "feature:batches",
      },
      {
        title: "Projects",
        href: "/projects",
        icon: FolderKanban,
        permission: "feature:projects",
      },
      {
        title: "Students",
        href: "/students",
        icon: GraduationCap,
        permission: "feature:students",
      },
      {
        title: "Mentors",
        href: "/mentors",
        icon: UserCog,
        permission: "feature:mentors",
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
        title: "Proposals",
        href: "/propose",
        icon: Compass,
        permission: "feature:propose",
      },
      {
        title: "Event Calendar",
        href: "/calendar",
        icon: CalendarDays,
        permission: "feature:calendar",
      },
      {
        title: "Daily Logs",
        href: "/daily-logs",
        icon: NotebookPen,
        permission: "feature:dailylogs",
      },
      {
        title: "Attendance",
        href: "/attendance",
        icon: CalendarCheck,
        permission: "feature:attendance",
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
    label: "Insights & Assets",
    items: [
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        permission: "feature:analytics",
      },
      {
        title: "AI Insights",
        href: "/ai",
        icon: Sparkles,
        permission: "feature:ai",
      },
      {
        title: "Reports",
        href: "/reports",
        icon: FileText,
        permission: "feature:reports",
      },
      {
        title: "Documents",
        href: "/documents",
        icon: FileBox,
        permission: "feature:documents",
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
