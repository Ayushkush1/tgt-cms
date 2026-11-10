"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { SelectField } from "@/components/SelectField";
import { TextAreaField } from "@/components/TextAreaField";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";
import { PILLAR_OPTIONS, type PillarId, type ServiceHeroData } from "../types";

interface ServiceHeroProps {
  data: ServiceHeroData;
  onChange: (hero: ServiceHeroData) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ServiceHero({ data, onChange, isSaving, onSave }: ServiceHeroProps) {
  const [isOpen, setIsOpen] = useState(false);

  const setParagraph0 = (value: string) => {
    const paragraphs = [...(data.paragraphs || ["", ""])];
    paragraphs[0] = value;
    onChange({ ...data, paragraphs });
  };

  return (
    <StaticSectionCard
      title="1. Service Hero (Hero)"
      description="Service eyebrow name, growth pillar badge, 2-line promise headline, and hero intro copy."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={onSave}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Service Name (Eyebrow)"
          value={data.name || ""}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="e.g. Branding & Identity"
        />

        <SelectField
          label="Growth Pillar"
          value={data.pillar || ""}
          onChange={(e) => onChange({ ...data, pillar: (e.target.value as PillarId | "") || "" })}
          options={PILLAR_OPTIONS}
        />

        <InputField
          label="Headline Line 1 (Promise)"
          value={data.headingLine1 || ""}
          onChange={(e) => onChange({ ...data, headingLine1: e.target.value })}
          placeholder="e.g. Brands people"
        />

        <InputField
          label="Headline Line 2 (Gold Italic Highlight)"
          value={data.headingLine2 || ""}
          onChange={(e) => onChange({ ...data, headingLine2: e.target.value })}
          placeholder="e.g. remember."
        />

        <TextAreaField
          label="Hero Description (supports multiple paragraphs)"
          value={data.paragraphs?.[0] || ""}
          onChange={(e) => setParagraph0(e.target.value)}
          placeholder="e.g. We create powerful brand identities that connect with your audience..."
          rows={3}
          containerClassName="md:col-span-2"
        />
      </div>
    </StaticSectionCard>
  );
}
