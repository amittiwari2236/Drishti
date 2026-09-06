import type { Role } from "@prisma/client";
// trigger reload

export const PERMISSIONS = [
  // companies
  "company:create",
  "company:read",
  "company:update",
  "company:delete",
  "company:switch",
  // users
  "user:create",
  "user:read",
  "user:update",
  "user:delete",
  // batches
  "batch:create",
  "batch:read",
  "batch:update",
  "batch:delete",
  // projects
  "project:create",
  "project:read",
  "project:update",
  "project:delete",
  // teams
  "team:manage",
  // tasks
  "task:create",
  "task:read",
  "task:update",
  "task:delete",
  "task:move",
  // daily logs
  "dailylog:create",
  "dailylog:read",
  "dailylog:read-own",
  // reviews
  "review:create",
  "review:read",
  // attendance
  "attendance:read",
  "attendance:manage",
  // reports & analytics
  "report:generate",
  "analytics:read",
  // documents
  "document:manage",
  "document:read-own",
  // settings
  "settings:manage",
  "activity:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: Permission[] = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SENIOR_DECISION_MAKER: ALL,
  DEPARTMENT: [
    "project:read",
    "project:update",
    "review:create",
    "review:read",
    "report:generate",
    "analytics:read",
    "activity:read",
  ],
  AGENCY: [
    "project:read",
    "project:update",
    "review:read",
    "report:generate",
    "analytics:read",
    "activity:read",
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
