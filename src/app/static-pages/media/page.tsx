"use client";

import { PageHeader } from "@/components/PageHeader";
import { GlobalSectionRef } from "@/app/components/GlobalSectionRef";
import { MediaHero } from "./components/MediaHero";
import { MediaCoverage } from "./components/MediaCoverage";

export default function MediaCMSPage() {
  return (
    <section className="flex flex-col gap-6 pb-16">
      <PageHeader
        title="Media & Articles"
        description="Manage all sections displayed on the live website /media page, in exact website order."
      />

      <MediaHero />
      <MediaCoverage />
      <GlobalSectionRef
        title="Growth CTA & Brief Modal"
        description="Let's Talk CTA section, office timezone clocks, and project brief modal copy (shared globally across the site)."
      />
    </section>
  );
}
