"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { HomeSectionCard, useHomeSection } from "./HomeSectionCard";

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

export function Insights() {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useHomeSection(
    "Insights",
    DEFAULT_DATA,
    "Insights Header",
  );

  const setText = (key: keyof InsightsData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <HomeSectionCard
      title="Insights"
      description="Blog section header & View All label (articles are managed in Blog Section below)."
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
    </HomeSectionCard>
  );
}
