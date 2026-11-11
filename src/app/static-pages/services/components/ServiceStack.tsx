"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SelectField } from "@/components/SelectField";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";
import { LogoPicker, type LogoValue } from "@/app/components/LogoPicker";
import { LIVE_SERVICE_OPTIONS } from "../types";

interface ServiceStackProps {
  currentSlug: string;
  stack: string[];
  related: string[];
  onStackChange: (stack: string[]) => void;
  onRelatedChange: (related: string[]) => void;
  /** The shared tech logo for a technology name (a picked file until saved). */
  techLogoFor: (name: string) => LogoValue;
  onPickTechLogo: (name: string, file: File) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ServiceStack({
  currentSlug,
  stack,
  related,
  onStackChange,
  onRelatedChange,
  techLogoFor,
  onPickTechLogo,
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
      <TechStackField
        items={stack || []}
        onChange={onStackChange}
        techLogoFor={techLogoFor}
        onPickTechLogo={onPickTechLogo}
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

/**
 * Technologies with their logos. Logos are shared by every service (and by matching
 * "What we deliver" tags): changing React's logo here changes it everywhere.
 */
function TechStackField({
  items,
  onChange,
  techLogoFor,
  onPickTechLogo,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  techLogoFor: (name: string) => LogoValue;
  onPickTechLogo: (name: string, file: File) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Technologies &amp; Disciplines ({items.length})
          </span>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Click a logo to upload or change it. Logos are shared by every service using that name.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] transition-colors hover:bg-amber-100"
        >
          <Plus className="h-3.5 w-3.5" /> Add technology
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-400">
          No items added yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {item.trim() ? (
                <LogoPicker
                  size="sm"
                  value={techLogoFor(item)}
                  onChange={(file) => onPickTechLogo(item, file)}
                />
              ) : (
                <span className="h-10 w-10 shrink-0 rounded-xl border border-dashed border-gray-200" />
              )}
              <input
                type="text"
                value={item ?? ""}
                onChange={(e) => onChange(items.map((v, i) => (i === idx ? e.target.value : v)))}
                placeholder="e.g. Next.js"
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-[#0B0F29] outline-none placeholder:text-gray-400 focus:border-[#0B0F29]"
              />
              <button
                type="button"
                aria-label="Remove"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
