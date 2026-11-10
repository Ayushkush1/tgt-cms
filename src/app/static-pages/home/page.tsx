"use client";

import { PageHeader } from "@/components/PageHeader";
import { GrowthHero } from "./components/GrowthHero";
import { Showreel } from "./components/Showreel";
import { Manifesto } from "./components/Manifesto";
import { ServicePillars } from "./components/ServicePillars";
import { WorkShowcase } from "./components/WorkShowcase";
import { GrowthProcess } from "./components/GrowthProcess";
import { Testimonials } from "./components/Testimonials";
import { Insights } from "./components/Insights";
import { GlobalSectionRef } from "@/app/components/GlobalSectionRef";
import { StickyCTA } from "./components/StickyCTA";

export default function HomeCMSPage() {
  return (
    <section className="flex flex-col gap-6 pb-16">
      <PageHeader
        title="Home Page Content"
        description="Manage all sections displayed on the live website Home page, in exact website order."
      />

      <GrowthHero />
      <Showreel />
      <Manifesto />
      <ServicePillars />
      <WorkShowcase />
      <GrowthProcess />
      <Testimonials />
      <Insights />
      <GlobalSectionRef
        title="Growth CTA & Brief Modal"
        description="Let's Talk CTA section, office timezone clocks, and project brief modal copy (shared globally across the site)."
      />
      <StickyCTA />
    </section>
  );
}
