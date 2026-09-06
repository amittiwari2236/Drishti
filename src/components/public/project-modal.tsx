"use client";

import React from "react";
import type { PublicProject } from "@/config/public-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  IndianRupee,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

interface ProjectModalProps {
  project: PublicProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PublicProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  if (!project) return null;

  const statusConfig = {
    ON_TRACK: { label: "On Track", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300" },
    UNDER_IMPLEMENTATION: { label: "Under Implementation", color: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300" },
    COMPLETED: { label: "Completed", color: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30 dark:text-indigo-300" },
    DELAYED: { label: "Schedule Delayed", color: "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300" },
    PLANNING: { label: "Sanctioned / Planning", color: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300" },
  }[project.status] || { label: project.status, color: "bg-slate-500/15 text-slate-700 border-slate-500/30" };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Modal Header Media & Titles */}
        <div className="relative h-52 sm:h-64 w-full shrink-0 overflow-hidden bg-slate-900">
          <img
            src={project.image}
            alt={project.projectName}
            className="size-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Badge className="bg-blue-600/90 hover:bg-blue-600 text-white font-medium backdrop-blur">
              {project.category}
            </Badge>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold backdrop-blur ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-xs font-mono text-cyan-300 tracking-wide uppercase">
              ID: {project.projectId}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight mt-0.5">
              {project.projectName}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1">
              <MapPin className="size-3.5 text-cyan-400 shrink-0" />
              <span>{project.location} ({project.state})</span>
            </p>
          </div>
        </div>

        {/* Scrollable details body */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm">
          {/* Progress Bar Strip */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs tracking-wide uppercase text-slate-600 dark:text-slate-400">
                Physical Work Progress
              </span>
              <span className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">
                {project.progress}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Sanction Cost</span>
                <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                  ₹ {project.estimatedCost.toLocaleString()} Cr
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Expended to Date</span>
                <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                  ₹ {project.expenditure.toLocaleString()} Cr
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Start Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {project.startDate}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Target Completion</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {project.expectedCompletion}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-1.5 flex items-center gap-1.5">
              <Layers className="size-4 text-blue-600" />
              Project Scope & Overview
            </h4>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Administrative Hierarchy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
              <span className="text-[11px] font-medium text-muted-foreground block">Ministry</span>
              <p className="font-semibold text-xs mt-0.5 text-foreground leading-snug">
                {project.ministry}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
              <span className="text-[11px] font-medium text-muted-foreground block">Department</span>
              <p className="font-semibold text-xs mt-0.5 text-foreground leading-snug">
                {project.department}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
              <span className="text-[11px] font-medium text-muted-foreground block">Implementing Agency</span>
              <p className="font-semibold text-xs mt-0.5 text-foreground leading-snug">
                {project.agency}
              </p>
            </div>
          </div>

          {/* Strategic Highlights */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Strategic Highlights & Technical Features
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted-foreground rounded-md bg-slate-50 dark:bg-slate-900/50 p-2.5 border border-slate-200/50 dark:border-slate-800/50"
                  >
                    <span className="size-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Risk Score indicator */}
          <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-sky-950/10 to-transparent p-3.5 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-cyan-500" />
              <div>
                <span className="font-semibold text-foreground block">GPMS AI Monitoring Index</span>
                <span className="text-muted-foreground text-[11px]">
                  Autonomous schedule variance & procurement anomaly detection
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              {project.aiRiskScore} Risk Rating
            </span>
          </div>

          {/* Public Transparency Disclaimer */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              Verified Public Registry — Government of India
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium hover:opacity-90 transition-opacity"
            >
              Close Record
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
