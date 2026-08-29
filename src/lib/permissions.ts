import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import {
  type Permission,
  DEFAULT_ROLE_PERMISSIONS,
} from "./permission-constants";

// Re-export constants so other files importing from here don't break
export * from "./permission-constants";

// Global in-memory dynamic permissions store
let dynamicRoleCache = new Map<Role, Set<Permission>>();
let dynamicUserOverridesCache = new Map<string, Map<Permission, boolean>>();

export function invalidatePermissionCache() {
  // In Next.js, relying on a global stale flag across RSC and Server Actions chunks fails in dev mode.
  // We rely entirely on React.cache() per-request deduplication now.
}

/**
 * Fast synchronous permission check (respects Super Admin, User Overrides, Dynamic Role Permissions, and Defaults).
 */
export function can(
  userOrRole: Role | { role: Role; id?: string } | undefined | null,
  permission: Permission,
): boolean {
  if (!userOrRole) return false;
  const role: Role =
    typeof userOrRole === "string" ? userOrRole : userOrRole.role;
  const userId: string | undefined =
    typeof userOrRole === "object" ? userOrRole.id : undefined;

  // Super Admin is never restricted
  if (role === "MANAGER") return true;

  // Check user-level override if provided
  if (userId && dynamicUserOverridesCache.has(userId)) {
    const userMap = dynamicUserOverridesCache.get(userId)!;
    if (userMap.has(permission)) {
      return userMap.get(permission)!;
    }
  }

  // Check dynamic role cache
  if (dynamicRoleCache.has(role)) {
    return dynamicRoleCache.get(role)!.has(permission);
  }

  // Fallback to static default matrix
  return DEFAULT_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Update active runtime cache from database rows.
 * Uses an atomic swap to prevent race conditions during concurrent request resolution.
 */
export function populatePermissionCache(
  rolePermissions: Array<{
    role: Role;
    permissionCode: string;
    allowed: boolean;
  }>,
  userOverrides?: Array<{
    userId: string;
    permissionCode: string;
    allowed: boolean;
  }>,
) {
  const newRoleCache = new Map<Role, Set<Permission>>();
  const newUserOverridesCache = new Map<string, Map<Permission, boolean>>();

  // Initialize all roles with defaults
  for (const [r, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    newRoleCache.set(r as Role, new Set(perms));
  }

  // Apply DB overrides for roles
  for (const rp of rolePermissions) {
    const roleSet = newRoleCache.get(rp.role) ?? new Set();
    if (rp.allowed) {
      roleSet.add(rp.permissionCode as Permission);
    } else {
      roleSet.delete(rp.permissionCode as Permission);
    }
    newRoleCache.set(rp.role, roleSet);
  }

  // Apply user-level overrides
  if (userOverrides) {
    for (const uo of userOverrides) {
      if (!newUserOverridesCache.has(uo.userId)) {
        newUserOverridesCache.set(uo.userId, new Map());
      }
      newUserOverridesCache
        .get(uo.userId)!
        .set(uo.permissionCode as Permission, uo.allowed);
    }
  }

  // Atomic swap ensures no request ever reads an empty map
  dynamicRoleCache = newRoleCache;
  dynamicUserOverridesCache = newUserOverridesCache;
}

const loadPermissionsForRequest = cache(async () => {
  const [rolePermissions, userOverrides] = await Promise.all([
    prisma.rolePermission.findMany(),
    prisma.userPermissionOverride.findMany(),
  ]);
  populatePermissionCache(rolePermissions, userOverrides);
  return true;
});

/**
 * Ensure database-backed permissions are loaded into runtime cache.
 * Uses React.cache to fetch exactly once per request, ensuring fresh data.
 */
export async function ensurePermissionsLoaded() {
  try {
    await loadPermissionsForRequest();
  } catch (err) {
    console.error("Failed to load permissions from database:", err);
  }
}
