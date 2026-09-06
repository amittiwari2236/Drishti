"use client";

import React from "react";
import {
  Users2,
  Activity,
  CheckCircle2,
  Coins,
  Landmark,
  MapPin,
  Cpu,
  Layers,
} from "lucide-react";

export function PublicStatsStrip() {
  const stats = [
    {
      label: "Total Projects",
      value: "1,248+",
      icon: Users2,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400",
      accent: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Active Projects",
      value: "965",
      icon: Activity,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      accent: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Completed Projects",
      value: "283",
      icon: CheckCircle2,
      color: "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400",
      accent: "text-teal-600 dark:text-teal-400",
    },
    {
      label: "Total Budget",
      value: "2,45,678 Cr",
      icon: Coins,
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
      accent: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Ministries",
      value: "36",
      icon: Landmark,
      color: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
      accent: "text-sky-700 dark:text-sky-400",
    },
    {
      label: "States / UTs",
      value: "28",
      icon: MapPin,
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
      accent: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Smart Insights",
      value: "AI Powered",
      icon: Cpu,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
      accent: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="relative -mt-8 sm:-mt-10 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 sm:p-6 shadow-xl shadow-slate-900/10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7 lg:divide-x lg:divide-slate-100 dark:lg:divide-slate-800">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`flex items-center gap-3 py-1 ${
                  idx !== 0 ? "lg:pl-4" : ""
                } group`}
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 duration-200 ${stat.color}`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white font-mono leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
