"use client";

import { PageHeader } from "@/components/PageHeader";
import { GlobalSectionRef } from "@/app/components/GlobalSectionRef";
import { AboutHero } from "./components/AboutHero";
import { AboutStory } from "./components/AboutStory";
import { AboutPurpose } from "./components/AboutPurpose";
import { FounderNote } from "./components/FounderNote";
import { Journey } from "./components/Journey";
import { Team } from "./components/Team";
import { AboutFilm } from "./components/AboutFilm";

export default function AboutCMSPage() {
  return (
    <section className="flex flex-col gap-6 pb-16">
      <PageHeader
        title="About Page Content"
        description="Manage all sections displayed on the live website About page, in exact website order."
      />

      <AboutHero />
      <AboutStory />
      <AboutPurpose />
      <FounderNote />
      <Journey />
      <Team />
      <AboutFilm />
      <GlobalSectionRef
        title="Growth CTA & Brief Modal"
        description="Let's Talk CTA section, office timezone clocks, and project brief modal copy (shared globally across the site)."
      />
    </section>
  );
}
