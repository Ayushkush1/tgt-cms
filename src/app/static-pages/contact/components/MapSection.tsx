"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import {
  StaticSectionCard,
  useStaticSection,
  type SectionInstanceProps,
} from "@/app/components/StaticSectionCard";

interface MapSectionData {
  [key: string]: unknown;
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  directionsLabel: string;
  mapEmbedUrl: string;
}

const DEFAULT_DATA: MapSectionData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  directionsLabel: "",
  mapEmbedUrl: "",
};

export default function MapSection(sectionProps?: SectionInstanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useStaticSection(
    "/api/contact",
    "MapSection",
    DEFAULT_DATA,
    "Offices & Map",
    sectionProps,
  );

  const setField =
    (key: keyof MapSectionData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <StaticSectionCard
      title="3. Offices & Map (MapSection)"
      description="Offices heading, directions link label, and Google Maps embed iframe URL."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() => save()}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setField("label")}
          placeholder="e.g. (Visit us)"
        />
        <InputField
          label="Directions Link Label"
          value={formData.directionsLabel || ""}
          onChange={setField("directionsLabel")}
          placeholder="e.g. Get directions"
        />
        <InputField
          label="Headline Main"
          value={formData.headlineMain || ""}
          onChange={setField("headlineMain")}
          placeholder="e.g. Two offices,"
        />
        <InputField
          label="Headline Gold Italic Highlight"
          value={formData.headlineHighlight || ""}
          onChange={setField("headlineHighlight")}
          placeholder="e.g. one team."
        />
        <div className="text-xs text-gray-500 md:col-span-2">
          In Google Maps, click <span className="font-semibold">Share</span> →{" "}
          <span className="font-semibold">Embed a map</span> and paste only the{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">src</code> URL below.
        </div>
        <TextAreaField
          label="Google Maps Embed URL (src only)"
          value={formData.mapEmbedUrl || ""}
          onChange={setField("mapEmbedUrl")}
          rows={3}
          containerClassName="md:col-span-2"
          placeholder="https://www.google.com/maps/embed?pb=..."
        />
      </div>
    </StaticSectionCard>
  );
}
