"use client";

import React, { useState } from "react";
import { Sparkles, MapPin, Building2, Zap } from "lucide-react";

interface HubPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  projectsCount: number;
  sector: string;
}

const HUBS: HubPoint[] = [
  { id: "delhi", name: "Delhi NCR", x: 38, y: 28, projectsCount: 142, sector: "Highways & Expressways" },
  { id: "mumbai", name: "Mumbai Region", x: 26, y: 55, projectsCount: 186, sector: "High Speed Rail & Ports" },
  { id: "bengaluru", name: "Bengaluru", x: 35, y: 78, projectsCount: 118, sector: "Metro & Tech Corridors" },
  { id: "hyderabad", name: "Hyderabad", x: 42, y: 64, projectsCount: 94, sector: "Urban Transit & Pharma" },
  { id: "chennai", name: "Chennai", x: 44, y: 82, projectsCount: 105, sector: "Automotive & Freight" },
  { id: "ahmedabad", name: "Ahmedabad", x: 23, y: 44, projectsCount: 88, sector: "Bullet Train & Solar" },
  { id: "kolkata", name: "Kolkata", x: 74, y: 48, projectsCount: 92, sector: "Dedicated Freight" },
  { id: "varanasi", name: "Varanasi - Prayagraj", x: 55, y: 38, projectsCount: 64, sector: "Inland Waterways" },
  { id: "guwahati", name: "Guwahati Hub", x: 86, y: 35, projectsCount: 52, sector: "Northeast Multi-Modal" },
  { id: "srinagar", name: "Srinagar - Jammu", x: 31, y: 13, projectsCount: 47, sector: "Chenab Bridge & Tunnels" },
];

export function IndiaMapGlowCard() {
  const [activeHub, setActiveHub] = useState<HubPoint | null>(HUBS[0]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#060e22] via-[#091536] to-[#040816] p-6 text-white shadow-2xl shadow-cyan-950/40">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-12 size-64 rounded-full bg-blue-600/15 blur-3xl" />

      {/* Grid texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Left / Center: Interactive Glowing SVG Map */}
        <div className="relative mx-auto flex h-[220px] w-full max-w-[260px] items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="size-full filter drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outline of India (Stylized High-Tech Polygon Contour) */}
            <path
              d="
                M 34 8 
                C 38 7, 42 12, 45 16 
                C 47 21, 52 23, 56 25
                C 62 26, 68 28, 73 30
                C 79 32, 85 28, 90 32
                C 94 35, 91 41, 87 43
                C 82 45, 78 44, 75 47
                C 72 50, 71 56, 66 58
                C 62 60, 58 64, 53 69
                C 49 74, 46 80, 44 88
                C 42 93, 40 96, 38 95
                C 35 91, 33 84, 32 78
                C 30 72, 27 67, 26 62
                C 24 57, 19 55, 17 50
                C 14 46, 17 40, 22 39
                C 26 38, 28 35, 29 30
                C 30 25, 27 20, 29 14
                Z
              "
              stroke="#0ea5e9"
              strokeWidth="1.2"
              fill="#0ea5e9"
              fillOpacity="0.06"
              strokeDasharray="1 0"
            />

            {/* Internal Geometric Connectivity Grid */}
            <path
              d="M38 28 L26 55 L35 78 L44 82 L74 48 L55 38 L38 28 Z"
              stroke="#22d3ee"
              strokeWidth="0.5"
              strokeOpacity="0.3"
              strokeDasharray="2 2"
            />
            <path
              d="M38 28 L31 13 M38 28 L86 35 M38 28 L42 64 M26 55 L23 44"
              stroke="#22d3ee"
              strokeWidth="0.5"
              strokeOpacity="0.25"
            />

            {/* Glowing Nodal Points */}
            {HUBS.map((hub) => {
              const isSelected = activeHub?.id === hub.id;
              return (
                <g
                  key={hub.id}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setActiveHub(hub)}
                >
                  {/* Ping animation on active */}
                  {isSelected && (
                    <circle
                      cx={hub.x}
                      cy={hub.y}
                      r="4.5"
                      fill="#22d3ee"
                      fillOpacity="0.3"
                      className="animate-ping origin-center"
                    />
                  )}
                  <circle
                    cx={hub.x}
                    cy={hub.y}
                    r={isSelected ? "3" : "1.8"}
                    fill={isSelected ? "#38bdf8" : "#22d3ee"}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? "1" : "0.5"}
                    className="drop-shadow-[0_0_6px_#38bdf8]"
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Pill indicator on active node */}
          {activeHub && (
            <div className="pointer-events-none absolute bottom-1 left-2 flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-slate-900/90 px-2.5 py-1 text-[10px] text-cyan-300 backdrop-blur">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-semibold">{activeHub.name}</span>
              <span className="text-slate-400 font-mono">({activeHub.projectsCount} projs)</span>
            </div>
          )}
        </div>

        {/* Right: Text & Strategic Metric */}
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300 border border-cyan-500/20">
              <Sparkles className="size-3" />
              <span>National Footprint</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
              Empowering India&apos;s
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-400">
                Growth Story
              </span>
            </h3>
            <p className="text-sm font-medium text-slate-300">
              One Project at a Time
            </p>
            {/* Cyan accent bar */}
            <div className="h-0.5 w-16 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full" />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time geospatial intelligence connecting PM GatiShakti national master plan with on-ground execution across 28 States & 8 Union Territories.
          </p>

          {/* Quick interactive hub info */}
          {activeHub && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs backdrop-blur">
              <div className="flex items-center justify-between text-slate-200">
                <span className="font-semibold text-cyan-300 flex items-center gap-1">
                  <MapPin className="size-3 text-cyan-400" />
                  {activeHub.name}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {activeHub.projectsCount} Live Projects
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Priority: {activeHub.sector}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
