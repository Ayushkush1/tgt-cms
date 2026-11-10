"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadFiles } from "@/app/lib/uploadHelpers";
import { StaticSectionCard, useStaticSection } from "@/app/components/StaticSectionCard";

interface MediaHeroData {
  [key: string]: unknown;
  label: string;
  top: string;
  highlight: string;
  description: string;
  imageUrl: string | File;
  secondaryLabel: string;
  listLabel: string;
  empty: string;
  blogLabel: string;
}

const DEFAULT_DATA: MediaHeroData = {
  label: "",
  top: "",
  highlight: "",
  description: "",
  imageUrl: "",
  secondaryLabel: "",
  listLabel: "",
  empty: "",
  blogLabel: "",
};

export function MediaHero() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { formData, setFormData, isSaving, save } = useStaticSection(
    "/api/media",
    "MediaIndex",
    DEFAULT_DATA,
    "Media Hero & Copy",
  );

  const setText =
    (key: keyof MediaHeroData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setIsUploading(true);
    try {
      const uploadedUrls = await uploadFiles([(formData.imageUrl as string | File) || ""]);
      const payload: MediaHeroData = {
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
      title="1. Media Page Hero & Copy (MediaIndex)"
      description="Hero eyebrow, 2-line headline, intro description, background photo, and empty-state copy shown on /media."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving || isUploading}
      onSave={handleSave}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (Insights) Media & Articles"
        />
        <InputField
          label="Headline Top"
          value={formData.top || ""}
          onChange={setText("top")}
          placeholder="e.g. In the"
        />
        <InputField
          label="Gold Italic Highlight"
          value={formData.highlight || ""}
          onChange={setText("highlight")}
          placeholder="e.g. spotlight."
        />
        <TextAreaField
          label="Hero Description"
          value={formData.description || ""}
          onChange={setText("description")}
          rows={2}
          containerClassName="md:col-span-3"
          placeholder="e.g. Press coverage, interviews and articles featuring The Gold Technologies..."
        />
        <InputField
          label="Scroll Button Label"
          value={formData.secondaryLabel || ""}
          onChange={setText("secondaryLabel")}
          placeholder="e.g. See the coverage"
        />
        <InputField
          label="Coverage List Label"
          value={formData.listLabel || ""}
          onChange={setText("listLabel")}
          placeholder="e.g. (Coverage)"
        />
        <InputField
          label="Blog Fallback Link Label"
          value={formData.blogLabel || ""}
          onChange={setText("blogLabel")}
          placeholder="e.g. Read the blog"
        />
        <InputField
          label="Empty State Message"
          value={formData.empty || ""}
          onChange={setText("empty")}
          containerClassName="md:col-span-3"
          placeholder="e.g. Press coverage is on its way. In the meantime, read our latest articles."
        />
        <div className="md:col-span-3">
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
