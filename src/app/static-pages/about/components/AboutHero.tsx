"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import {
  StaticSectionCard,
  StringListField,
  useStaticSection,
} from "@/app/components/StaticSectionCard";

interface AboutHeroData {
  [key: string]: unknown;
  label: string;
  headlineTop: string;
  headlineHighlight: string;
  description: string;
  meta: string[];
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
}

const DEFAULT_DATA: AboutHeroData = {
  label: "",
  headlineTop: "",
  headlineHighlight: "",
  description: "",
  meta: [],
  primaryLabel: "",
  primaryUrl: "",
  secondaryLabel: "",
  secondaryUrl: "",
};

export function AboutHero() {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useStaticSection(
    "/api/about",
    "AboutHero",
    DEFAULT_DATA,
    "About Hero",
  );

  const setText =
    (key: keyof AboutHeroData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <StaticSectionCard
      title="About Hero"
      description="About landing hero eyebrow, headline, intro description, CTAs, and quick facts."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() =>
        save({
          ...formData,
          meta: (formData.meta || []).map((m) => m.trim()).filter(Boolean),
        })
      }
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (About us)"
        />
        <InputField
          label="Headline Top"
          value={formData.headlineTop || ""}
          onChange={setText("headlineTop")}
          placeholder="e.g. The team behind"
        />
        <InputField
          label="Gold Italic Highlight"
          value={formData.headlineHighlight || ""}
          onChange={setText("headlineHighlight")}
          placeholder="e.g. brands that grow."
        />
        <TextAreaField
          label="Description"
          value={formData.description || ""}
          onChange={setText("description")}
          rows={3}
          containerClassName="md:col-span-3"
          placeholder="Since 2023, our senior team has helped founders across 7+ countries..."
        />
      </div>

      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Primary Button Label"
          value={formData.primaryLabel || ""}
          onChange={setText("primaryLabel")}
          placeholder="e.g. Book a free strategy call"
        />
        <InputField
          label="Primary Button URL"
          value={formData.primaryUrl || ""}
          onChange={setText("primaryUrl")}
          placeholder="https://calendar.app.google/..."
        />
        <InputField
          label="Secondary Link Label"
          value={formData.secondaryLabel || ""}
          onChange={setText("secondaryLabel")}
          placeholder="e.g. Meet the team"
        />
        <InputField
          label="Secondary Link URL"
          value={formData.secondaryUrl || ""}
          onChange={setText("secondaryUrl")}
          placeholder="e.g. #team"
        />
      </div>

      <StringListField
        label="Meta / Fact Pills"
        items={formData.meta || []}
        onChange={(meta) => setFormData((prev) => ({ ...prev, meta }))}
        placeholder="e.g. Since 2023"
        addLabel="Add fact"
        columns={3}
      />
    </StaticSectionCard>
  );
}
