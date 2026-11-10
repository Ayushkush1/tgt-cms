"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";
import type { ProductHeroData } from "../types";

interface ProductHeroProps {
  data: ProductHeroData;
  onChange: (hero: ProductHeroData) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ProductHero({ data, onChange, isSaving, onSave }: ProductHeroProps) {
  const [isOpen, setIsOpen] = useState(false);

  const setField =
    (key: keyof ProductHeroData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [key]: e.target.value });

  return (
    <StaticSectionCard
      title="1. Product Page Hero (PageHero)"
      description="Eyebrow label, 2-line hero headline with gold highlight, intro copy, and primary/secondary actions."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={onSave}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Eyebrow Label"
          value={data.label || ""}
          onChange={setField("label")}
          placeholder="e.g. (Our products)"
          containerClassName="md:col-span-2"
        />

        <InputField
          label="Headline Top"
          value={data.headingLine || ""}
          onChange={setField("headingLine")}
          placeholder="e.g. Software that"
        />

        <InputField
          label="Headline Gold Italic Highlight"
          value={data.headingHighlight || ""}
          onChange={setField("headingHighlight")}
          placeholder="e.g. runs the business."
        />

        <TextAreaField
          label="Description"
          value={data.description || ""}
          onChange={setField("description")}
          placeholder="e.g. Ready-made platforms for ERP, CRM, commerce, delivery and learning..."
          rows={3}
          containerClassName="md:col-span-2"
        />

        <InputField
          label="Primary CTA Label"
          value={data.primaryLabel || ""}
          onChange={setField("primaryLabel")}
          placeholder="e.g. Book a free demo call"
        />

        <InputField
          label="Primary CTA URL"
          value={data.primaryUrl || ""}
          onChange={setField("primaryUrl")}
          placeholder="e.g. https://calendar.app.google/..."
        />

        <InputField
          label="Secondary CTA Label"
          value={data.secondaryLabel || ""}
          onChange={setField("secondaryLabel")}
          placeholder="e.g. See the products"
        />

        <InputField
          label="Secondary CTA URL"
          value={data.secondaryUrl || ""}
          onChange={setField("secondaryUrl")}
          placeholder="e.g. #products"
        />
      </div>
    </StaticSectionCard>
  );
}
