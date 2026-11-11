"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { HomeSectionCard, useHomeSection, type SectionInstanceProps } from "./HomeSectionCard";

interface WorkShowcaseData {
  [key: string]: unknown;
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  description: string;
  viewAllLabel: string;
  viewAllUrl: string;
  shortTitles: Record<string, string>;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaButtonLabel: string;
  ctaButtonUrl: string;
}

const DEFAULT_DATA: WorkShowcaseData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  description: "",
  viewAllLabel: "",
  viewAllUrl: "",
  shortTitles: {},
  ctaEyebrow: "",
  ctaTitle: "",
  ctaButtonLabel: "",
  ctaButtonUrl: "",
};

export function WorkShowcase(sectionProps?: SectionInstanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useHomeSection(
    "WorkShowcase",
    DEFAULT_DATA,
    "Work Showcase",
    sectionProps,
  );

  const setText =
    (key: keyof WorkShowcaseData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const titleEntries = Object.entries(formData.shortTitles || {});

  const updateEntries = (entries: [string, string][]) =>
    setFormData((prev) => ({
      ...prev,
      shortTitles: Object.fromEntries(entries),
    }));

  return (
    <HomeSectionCard
      title="Work Showcase"
      description="Selected work horizontal track intro, closing CTA card, and short title overrides."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() =>
        save({
          ...formData,
          shortTitles: Object.fromEntries(titleEntries.filter(([k, v]) => k.trim() && v.trim())),
        })
      }
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (Selected work)"
        />
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Headline Main"
            value={formData.headlineMain || ""}
            onChange={setText("headlineMain")}
            placeholder="e.g. Work that"
          />
          <InputField
            label="Gold Italic Highlight"
            value={formData.headlineHighlight || ""}
            onChange={setText("headlineHighlight")}
            placeholder="e.g. moves numbers."
          />
        </div>
        <TextAreaField
          label="Description"
          value={formData.description || ""}
          onChange={setText("description")}
          rows={2}
          containerClassName="md:col-span-2"
          placeholder="e.g. Case studies from retail, finance, SaaS and hospitality..."
        />
        <InputField
          label="View All Label"
          value={formData.viewAllLabel || ""}
          onChange={setText("viewAllLabel")}
          placeholder="e.g. View full portfolio"
        />
        <InputField
          label="View All URL"
          value={formData.viewAllUrl || ""}
          onChange={setText("viewAllUrl")}
          placeholder="e.g. /portfolio"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-amber-200/60 bg-amber-50/40 p-4 md:grid-cols-2">
        <InputField
          label="Closing Card Eyebrow"
          value={formData.ctaEyebrow || ""}
          onChange={setText("ctaEyebrow")}
          placeholder="e.g. Your turn"
        />
        <InputField
          label="Closing Card Title"
          value={formData.ctaTitle || ""}
          onChange={setText("ctaTitle")}
          placeholder="e.g. Your project could be next."
        />
        <InputField
          label="Closing Card Button Label"
          value={formData.ctaButtonLabel || ""}
          onChange={setText("ctaButtonLabel")}
          placeholder="e.g. Book a free call"
        />
        <InputField
          label="Closing Card Button URL"
          value={formData.ctaButtonUrl || ""}
          onChange={setText("ctaButtonUrl")}
          placeholder="https://calendar.app.google/..."
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Short Title Overrides ({titleEntries.length})
          </span>
          <button
            type="button"
            onClick={() => updateEntries([...titleEntries, ["", ""]])}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] hover:bg-amber-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add override
          </button>
        </div>
        {titleEntries.map(([fullTitle, shortTitle], idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 items-center gap-2 md:grid-cols-[1fr_1fr_auto]"
          >
            <input
              type="text"
              value={fullTitle}
              onChange={(e) => {
                const next = [...titleEntries];
                next[idx] = [e.target.value, shortTitle];
                updateEntries(next);
              }}
              placeholder="Original portfolio title…"
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm text-[#0B0F29] transition-all outline-none placeholder:text-gray-400 focus:border-[#0B0F29] focus:ring-2 focus:ring-[#0B0F29]/15"
            />
            <input
              type="text"
              value={shortTitle}
              onChange={(e) => {
                const next = [...titleEntries];
                next[idx] = [fullTitle, e.target.value];
                updateEntries(next);
              }}
              placeholder="Short 1-line title…"
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm text-[#0B0F29] transition-all outline-none placeholder:text-gray-400 focus:border-[#0B0F29] focus:ring-2 focus:ring-[#0B0F29]/15"
            />
            <button
              type="button"
              onClick={() => updateEntries(titleEntries.filter((_, i) => i !== idx))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </HomeSectionCard>
  );
}
