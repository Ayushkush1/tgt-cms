"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";
import type { ApproachPillar, ServiceHeroData } from "../types";

interface ServiceApproachProps {
  data: ServiceHeroData;
  onChange: (hero: ServiceHeroData) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ServiceApproach({ data, onChange, isSaving, onSave }: ServiceApproachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const pillars = Array.isArray(data.pillars) ? data.pillars : [];

  const setApproachText = (value: string) => {
    const paragraphs = [...(data.paragraphs || ["", ""])];
    paragraphs[1] = value;
    onChange({ ...data, paragraphs });
  };

  const updatePillar = (index: number, field: keyof ApproachPillar, value: string) => {
    const next = pillars.map((pillar, i) => (i === index ? { ...pillar, [field]: value } : pillar));
    onChange({ ...data, pillars: next });
  };

  const addPillar = () => {
    if (pillars.length >= 4) return;
    const nextNum = String(pillars.length + 1).padStart(2, "0");
    const next = [...pillars, { number: nextNum, title: "", desc: "" }];
    onChange({ ...data, pillars: next });
    setExpandedIdx(next.length - 1);
  };

  const removePillar = (index: number) => {
    onChange({
      ...data,
      pillars: pillars.filter((_, i) => i !== index),
    });
    setExpandedIdx((prev) => (prev === index ? null : prev));
  };

  return (
    <StaticSectionCard
      title="2. Our Approach (Approach)"
      description="Scroll-reveal approach statement (ending word of each sentence highlights in gold) and up to 4 approach cards."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={onSave}
    >
      <TextAreaField
        label="Approach Statement"
        value={data.paragraphs?.[1] || ""}
        onChange={(e) => setApproachText(e.target.value)}
        placeholder="e.g. Our process combines strategy and clarity. Built to compound over time."
        rows={3}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Approach Pillars ({pillars.length}/4)
          </span>
          {pillars.length < 4 && (
            <button
              type="button"
              onClick={addPillar}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:bg-gray-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add pillar
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {pillars.map((pillar, idx) => (
            <CollapsibleCard
              key={idx}
              badge={pillar.number || String(idx + 1).padStart(2, "0")}
              title={pillar.title || `Pillar ${idx + 1}`}
              isOpen={expandedIdx === idx}
              onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              onRemove={() => removePillar(idx)}
            >
              <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[110px_1fr]">
                <InputField
                  label="Number"
                  value={pillar.number || ""}
                  onChange={(e) => updatePillar(idx, "number", e.target.value)}
                  placeholder="01"
                />
                <InputField
                  label="Pillar Title"
                  value={pillar.title || ""}
                  onChange={(e) => updatePillar(idx, "title", e.target.value)}
                  placeholder="e.g. Brand Strategy"
                />
                <TextAreaField
                  label="Description"
                  value={pillar.desc || ""}
                  onChange={(e) => updatePillar(idx, "desc", e.target.value)}
                  placeholder="e.g. Clear positioning and messaging that defines your brand's purpose."
                  rows={2}
                  containerClassName="md:col-span-2"
                />
              </div>
            </CollapsibleCard>
          ))}
        </div>
      </div>
    </StaticSectionCard>
  );
}
