"use client";

import React from "react";
import Link from "next/link";
import { IndiaMapGlowCard } from "@/components/public/icons/india-map-glow";
import {
  BarChart3,
  Cpu,
  ShieldCheck,
  Lightbulb,
  ArrowRight,
  Eye,
  CheckCircle2,
} from "lucide-react";

export function AboutSection() {
  const features = [
    {
      title: "Real-time Monitoring",
      description: "Track project progress in real-time with interactive dashboards.",
      icon: BarChart3,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      title: "AI Driven Insights",
      description: "Leverage AI & analytics for predictive insights and risk detection.",
      icon: Cpu,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Transparency",
      description: "Ensure transparency with centralized data and public reporting.",
      icon: ShieldCheck,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    {
      title: "Better Decision Making",
      description: "Empower stakeholders with data-driven decision support.",
      icon: Lightbulb,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-20 bg-slate-50/70 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-blue-600" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            About GPMS
          </h2>
        </div>

        {/* ── Main Layout: Description + 4 Features + Glowing India Card ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center: Overview text + 4 Feature Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              GPMS is a one-stop digital platform designed to monitor the planning,
              implementation and progress of government infrastructure projects. It brings
              transparency, accountability and efficiency through real-time monitoring,
              data analytics and AI-driven insights.
            </p>

            {/* "Know More About Us" Action Button */}
            <div>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-blue-600/30 bg-blue-50 dark:bg-blue-950/40 px-4 py-2 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
              >
                <span>Know More About Us</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* 4 Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`flex size-9 items-center justify-center rounded-lg border mb-3 ${feat.color}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Glowing Neon India Map Card (5 cols) */}
          <div className="lg:col-span-5">
            <IndiaMapGlowCard />
          </div>
        </div>
      </div>
    </section>
  );
}
