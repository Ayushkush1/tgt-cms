"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { HomeSectionCard, useHomeSection } from "./HomeSectionCard";

interface TestimonialsData {
  [key: string]: unknown;
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  rating: string;
  ratingLabel: string;
  ctaLabel: string;
  ctaUrl: string;
}

const DEFAULT_DATA: TestimonialsData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  rating: "",
  ratingLabel: "",
  ctaLabel: "",
  ctaUrl: "",
};

export function Testimonials() {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useHomeSection(
    "Testimonials",
    DEFAULT_DATA,
    "Testimonials Header",
  );

  const setText = (key: keyof TestimonialsData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <HomeSectionCard
      title="Testimonials"
      description="Client stories section header, rating score, and bottom CTA (quotes come from Our Reputation below)."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() => save()}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (Client stories)"
        />
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Headline Main"
            value={formData.headlineMain || ""}
            onChange={setText("headlineMain")}
            placeholder="e.g. Don't take our word."
          />
          <InputField
            label="Gold Italic Highlight"
            value={formData.headlineHighlight || ""}
            onChange={setText("headlineHighlight")}
            placeholder="e.g. Take theirs."
          />
        </div>
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
          placeholder="e.g. Average rating from 50+ clients"
        />
        <InputField
          label="CTA Button Label"
          value={formData.ctaLabel || ""}
          onChange={setText("ctaLabel")}
          placeholder="e.g. Book a free strategy call"
        />
        <InputField
          label="CTA Button URL"
          value={formData.ctaUrl || ""}
          onChange={setText("ctaUrl")}
          placeholder="https://calendar.app.google/..."
        />
      </div>
    </HomeSectionCard>
  );
}
