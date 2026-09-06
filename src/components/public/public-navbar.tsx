"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GovernmentEmblem } from "@/components/public/icons/emblem";
import { IndianFlagIcon } from "@/components/public/icons/flag";
import {
  Lock,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Globe,
  SlidersHorizontal,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";

export function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/#" },
    { label: "About Us", href: "/#about" },
    { label: "Projects", href: "/explore" },
    { label: "Dashboard Overview", href: "/#monitoring" },
    { label: "AI Insights", href: "/#ai-insights" },
    { label: "News & Updates", href: "/#news" },
    { label: "Contact Us", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* ── Top Official Government Strip ── */}
      <div className="bg-[#030712] border-b border-white/10 text-[11px] text-slate-300 px-4 py-1.5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: Government of India attribution */}
          <div className="flex items-center gap-2">
            <IndianFlagIcon className="size-3.5" />
            <span className="font-semibold tracking-wide text-white uppercase text-[10px] sm:text-[11px]">
              GOVERNMENT OF INDIA
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 font-hindi hidden sm:inline">
              भारत सरकार
            </span>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="text-cyan-400 hidden md:inline text-[10px] font-mono">
              PAIMANA & PM GATISHAKTI INTEGRATED
            </span>
          </div>

          {/* Right: Accessibility & Language Utilities */}
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="#main-content"
              className="hover:text-white transition-colors hidden lg:inline text-slate-400"
            >
              Skip to Main Content
            </a>
            <div className="flex items-center gap-1.5 border-l border-white/15 pl-3 text-slate-300">
              <span className="hover:text-white cursor-pointer px-1 py-0.5 rounded text-[10px]">A-</span>
              <span className="hover:text-white cursor-pointer px-1 py-0.5 rounded text-[10px] font-bold">A</span>
              <span className="hover:text-white cursor-pointer px-1 py-0.5 rounded text-[10px]">A+</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-white/15 pl-3">
              <Globe className="size-3 text-cyan-400" />
              <button
                type="button"
                className="hover:text-white text-slate-200 font-medium cursor-pointer"
                onClick={() => {}}
              >
                English / हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Government Navbar ── */}
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#071126]/95 backdrop-blur-md shadow-xl border-b border-cyan-500/20 py-2.5"
            : "bg-[#08122c] border-b border-white/10 py-3.5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand: Emblem + Title */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="transition-transform group-hover:scale-105 duration-200">
              <GovernmentEmblem className="h-10 w-9 sm:h-12 sm:w-10 drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                  GPMS
                </span>
                <span className="rounded-xs bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 tracking-wider border border-cyan-500/30">
                  NATIONAL
                </span>
              </div>
              <span className="text-[11px] sm:text-[12px] font-semibold text-slate-200 tracking-tight mt-0.5">
                Government Project Monitoring System
              </span>
              <span className="text-[9px] text-slate-400 hidden sm:block">
                Ministry of Statistics & Programme Implementation
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link, idx) => {
              const isFirst = idx === 0;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-xs xl:text-sm font-medium transition-colors rounded-md ${
                    isFirst
                      ? "text-white font-semibold"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {isFirst && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Explore Projects link for small screens */}
            <Link
              href="/explore"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/40 transition-colors"
            >
              <Search className="size-3.5" />
              <span>Explore Projects</span>
            </Link>

            {/* "Login to System" Official Button */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 hover:bg-white/15 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition-all shadow-sm hover:border-cyan-400/50 hover:shadow-cyan-500/20 group"
            >
              <Lock className="size-3.5 text-cyan-300 transition-transform group-hover:scale-110" />
              <span>Login to System</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center size-9 rounded-lg border border-white/15 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#071126]/98 backdrop-blur-xl px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="size-4 text-slate-500" />
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-950/50 py-2.5 text-sm font-semibold text-cyan-300"
              >
                <Search className="size-4" />
                <span>Explore Public Projects</span>
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-semibold text-white"
              >
                <Lock className="size-4" />
                <span>Login to Official System</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
