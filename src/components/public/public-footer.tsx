"use client";

import React from "react";
import Link from "next/link";
import { GovernmentEmblem } from "@/components/public/icons/emblem";
import { IndianFlagIcon } from "@/components/public/icons/flag";
import {
  ShieldCheck,
  ExternalLink,
  Lock,
  ChevronUp,
  Globe,
  Award,
} from "lucide-react";

export function PublicFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#04091a] text-slate-400 text-xs border-t border-white/10">
      {/* ── National Digital India & Portal Partners Ribbon ── */}
      <div className="border-b border-white/10 bg-[#02050f] py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              National Digital Platforms:
            </span>
            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              <span className="hover:text-white transition-colors cursor-pointer">
                India.gov.in (National Portal)
              </span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">
                PM GatiShakti Master Plan
              </span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">
                MyGov.in
              </span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">
                MoSPI Data Bank
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
          >
            <span>Back to Top</span>
            <ChevronUp className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Main Footer Directory Grid ── */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Branding & National Charter (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <GovernmentEmblem className="h-10 w-9" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-white tracking-tight">GPMS</span>
                  <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                    OFFICIAL
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-300">
                  Government Project Monitoring System
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An authoritative digital monitoring platform of the Government of India for tracking major infrastructure investments, milestones, and expenditure transparency across the nation.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-white font-medium backdrop-blur transition-colors"
              >
                <Lock className="size-3 text-cyan-300" />
                <span>Officer Login Portal</span>
              </Link>
            </div>
          </div>

          {/* Col 3: Key Sectors */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Priority Sectors
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Roads & National Highways
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Railways & High-Speed Rail
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Urban Mass Transit (Metro)
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Renewable Energy & Power
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Water Resources & Irrigation
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Civil Aviation & Ports
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Public Resources */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Public Resources
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  National Project Explorer
                </Link>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About the GPMS Framework
                </a>
              </li>
              <li>
                <a href="#monitoring" className="hover:text-white transition-colors">
                  Real-time Monitoring Protocols
                </a>
              </li>
              <li>
                <a href="#news" className="hover:text-white transition-colors">
                  Monthly Review Bulletins
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Citizen Feedback & RTI Desk
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Compliance & Security */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Governance & Policies
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li className="hover:text-white cursor-pointer">Terms & Conditions</li>
              <li className="hover:text-white cursor-pointer">Privacy & Data Protection</li>
              <li className="hover:text-white cursor-pointer">Hyperlinking Policy</li>
              <li className="hover:text-white cursor-pointer">Copyright Policy</li>
              <li className="hover:text-white cursor-pointer">Accessibility Statement</li>
              <li className="hover:text-white cursor-pointer">Security & Audit Compliance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Mandatory NIC Attribution & Copyright ── */}
      <div className="border-t border-white/10 bg-[#02050e] py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 text-center md:text-left">
          <div className="space-y-1">
            <p>
              Website Content Managed & Published by{" "}
              <strong className="text-slate-200">
                Ministry of Statistics and Programme Implementation (MoSPI)
              </strong>
              , Government of India.
            </p>
            <p className="text-slate-400">
              Designed, developed, and maintained by{" "}
              <strong className="text-slate-200">National Informatics Centre (NIC)</strong>.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1 text-[11px]">
            <p className="text-slate-400">
              © 2026 Government of India. All rights reserved.
            </p>
            <p className="font-mono text-cyan-400 text-[10px]">
              Last Updated: 06 Sep 2026 | Portal Version: 3.4.1 (National Release)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
