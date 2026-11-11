"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { HomeSectionCard, useHomeSection, type SectionInstanceProps } from "./HomeSectionCard";

interface ShowreelData {
  [key: string]: unknown;
  label: string;
  bigNumber: string;
  caption: string;
  linkLabel: string;
  linkUrl: string;
}

const DEFAULT_DATA: ShowreelData = {
  label: "",
  bigNumber: "",
  caption: "",
  linkLabel: "",
  linkUrl: "",
};

export function Showreel(sectionProps?: SectionInstanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useHomeSection(
    "Showreel",
    DEFAULT_DATA,
    "Showreel",
    sectionProps,
  );

  const setText = (key: keyof ShowreelData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <HomeSectionCard
      title="Showreel"
      description="Scroll-expanding wall of work: eyebrow label, giant number, gold caption, and CTA."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() => save()}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (Proof, not promises)"
        />
        <InputField
          label="Big Metric Number"
          value={formData.bigNumber || ""}
          onChange={setText("bigNumber")}
          placeholder="e.g. 70+"
        />
        <InputField
          label="Gold Italic Caption"
          value={formData.caption || ""}
          onChange={setText("caption")}
          placeholder="e.g. launches for brands in 7+ countries"
          containerClassName="md:col-span-2"
        />
        <InputField
          label="Link Label"
          value={formData.linkLabel || ""}
          onChange={setText("linkLabel")}
          placeholder="e.g. Explore the work"
        />
        <InputField
          label="Link URL"
          value={formData.linkUrl || ""}
          onChange={setText("linkUrl")}
          placeholder="e.g. #work"
        />
      </div>
    </HomeSectionCard>
  );
}
