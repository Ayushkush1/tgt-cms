"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { HomeSectionCard, StringListField, useHomeSection } from "./HomeSectionCard";

interface GrowthHeroData {
  [key: string]: unknown;
  headlineTop: string;
  headlineWords: string[];
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  description: string;
  primaryButtonLabel: string;
  primaryButtonUrl: string;
  secondaryButtonLabel: string;
  secondaryButtonUrl: string;
  rating: string;
  ratingLabel: string;
  proofLine: string;
  responseLine: string;
  ticker: string[];
}

const DEFAULT_DATA: GrowthHeroData = {
  headlineTop: "",
  headlineWords: ["", ""],
  headlinePrefix: "",
  headlineHighlight: "",
  headlineSuffix: "",
  description: "",
  primaryButtonLabel: "",
  primaryButtonUrl: "",
  secondaryButtonLabel: "",
  secondaryButtonUrl: "",
  rating: "",
  ratingLabel: "",
  proofLine: "",
  responseLine: "",
  ticker: [],
};

export function GrowthHero() {
  const [isOpen, setIsOpen] = useState(true);
  const { formData, setFormData, isSaving, save } = useHomeSection(
    "GrowthHero",
    DEFAULT_DATA,
    "Growth Hero",
  );

  const setText =
    (key: keyof GrowthHeroData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const words = Array.isArray(formData.headlineWords) ? formData.headlineWords : ["", ""];
  const setWord = (index: 0 | 1, value: string) =>
    setFormData((prev) => {
      const next = [words[0] || "", words[1] || ""];
      next[index] = value;
      return { ...prev, headlineWords: next };
    });

  return (
    <HomeSectionCard
      title="Growth Hero"
      description="Main landing hero headline, CTAs, proof rating card, and outlined service ticker."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() =>
        save({
          ...formData,
          headlineWords: [words[0] || "", words[1] || ""],
          ticker: (formData.ticker || []).map((t) => t.trim()).filter(Boolean),
        })
      }
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <div className="grid grid-cols-1 items-end gap-4 md:col-span-2 md:grid-cols-3">
          <InputField
            label="Headline Line 1"
            value={formData.headlineTop || ""}
            onChange={setText("headlineTop")}
            placeholder="e.g. One team to"
          />
          <InputField
            label="Line 2 Word 1"
            tooltip="Shown before the client logos pill."
            value={words[0] || ""}
            onChange={(e) => setWord(0, e.target.value)}
            placeholder="e.g. brand,"
          />
          <InputField
            label="Line 2 Word 2"
            tooltip="Shown before the product screens pill."
            value={words[1] || ""}
            onChange={(e) => setWord(1, e.target.value)}
            placeholder="e.g. build"
          />
        </div>
        <div className="grid grid-cols-1 items-end gap-4 md:col-span-2 md:grid-cols-3">
          <InputField
            label="Line 3 Prefix"
            value={formData.headlinePrefix || ""}
            onChange={setText("headlinePrefix")}
            placeholder="e.g. &"
          />
          <InputField
            label="Line 3 Gold Highlight"
            value={formData.headlineHighlight || ""}
            onChange={setText("headlineHighlight")}
            placeholder="e.g. grow"
          />
          <InputField
            label="Line 3 Suffix"
            value={formData.headlineSuffix || ""}
            onChange={setText("headlineSuffix")}
            placeholder="e.g. your business."
          />
        </div>

        <TextAreaField
          label="Hero Description"
          value={formData.description || ""}
          onChange={setText("description")}
          rows={3}
          containerClassName="md:col-span-2"
          placeholder="Strategy, design, technology and marketing under one roof..."
        />

        <InputField
          label="Primary Button Label"
          value={formData.primaryButtonLabel || ""}
          onChange={setText("primaryButtonLabel")}
          placeholder="e.g. Book a free strategy call"
        />
        <InputField
          label="Primary Button URL"
          value={formData.primaryButtonUrl || ""}
          onChange={setText("primaryButtonUrl")}
          placeholder="https://calendar.app.google/..."
        />
        <InputField
          label="Secondary Button Label"
          value={formData.secondaryButtonLabel || ""}
          onChange={setText("secondaryButtonLabel")}
          placeholder="e.g. See our work"
        />
        <InputField
          label="Secondary Button URL"
          value={formData.secondaryButtonUrl || ""}
          onChange={setText("secondaryButtonUrl")}
          placeholder="e.g. #work"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 md:grid-cols-4">
        <InputField
          label="Rating Score"
          value={formData.rating || ""}
          onChange={setText("rating")}
          placeholder="e.g. 5.0"
        />
        <InputField
          label="Rating Label"
          value={formData.ratingLabel || ""}
          onChange={setText("ratingLabel")}
          placeholder="e.g. Average client rating"
        />
        <InputField
          label="Proof Line"
          value={formData.proofLine || ""}
          onChange={setText("proofLine")}
          placeholder="e.g. 50+ businesses grown worldwide"
        />
        <InputField
          label="Response Time Line"
          value={formData.responseLine || ""}
          onChange={setText("responseLine")}
          placeholder="e.g. Reply within 24 hours"
        />
      </div>

      <StringListField
        label="Service Marquee Ticker"
        items={formData.ticker || []}
        onChange={(ticker) => setFormData((prev) => ({ ...prev, ticker }))}
        placeholder="e.g. Branding"
        addLabel="Add ticker item"
        columns={3}
      />
    </HomeSectionCard>
  );
}
