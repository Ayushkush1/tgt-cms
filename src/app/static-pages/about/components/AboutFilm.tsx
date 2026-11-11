"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import {
  StaticSectionCard,
  saveCustomSection,
  type SectionInstanceProps,
} from "@/app/components/StaticSectionCard";

interface AboutFilmData {
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  descriptionText: string;
  videoUrl: string;
}

const DEFAULT_DATA: AboutFilmData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  descriptionText: "",
  videoUrl: "",
};

export function AboutFilm(sectionProps?: SectionInstanceProps) {
  const sectionId = sectionProps?.sectionId;
  const initialData = sectionProps?.initialData;
  const sectionSaveUrl = sectionProps?.saveUrl;

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<AboutFilmData>(DEFAULT_DATA);
  const [videoMeta, setVideoMeta] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (sectionId) {
      setFormData({ ...DEFAULT_DATA, ...((initialData as Partial<AboutFilmData>) || {}) });
      return;
    }

    let active = true;
    fetchWithCache("/api/about")
      .then((json) => {
        if (!active || !json?.success) return;
        const film = json.data?.AboutFilm;
        const legacy = json.data?.VideoSection;
        if (legacy && typeof legacy === "object") {
          setVideoMeta(legacy as Record<string, unknown>);
        }
        setFormData({
          ...DEFAULT_DATA,
          descriptionText: String(legacy?.descriptionText || ""),
          videoUrl: String(legacy?.videoUrl || ""),
          ...(film && typeof film === "object" ? film : {}),
        });
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, [sectionId, initialData]);

  const setText =
    (key: keyof AboutFilmData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving About Film…");
    try {
      if (sectionId) {
        await saveCustomSection(sectionId, formData, sectionSaveUrl);
      } else {
        const [filmRes, videoRes] = await Promise.all([
          fetch("/api/about", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section: "AboutFilm", content: formData }),
          }),
          fetch("/api/about", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              section: "VideoSection",
              content: {
                ...videoMeta,
                videoUrl: formData.videoUrl,
                descriptionText: formData.descriptionText,
              },
            }),
          }),
        ]);

        const [filmJson, videoJson] = await Promise.all([filmRes.json(), videoRes.json()]);
        if (!filmRes.ok || !filmJson.success || !videoRes.ok || !videoJson.success) {
          throw new Error(filmJson?.error || videoJson?.error || "Save failed");
        }

        clearCache("/api/about");
      }
      toast.success("About Film saved and published!", { id: toastId });
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
      title="About Film"
      description="Company video section heading, description, and YouTube embed/watch URL."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={handleSave}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (Inside TGT)"
        />
        <InputField
          label="Headline Main"
          value={formData.headlineMain || ""}
          onChange={setText("headlineMain")}
          placeholder="e.g. See how we"
        />
        <InputField
          label="Gold Italic Highlight"
          value={formData.headlineHighlight || ""}
          onChange={setText("headlineHighlight")}
          placeholder="e.g. work."
        />
        <TextAreaField
          label="Description"
          value={formData.descriptionText || ""}
          onChange={setText("descriptionText")}
          rows={3}
          containerClassName="md:col-span-3"
          placeholder="At The Gold Technologies, we help businesses innovate..."
        />
        <InputField
          label="YouTube Video URL"
          value={formData.videoUrl || ""}
          onChange={setText("videoUrl")}
          containerClassName="md:col-span-3"
          placeholder="https://www.youtube.com/embed/..."
        />
      </div>
    </StaticSectionCard>
  );
}
