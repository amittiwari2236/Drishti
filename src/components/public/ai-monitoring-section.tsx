"use client";

import React, { useState } from "react";
import {
  Cpu,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Camera,
  Layers,
  Sparkles,
  TrendingUp,
  FileCheck2,
} from "lucide-react";

export function AIMonitoringSection() {
  const [activeTab, setActiveTab] = useState<"ai" | "telemetry" | "geotag">("ai");

  return (
    <section id="ai-insights" className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow blooms */}
      <div className="pointer-events-none absolute -top-20 right-10 size-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-10 size-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
              <Sparkles className="size-3.5" />
              <span>Next-Gen Infrastructure Governance</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              AI-Powered Project Monitoring & Intelligence
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
              GPMS employs predictive neural networks and geo-spatial analytics to detect delays,
              prevent cost escalations, and empower senior administrators with actionable intelligence.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "ai"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="size-3.5" />
              <span>AI Risk Engine</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "telemetry"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="size-3.5" />
              <span>Live Telemetry</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("geotag")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "geotag"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="size-3.5" />
              <span>Drone & GIS</span>
            </button>
          </div>
        </div>

        {/* Dynamic Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4 hover:border-cyan-500/30 transition-all">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <AlertTriangle className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Autonomous Delay Risk Prediction
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Machine learning models trained on historical project timelines forecast milestone slippage 60 days before critical paths are impacted, alerting nodal ministries immediately.
            </p>
            <div className="pt-2 border-t border-white/10 text-[11px] text-cyan-300 font-mono flex items-center justify-between">
              <span>Forecast Accuracy</span>
              <span className="font-bold text-white">94.8%</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4 hover:border-blue-500/30 transition-all">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <TrendingUp className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Cost Overrun & Expenditure Auditing
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time reconciliation of physical work packages against financial drawdowns. Automatically flags billings that outpace ground completion percentages.
            </p>
            <div className="pt-2 border-t border-white/10 text-[11px] text-blue-300 font-mono flex items-center justify-between">
              <span>Variance Detection</span>
              <span className="font-bold text-white">&lt; 1% Margin</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4 hover:border-emerald-500/30 transition-all">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Camera className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Satellite & Drone Geo-Verification
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Integrates high-resolution Cartosat earth observation imagery and monthly drone point-cloud models to independently verify earthwork and structural progress.
            </p>
            <div className="pt-2 border-t border-white/10 text-[11px] text-emerald-300 font-mono flex items-center justify-between">
              <span>Geo-tag Tamper Proof</span>
              <span className="font-bold text-white">SHA-256 Ledger</span>
            </div>
          </div>
        </div>

        {/* Dashboard Snapshot Preview Strip */}
        <div id="monitoring" className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider">
                Interactive Command Preview
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                Real-Time National Monitoring Dashboard
              </h3>
            </div>
            <span className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry Streams Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
              <span className="text-[11px] text-slate-400 block">Active Sensors</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-white mt-1 block">45,210</span>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">+12% this quarter</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
              <span className="text-[11px] text-slate-400 block">Projects On Schedule</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1 block">84.2%</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">1,051 projects</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
              <span className="text-[11px] text-slate-400 block">Critical Interventions</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-amber-400 mt-1 block">38</span>
              <span className="text-[10px] text-amber-300 mt-0.5 block">Nodal task forces assigned</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
              <span className="text-[11px] text-slate-400 block">Drone Audits Completed</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-cyan-400 mt-1 block">8,420</span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">All states covered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
