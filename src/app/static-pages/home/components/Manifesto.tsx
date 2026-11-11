"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import {
  HomeSectionCard,
  StringListField,
  useHomeSection,
  type SectionInstanceProps,
} from "./HomeSectionCard";

interface ManifestoStat {
  value: string;
  label: string;
}

interface ManifestoData {
  [key: string]: unknown;
  label: string;
  text: string;
  highlights: string[];
  stats: ManifestoStat[];
}

const DEFAULT_DATA: ManifestoData = {
  label: "",
  text: "",
  highlights: [],
  stats: [],
};

export function Manifesto(sectionProps?: SectionInstanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useHomeSection(
    "Manifesto",
    DEFAULT_DATA,
    "Manifesto",
    sectionProps,
  );

  const stats = Array.isArray(formData.stats) ? formData.stats : [];

  return (
    <HomeSectionCard
      title="Manifesto"
      description="Scroll-lit positioning statement, gold italic highlight words, and 3 key stats."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() =>
        save({
          ...formData,
          highlights: (formData.highlights || []).map((w) => w.trim()).filter(Boolean),
          stats: stats.filter((s) => s.value.trim() || s.label.trim()),
        })
      }
    >
      <InputField
        label="Eyebrow Label"
        value={formData.label || ""}
        onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
        placeholder="e.g. (Our approach)"
      />
      <TextAreaField
        label="Manifesto Statement"
        value={formData.text || ""}
        onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
        rows={3}
        placeholder="Most agencies hand you a deliverable and walk away..."
      />

      <StringListField
        label="Highlighted Words (exact words from statement, e.g. stay.)"
        items={formData.highlights || []}
        onChange={(highlights) => setFormData((prev) => ({ ...prev, highlights }))}
        placeholder="e.g. stay."
        addLabel="Add highlight word"
        columns={3}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Key Stats ({stats.length})
          </span>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, stats: [...stats, { value: "", label: "" }] }))
            }
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] transition-colors hover:bg-amber-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add stat
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400">Stat #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, stats: stats.filter((_, i) => i !== idx) }))
                  }
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <InputField
                label="Value"
                value={stat.value || ""}
                onChange={(e) => {
                  const next = [...stats];
                  next[idx] = { ...next[idx], value: e.target.value };
                  setFormData((prev) => ({ ...prev, stats: next }));
                }}
                placeholder="e.g. 24h"
              />
              <InputField
                label="Label"
                value={stat.label || ""}
                onChange={(e) => {
                  const next = [...stats];
                  next[idx] = { ...next[idx], label: e.target.value };
                  setFormData((prev) => ({ ...prev, stats: next }));
                }}
                placeholder="e.g. Response time"
              />
            </div>
          ))}
        </div>
      </div>
    </HomeSectionCard>
  );
}
