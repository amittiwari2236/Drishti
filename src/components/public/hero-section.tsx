"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IndianFlagIcon } from "@/components/public/icons/flag";
import { HERO_VIDEO_ITEMS } from "@/config/public-data";
import {
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  TrendingUp,
  Activity,
  CheckCircle2,
  Coins,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";

export function HeroSection() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progressPercent, setProgressPercent] = useState(48);
  const [secondsElapsed, setSecondsElapsed] = useState(45);

  const activeVideo = HERO_VIDEO_ITEMS[activeVideoIndex];

  // Simulated playback timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => {
          if (prev >= 90) return 0;
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    setProgressPercent(Math.min(100, Math.round((secondsElapsed / 90) * 100)));
  }, [secondsElapsed]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#060e24] via-[#081330] to-[#040816] text-white pt-10 pb-16 lg:pt-14 lg:pb-24">
      {/* Background ambient lighting and grid lines */}
      <div className="pointer-events-none absolute inset-0">
        {/* Glow blooms */}
        <div className="absolute top-0 left-1/4 size-[550px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute top-1/3 right-10 size-[450px] rounded-full bg-cyan-500/12 blur-[100px]" />
        {/* Infrastructure grid mesh */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Top Hero Grid: Left Content + Right Video Card ── */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          {/* ── Left Column: Headline & Action CTAs (5 cols on large screens) ── */}
          <div className="lg:col-span-5 space-y-6">
            {/* "Building a New India" Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 backdrop-blur-md shadow-sm">
              <IndianFlagIcon className="size-4" />
              <span className="text-xs font-semibold text-slate-200 tracking-wide">
                Building a New India
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Monitor. Manage.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-teal-300 drop-shadow-[0_0_25px_rgba(34,211,238,0.35)]">
                  Deliver.
                </span>
              </h1>
            </div>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
              GPMS is an integrated platform to monitor and manage government
              projects in real time with AI-powered insights for better decision
              making and timely delivery.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/35 hover:bg-blue-500 hover:shadow-blue-500/45 transition-all group"
              >
                <span>Explore Projects</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#about"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all"
              >
                <div className="flex size-6 items-center justify-center rounded-full bg-white/15">
                  <Play className="size-3 text-cyan-300 fill-cyan-300 ml-0.5" />
                </div>
                <span>Learn More</span>
              </a>
            </div>

            {/* Key Indicators Mini-strip */}
            <div className="pt-4 border-t border-white/10 flex items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span>Live Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-cyan-400" />
                <span>AI Risk Forecasting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="size-3.5 text-blue-400" />
                <span>Geo-Tagged Updates</span>
              </div>
            </div>
          </div>

          {/* ── Right Column: Project Video Area + Live Stats Card (7 cols) ── */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            {/* ── Video Player Area (8 cols of 12) ── */}
            <div className="md:col-span-8 rounded-2xl border border-white/15 bg-slate-950/70 p-3 shadow-2xl backdrop-blur-lg flex flex-col justify-between">
              {/* Card Header */}
              <div className="flex items-center justify-between px-2 pt-1 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-bold text-white tracking-tight">
                    Nation Building in Progress
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                  {activeVideo.category}
                </span>
              </div>

              {/* Video Screen / Media Player */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 group">
                <img
                  src={activeVideo.image}
                  alt={activeVideo.title}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Project overlay info in video */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white border border-white/10">
                    {activeVideo.title}
                  </span>
                  <span className="text-[10px] text-slate-300 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md border border-white/10 backdrop-blur">
                    <MapPin className="size-2.5 text-cyan-400" />
                    {activeVideo.location.split(",")[0]}
                  </span>
                </div>

                {/* Large Central Circular Play Button */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-white/95 text-blue-600 shadow-xl shadow-black/40 hover:scale-110 hover:bg-white transition-all cursor-pointer z-10"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? (
                    <Pause className="size-6 fill-blue-600" />
                  ) : (
                    <Play className="size-6 fill-blue-600 ml-1" />
                  )}
                </button>

                {/* Video Bottom Control Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-3 pt-6 flex flex-col gap-1.5 z-10">
                  {/* Scrubber / Progress Bar */}
                  <div className="relative h-1 w-full bg-white/20 rounded-full cursor-pointer overflow-hidden group/bar">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Controls row */}
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="hover:text-white"
                        aria-label="Play/Pause"
                      >
                        {isPlaying ? (
                          <Pause className="size-3.5 fill-current" />
                        ) : (
                          <Play className="size-3.5 fill-current" />
                        )}
                      </button>
                      <span className="text-[11px] font-mono text-slate-300">
                        {formatTime(secondsElapsed)} / {activeVideo.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className="hover:text-white"
                        aria-label="Toggle mute"
                      >
                        {isMuted ? (
                          <VolumeX className="size-3.5" />
                        ) : (
                          <Volume2 className="size-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        className="hover:text-white"
                        aria-label="Settings"
                      >
                        <Settings className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="hover:text-white"
                        aria-label="Fullscreen"
                      >
                        <Maximize2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Playlist Quick-Switch Selector */}
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {HERO_VIDEO_ITEMS.map((item, idx) => {
                  const isSelected = activeVideoIndex === idx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveVideoIndex(idx);
                        setSecondsElapsed(0);
                        setIsPlaying(true);
                      }}
                      className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white font-semibold shadow-sm"
                          : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item.category.split("&")[0].trim()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Live Floating Stats Card (4 cols of 12) ── */}
            <div className="md:col-span-4 rounded-2xl border border-white/15 bg-slate-900/80 p-4 shadow-xl backdrop-blur-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Stat Item 1: Total Projects */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <TrendingUp className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Projects</span>
                      <span className="font-bold text-sm text-white font-mono">1,248</span>
                    </div>
                  </div>
                  {/* Mini sparkline svg */}
                  <svg className="w-10 h-4 text-blue-400" viewBox="0 0 40 16" fill="none">
                    <path d="M1 12 L10 9 L20 13 L30 5 L39 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Stat Item 2: Active Projects */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Activity className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Active Projects</span>
                      <span className="font-bold text-sm text-emerald-400 font-mono">965</span>
                    </div>
                  </div>
                  {/* Mini sparkline svg */}
                  <svg className="w-10 h-4 text-emerald-400" viewBox="0 0 40 16" fill="none">
                    <path d="M1 14 L12 11 L22 6 L30 8 L39 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Stat Item 3: Completed Projects */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Completed Projects</span>
                      <span className="font-bold text-sm text-sky-400 font-mono">283</span>
                    </div>
                  </div>
                  {/* Mini sparkline svg */}
                  <svg className="w-10 h-4 text-sky-400" viewBox="0 0 40 16" fill="none">
                    <path d="M1 10 L10 14 L20 8 L30 11 L39 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Stat Item 4: Total Budget */}
                <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 border border-white/5 hover:border-white/15 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                      <Coins className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Budget (₹)</span>
                      <span className="font-bold text-xs text-purple-300 font-mono">2,45,678 Cr</span>
                    </div>
                  </div>
                  {/* Mini sparkline svg */}
                  <svg className="w-10 h-4 text-purple-400" viewBox="0 0 40 16" fill="none">
                    <path d="M1 13 L12 8 L22 10 L31 4 L39 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* View Dashboard Overview Button */}
              <Link
                href="/explore"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-2.5 text-xs font-semibold text-white transition-all group"
              >
                <span>View Dashboard Overview</span>
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
