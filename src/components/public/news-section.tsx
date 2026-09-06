"use client";

import React from "react";
import { PUBLIC_NEWS } from "@/config/public-data";
import {
  Newspaper,
  Calendar,
  ArrowRight,
  ExternalLink,
  BellRing,
} from "lucide-react";

export function NewsSection() {
  return (
    <section id="news" className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-blue-600" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                News & Government Updates
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Official press releases, gazette notifications, and project sanction announcements
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>View All Gazettes</span>
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PUBLIC_NEWS.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                    {item.tag}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="size-3" />
                    {item.date}
                  </span>
                </div>

                <p className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400 line-clamp-1">
                  {item.ministry}
                </p>

                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {item.snippet}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
                <span>Read Full Circular</span>
                <ArrowRight className="size-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
