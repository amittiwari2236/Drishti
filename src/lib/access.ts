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
};

/** Cached per-request session lookup with PostgreSQL authoritative verification. */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  // Always verify fresh, authoritative role and status from PostgreSQL
  let dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      companyId: true,
      isActive: true,
    },
  });

  // Fallback lookup by email if id changed across database seeds
  if (!dbUser && session.user.email) {
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
  };
  return { user, session: session.session };
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
 * - SUPER_ADMIN: uses the company selected in the switcher cookie (may be null = all).
 * - Everyone else: bound to their own companyId (or null if unassigned).
 */
export async function companyScope(
  user: SessionUser
): Promise<string | null> {
  if (user.role === "SUPER_ADMIN") {
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
  if (user.role !== "SUPER_ADMIN") {
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
  if (user.role === "SUPER_ADMIN") return;
  if (!entityCompanyId || entityCompanyId !== user.companyId) {
    throw new Error("Access denied: entity belongs to another company.");
  }
}
