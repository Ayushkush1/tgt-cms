"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";
import type { DeliverItem } from "../types";

interface TagsFieldProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

function TagsField({ tags, onChange }: TagsFieldProps) {
  const joined = Array.isArray(tags) ? tags.filter(Boolean).join(", ") : "";
  const [draft, setDraft] = useState(joined);
  const [focused, setFocused] = useState(false);

  const value = focused ? draft : joined;

  return (
    <InputField
      label="Tags (comma separated)"
      value={value}
      onFocus={() => {
        setDraft(joined);
        setFocused(true);
      }}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        onChange(
          next
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        );
      }}
      onBlur={() => setFocused(false)}
      placeholder="e.g. BRAND POSITIONING, MARKET RESEARCH"
    />
  );
}

interface ServiceDeliverProps {
  services: DeliverItem[];
  onChange: (services: DeliverItem[]) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ServiceDeliver({ services, onChange, isSaving, onSave }: ServiceDeliverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const items = Array.isArray(services) ? services : [];

  const addService = () => {
    const nextNum = String(items.length + 1).padStart(2, "0");
    onChange([
      ...items,
      {
        number: nextNum,
        title: "",
        category: "",
        description: "",
        tags: [],
        outcome: "",
      },
    ]);
    setExpandedIdx(items.length);
  };

  const removeService = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    setExpandedIdx((prev) => (prev === index ? null : prev));
  };

  const handleUpdate = (
    index: number,
    field: keyof DeliverItem,
    value: DeliverItem[keyof DeliverItem],
  ) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <StaticSectionCard
      title="3. What We Deliver (Deliver)"
      description="Interactive capabilities index with pinned detail card, tech tags, and expected client outcomes."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={onSave}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          Capabilities ({items.length})
        </span>
        <button
          type="button"
          onClick={addService}
          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add capability
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((service, idx) => (
          <CollapsibleCard
            key={idx}
            badge={`(${service.number || String(idx + 1).padStart(2, "0")})`}
            title={service.title || `Capability ${idx + 1}`}
            subtitle={service.category || undefined}
            isOpen={expandedIdx === idx}
            onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            onRemove={() => removeService(idx)}
          >
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
              <InputField
                label="Capability Title"
                value={service.title || ""}
                onChange={(e) => handleUpdate(idx, "title", e.target.value)}
                placeholder="e.g. Brand Strategy & Positioning"
              />
              <InputField
                label="Category / Subtitle"
                value={service.category || ""}
                onChange={(e) => handleUpdate(idx, "category", e.target.value)}
                placeholder="e.g. Strategy · Identity"
              />
              <TextAreaField
                label="Description"
                value={service.description || ""}
                onChange={(e) => handleUpdate(idx, "description", e.target.value)}
                containerClassName="md:col-span-2"
                placeholder="Briefly describe the capability and deliverables"
                rows={3}
              />
              <TagsField
                tags={service.tags || []}
                onChange={(tags) => handleUpdate(idx, "tags", tags)}
              />
              <InputField
                label="Expected Outcome"
                value={service.outcome || ""}
                onChange={(e) => handleUpdate(idx, "outcome", e.target.value)}
                placeholder="e.g. A clear, distinctive brand identity that resonates deeply."
              />
            </div>
          </CollapsibleCard>
        ))}
      </div>
    </StaticSectionCard>
  );
}
