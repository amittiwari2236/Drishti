"use client";

import { useState, useMemo, useTransition } from "react";
import {
  RotateCcw,
  CheckCheck,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@prisma/client";
import {
  PERMISSION_DEFINITIONS,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/lib/permission-constants";
import {
  updateRolePermission,
  resetRolePermissions,
  grantAllRolePermissions,
  updateUserPermissionOverride,
  resetAllRolesPermissions,
} from "@/features/settings/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserAvatar } from "@/components/shared/user-avatar";

export type RolePermissionRow = {
  role: Role;
  permissionCode: string;
  allowed: boolean;
};

export type UserOverrideRow = {
  userId: string;
  permissionCode: string;
  allowed: boolean;
};

export type UserItem = {
  id: string;
  name: string;
  email: string;
  role: Role;
  image: string | null;
  designation?: string | null;
};

const ALL_ROLES: { role: Role; label: string; description: string; badgeColor: string }[] = [
  {
    role: "MANAGER",
    label: "Super Admin",
    description: "Highest system authority. Full unrestricted control over all features & permissions.",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300",
  },
  {
    role: "SENIOR",
    label: "Teacher",
    description: "Course faculty & academic lead. Manages tasks, reviews student logs, and event proposals.",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
  },
  {
    role: "EXECUTIVE",
    label: "Finance",
    description: "Financial administrator. Oversees budgets, pricing, financial analytics, and contracts.",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
  },
  {
    role: "EXECUTIVE",
    label: "Designer",
    description: "UI/UX & creative assets lead. Manages design tasks, prototypes, and asset deliverables.",
    badgeColor: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300 border-pink-300",
  },
  {
    role: "EXECUTIVE",
    label: "Instructor",
    description: "Hands-on technical mentor. Manages assigned workshops, reviews work, and logs attendance.",
    badgeColor: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300",
  },
  {
    role: "SENIOR",
    label: "Schedule Manager",
    description: "Operations planner. Schedules events, books dates, and coordinates multi-day timelines.",
    badgeColor: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300",
  },
  {
    role: "MANAGER",
    label: "Company Admin",
    description: "Company workspace administrator. Manages company batches, mentors, and projects.",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300",
  },
  {
    role: "SENIOR",
    label: "Coordinator",
    description: "Program coordinator. Oversees batches, attendance rosters, and student allocations.",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300",
  },
  {
    role: "EXECUTIVE",
    label: "Mentor",
    description: "Project guide. Evaluates daily work logs, assigns tasks, and conducts reviews.",
    badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300",
  },
  {
    role: "INTERN",
    label: "Student / Intern",
    description: "Intern participant. Tracks assigned tasks, moves board cards, and logs daily work.",
    badgeColor: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300 border-slate-300",
  },
];

const CATEGORIES = [
  "All Categories",
  "Feature Access",
  "Task Controls",
  "Event Track Controls",
  "Proposals & Events",
  "Analytics Controls",
  "Daily Workflow",
  "Administration",
];

export function PermissionsManagement({
  initialRolePermissions,
  initialUserOverrides,
  users,
}: {
  initialRolePermissions: RolePermissionRow[];
  initialUserOverrides: UserOverrideRow[];
  users: UserItem[];
}) {
  const [selectedRole, setSelectedRole] = useState<Role>("SENIOR");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  // Local state for instant reactive UI
  const [rolePermissionsState, setRolePermissionsState] = useState<RolePermissionRow[]>(
    initialRolePermissions
  );
  const [userOverridesState, setUserOverridesState] = useState<UserOverrideRow[]>(
    initialUserOverrides
  );

  // Map helper for active role's effective permissions
  const activeRolePermissionsMap = useMemo(() => {
    const map = new Map<string, boolean>();

    // Start with defaults
    const defaults = DEFAULT_ROLE_PERMISSIONS[selectedRole] ?? [];
    for (const p of PERMISSION_DEFINITIONS) {
      map.set(p.code, selectedRole === "MANAGER" ? true : defaults.includes(p.code));
    }

    // Apply DB values
    for (const row of rolePermissionsState) {
      if (row.role === selectedRole) {
        map.set(row.permissionCode, selectedRole === "MANAGER" ? true : row.allowed);
      }
    }

    return map;
  }, [selectedRole, rolePermissionsState]);

  // Filtered permission definitions
  const filteredPermissions = useMemo(() => {
    return PERMISSION_DEFINITIONS.filter((def) => {
      if (selectedCategory !== "All Categories" && def.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          def.name.toLowerCase().includes(q) ||
          def.code.toLowerCase().includes(q) ||
          (def.description && def.description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Active selected user for overrides tab
  const activeUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId]
  );

  const activeUserOverridesMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const o of userOverridesState) {
      if (o.userId === selectedUserId) {
        map.set(o.permissionCode, o.allowed);
      }
    }
    return map;
  }, [userOverridesState, selectedUserId]);

  // Handle single permission toggle
  function handleTogglePermission(code: string, currentAllowed: boolean) {
    if (selectedRole === "MANAGER") {
      toast.info("Super Admin has all permissions unconditionally by design.");
      return;
    }

    const newAllowed = !currentAllowed;

    // Optimistic local update
    setRolePermissionsState((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.role === selectedRole && r.permissionCode === code
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], allowed: newAllowed };
        return updated;
      }
      return [...prev, { role: selectedRole, permissionCode: code, allowed: newAllowed }];
    });

    startTransition(async () => {
      try {
        await updateRolePermission(selectedRole, code, newAllowed);
        toast.success(`Updated ${code} for ${selectedRole}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update permission");
      }
    });
  }

  // Handle reset to default matrix
  function handleResetDefaults() {
    if (selectedRole === "MANAGER") return;

    startTransition(async () => {
      try {
        await resetRolePermissions(selectedRole);
        const defaults = DEFAULT_ROLE_PERMISSIONS[selectedRole] ?? [];
        setRolePermissionsState((prev) =>
          prev
            .filter((r) => r.role !== selectedRole)
            .concat(
              PERMISSION_DEFINITIONS.map((def) => ({
                role: selectedRole,
                permissionCode: def.code,
                allowed: defaults.includes(def.code),
              }))
            )
        );
        toast.success(`Reset ${selectedRole} permissions to defaults`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reset permissions");
      }
    });
  }

  // Handle grant all
  function handleGrantAll() {
    if (selectedRole === "MANAGER") return;

    startTransition(async () => {
      try {
        await grantAllRolePermissions(selectedRole);
        setRolePermissionsState((prev) =>
          prev
            .filter((r) => r.role !== selectedRole)
            .concat(
              PERMISSION_DEFINITIONS.map((def) => ({
                role: selectedRole,
                permissionCode: def.code,
                allowed: true,
              }))
            )
        );
        toast.success(`Granted all permissions to ${selectedRole}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to grant permissions");
      }
    });
  }

  // Handle user override change
  function handleUserOverride(code: string, mode: "INHERIT" | "GRANT" | "REVOKE") {
    if (!selectedUserId) return;

    const allowed = mode === "GRANT" ? true : mode === "REVOKE" ? false : null;

    setUserOverridesState((prev) => {
      const filtered = prev.filter(
        (o) => !(o.userId === selectedUserId && o.permissionCode === code)
      );
      if (allowed !== null) {
        return [...filtered, { userId: selectedUserId, permissionCode: code, allowed }];
      }
      return filtered;
    });

    startTransition(async () => {
      try {
        await updateUserPermissionOverride(selectedUserId, code, allowed);
        toast.success(`Updated override for ${code}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update user override");
      }
    });
  }

  // Handle reset ALL roles to defaults (fresh start)
  function handleResetAllRoles() {
    const confirmed = window.confirm(
      "⚠️ Reset ALL role permissions to defaults?\n\nThis will delete all custom permission overrides for every role and restore the original default matrix. This action cannot be undone."
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await resetAllRolesPermissions();
        // Rebuild local state from defaults
        const newState: RolePermissionRow[] = [];
        for (const [roleKey, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
          if (roleKey === "MANAGER") continue;
          for (const def of PERMISSION_DEFINITIONS) {
            newState.push({
              role: roleKey as import("@prisma/client").Role,
              permissionCode: def.code,
              allowed: (perms as string[]).includes(def.code),
            });
          }
        }
        setRolePermissionsState(newState);
        toast.success("All role permissions reset to defaults successfully.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to reset all role permissions");
      }
    });
  }

  const roleMeta = ALL_ROLES.find((r) => r.role === selectedRole);

  return (
    <div className="space-y-6">
      {/* ── Global Reset Banner ── */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
          <div className="space-y-0.5">
            <p className="font-bold text-sm text-foreground">Fresh Start — Reset All Roles to Defaults</p>
            <p className="text-xs text-muted-foreground">
              Wipe all custom permission overrides across every role and restore the original default matrix. Use this before applying new custom permissions.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleResetAllRoles}
            disabled={isPending}
            className="h-8 gap-1.5 text-xs font-semibold shrink-0"
          >
            <RefreshCcw className="size-3.5" />
            Reset All Roles
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="role-matrix" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="role-matrix">Role Permissions</TabsTrigger>
          <TabsTrigger value="user-overrides">User Overrides</TabsTrigger>
          <TabsTrigger value="feature-matrix">Feature Grid</TabsTrigger>
        </TabsList>

        {/* ── 1. ROLE PERMISSIONS MATRIX TAB ── */}
        <TabsContent value="role-matrix" className="space-y-6 mt-4">
          {/* Role selector pill grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {ALL_ROLES.map((r) => {
              const isSelected = selectedRole === r.role;
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setSelectedRole(r.role)}
                  className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                      : "border-border/70 bg-card hover:bg-muted/40 hover:border-primary/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-bold text-xs">{r.label}</span>
                    {r.role === "MANAGER" && (
                      <span className="text-[10px] text-purple-600 font-bold">★ Master</span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">
                    {r.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Role Header Banner */}
          {roleMeta && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground">{roleMeta.label}</h3>
                    <Badge variant="outline" className={roleMeta.badgeColor}>
                      {roleMeta.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{roleMeta.description}</p>
                </div>

                {selectedRole !== "MANAGER" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetDefaults}
                      disabled={isPending}
                      className="h-8 gap-1.5 text-xs font-semibold"
                    >
                      <RotateCcw className="size-3.5" /> Reset Defaults
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGrantAll}
                      disabled={isPending}
                      className="h-8 gap-1.5 text-xs font-semibold"
                    >
                      <CheckCheck className="size-3.5" /> Grant All
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                    <Sparkles className="size-4" /> Permanent Super Authority (All Enabled)
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative min-w-[200px] flex-1 sm:w-64 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions…"
                  className="h-9 rounded-lg pl-8 text-xs focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 w-44 rounded-lg text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground self-start sm:self-center">
              Showing {filteredPermissions.length} permissions
            </p>
          </div>

          {/* Granular Permission Rows */}
          <div className="space-y-3">
            {filteredPermissions.map((def) => {
              const isAllowed = activeRolePermissionsMap.get(def.code) ?? false;
              const isSuper = selectedRole === "MANAGER";

              return (
                <div
                  key={def.code}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
                >
                  <div className="space-y-0.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{def.name}</span>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        {def.category}
                      </Badge>
                      <code className="text-[11px] font-mono text-muted-foreground opacity-75">
                        {def.code}
                      </code>
                    </div>
                    {def.description && (
                      <p className="text-xs text-muted-foreground">{def.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold ${
                        isAllowed
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground opacity-50"
                      }`}
                    >
                      {isAllowed ? "Allowed" : "Disabled"}
                    </span>
                    <Switch
                      checked={isAllowed}
                      disabled={isSuper || isPending}
                      onCheckedChange={() => handleTogglePermission(def.code, isAllowed)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── 2. USER OVERRIDES TAB ── */}
        <TabsContent value="user-overrides" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User-Level Permission Overrides</CardTitle>
              <CardDescription className="text-xs">
                Grant or revoke specific permissions for an individual user, overriding their base role defaults.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-full sm:w-80">
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.role}) — {u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeUser && (
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2 text-xs">
                    <UserAvatar name={activeUser.name} image={activeUser.image} className="size-7" />
                    <div>
                      <p className="font-bold text-foreground">{activeUser.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Role: <span className="font-semibold text-primary">{activeUser.role}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Overrides Table */}
              <div className="space-y-2">
                {PERMISSION_DEFINITIONS.map((def) => {
                  const baseAllowed =
                    activeUser?.role === "MANAGER"
                      ? true
                      : DEFAULT_ROLE_PERMISSIONS[activeUser?.role ?? "INTERN"]?.includes(def.code) ??
                        false;
                  const overrideVal = activeUserOverridesMap.get(def.code);

                  const effectiveAllowed =
                    overrideVal !== undefined ? overrideVal : baseAllowed;

                  const overrideState =
                    overrideVal === true
                      ? "GRANT"
                      : overrideVal === false
                      ? "REVOKE"
                      : "INHERIT";

                  return (
                    <div
                      key={def.code}
                      className="flex items-center justify-between rounded-lg border p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{def.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {def.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Base Role: {baseAllowed ? "Allowed" : "Denied"} · Effective:{" "}
                          <span
                            className={
                              effectiveAllowed
                                ? "font-bold text-emerald-600"
                                : "font-bold text-rose-600"
                            }
                          >
                            {effectiveAllowed ? "ALLOWED" : "DENIED"}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant={overrideState === "INHERIT" ? "secondary" : "ghost"}
                          className="h-7 px-2 text-[11px]"
                          onClick={() => handleUserOverride(def.code, "INHERIT")}
                        >
                          Inherit Role
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={overrideState === "GRANT" ? "default" : "outline"}
                          className="h-7 px-2 text-[11px] text-emerald-600 hover:text-emerald-700"
                          onClick={() => handleUserOverride(def.code, "GRANT")}
                        >
                          Force Grant
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={overrideState === "REVOKE" ? "destructive" : "outline"}
                          className="h-7 px-2 text-[11px]"
                          onClick={() => handleUserOverride(def.code, "REVOKE")}
                        >
                          Force Revoke
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 3. FEATURE ACCESS GRID TAB ── */}
        <TabsContent value="feature-matrix" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System-Wide Feature Access Grid</CardTitle>
              <CardDescription className="text-xs">
                Comprehensive matrix comparing module access across all system roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b bg-muted/50 font-bold">
                    <th className="p-3">Feature Module</th>
                    {ALL_ROLES.map((r) => (
                      <th key={r.label} className="p-2 text-center">
                        {r.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {PERMISSION_DEFINITIONS.filter((d) => d.category === "Feature Access").map(
                    (def) => (
                      <tr key={def.code} className="hover:bg-muted/20">
                        <td className="p-3 font-semibold">
                          <p>{def.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground opacity-70">
                            {def.code}
                          </p>
                        </td>
                        {ALL_ROLES.map((r) => {
                          // Use live DB-backed state for accuracy (not just static defaults)
                          let isAllowed: boolean;
                          if (r.role === "MANAGER") {
                            isAllowed = true;
                          } else {
                            // Check DB-backed rolePermissionsState first
                            const dbRow = rolePermissionsState.find(
                              (row) => row.role === r.role && row.permissionCode === def.code
                            );
                            if (dbRow !== undefined) {
                              isAllowed = dbRow.allowed;
                            } else {
                              // Fall back to static defaults if no DB row exists
                              isAllowed = DEFAULT_ROLE_PERMISSIONS[r.role]?.includes(def.code) ?? false;
                            }
                          }
                          return (
                            <td key={r.label} className="p-2 text-center">
                              {isAllowed ? (
                                <CheckCircle2 className="mx-auto size-4 text-emerald-500" />
                              ) : (
                                <XCircle className="mx-auto size-4 text-muted-foreground/30" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
