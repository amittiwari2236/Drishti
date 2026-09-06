"use client";

import React, { useState, useMemo } from "react";
import {
  EXPLORE_ALL_PROJECTS,
  PUBLIC_MINISTRIES,
  PUBLIC_SECTORS,
  PUBLIC_STATES,
  type PublicProject,
} from "@/config/public-data";
import { PublicProjectModal } from "@/components/public/project-modal";
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Building2,
  Calendar,
  IndianRupee,
  MapPin,
  TrendingUp,
  Grid,
  List,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowUpDown,
  Layers,
} from "lucide-react";

export function ProjectExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMinistry, setSelectedMinistry] = useState("All Ministries");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [selectedState, setSelectedState] = useState("All States/UTs");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState<"cost-desc" | "cost-asc" | "progress-desc" | "name">("cost-desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [selectedProject, setSelectedProject] = useState<PublicProject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter & Sort logic
  const filteredProjects = useMemo(() => {
    return EXPLORE_ALL_PROJECTS.filter((proj) => {
      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = proj.projectName.toLowerCase().includes(q);
        const matchId = proj.projectId.toLowerCase().includes(q);
        const matchLoc = proj.location.toLowerCase().includes(q);
        const matchMin = proj.ministry.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchLoc && !matchMin) return false;
      }

      // Ministry filter
      if (selectedMinistry !== "All Ministries" && proj.ministry !== selectedMinistry) {
        return false;
      }

      // Sector filter
      if (selectedSector !== "All Sectors" && proj.sector !== selectedSector) {
        return false;
      }

      // State filter
      if (selectedState !== "All States/UTs" && proj.state !== selectedState && !proj.state.includes("Multiple") && !proj.state.includes("Pan-India")) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "ALL" && proj.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "cost-desc") return b.estimatedCost - a.estimatedCost;
      if (sortBy === "cost-asc") return a.estimatedCost - b.estimatedCost;
      if (sortBy === "progress-desc") return b.progress - a.progress;
      if (sortBy === "name") return a.projectName.localeCompare(b.projectName);
      return 0;
    });
  }, [searchQuery, selectedMinistry, selectedSector, selectedState, selectedStatus, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedMinistry("All Ministries");
    setSelectedSector("All Sectors");
    setSelectedState("All States/UTs");
    setSelectedStatus("ALL");
    setSortBy("cost-desc");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedMinistry !== "All Ministries" ||
    selectedSector !== "All Sectors" ||
    selectedState !== "All States/UTs" ||
    selectedStatus !== "ALL";

  const getStatusBadge = (status: PublicProject["status"]) => {
    switch (status) {
      case "ON_TRACK":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">On Track</span>;
      case "UNDER_IMPLEMENTATION":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">In Progress</span>;
      case "COMPLETED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Completed</span>;
      case "DELAYED":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">Delayed</span>;
      case "PLANNING":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">Sanctioned</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Search & Filter Control Deck ── */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm space-y-4">
        {/* Top Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, Project ID, sector, or nodal ministry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 pl-10 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Filter Selects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Ministry Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Ministry / Department
            </label>
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
            >
              {PUBLIC_MINISTRIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Infrastructure Sector
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
            >
              {PUBLIC_SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* State / UT Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              State / Location
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
            >
              {PUBLIC_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Execution Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 focus:border-blue-600 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ON_TRACK">On Track</option>
              <option value="UNDER_IMPLEMENTATION">Under Implementation</option>
              <option value="COMPLETED">Completed</option>
              <option value="DELAYED">Delayed</option>
              <option value="PLANNING">Planning / Sanctioned</option>
            </select>
          </div>
        </div>

        {/* Action strip: Result count, Sort, View toggle, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Showing <strong className="text-blue-600 dark:text-blue-400 font-mono">{filteredProjects.length}</strong> of {EXPLORE_ALL_PROJECTS.length} National Projects
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 font-medium transition-colors"
              >
                <X className="size-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="size-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300"
              >
                <option value="cost-desc">Cost: High to Low</option>
                <option value="cost-asc">Cost: Low to High</option>
                <option value="progress-desc">Progress: High to Low</option>
                <option value="name">Project Name (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Grid View"
              >
                <Grid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Table View"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Empty State ── */}
      {filteredProjects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-12 text-center space-y-3">
          <Layers className="size-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            No infrastructure projects match your filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try broadening your search term or resetting sector, state, or ministry filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 text-white px-4 py-2 text-xs font-semibold hover:bg-blue-500 transition-colors"
          >
            <span>Reset All Filters</span>
          </button>
        </div>
      )}

      {/* ── Grid View ── */}
      {viewMode === "grid" && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => {
                setSelectedProject(proj);
                setIsModalOpen(true);
              }}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              {/* Card Image */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <img
                  src={proj.image}
                  alt={proj.projectName}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                {/* Badges on image */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-600/90 text-white backdrop-blur shadow-xs">
                    {proj.sector}
                  </span>
                  {getStatusBadge(proj.status)}
                </div>

                {/* Bottom of image: ID & Location */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
                  <span className="font-mono text-cyan-300 font-semibold">{proj.projectId}</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="size-3 text-cyan-400" />
                    {proj.state}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {proj.projectName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    {proj.ministry}
                  </p>
                </div>

                {/* Cost and Progress row */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sanctioned Budget</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        ₹ {proj.estimatedCost.toLocaleString()} Cr
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Work Progress</span>
                      <span className="font-bold font-mono text-blue-600 dark:text-blue-400">
                        {proj.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer action button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  <span>View Public Details</span>
                  <Eye className="size-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Table View ── */}
      {viewMode === "table" && filteredProjects.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Project ID</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Sector</th>
                  <th className="py-3 px-4">Ministry</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 font-mono">Budget (₹ Cr)</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.map((proj) => (
                  <tr
                    key={proj.id}
                    onClick={() => {
                      setSelectedProject(proj);
                      setIsModalOpen(true);
                    }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {proj.projectId}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-[220px] truncate">
                      {proj.projectName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {proj.sector}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                      {proj.ministry}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {proj.state}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₹ {proj.estimatedCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                          {proj.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(proj.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        Details →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Read-Only Modal */}
      <PublicProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
