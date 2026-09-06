"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  ShieldCheck,
  Building,
  HelpCircle,
} from "lucide-react";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    projectReference: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-blue-600" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Contact & Public Grievance Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Citizen enquiry, infrastructure feedback, and National Project Monitoring Unit (NPMU) helpdesk
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Contact Details & Headquarters Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-6 space-y-5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                National Project Monitoring Unit (NPMU)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Centralized oversight authority coordinating with Line Ministries, State Governments, and Implementing Agencies under PM GatiShakti.
              </p>

              <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Headquarters</span>
                    <span>Sardar Patel Bhawan, Sansad Marg, New Delhi — 110001</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Toll-Free Helpline</span>
                    <span className="font-mono">1800-11-GPMS (4767) / 011-23340000</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="size-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-900 dark:text-white">Public Enquiries & RTI</span>
                    <span className="font-mono">support-gpms@nic.in / feedback@mospi.gov.in</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <p className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  Official Government Support Desk (Monday - Friday, 9:00 AM - 5:30 PM IST)
                </p>
              </div>
            </div>
          </div>

          {/* Right: Citizen Feedback Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 sm:p-8 shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Grievance / Feedback Registered Successfully
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Your reference ID is <strong className="font-mono text-blue-600">GPMS-FB-2026-9042</strong>. A confirmation has been routed to the relevant Ministry nodal officer.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "", projectReference: "", message: "" });
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-semibold"
                >
                  Submit Another Feedback
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Submit Citizen Feedback or Project Enquiry
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Inquiries regarding project status, environmental clearances, or citizen impact
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ramesh Chandra"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. ramesh@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Subject / Topic *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Inquiry on Expressway Section 4"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Project ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NHAI-DME-2023"
                      value={formData.projectReference}
                      onChange={(e) => setFormData({ ...formData, projectReference: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Detailed Message or Public Query *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide detailed description of your observation or query..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-slate-900 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-5 py-2.5 font-semibold text-white transition-colors"
                >
                  <Send className="size-3.5" />
                  <span>Submit Public Feedback</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
