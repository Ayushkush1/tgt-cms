"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";

interface BlogIndexData {
  label: string;
  top: string;
  highlight: string;
  description: string;
  secondaryLabel: string;
  listLabel: string;
  empty: string;
  mediaPrompt: string;
  mediaLabel: string;
  mediaUrl: string;
}

const DEFAULT_DATA: BlogIndexData = {
  label: "",
  top: "",
  highlight: "",
  description: "",
  secondaryLabel: "",
  listLabel: "",
  empty: "",
  mediaPrompt: "",
  mediaLabel: "",
  mediaUrl: "",
};

const SECTION_KEY = "BlogIndex";

export function BlogIndex() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<BlogIndexData>(DEFAULT_DATA);

  useEffect(() => {
    let active = true;
    fetchWithCache("/api/blog")
      .then((json) => {
        if (!active) return;
        const incoming = json?.success ? json?.data?.[SECTION_KEY] : null;
        if (incoming && typeof incoming === "object") {
          // The /blog hero has no image, so an old saved imageUrl is dropped
          const { imageUrl: _unusedImage, ...rest } = incoming as Partial<BlogIndexData> & {
            imageUrl?: unknown;
          };
          void _unusedImage;
          setFormData({ ...DEFAULT_DATA, ...rest });
        }
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  const setText =
    (key: keyof BlogIndexData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving Blog Page settings…");
    try {
      const payload: BlogIndexData = { ...formData };
      const res = await fetch("/api/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Save failed");
      }
      setFormData(payload);
      clearCache("/api/blog");
      toast.success("Blog Page settings saved and published!", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all">
        <SectionHeader
          title="Blog Page Header & Copy"
          description="Hero headline, intro description, articles list label, empty-state text, and media link shown on /blog."
          isOpen={isOpen}
          onToggle={() => setIsOpen((v) => !v)}
        />
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className={isOpen ? "overflow-visible" : "overflow-hidden"}>
            <div className="flex flex-col gap-5 pt-2">
              <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                <InputField
                  label="Eyebrow Label"
                  value={formData.label || ""}
                  onChange={setText("label")}
                  placeholder="e.g. (Insights) Blog"
                />
                <InputField
                  label="Headline Top"
                  value={formData.top || ""}
                  onChange={setText("top")}
                  placeholder="e.g. Ideas that"
                />
                <InputField
                  label="Gold Italic Highlight"
                  value={formData.highlight || ""}
                  onChange={setText("highlight")}
                  placeholder="e.g. grow businesses."
                />
                <TextAreaField
                  label="Hero Description"
                  value={formData.description || ""}
                  onChange={setText("description")}
                  rows={2}
                  containerClassName="md:col-span-3"
                  placeholder="e.g. Practical guides on websites, search, software and marketing..."
                />
                <InputField
                  label="Scroll Button Label"
                  value={formData.secondaryLabel || ""}
                  onChange={setText("secondaryLabel")}
                  placeholder="e.g. Read the articles"
                />
                <InputField
                  label="Articles List Label"
                  value={formData.listLabel || ""}
                  onChange={setText("listLabel")}
                  placeholder="e.g. (All articles)"
                />
                <InputField
                  label="Empty State Message"
                  value={formData.empty || ""}
                  onChange={setText("empty")}
                  placeholder="e.g. New articles are on their way. Check back soon."
                />
                <InputField
                  label="Bottom Media Prompt"
                  value={formData.mediaPrompt || ""}
                  onChange={setText("mediaPrompt")}
                  placeholder="e.g. Looking for press coverage?"
                />
                <InputField
                  label="Media Link Label"
                  value={formData.mediaLabel || ""}
                  onChange={setText("mediaLabel")}
                  placeholder="e.g. See media & articles"
                />
                <InputField
                  label="Media Link URL"
                  value={formData.mediaUrl || ""}
                  onChange={setText("mediaUrl")}
                  placeholder="e.g. /media"
                />
              </div>

              <SaveButton onClick={handleSave} disabled={isSaving} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
