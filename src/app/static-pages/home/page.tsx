"use client";

import { PageHeader } from "@/components/PageHeader";
import { HeroSection } from "@/components/cms/sections/HeroSection";
import { WhoWeAreSection } from "@/components/cms/sections/WhoWeAreSection";
import { WhatWeDoSection } from "@/components/cms/sections/WhatWeDoSection";
import { IntegrationsSection } from "@/components/cms/sections/IntegrationsSection";
import { OurPartnersSection } from "@/components/cms/sections/OurPartnersSection";
import { BlogSection } from "@/components/cms/sections/BlogSection";
import { OurReputationSection } from "@/components/cms/sections/OurReputationSection";
import EnquirySection from "./components/EnquirySection";
import FooterCMS from "../components/FooterCMS";
import TrustedBySection from "../components/TrustedBySection";

export default function HomeCMSPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Home Page Content"
        description="Manage the content displayed on the main landing page hero section."
      />

      <HeroSection />
      <TrustedBySection />
      <WhoWeAreSection />
      <WhatWeDoSection />
      <IntegrationsSection />
      <BlogSection />
      <OurReputationSection />
      <OurPartnersSection />
      <EnquirySection />
      <FooterCMS />
    </section>
  );
}
