"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";
import type { PortfolioResultsData } from "../types";

interface PortfolioResultsProps {
  data: PortfolioResultsData;
  onChange: (results: PortfolioResultsData) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function PortfolioResults({ data, onChange, isSaving, onSave }: PortfolioResultsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const stats = Array.isArray(data.stats) ? data.stats : [];

  return (
    <StaticSectionCard
      title="4. Headline Results (Results)"
      description="Dark results band between Selected Work and Testimonials with 4 headline numbers."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={onSave}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <InputField
          label="Eyebrow Label"
          value={data.label || ""}
          onChange={(e) => onChange({ ...data, label: e.target.value })}
          placeholder="e.g. (By the numbers)"
        />
        <InputField
          label="Headline Main"
          value={data.headlineMain || ""}
          onChange={(e) => onChange({ ...data, headlineMain: e.target.value })}
          placeholder="e.g. Results that"
        />
        <InputField
          label="Headline Gold Italic Highlight"
          value={data.headlineHighlight || ""}
          onChange={(e) => onChange({ ...data, headlineHighlight: e.target.value })}
          placeholder="e.g. compound."
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Result Stats ({stats.length})
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...data, stats: [...stats, { value: "", label: "" }] })}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add stat
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 items-end gap-2 md:grid-cols-[1fr_1.5fr_auto]"
            >
              <InputField
                label="Value"
                value={stat.value || ""}
                onChange={(e) => {
                  const next = stats.map((s, i) =>
                    i === idx ? { ...s, value: e.target.value } : s,
                  );
                  onChange({ ...data, stats: next });
                }}
                placeholder="e.g. 70+"
              />
              <InputField
                label="Label"
                value={stat.label || ""}
                onChange={(e) => {
                  const next = stats.map((s, i) =>
                    i === idx ? { ...s, label: e.target.value } : s,
                  );
                  onChange({ ...data, stats: next });
                }}
                placeholder="e.g. Launches shipped"
              />
              <button
                type="button"
                onClick={() => onChange({ ...data, stats: stats.filter((_, i) => i !== idx) })}
                className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </StaticSectionCard>
  );
}
