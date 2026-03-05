"use client";

import { PageHeader } from "@/components/PageHeader";
import HeroSection from "./components/HeroSection";
import WhoWeAre from "./components/WhoWeAre";
import WhatWeDo from "./components/WhatWeDo";
import Integrations from "../components/Integrations";
import OurPartners from "./components/OurPartners";
import BlogSection from "../components/BlogSection";
import OurReputation from "./components/OurReputation";
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
      <WhoWeAre />
      <WhatWeDo />
      <Integrations />
      <BlogSection />
      <OurReputation />
      <OurPartners />
      <EnquirySection />
      <FooterCMS />
    </section>
  );
}
