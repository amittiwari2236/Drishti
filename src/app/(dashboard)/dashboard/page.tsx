import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  FolderKanban,
  GraduationCap,
  Layers,
  ListTodo,
  NotebookPen,
  LogIn,
  CheckCircle2,
  FileText,
  LogOut,
  Timer,
  Clock,
  KanbanSquare,
  ShieldCheck,
  Compass,
  CalendarDays,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { requireUser, companyFilter } from "@/lib/access";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/config/labels";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EndWorkDayButton } from "@/features/workflow/end-work-day-button";
import { recordLoginTime } from "@/features/workflow/actions";
import { fetchPragyaAPI } from "@/lib/pragya-api";
import { cookies } from "next/headers";

// IMPORT THE NEW ROLE DASHBOARDS
import { AdminDashboardView, LeadDashboardView, MemberDashboardView } from "@/features/dashboard/components/role-views";

export const metadata: Metadata = { title: "Dashboard" };

function formatTime(dt: Date | null | undefined): string {
  if (!dt) return "—";
  return format(dt, "hh:mm a");
}

function formatMinutes(mins: number): string {
  if (mins === 0) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}



export default async function DashboardPage() {
  const user = await requireUser();
  const scope = await companyFilter(user);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const hasCompaniesAccess = can(user, "feature:companies");
  const hasStudentsAccess = can(user, "feature:students");
  const hasProjectsAccess = can(user, "feature:projects");
  const hasBatchesAccess = can(user, "feature:batches");
  const hasTasksAccess = can(user, "feature:tasks") || can(user, "feature:kanban");
  const hasDailyLogsAccess = can(user, "feature:dailylogs");
  const hasKanbanAccess = can(user, "feature:kanban");
  const hasProposalsAccess = can(user, "feature:propose");
  const hasAnalyticsAccess = can(user, "feature:analytics");
  const hasCalendarAccess = can(user, "feature:calendar");
  const hasPermissionsAccess = can(user, "feature:permissions") || user.role === "MANAGER";

  const [companies, students, projects, batches, openTasks, reportsToday] =
    await Promise.all([
      hasCompaniesAccess ? prisma.company.count() : Promise.resolve(0),
      hasStudentsAccess ? prisma.user.count({ where: { role: "INTERN", ...scope } }) : Promise.resolve(0),
      hasProjectsAccess ? prisma.project.count({ where: { ...scope } }) : Promise.resolve(0),
      hasBatchesAccess ? prisma.batch.count({ where: { ...scope } }) : Promise.resolve(0),
      hasTasksAccess
        ? prisma.task.count({
            where: {
              ...scope,
              status: { notIn: ["COMPLETED", "CANCELLED"] },
              ...(user.role === "INTERN" ? { assigneeId: user.id } : {}),
              OR: [
                { approval: null },
                { approval: { status: "APPROVED" } },
              ],
            },
          })
        : Promise.resolve(0),
      hasDailyLogsAccess
        ? prisma.dailyLog.count({
            where: {
              ...scope,
              date: today,
              ...(user.role === "INTERN" ? { studentId: user.id } : {}),
            },
          })
        : Promise.resolve(0),
    ]);

  // ROLE-BASED DASHBOARD DATA FETCHING (Realistic replacement of client HTML dummy data)
  const isAdmin = user.role === "MANAGER";
  const isLead = user.role === "SENIOR" || user.role === "EXECUTIVE";
  // Fallback to member if not admin or lead

  let localDepartments: (Department & { _count: { tasks: number } })[] = [];
  let roleProjects: any[] = [];
  let roleTasks: any[] = [];
  let teamMembers: User[] = [];
  let pragyaDepartments: any[] = [];
  let pragyaStats: any = null;
  let pragyaSchedule: any[] = [];

  const token = (await cookies()).get('pragya_jwt')?.value;

  try {
    if (token === "DUMMY_TOKEN_FOR_DEMO") {
      // Provide completely offline mock data for dummy accounts for instant login
      pragyaDepartments = [
        { id: 1, name: 'Technology', code: 'TECH', roles: [{id: 1, name: 'Developer', hierarchy_level: 3}, {id: 2, name: 'Tech Lead', hierarchy_level: 2}] },
        { id: 2, name: 'Finance', code: 'FIN', roles: [] },
        { id: 5, name: 'Teaching', code: 'TEACHING', roles: [{id: 3, name: 'Instructor', hierarchy_level: 3}] }
      ];
      pragyaStats = { total_classes: 42, total_hours: 128 };
      pragyaSchedule = [
        { title: "Yoga Basics", date: "Tomorrow, 10:00 AM", room: "Studio A" },
        { title: "Advanced Meditation", date: "Friday, 06:00 PM", room: "Studio B" },
        { title: "Teacher Training", date: "Saturday, 08:00 AM", room: "Main Hall" }
      ];
    } else {
      // Fetch concurrently to avoid long loading times
      const apiPromises = [fetchPragyaAPI('departments')];
      if (token) {
        apiPromises.push(fetchPragyaAPI('stats', token));
        apiPromises.push(fetchPragyaAPI('schedule', token));
      }

      const results = await Promise.all(apiPromises);
      pragyaDepartments = results[0]?.status ? results[0].data : [];
      
      if (token) {
        pragyaStats = results[1]?.status ? results[1].data : null;
        pragyaSchedule = results[2]?.status ? results[2].data : [];
      }
    }
  } catch (e) {
    console.error("Failed to fetch from Pragya API", e);
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  const userDepartment = dbUser?.departmentId 
    ? await prisma.department.findUnique({ where: { id: dbUser.departmentId } }) 
    : null;


  const allPragyaRoles = pragyaDepartments.flatMap((d: any) => d.roles?.map((r: any) => r.name) || []);
  const defaultRoles = ["Tech Lead", "Finance Manager", "Event Manager", "Instructor", "Front Desk Lead"];
  const pragyaRoleNames = allPragyaRoles.length > 0 ? allPragyaRoles : defaultRoles;

  // Give the logged in user a Pragya role based on their ID length or randomly
  const userPragyaRole = pragyaRoleNames[user.id.length % pragyaRoleNames.length];

  if (isAdmin) {
    roleTasks = await prisma.task.findMany({
      where: { ...scope },
      include: { assignee: true }
    });
    
    const depts = await prisma.department.findMany({
      where: scope as any
    });
    
    localDepartments = depts.map(d => ({
      ...d,
      _count: { tasks: roleTasks.filter(t => t.targetDepartmentId === d.id).length }
    }));
    
    roleProjects = await prisma.project.findMany({
      where: { ...scope },
      include: { tasks: true }
    });
  } else if (isLead) {
    if (dbUser?.departmentId) {
      const members = await prisma.user.findMany({
        where: { departmentId: dbUser.departmentId, ...scope } as any
      });
      teamMembers = members.map((m: any, idx: number) => ({
        ...m,
        displayRole: pragyaRoleNames[idx % pragyaRoleNames.length]
      }));
    }
    const memberIds = teamMembers.map(m => m.id);
    roleTasks = await prisma.task.findMany({
      where: { assigneeId: { in: [...memberIds, user.id] }, ...scope },
      include: { assignee: true }
    });
    const projectIds = Array.from(new Set(roleTasks.map(t => t.projectId)));
    roleProjects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: { tasks: true }
    });
  } else {
    // Member View
    roleTasks = await prisma.task.findMany({
      where: { assigneeId: user.id, ...scope },
      include: { assignee: true }
    });
    const projectIds = Array.from(new Set(roleTasks.map(t => t.projectId)));
    roleProjects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: { tasks: true }
    });
  }


  // ── Student: auto-record login + fetch today's timeline ────────────────
  let timeline: {
    loginAt: Date | null;
    workLogUpdatedAt: Date | null;
    submittedAt: Date | null;
    logoutAt: Date | null;
    workingMinutes: number;
  } | null = null;

  let todayAcknowledgements: { taskId: string; status: "ON_TIME" | "LATE"; task: { title: string } }[] = [];

  if (user.role === "INTERN") {
    await recordLoginTime().catch(() => {});

    timeline = await prisma.dailyTimeline.findUnique({
      where: { studentId_date: { studentId: user.id, date: today } },
      select: {
        loginAt: true,
        workLogUpdatedAt: true,
        submittedAt: true,
        logoutAt: true,
        workingMinutes: true,
      },
    });

    todayAcknowledgements = await prisma.taskAcknowledgement.findMany({
      where: { studentId: user.id, date: today },
      select: { taskId: true, status: true, task: { select: { title: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${user.name.split(" ")[0]}`}
        description={`You are signed in as ${userPragyaRole}${userDepartment ? ` in the ${userDepartment.name} department` : ""}.`}
      />

      {/* ── Stat Cards (Filtered strictly by permitted features) ──────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {hasCompaniesAccess && (
          <StatCard title="Companies" value={companies} icon={Building2} />
        )}
        {hasStudentsAccess && (
          <StatCard title="Students" value={students} icon={GraduationCap} />
        )}
        {hasProjectsAccess && (
          <StatCard title="Projects" value={projects} icon={FolderKanban} />
        )}
        {hasBatchesAccess && (
          <StatCard title="Batches" value={batches} icon={Layers} />
        )}
        {hasTasksAccess && (
          <StatCard
            title={user.role === "INTERN" ? "My open tasks" : "Open tasks"}
            value={openTasks}
            icon={ListTodo}
          />
        )}
        {hasDailyLogsAccess && (
          <StatCard
            title={
              user.role === "INTERN"
                ? "Today's report"
                : "Reports submitted today"
            }
            value={
              user.role === "INTERN"
                ? reportsToday > 0
                  ? "Submitted"
                  : "Pending"
                : reportsToday
            }
            icon={NotebookPen}
          />
        )}
      </div>

      {/* ── Role Shortcuts & Quick Navigation ────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hasKanbanAccess && (
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <KanbanSquare className="size-5 text-amber-500" />
                Dynamic Event Track
              </CardTitle>
              <CardDescription>
                Track live tasks and event movements on interactive sticky notes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild className="w-full justify-between">
                <Link href="/kanban">
                  <span>Open Event Track</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {hasProposalsAccess && (
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Compass className="size-5 text-sky-500" />
                Proposals & Workshops
              </CardTitle>
              <CardDescription>
                Submit, review, and schedule educational proposals and trainings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild className="w-full justify-between">
                <Link href="/propose">
                  <span>View Proposals</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {hasCalendarAccess && (
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-5 text-emerald-500" />
                Event Calendar
              </CardTitle>
              <CardDescription>
                Review schedules, room reservations, and project milestones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild className="w-full justify-between">
                <Link href="/calendar">
                  <span>View Calendar</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {hasAnalyticsAccess && (
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="size-5 text-indigo-500" />
                Program Analytics
              </CardTitle>
              <CardDescription>
                Gain insights into task turnaround times, attendance, and metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild className="w-full justify-between">
                <Link href="/analytics">
                  <span>View Analytics</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {hasPermissionsAccess && (
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-5 text-primary" />
                Roles & Permissions
              </CardTitle>
              <CardDescription>
                Super Admin control over system roles, permissions, and feature access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild className="w-full justify-between">
                <Link href="/settings?tab=permissions">
                  <span>Manage Permissions</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Role-Based Dashboard Views (Pragya Flow Concepts) ────────── */}
      {isAdmin ? (
        <AdminDashboardView 
          projects={roleProjects} 
          tasks={roleTasks} 
          departments={localDepartments} 
          pragyaDepartments={pragyaDepartments}
          pragyaStats={pragyaStats}
          pragyaSchedule={pragyaSchedule}
        />
      ) : isLead ? (
        <LeadDashboardView 
          user={{ id: user.id, name: user.name, role: userPragyaRole }}
          projects={roleProjects}
          tasks={roleTasks}
          teamMembers={teamMembers}
          pragyaStats={pragyaStats}
          pragyaSchedule={pragyaSchedule}
        />
      ) : (
        <MemberDashboardView 
          projects={roleProjects}
          tasks={roleTasks}
          pragyaStats={pragyaStats}
          pragyaSchedule={pragyaSchedule}
        />
      )}

      {/* ── Student Daily Timeline Widget ────────────────────────────────── */}
      {user.role === "INTERN" && (
        <Card className="border-indigo-100 dark:border-indigo-900/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Timer className="size-4 text-indigo-500" />
                Today&apos;s Timeline
              </CardTitle>
              <EndWorkDayButton alreadyEnded={!!timeline?.logoutAt} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <LogIn className="size-4 shrink-0 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Login</p>
                  <p className="text-sm font-medium">{formatTime(timeline?.loginAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <FileText className="size-4 shrink-0 text-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Work Log Updated</p>
                  <p className="text-sm font-medium">{formatTime(timeline?.workLogUpdatedAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Report Submitted</p>
                  <p className="text-sm font-medium">{formatTime(timeline?.submittedAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <LogOut className="size-4 shrink-0 text-slate-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Logout</p>
                  <p className="text-sm font-medium">{formatTime(timeline?.logoutAt)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3">
              <Clock className="size-4 text-indigo-500" />
              <span className="text-sm text-muted-foreground">Hours Worked:</span>
              <span className="text-sm font-semibold">
                {formatMinutes(timeline?.workingMinutes ?? 0)}
              </span>
            </div>

            {todayAcknowledgements.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Task Acknowledgements Today
                  </p>
                  <div className="space-y-2">
                    {todayAcknowledgements.map((ack) => (
                      <div
                        key={ack.taskId}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <span className="truncate text-sm">{ack.task.title}</span>
                        <Badge
                          variant="secondary"
                          className={
                            ack.status === "ON_TIME"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                          }
                        >
                          {ack.status === "ON_TIME" ? "On Time" : "Late"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
