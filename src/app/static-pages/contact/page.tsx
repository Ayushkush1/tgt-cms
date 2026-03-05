"use client";

import { PageHeader } from "@/components/PageHeader";
import MapSection from "./components/MapSection";

export default function ContactCMSPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Contact Page Content"
        description="Manage the content displayed on the Contact Us landing page."
      />

      <MapSection />
    </section>
  );
}
