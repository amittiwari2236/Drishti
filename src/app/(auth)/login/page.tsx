import type { Metadata } from "next";
import { Suspense } from "react";
import { Eye, Map, ClipboardList, Landmark, BarChart3, CheckCircle2 } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in - DRISHTI" };

const features = [
  { icon: Map, text: "Monitor infrastructure across zones & states" },
  { icon: Landmark, text: "Track ministries, departments & agencies" },
  { icon: ClipboardList, text: "Real-time project physical & financial progress" },
  { icon: BarChart3, text: "National analytics & delay risk insights" },
];

export default async function LoginPage() {
  // Check session on the server; if valid, bypass the login page.
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-svh sm:grid-cols-2">
      {/* ── Left: Form Panel ── */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden">
        {/* Soft background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20" />
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 size-72 rounded-full bg-indigo-100/60 blur-3xl dark:bg-indigo-900/20" />
        <div className="absolute -bottom-24 -right-12 size-64 rounded-full bg-sky-100/60 blur-3xl dark:bg-sky-900/20" />

        <div className="relative w-full max-w-sm space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-lg dark:bg-white dark:text-zinc-900">
              <Eye className="size-5" />
            </div>
            <div>
              <p className="text-base font-bold leading-none tracking-tight">DRISHTI</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Project Monitoring System</p>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-xl shadow-black/[0.06] p-7 space-y-6">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>

          {/* Footer */}
          <div className="text-center space-y-0.5">
            <p className="text-xs font-semibold text-foreground/70">National Infrastructure Monitoring</p>
            <p className="text-[11px] text-muted-foreground">Government of India</p>
          </div>
        </div>
      </div>

      {/* ── Right: Hero Panel ── */}
      <div className="relative max-sm:hidden flex flex-col justify-between overflow-hidden bg-zinc-950 dark:border-l">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.32),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(56,189,248,0.2),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
            <CheckCircle2 className="size-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-white/80 tracking-wide uppercase">
              PAIMANA Initiative
            </span>
          </div>
        </div>

        <div className="relative flex flex-col items-start justify-center px-10 gap-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Infrastructure Monitoring
            </p>
            <h2 className="text-4xl font-bold text-white leading-tight">
              DRISHTI<br />National Platform
            </h2>
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed mt-2">
              A unified platform to track, manage, and analyze physical and financial progress of government infrastructure projects nationwide.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/20">
                  <Icon className="size-3.5 text-indigo-400" />
                </div>
                <span className="text-sm text-zinc-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative p-10">
          <blockquote className="space-y-2 border-l-2 border-indigo-500/50 pl-4">
            <p className="text-sm font-medium leading-relaxed text-white/75 italic">
              &ldquo;Transforming data into actionable insights to ensure timely completion of critical infrastructure projects.&rdquo;
            </p>
            <footer className="text-xs text-zinc-500">
              National Project Monitoring Unit
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
