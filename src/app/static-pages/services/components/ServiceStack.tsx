"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SelectField } from "@/components/SelectField";
import { StaticSectionCard, StringListField } from "@/app/components/StaticSectionCard";
import { LIVE_SERVICE_OPTIONS } from "../types";

interface ServiceStackProps {
  currentSlug: string;
  stack: string[];
  related: string[];
  onStackChange: (stack: string[]) => void;
  onRelatedChange: (related: string[]) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ServiceStack({
  currentSlug,
  stack,
  related,
  onStackChange,
  onRelatedChange,
  isSaving,
  onSave,
}: ServiceStackProps) {
  const [isOpen, setIsOpen] = useState(false);

  const relatedItems = Array.isArray(related) ? related : [];
  const relatedSelectOptions = [
    { value: "", label: "Select related service..." },
    ...LIVE_SERVICE_OPTIONS.filter((opt) => opt.id !== currentSlug).map((opt) => ({
      value: opt.id,
      label: opt.label,
    })),
  ];

  return (
    <StaticSectionCard
      title="5. Tech Stack & Related Services (Stack)"
      description="Technologies and disciplines grid plus the paired 'Pairs well with' service cards."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={onSave}
    >
      <StringListField
        label="Technologies & Disciplines"
        items={stack || []}
        onChange={onStackChange}
        placeholder="e.g. Next.js"
        addLabel="Add technology"
        columns={3}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Pairs Well With ({relatedItems.length})
          </span>
          {relatedItems.length < 3 && (
            <button
              type="button"
              onClick={() => onRelatedChange([...relatedItems, ""])}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:bg-gray-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add related service
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {relatedItems.map((slug, idx) => (
            <div key={idx} className="flex items-end gap-2">
              <SelectField
                label={`Paired Service ${idx + 1}`}
                value={slug || ""}
                onChange={(e) => {
                  const next = [...relatedItems];
                  next[idx] = e.target.value;
                  onRelatedChange(next);
                }}
                options={relatedSelectOptions}
                containerClassName="flex-1"
              />
              <button
                type="button"
                onClick={() => onRelatedChange(relatedItems.filter((_, i) => i !== idx))}
                className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-red-500"
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
