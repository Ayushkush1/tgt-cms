"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadFiles } from "@/app/lib/uploadHelpers";
import {
  StaticSectionCard,
  useStaticSection,
  type SectionInstanceProps,
} from "@/app/components/StaticSectionCard";

interface ContactHeroData {
  [key: string]: unknown;
  label: string;
  headlineTop: string;
  headlineHighlight: string;
  description: string;
  imageUrl: string | File;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
}

const DEFAULT_DATA: ContactHeroData = {
  label: "",
  headlineTop: "",
  headlineHighlight: "",
  description: "",
  imageUrl: "",
  primaryLabel: "",
  primaryUrl: "",
  secondaryLabel: "",
  secondaryUrl: "",
};

export function ContactHero(sectionProps?: SectionInstanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { formData, setFormData, isSaving, save } = useStaticSection(
    "/api/contact",
    "ContactHero",
    DEFAULT_DATA,
    "Contact Hero",
    sectionProps,
  );

  const setField =
    (key: keyof ContactHeroData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setIsUploading(true);
    try {
      const uploadedUrls = await uploadFiles([(formData.imageUrl as string | File) || ""]);
      const payload: ContactHeroData = {
        ...formData,
        imageUrl: uploadedUrls[0] || "",
      };
      setFormData(payload);
      await save(payload);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <StaticSectionCard
      title="1. Contact Hero (PageHero)"
      description="Eyebrow label, 2-line headline with gold highlight, intro copy, background image, and primary/secondary actions."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving || isUploading}
      onSave={handleSave}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setField("label")}
          placeholder="e.g. (Contact)"
          containerClassName="md:col-span-2"
        />
        <InputField
          label="Headline Top"
          value={formData.headlineTop || ""}
          onChange={setField("headlineTop")}
          placeholder="e.g. Let's build"
        />
        <InputField
          label="Headline Gold Italic Highlight"
          value={formData.headlineHighlight || ""}
          onChange={setField("headlineHighlight")}
          placeholder="e.g. something great."
        />
        <TextAreaField
          label="Hero Description"
          value={formData.description || ""}
          onChange={setField("description")}
          rows={3}
          containerClassName="md:col-span-2"
          placeholder="e.g. Tell us where you want to grow. You'll get a reply within 24 hours..."
        />
        <InputField
          label="Primary CTA Label"
          value={formData.primaryLabel || ""}
          onChange={setField("primaryLabel")}
          placeholder="e.g. Book a free strategy call"
        />
        <InputField
          label="Primary CTA URL"
          value={formData.primaryUrl || ""}
          onChange={setField("primaryUrl")}
          placeholder="e.g. https://calendar.app.google/..."
        />
        <InputField
          label="Secondary CTA Label"
          value={formData.secondaryLabel || ""}
          onChange={setField("secondaryLabel")}
          placeholder="e.g. Send a brief"
        />
        <InputField
          label="Secondary CTA URL"
          value={formData.secondaryUrl || ""}
          onChange={setField("secondaryUrl")}
          placeholder="e.g. #brief"
        />
        <div className="md:col-span-2">
          <ImageUploadField
            label="Hero Background Image"
            images={formData.imageUrl ? [formData.imageUrl] : []}
            onImagesChange={(imgs) => setFormData((prev) => ({ ...prev, imageUrl: imgs[0] || "" }))}
            maxImages={1}
          />
        </div>
      </div>
    </StaticSectionCard>
  );
}
