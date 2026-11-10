"use client";

import { PageHeader } from "@/components/PageHeader";
import { GlobalSectionRef } from "@/app/components/GlobalSectionRef";
import { ContactHero } from "./components/ContactHero";
import { ContactDirect } from "./components/ContactDirect";
import MapSection from "./components/MapSection";

export default function ContactCMSPage() {
  return (
    <section className="flex flex-col gap-6 pb-16">
      <PageHeader
        title="Contact Page Content"
        description="Manage all sections displayed on the live website Contact Us (/contactUs) page, in exact website order."
      />

      <ContactHero />
      <ContactDirect />
      <MapSection />
      <GlobalSectionRef
        title="Email, Phone, Office Addresses & Social Links (FooterCMS)"
        description="Direct email, phone, social channels, and Noida / Dubai addresses shown on /contactUs are managed globally in Social Media & Footer."
        href="/navigation/social-media"
      />
      <GlobalSectionRef
        title="Brief Form & Office Timezone Clocks (GrowthCTA)"
        description="Brief form options (interests, budgets, labels) and live office clocks shown on /contactUs are shared globally with Growth CTA."
        href="/navigation/social-media#growth-cta"
      />
    </section>
  );
}
