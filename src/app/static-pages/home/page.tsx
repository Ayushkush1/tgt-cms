"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronRight, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { HeroSection } from "@/components/cms/sections/HeroSection";
import { WhoWeAreSection } from "@/components/cms/sections/WhoWeAreSection";
import { WhatWeDoSection } from "@/components/cms/sections/WhatWeDoSection";
import { IntegrationsSection } from "@/components/cms/sections/IntegrationsSection";
import { OurPartnersSection } from "@/components/cms/sections/OurPartnersSection";
import { OurReputationSection } from "@/components/cms/sections/OurReputationSection";
import EnquirySection from "./components/EnquirySection";
import TrustedBySection from "../components/TrustedBySection";
import { GrowthHero } from "./components/GrowthHero";
import { Showreel } from "./components/Showreel";
import { Manifesto } from "./components/Manifesto";
import { ServicePillars } from "./components/ServicePillars";
import { WorkShowcase } from "./components/WorkShowcase";
import { GrowthProcess } from "./components/GrowthProcess";
import { Testimonials } from "./components/Testimonials";
import { Insights } from "./components/Insights";
import { GrowthCTA } from "./components/GrowthCTA";
import { StickyCTA } from "./components/StickyCTA";

export default function HomeCMSPage() {
  const [showLegacy, setShowLegacy] = useState(false);

  return (
    <section className="flex flex-col gap-6 pb-16">
      <PageHeader
        title="Home Page Content"
        description="Manage all sections displayed on the live website Home page, in website order."
      />

      {/* Live website Home page sections */}
      <GrowthHero />
      <TrustedBySection />
      <Showreel />
      <Manifesto />
      <ServicePillars />
      <WorkShowcase />
      <GrowthProcess />
      <Testimonials />
      <OurReputationSection />
      <Insights />
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200/80 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[#B8932A]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0B0F29]">Blog Posts &amp; Articles</p>
            <p className="text-xs text-gray-500">
              All blog articles for Home (Insights), /blog, and /blog/[slug] are managed in one
              place.
            </p>
          </div>
        </div>
        <Link
          href="/static-pages/blog"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0B0F29] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-black"
        >
          Manage Blog Page
          <ArrowUpRight className="h-3.5 w-3.5 text-[#D4AF37]" />
        </Link>
      </div>
      <GrowthCTA />
      <StickyCTA />

      {/* Legacy / shared fallback sections */}
      <div className="mt-4 rounded-2xl border border-gray-200/80 bg-gray-50/70 p-4">
        <button
          type="button"
          onClick={() => setShowLegacy((v) => !v)}
          className="flex w-full items-center justify-between px-2 py-1 text-left"
        >
          <div>
            <p className="text-sm font-bold text-gray-700">Legacy &amp; Fallback Sections</p>
            <p className="text-xs text-gray-500">
              Enquiry contact fallback (shared with Contact page) and older unused Home sections.
            </p>
          </div>
          {showLegacy ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {showLegacy && (
          <div className="mt-4 flex flex-col gap-5">
            <EnquirySection />
            <HeroSection />
            <WhoWeAreSection />
            <WhatWeDoSection />
            <IntegrationsSection />
            <OurPartnersSection />
          </div>
        )}
      </div>
    </section>
  );
}
