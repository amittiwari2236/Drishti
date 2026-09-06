import type { Metadata } from "next";
import { PublicNavbar } from "@/components/public/public-navbar";
import { HeroSection } from "@/components/public/hero-section";
import { PublicStatsStrip } from "@/components/public/stats-strip";
import { AboutSection } from "@/components/public/about-section";
import { FeaturedProjects } from "@/components/public/featured-projects";
import { AIMonitoringSection } from "@/components/public/ai-monitoring-section";
import { NewsSection } from "@/components/public/news-section";
import { ContactSection } from "@/components/public/contact-section";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "GPMS — Government Project Monitoring System | Government of India",
  description:
    "An integrated national platform for transparent, intelligent and real-time monitoring of government infrastructure projects across India.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans selection:bg-cyan-500/20 selection:text-cyan-900 dark:selection:text-cyan-200">
      {/* ── 1. Sticky Responsive Government Navbar ── */}
      <PublicNavbar />

      {/* ── Main Content Area ── */}
      <main id="main-content" className="flex-1">
        {/* ── 2. Hero Section with Cinematic Video Area & Live Stats ── */}
        <HeroSection />

        {/* ── 3. Public Statistics Strip ── */}
        <PublicStatsStrip />

        {/* ── 4. About GPMS Section with Glowing India Map Card ── */}
        <AboutSection />

        {/* ── 5. Featured Projects Carousel Showcase ── */}
        <FeaturedProjects />

        {/* ── 6. AI Insights & Real-Time Monitoring Preview ── */}
        <AIMonitoringSection />

        {/* ── 7. News & Government Circulars Section ── */}
        <NewsSection />

        {/* ── 8. Public Contact & Citizen Grievance Portal ── */}
        <ContactSection />
      </main>

      {/* ── 9. Official National Government Footer ── */}
      <PublicFooter />
    </div>
  );
}
