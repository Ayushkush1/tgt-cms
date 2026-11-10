"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { uploadFiles } from "@/lib/uploadHelpers";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";

interface FounderNoteData {
  label: string;
  quote: string;
  quoteHighlight: string;
  note: string[];
  name: string;
  role: string;
  photo: string;
  backdrop: string;
  ctaLabel: string;
  ctaUrl: string;
}

const DEFAULT_DATA: FounderNoteData = {
  label: "",
  quote: "",
  quoteHighlight: "",
  note: ["", ""],
  name: "",
  role: "",
  photo: "",
  backdrop: "",
  ctaLabel: "",
  ctaUrl: "",
};

export function FounderNote() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FounderNoteData>(DEFAULT_DATA);
  const [photoFiles, setPhotoFiles] = useState<(File | string | null)[]>([]);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    let active = true;
    fetchWithCache("/api/about")
      .then((json) => {
        if (!active || !json?.success) return;
        const incoming = json.data?.FounderNote;
        if (incoming && typeof incoming === "object") {
          const noteList = Array.isArray(incoming.note) ? (incoming.note as string[]) : [];
          const merged: FounderNoteData = {
            ...DEFAULT_DATA,
            ...incoming,
            note: noteList,
          };
          setFormData(merged);
          setNoteDraft(noteList.join("\n\n"));
          setPhotoFiles(merged.photo ? [merged.photo] : []);
        }
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  const setText =
    (key: keyof FounderNoteData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving Founder Note…");
    try {
      const uploaded = await uploadFiles(photoFiles);
      const photoUrl = uploaded[0] || formData.photo || "";
      const paragraphs = noteDraft
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean);
      const payload: FounderNoteData = {
        ...formData,
        photo: photoUrl,
        note: paragraphs,
      };

      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "FounderNote", content: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Save failed");
      }
      setPhotoFiles(photoUrl ? [photoUrl] : []);
      clearCache("/api/about");
      toast.success("Founder Note saved and published!", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StaticSectionCard
      title="Founder Note"
      description="Arch portrait, word-masked pull quote, two-column note paragraphs, backdrop watermark, and CTA."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={handleSave}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (A note from our founder)"
        />
        <InputField
          label="Backdrop Watermark Word"
          value={formData.backdrop || ""}
          onChange={setText("backdrop")}
          placeholder="e.g. Founder's note"
        />
        <InputField
          label="Pull Quote (Main)"
          value={formData.quote || ""}
          onChange={setText("quote")}
          placeholder="e.g. Every business we take on deserves a team that treats it"
        />
        <InputField
          label="Pull Quote Gold Highlight"
          value={formData.quoteHighlight || ""}
          onChange={setText("quoteHighlight")}
          placeholder="e.g. like its own."
        />
        <TextAreaField
          label="Founder's Letter (Enter for new paragraph)"
          tooltip="Press Enter to split into paragraphs (rendered across columns on the website)."
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          rows={5}
          containerClassName="md:col-span-2"
          placeholder="When I started The Gold Technologies in 2023...&#10;&#10;50+ businesses later, that is still how we work..."
        />
        <InputField
          label="Founder Name"
          value={formData.name || ""}
          onChange={setText("name")}
          placeholder="e.g. Meghna Tiwari"
        />
        <InputField
          label="Founder Role"
          value={formData.role || ""}
          onChange={setText("role")}
          placeholder="e.g. Founder & CEO"
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

      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
        <ImageUploadField
          label="Founder Arch Portrait"
          images={photoFiles}
          onImagesChange={setPhotoFiles}
          maxImages={1}
        />
      </div>
    </StaticSectionCard>
  );
}
