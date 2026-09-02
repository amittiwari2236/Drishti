import "server-only";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can, type Permission, ensurePermissionsLoaded } from "@/lib/permissions";

export const ACTIVE_COMPANY_COOKIE = "drishti-active-company";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  companyId: string | null;
  departmentId: string | null;
  hierarchyLevel: number | null;
  designation?: string | null; // Track current active designation
  activeRoleName?: string | null; // The exact name of the active context sub-role
  activeRoleId?: string | null; // The dynamic ID of the active role from the API
};

/** Cached per-request session lookup with PostgreSQL authoritative verification. */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  
  const customUserId = (await cookies()).get("drishti_user_id")?.value;
  
  if (!session?.user?.id && !customUserId) return null;
  const userId = session?.user?.id || customUserId;

  // Always verify fresh, authoritative role and status from PostgreSQL
  let dbUser = await prisma.user.findUnique({
    where: { id: userId as string },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      companyId: true,
      isActive: true,
      departmentId: true,
      hierarchyLevel: true,
      designation: true,
    },
  });

  // Fallback lookup by email if id changed across database seeds
  if (!dbUser && session?.user?.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        companyId: true,
        isActive: true,
        departmentId: true,
        hierarchyLevel: true,
        designation: true,
      },
    });
  }

  if (!dbUser || dbUser.isActive === false) return null;

  // Ensure runtime permission cache is loaded from PostgreSQL
  await ensurePermissionsLoaded();

  const user: SessionUser = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image,
    role: dbUser.role,
    companyId: dbUser.companyId,
    departmentId: dbUser.departmentId,
    hierarchyLevel: dbUser.hierarchyLevel,
    designation: dbUser.designation,
  };

  // ── Apply Application-Level Context Override ──
  // If the user has switched their role context in the sidebar, override the session user properties.
  const activeRoleCookie = (await cookies()).get("drishti_active_role")?.value;
  if (activeRoleCookie) {
    try {
      const parsedContext = JSON.parse(activeRoleCookie);
      
      // Override properties
      user.hierarchyLevel = parsedContext.hierarchyLevel;
      user.departmentId = parsedContext.departmentId ? String(parsedContext.departmentId) : null;
      user.activeRoleName = parsedContext.roleName;
      user.designation = parsedContext.roleName;
      user.activeRoleId = parsedContext.roleId ? String(parsedContext.roleId) : null;

      // Map the active hierarchy level to a base Prisma Role for strict permission matching
      if (parsedContext.hierarchyLevel === 1) user.role = "MANAGER";
      else if (parsedContext.hierarchyLevel === 2) user.role = "SENIOR";
      else if (parsedContext.hierarchyLevel === 3) user.role = "EXECUTIVE";
      else if (parsedContext.hierarchyLevel === 4) user.role = "INTERN";
      
    } catch (err) {
      console.error("Failed to parse drishti_active_role cookie", err);
    }
  }

  return { user, session: session?.session || {} as any };
});

/** Require an authenticated user or redirect to login. */
export async function requireUser(): Promise<SessionUser> {
  const s = await getSession();
  if (!s) redirect("/login?clear_session=true");
  return s.user;
}

/** Require one of the given roles. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

/** Require a specific permission (throws for use in server actions). */
export async function requirePermission(
  permission: Permission
): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user, permission)) {
    throw new Error("You do not have permission to perform this action.");
  }
  return user;
}

/**
 * Resolve the company scope for the current user.
 * - MANAGER: uses the company selected in the switcher cookie (may be null = all).
 * - Everyone else: bound to their own companyId (or null if unassigned).
 */
export async function companyScope(
  user: SessionUser
): Promise<string | null> {
  if (user.role === "MANAGER") {
    const store = await cookies();
    const selected = store.get(ACTIVE_COMPANY_COOKIE)?.value;
    if (!selected || selected === "all") return null;
    const exists = await prisma.company.findUnique({
      where: { id: selected },
      select: { id: true },
    });
    return exists?.id ?? null;
  }
  return user.companyId ?? null;
}

/**
 * Build a `companyId` where-filter for scoped queries.
 * Returns {} for super admin viewing all companies or users with no company scope.
 */
export async function companyFilter(
  user: SessionUser
): Promise<{ companyId?: string }> {
  const scope = await companyScope(user);
  return scope ? { companyId: scope } : {};
}

/**
 * Resolve the companyId a write should target.
 * Non-super users are always forced to their own company; super admins
 * may pass an explicit companyId, falling back to the switcher scope.
 */
export async function resolveCompanyForWrite(
  user: SessionUser,
  requestedCompanyId?: string | null
): Promise<string> {
  if (user.role !== "MANAGER") {
    if (!user.companyId) throw new Error("Your account has no company assigned.");
    return user.companyId;
  }
  const target = requestedCompanyId ?? (await companyScope(user));
  if (!target) {
    throw new Error("Select a company first (use the company switcher).");
  }
  const exists = await prisma.company.findUnique({
    where: { id: target },
    select: { id: true },
  });
  if (!exists) throw new Error("Company not found.");
  return target;
}

/** Assert that an entity belongs to the caller's company scope. */
export function assertCompanyAccess(
  user: SessionUser,
  entityCompanyId: string | null | undefined
) {
  if (user.role === "MANAGER") return;
  if (!entityCompanyId || entityCompanyId !== user.companyId) {
    throw new Error("Access denied: entity belongs to another company.");
  }
}
