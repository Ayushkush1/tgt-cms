"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";
import type { PortfolioWorkIndexData } from "../types";

interface PortfolioWorkIndexProps {
  data: PortfolioWorkIndexData;
  onChange: (index: PortfolioWorkIndexData) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function PortfolioWorkIndex({ data, onChange, isSaving, onSave }: PortfolioWorkIndexProps) {
  const [isOpen, setIsOpen] = useState(false);

  const setField =
    (key: keyof PortfolioWorkIndexData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...data, [key]: e.target.value });

  return (
    <StaticSectionCard
      title="2. Selected Work Header (WorkIndex)"
      description="Filterable case study grid heading, 'All work' filter pill label, and hover card CTA label."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={onSave}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <InputField
          label="Eyebrow Label"
          value={data.label || ""}
          onChange={setField("label")}
          placeholder="e.g. (Selected work)"
        />
        <InputField
          label="Headline Main"
          value={data.headlineMain || ""}
          onChange={setField("headlineMain")}
          placeholder="e.g. Every project,"
        />
        <InputField
          label="Headline Gold Italic Highlight"
          value={data.headlineHighlight || ""}
          onChange={setField("headlineHighlight")}
          placeholder="e.g. a partnership."
        />
        <InputField
          label="All Filter Tab Label"
          value={data.allLabel || ""}
          onChange={setField("allLabel")}
          placeholder="e.g. All work"
        />
        <InputField
          label="Hover Card CTA Label"
          value={data.viewLabel || ""}
          onChange={setField("viewLabel")}
          placeholder="e.g. View case"
        />
      </div>
    </StaticSectionCard>
  );
}
