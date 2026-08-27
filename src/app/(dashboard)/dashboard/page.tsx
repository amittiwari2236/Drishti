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
  const hasPermissionsAccess = can(user, "feature:permissions") || user.role === "SUPER_ADMIN";
  const hasTaskReadAccess = can(user, "task:read");

  const [companies, students, projects, batches, openTasks, reportsToday, myAssignedTasks] =
    await Promise.all([
      hasCompaniesAccess ? prisma.company.count() : Promise.resolve(0),
      hasStudentsAccess ? prisma.user.count({ where: { role: "STUDENT", ...scope } }) : Promise.resolve(0),
      hasProjectsAccess ? prisma.project.count({ where: { ...scope } }) : Promise.resolve(0),
      hasBatchesAccess ? prisma.batch.count({ where: { ...scope } }) : Promise.resolve(0),
      hasTasksAccess
        ? prisma.task.count({
            where: {
              ...scope,
              status: { notIn: ["COMPLETED", "CANCELLED"] },
              ...(user.role === "STUDENT" ? { assigneeId: user.id } : {}),
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
              ...(user.role === "STUDENT" ? { studentId: user.id } : {}),
            },
          })
        : Promise.resolve(0),
      hasTaskReadAccess
        ? prisma.task.findMany({
            where: {
              assigneeId: user.id,
              status: { notIn: ["COMPLETED", "CANCELLED"] },
              OR: [
                { approval: null },
                { approval: { status: "APPROVED" } },
              ],
            },
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              deadline: true,
            },
            take: 5,
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

  // ── Student: auto-record login + fetch today's timeline ────────────────
  let timeline: {
    loginAt: Date | null;
    workLogUpdatedAt: Date | null;
    submittedAt: Date | null;
    logoutAt: Date | null;
    workingMinutes: number;
  } | null = null;

  let todayAcknowledgements: { taskId: string; status: "ON_TIME" | "LATE"; task: { title: string } }[] = [];

  if (user.role === "STUDENT") {
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
        description={`You are signed in as ${ROLE_LABELS[user.role]}.`}
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
            title={user.role === "STUDENT" ? "My open tasks" : "Open tasks"}
            value={openTasks}
            icon={ListTodo}
          />
        )}
        {hasDailyLogsAccess && (
          <StatCard
            title={
              user.role === "STUDENT"
                ? "Today's report"
                : "Reports submitted today"
            }
            value={
              user.role === "STUDENT"
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

      {/* ── My Assigned Tasks Section ───────────────────────────────────── */}
      {myAssignedTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodo className="size-5 text-primary" />
              My Assigned Tasks
            </CardTitle>
            <CardDescription>
              Tasks specifically assigned to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y rounded-md border">
              {myAssignedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 text-sm hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <Link
                      href={`/tasks/${t.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {t.title}
                    </Link>
                    {t.deadline && (
                      <p className="text-xs text-muted-foreground">
                        Due {format(new Date(t.deadline), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      {t.priority}
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Student Daily Timeline Widget ────────────────────────────────── */}
      {user.role === "STUDENT" && (
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
