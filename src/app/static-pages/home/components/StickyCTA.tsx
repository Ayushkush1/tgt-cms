"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { HomeSectionCard, useHomeSection } from "./HomeSectionCard";

interface StickyCTAData {
  [key: string]: unknown;
  label: string;
  buttonLabel: string;
  buttonUrl: string;
}

const DEFAULT_DATA: StickyCTAData = {
  label: "",
  buttonLabel: "",
  buttonUrl: "",
};

export function StickyCTA() {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useHomeSection(
    "StickyCTA",
    DEFAULT_DATA,
    "Sticky CTA",
  );

  const setText = (key: keyof StickyCTAData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <HomeSectionCard
      title="Sticky CTA"
      description="Floating bottom booking pill shown when scrolling past the hero."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() => save()}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InputField
          label="Status Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. Available for new projects"
        />
        <InputField
          label="Button Label"
          value={formData.buttonLabel || ""}
          onChange={setText("buttonLabel")}
          placeholder="e.g. Book a free call"
        />
        <InputField
          label="Button URL"
          value={formData.buttonUrl || ""}
          onChange={setText("buttonUrl")}
          placeholder="https://calendar.app.google/..."
        />
      </div>
    </HomeSectionCard>
  );
}
