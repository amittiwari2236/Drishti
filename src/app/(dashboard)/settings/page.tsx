import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser, companyScope } from "@/lib/access";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HolidaysPanel,
  type HolidayItem,
} from "@/features/settings/components/holidays-panel";
import {
  TaxonomyPanel,
  type TaxonomyItem,
} from "@/features/settings/components/taxonomy-panel";
import {
  RemindersPanel,
  type ReminderItem,
} from "@/features/settings/components/reminders-panel";
import {
  PermissionsManagement,
  type RolePermissionRow,
  type UserOverrideRow,
  type UserItem,
} from "@/features/settings/components/permissions-management";

export const metadata: Metadata = { title: "Settings" };

const REMINDER_DEFS: { key: string; label: string; hour: number }[] = [
  { key: "daily_report", label: "Daily report reminder", hour: 18 },
  { key: "deadline", label: "Deadline reminder", hour: 9 },
  { key: "inactive", label: "Inactive student alert", hour: 20 },
];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  if (!can(user, "settings:manage") && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const { tab: requestedTab } = await searchParams;
  const scope = await companyScope(user);

  const [
    holidays,
    departments,
    technologies,
    reminderRows,
    rolePermissions,
    userOverrides,
    users,
  ] = await Promise.all([
    prisma.holiday.findMany({
      where: scope ? { OR: [{ companyId: scope }, { companyId: null }] } : {},
      orderBy: { date: "asc" },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.technology.findMany({ orderBy: { name: "asc" } }),
    prisma.reminderSetting.findMany(),
    prisma.rolePermission.findMany(),
    prisma.userPermissionOverride.findMany(),
    prisma.user.findMany({
      where: scope ? { companyId: scope } : {},
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        designation: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const holidayItems: HolidayItem[] = holidays.map((h) => ({
    id: h.id,
    name: h.name,
    date: h.date.toISOString(),
  }));

  const departmentItems: TaxonomyItem[] = departments.map((d) => ({
    id: d.id,
    name: d.name,
    extra: d.code,
  }));

  const technologyItems: TaxonomyItem[] = technologies.map((t) => ({
    id: t.id,
    name: t.name,
    extra: t.category,
  }));

  const reminderMap = new Map(reminderRows.map((r) => [r.key, r]));
  const reminders: ReminderItem[] = REMINDER_DEFS.map((def) => {
    const row = reminderMap.get(def.key);
    return {
      key: def.key,
      label: def.label,
      hour: row?.hour ?? def.hour,
      minute: row?.minute ?? 0,
      enabled: row?.enabled ?? true,
    };
  });

  const rolePermRows: RolePermissionRow[] = rolePermissions.map((rp) => ({
    role: rp.role,
    permissionCode: rp.permissionCode,
    allowed: rp.allowed,
  }));

  const userOverrideRows: UserOverrideRow[] = userOverrides.map((uo) => ({
    userId: uo.userId,
    permissionCode: uo.permissionCode,
    allowed: uo.allowed,
  }));

  const userItems: UserItem[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    image: u.image,
    designation: u.designation,
  }));

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const defaultTab = requestedTab || (isSuperAdmin ? "permissions" : "holidays");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Governance"
        description="Manage system permissions, roles, holidays, taxonomies, and automated triggers."
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex flex-wrap">
          {isSuperAdmin && (
            <TabsTrigger value="permissions">Roles & Permissions</TabsTrigger>
          )}
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="technologies">Technologies</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        {isSuperAdmin && (
          <TabsContent value="permissions" className="mt-6">
            <PermissionsManagement
              initialRolePermissions={rolePermRows}
              initialUserOverrides={userOverrideRows}
              users={userItems}
            />
          </TabsContent>
        )}

        <TabsContent value="holidays" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Holiday calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <HolidaysPanel holidays={holidayItems} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <TaxonomyPanel
                kind="department"
                items={departmentItems}
                namePlaceholder="Department name"
                extraPlaceholder="Code (optional)"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technologies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              <TaxonomyPanel
                kind="technology"
                items={technologyItems}
                namePlaceholder="Technology name"
                extraPlaceholder="Category (optional)"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Automated reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <RemindersPanel reminders={reminders} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
