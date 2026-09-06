"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { FEATURED_PROJECTS, type PublicProject } from "@/config/public-data";
import { PublicProjectModal } from "@/components/public/project-modal";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Building2,
  ExternalLink,
  MapPin,
} from "lucide-react";

export function FeaturedProjects() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<PublicProject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleViewProject = (proj: PublicProject) => {
    setSelectedProject(proj);
    setIsModalOpen(true);
  };

  // Badge background coloring per sector
  const getSectorBadgeClass = (category: string) => {
    switch (category) {
      case "Transport":
        return "bg-blue-600 text-white";
      case "Railways":
        return "bg-emerald-600 text-white";
      case "Urban":
        return "bg-indigo-600 text-white";
      case "Energy":
        return "bg-amber-600 text-white";
      case "Water":
        return "bg-cyan-600 text-white";
      default:
        return "bg-slate-700 text-white";
    }
  };

  // Progress bar color
  const getProgressBarClass = (category: string) => {
    switch (category) {
      case "Transport":
        return "bg-blue-600";
      case "Railways":
        return "bg-emerald-500";
      case "Urban":
        return "bg-indigo-500";
      case "Energy":
        return "bg-amber-500";
      case "Water":
        return "bg-cyan-500";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <section id="projects" className="py-14 sm:py-18 bg-white dark:bg-slate-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ── Section Header Strip ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-7 w-1.5 rounded-full bg-blue-600" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Featured Projects
            </h2>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
          >
            <span>View All Projects</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ── Carousel Slider Container with Left & Right Arrows ── */}
        <div className="relative group/carousel">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-md hover:scale-105 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            aria-label="Previous project"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-md hover:scale-105 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            aria-label="Next project"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Horizontal Scroll Area */}
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth scrollbar-none"
          >
            {FEATURED_PROJECTS.map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleViewProject(proj)}
                className="w-[260px] sm:w-[280px] shrink-0 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                {/* Image Container with Sector Badge */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-900 group">
                  <img
                    src={proj.image}
                    alt={proj.projectName}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Category Pill on top-left of image */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${getSectorBadgeClass(
                        proj.category
                      )}`}
                    >
                      {proj.category}
                    </span>
                  </div>
                </div>

                {/* Card Info Details */}
                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 leading-snug">
                      {proj.projectName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {proj.ministry}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Progress
                      </span>
                      <span className="font-bold font-mono text-slate-700 dark:text-slate-200">
                        {proj.progress}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressBarClass(
                          proj.category
                        )}`}
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Read-Only Public Project Detail Modal */}
      <PublicProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
