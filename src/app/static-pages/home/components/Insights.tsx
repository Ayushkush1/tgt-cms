"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { InputField } from "@/components/InputField";
import { HomeSectionCard, useHomeSection, type SectionInstanceProps } from "./HomeSectionCard";

interface InsightsData {
  [key: string]: unknown;
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  viewAllLabel: string;
}

const DEFAULT_DATA: InsightsData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  viewAllLabel: "",
};

export function Insights(sectionProps?: SectionInstanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useHomeSection(
    "Insights",
    DEFAULT_DATA,
    "Insights Header",
    sectionProps,
  );

  const setText = (key: keyof InsightsData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <HomeSectionCard
      title="Insights"
      description="Blog section header & View All label (manage blog articles in Static Pages → Blog)."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() => save()}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (Insights)"
        />
        <InputField
          label="View All Label"
          value={formData.viewAllLabel || ""}
          onChange={setText("viewAllLabel")}
          placeholder="e.g. All articles"
        />
        <InputField
          label="Headline Main"
          value={formData.headlineMain || ""}
          onChange={setText("headlineMain")}
          placeholder="e.g. Ideas that"
        />
        <InputField
          label="Gold Italic Highlight"
          value={formData.headlineHighlight || ""}
          onChange={setText("headlineHighlight")}
          placeholder="e.g. grow businesses."
        />
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200/80 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[#B8932A]">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0B0F29]">Blog Posts &amp; Articles</p>
            <p className="text-xs text-gray-500">
              All blog articles for Home (Insights), /blog, and /blog/[slug] are managed in Static
              Pages → Blog.
            </p>
          </div>
        </div>
        <Link
          href="/static-pages/blog"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0B0F29] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-black"
        >
          Manage Blog Page
          <ArrowUpRight className="h-3.5 w-3.5 text-[#D4AF37]" />
        </Link>
      </div>
    </HomeSectionCard>
  );
}
