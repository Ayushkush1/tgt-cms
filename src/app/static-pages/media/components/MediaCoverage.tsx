"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SelectField } from "@/components/SelectField";
import { TextAreaField } from "@/components/TextAreaField";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { StaticSectionCard, useStaticSection } from "@/app/components/StaticSectionCard";

export interface MediaCoverageItem {
  outlet: string;
  title: string;
  date: string;
  url: string;
  type: string;
  excerpt?: string;
}

interface MediaItemsData {
  [key: string]: unknown;
  items: MediaCoverageItem[];
}

const DEFAULT_DATA: MediaItemsData = {
  items: [],
};

const MEDIA_TYPE_OPTIONS = [
  { value: "", label: "Select coverage type..." },
  { value: "Press", label: "Press" },
  { value: "Interview", label: "Interview" },
  { value: "Article", label: "Article" },
  { value: "Podcast", label: "Podcast" },
];

export function MediaCoverage() {
  const confirmDelete = useConfirmDelete();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const { formData, setFormData, isSaving, save } = useStaticSection(
    "/api/media",
    "MediaItems",
    DEFAULT_DATA,
    "Press Coverage",
  );

  const items = Array.isArray(formData.items) ? formData.items : [];

  const addItem = () => {
    const next: MediaCoverageItem = {
      outlet: "",
      title: "",
      date: "",
      url: "",
      type: "",
      excerpt: "",
    };
    setFormData((prev) => ({ ...prev, items: [next, ...(prev.items || [])] }));
    setExpandedIdx(0);
  };

  const removeItem = async (index: number) => {
    const target = items[index];
    const ok = await confirmDelete({
      title: target?.title ? `Remove "${target.title}"?` : "Remove this media item?",
      message: "This press item will be removed from /media once saved.",
    });
    if (!ok) return;

    setFormData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index),
    }));
    setExpandedIdx((prev) => (prev === index ? null : prev));
  };

  const updateItem = (index: number, field: keyof MediaCoverageItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: (prev.items || []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  return (
    <StaticSectionCard
      title="2. Press Coverage & Features (MediaItems)"
      description="Manage press mentions, interviews, articles, and podcasts (newest first) displayed on /media."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() => save({ ...formData, items })}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          Coverage Items ({items.length})
        </span>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add coverage
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-sm text-gray-400">
          No press coverage items added yet (empty state message will show on /media).
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => (
            <CollapsibleCard
              key={idx}
              badge={item.outlet || String(idx + 1).padStart(2, "0")}
              title={item.title || `Coverage Item ${idx + 1}`}
              subtitle={[item.type, item.date].filter(Boolean).join(" · ") || undefined}
              isOpen={expandedIdx === idx}
              onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              onRemove={() => removeItem(idx)}
            >
              <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
                <InputField
                  label="Outlet / Publication"
                  value={item.outlet || ""}
                  onChange={(e) => updateItem(idx, "outlet", e.target.value)}
                  placeholder="e.g. Economic Times"
                />
                <SelectField
                  label="Coverage Type"
                  value={item.type || ""}
                  onChange={(e) => updateItem(idx, "type", e.target.value)}
                  options={MEDIA_TYPE_OPTIONS}
                />
                <InputField
                  label="Headline / Title"
                  value={item.title || ""}
                  onChange={(e) => updateItem(idx, "title", e.target.value)}
                  placeholder="e.g. How TGT Helps Founders Ship Faster"
                  containerClassName="md:col-span-2"
                />
                <InputField
                  label="Date"
                  value={item.date || ""}
                  onChange={(e) => updateItem(idx, "date", e.target.value)}
                  placeholder="e.g. 12 Mar 2026"
                />
                <InputField
                  label="Article URL"
                  value={item.url || ""}
                  onChange={(e) => updateItem(idx, "url", e.target.value)}
                  placeholder="https://..."
                />
                <TextAreaField
                  label="Excerpt (optional)"
                  value={item.excerpt || ""}
                  onChange={(e) => updateItem(idx, "excerpt", e.target.value)}
                  rows={2}
                  containerClassName="md:col-span-2"
                  placeholder="Optional short summary shown under the headline..."
                />
              </div>
            </CollapsibleCard>
          ))}
        </div>
      )}
    </StaticSectionCard>
  );
}
