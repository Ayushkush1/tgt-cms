"use client";

import { Globe } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BlogSection } from "@/components/cms/sections/BlogSection";
import { BlogIndex } from "./components/BlogIndex";

export default function BlogCMSPage() {
  return (
    <section className="flex flex-col gap-6 pb-16">
      <PageHeader
        title="Blog Management"
        description="Manage the dedicated /blog page copy and all articles shown across the website (Home, /blog, and /blog/[slug])."
      />

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/40 px-5 py-4 text-sm text-[#7A5E14]">
        <Globe className="mt-0.5 h-4 w-4 shrink-0 text-[#B8932A]" />
        <p className="leading-relaxed">
          Articles managed here appear in the <span className="font-semibold">Home</span> page
          Insights section, on <span className="font-semibold">/blog</span>, and at{" "}
          <span className="font-semibold">/blog/[slug]</span>. To edit the Home page Insights
          section heading, go to <span className="font-semibold">Static Pages → Home</span>.
        </p>
      </div>

      <BlogIndex />
      <BlogSection
        defaultOpen
        title="All Website Blog Posts"
        description="Create, edit, and publish articles used across Home, /blog, and /blog/[slug]."
      />
    </section>
  );
}
