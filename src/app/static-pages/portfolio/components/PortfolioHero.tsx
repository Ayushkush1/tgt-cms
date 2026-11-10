"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";
import type { PortfolioHeroData } from "../types";

interface PortfolioHeroProps {
  data: PortfolioHeroData;
  onChange: (hero: PortfolioHeroData) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function PortfolioHero({ data, onChange, isSaving, onSave }: PortfolioHeroProps) {
  const [isOpen, setIsOpen] = useState(false);

  const setField =
    (key: keyof PortfolioHeroData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [key]: e.target.value });

  return (
    <StaticSectionCard
      title="1. Portfolio Hero (PortfolioHero)"
      description="Eyebrow label, 2-line headline with gold highlight, intro copy, and primary/secondary actions."
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
          placeholder="e.g. (Our work)"
          containerClassName="md:col-span-2"
        />

        <InputField
          label="Headline Top"
          value={data.headlineTop || ""}
          onChange={setField("headlineTop")}
          placeholder="e.g. Work that"
        />

        <InputField
          label="Headline Gold Italic Highlight"
          value={data.headlineHighlight || ""}
          onChange={setField("headlineHighlight")}
          placeholder="e.g. speaks for itself."
        />

        <TextAreaField
          label="Hero Description"
          value={data.description || ""}
          onChange={setField("description")}
          placeholder="e.g. Websites, platforms and growth campaigns we've shipped..."
          rows={3}
          containerClassName="md:col-span-2"
        />

        <InputField
          label="Primary CTA Label"
          value={data.primaryLabel || ""}
          onChange={setField("primaryLabel")}
          placeholder="e.g. Book a free strategy call"
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
          placeholder="e.g. See the work"
        />

        <InputField
          label="Secondary CTA URL"
          value={data.secondaryUrl || ""}
          onChange={setField("secondaryUrl")}
          placeholder="e.g. #work"
        />

        <div className="md:col-span-2">
          <ImageUploadField
            label="Hero Background Image"
            images={data.imageUrl ? [data.imageUrl] : []}
            onImagesChange={(imgs) => onChange({ ...data, imageUrl: imgs[0] || "" })}
            maxImages={1}
          />
        </div>
      </div>
    </StaticSectionCard>
  );
}
