"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import {
  StaticSectionCard,
  StringListField,
  useStaticSection,
} from "@/app/components/StaticSectionCard";

interface PurposeCard {
  kicker: string;
  title: string;
  text: string;
}

interface AboutPurposeData {
  [key: string]: unknown;
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  cards: PurposeCard[];
  values: string[];
}

const DEFAULT_DATA: AboutPurposeData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  cards: [],
  values: [],
};

export function AboutPurpose() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const { formData, setFormData, isSaving, save } = useStaticSection(
    "/api/about",
    "AboutPurpose",
    DEFAULT_DATA,
    "About Purpose",
  );

  const cards = Array.isArray(formData.cards) ? formData.cards : [];

  const setText = (key: keyof AboutPurposeData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const updateCard = (idx: number, patch: Partial<PurposeCard>) =>
    setFormData((prev) => ({
      ...prev,
      cards: cards.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));

  return (
    <StaticSectionCard
      title="About Purpose"
      description="Mission & Vision editorial cards and bottom commitment checkmarks."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() =>
        save({
          ...formData,
          values: (formData.values || []).map((v) => v.trim()).filter(Boolean),
        })
      }
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (Our foundation)"
        />
        <InputField
          label="Headline Main"
          value={formData.headlineMain || ""}
          onChange={setText("headlineMain")}
          placeholder="e.g. Why we"
        />
        <InputField
          label="Gold Italic Highlight"
          value={formData.headlineHighlight || ""}
          onChange={setText("headlineHighlight")}
          placeholder="e.g. exist."
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Purpose Cards ({cards.length})
          </span>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                cards: [...cards, { kicker: "", title: "", text: "" }],
              }));
              setExpandedCard(cards.length);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] hover:bg-amber-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add card
          </button>
        </div>

        {cards.map((card, idx) => (
          <CollapsibleCard
            key={idx}
            badge={`(${String(idx + 1).padStart(2, "0")})`}
            title={card.kicker || `Card #${idx + 1}`}
            subtitle={card.title || undefined}
            isOpen={expandedCard === idx}
            onToggle={() => setExpandedCard(expandedCard === idx ? null : idx)}
            onRemove={() =>
              setFormData((prev) => ({ ...prev, cards: cards.filter((_, i) => i !== idx) }))
            }
          >
            <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2">
              <InputField
                label="Kicker"
                value={card.kicker || ""}
                onChange={(e) => updateCard(idx, { kicker: e.target.value })}
                placeholder="e.g. Mission"
              />
              <InputField
                label="Card Title"
                value={card.title || ""}
                onChange={(e) => updateCard(idx, { title: e.target.value })}
                placeholder="e.g. Make growth simple."
              />
              <TextAreaField
                label="Description"
                value={card.text || ""}
                onChange={(e) => updateCard(idx, { text: e.target.value })}
                rows={3}
                containerClassName="md:col-span-2"
                placeholder="Deliver strategy, design and technology..."
              />
            </div>
          </CollapsibleCard>
        ))}
      </div>

      <StringListField
        label="Commitment Values"
        items={formData.values || []}
        onChange={(values) => setFormData((prev) => ({ ...prev, values }))}
        placeholder="e.g. Transparent communication"
        addLabel="Add value"
        columns={2}
      />
    </StaticSectionCard>
  );
}
