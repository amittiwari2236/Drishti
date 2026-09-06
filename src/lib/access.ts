import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { can, type Permission } from "@/lib/permissions";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  departmentId?: string | null;
  agencyId?: string | null;
};

/** Cached per-request session lookup. */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as unknown as Record<string, unknown>;
  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (u.role as Role) ?? "AGENCY",
    departmentId: (u.departmentId as string | null | undefined) ?? null,
    agencyId: (u.agencyId as string | null | undefined) ?? null,
  };
  return { user, session: session.session };
});

/** Require an authenticated user or redirect to login. */
export async function requireUser(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s.user;
}

/** Require one of the given roles. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

/**
 * Returns the Prisma WHERE clause that scopes InfrastructureProject queries
 * to what the current user is authorized to see.
 *
 * - SENIOR_DECISION_MAKER → sees all projects (no filter)
 * - DEPARTMENT → sees only projects belonging to their department
 * - AGENCY → sees only projects belonging to their agency
 */
export function projectScopeFilter(user: SessionUser): Record<string, unknown> {
  switch (user.role) {
    case "SENIOR_DECISION_MAKER":
      return {}; // national view — no restriction

    case "DEPARTMENT":
      if (!user.departmentId) return { id: "__DENIED__" };
      return { departmentId: user.departmentId };

    case "AGENCY":
      if (!user.agencyId) return { id: "__DENIED__" };
      return { agencyId: user.agencyId };

    default:
      return { id: "__DENIED__" };
  }
}

/**
 * Returns a human-readable scope description for the current user.
 */
export function scopeLabel(user: SessionUser): string {
  switch (user.role) {
    case "SENIOR_DECISION_MAKER":
      return "National View";
    case "DEPARTMENT":
      return "Department View";
    case "AGENCY":
      return "Agency View";
    default:
      return "";
  }
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

/** Require a specific permission or redirect to dashboard. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) {
    redirect("/dashboard");
  }
  return user;
}

/**
 * Ensures user has authorized access to a specific project.
 * If unauthorized or not found, throws notFound() (404).
 */
export async function requireProjectAccess(projectId: string, user: SessionUser) {
  const project = await prisma.infrastructureProject.findUnique({
    where: { id: projectId },
    include: {
      department: true,
      agency: true,
      ministry: true,
      sector: true,
      state: true,
    },
  });

  if (!project) {
    notFound();
  }

  if (user.role === "DEPARTMENT" && project.departmentId !== user.departmentId) {
    notFound();
  }

  if (user.role === "AGENCY" && project.agencyId !== user.agencyId) {
    notFound();
  }

  return project;
}

/** Legacy scope helper compatibility. */
export async function companyScope(_user: SessionUser): Promise<string | null> {
  return null;
}

/** Legacy filter helper compatibility. */
export async function companyFilter(_user: SessionUser): Promise<Record<string, unknown>> {
  return {};
}


