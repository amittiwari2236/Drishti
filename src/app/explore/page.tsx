import type { Metadata } from "next";
import { PublicNavbar } from "@/components/public/public-navbar";
import { PublicFooter } from "@/components/public/public-footer";
import { ProjectExplorer } from "@/components/public/project-explorer";
import { ShieldCheck, Search, Database, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Explore National Infrastructure Projects — GPMS",
  description:
    "Search, filter, and inspect national infrastructure projects across all ministries, states, and sectors on the Government Project Monitoring System.",
};

export default function ExplorePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      <PublicNavbar />

      {/* ── Explorer Banner ── */}
      <div className="bg-[#071126] border-b border-cyan-500/20 text-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute left-10 -bottom-20 size-80 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="mx-auto max-w-7xl relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Database className="size-3.5" />
            <span>Public Transparency Data Registry</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            National Infrastructure Project Explorer
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Search, filter, and review verified physical and financial progress across all Central Ministries, State Governments, and Implementing Agencies under PM GatiShakti.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Public Read-Only Access</span>
            </span>
            <span>•</span>
            <span>Live Data Sync from MoSPI & Nodal Line Ministries</span>
            <span>•</span>
            <span>RTI Section 4 Compliant</span>
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ProjectExplorer />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
