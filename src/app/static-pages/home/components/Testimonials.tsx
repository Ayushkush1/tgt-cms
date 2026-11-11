"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { uploadFiles } from "@/lib/uploadHelpers";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import { saveCustomSection } from "@/app/components/StaticSectionCard";
import { HomeSectionCard, type SectionInstanceProps } from "./HomeSectionCard";

interface TestimonialsHeaderData {
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  rating: string;
  ratingLabel: string;
  ctaLabel: string;
  ctaUrl: string;
}

interface ClientStory {
  clientName: string;
  clientRole: string;
  quote: string;
  image?: string | null;
}

const DEFAULT_HEADER: TestimonialsHeaderData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  rating: "",
  ratingLabel: "",
  ctaLabel: "",
  ctaUrl: "",
};

const emptyStory = (): ClientStory => ({
  clientName: "",
  clientRole: "",
  quote: "",
  image: null,
});

export function Testimonials(sectionProps?: SectionInstanceProps) {
  const sectionId = sectionProps?.sectionId;
  const initialData = sectionProps?.initialData;
  const sectionSaveUrl = sectionProps?.saveUrl;

  const [isOpen, setIsOpen] = useState(false);
  const [expandedQuote, setExpandedQuote] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<TestimonialsHeaderData>(DEFAULT_HEADER);
  const [reputationMeta, setReputationMeta] = useState<Record<string, unknown>>({});
  const [stories, setStories] = useState<ClientStory[]>([]);
  const [storyImages, setStoryImages] = useState<(File | string | null)[]>([]);
  const confirmDelete = useConfirmDelete();

  useEffect(() => {
    if (sectionId) {
      const data = initialData || {};
      setFormData({ ...DEFAULT_HEADER, ...(data as Partial<TestimonialsHeaderData>) });
      const list = Array.isArray(data.testimonials) ? (data.testimonials as ClientStory[]) : [];
      setStories(list);
      setStoryImages(list.map((t) => t.image || null));
      return;
    }

    let active = true;
    fetchWithCache("/api/home")
      .then((json) => {
        if (!active || !json?.success) return;
        const header = json.data?.Testimonials;
        if (header && typeof header === "object") {
          setFormData({ ...DEFAULT_HEADER, ...header });
        }
        const rep = json.data?.OurReputation;
        if (rep && typeof rep === "object") {
          setReputationMeta(rep as Record<string, unknown>);
          const list = Array.isArray(rep.testimonials) ? (rep.testimonials as ClientStory[]) : [];
          setStories(list);
          setStoryImages(list.map((t) => t.image || null));
        }
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, [sectionId, initialData]);

  const setText = (key: keyof TestimonialsHeaderData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const updateStory = (idx: number, patch: Partial<ClientStory>) =>
    setStories((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const removeStory = async (idx: number) => {
    const name = stories[idx]?.clientName?.trim() || `Testimonial #${idx + 1}`;
    const ok = await confirmDelete({
      title: `Delete "${name}"?`,
      message: "This client quote will be removed from the Testimonials carousel once saved.",
    });
    if (!ok) return;
    setStories((prev) => prev.filter((_, i) => i !== idx));
    setStoryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving Testimonials…");
    try {
      const uploadedPhotos = await uploadFiles(storyImages);
      const cleanStories: ClientStory[] = stories
        .map((s, i) => ({
          clientName: (s.clientName || "").trim(),
          clientRole: (s.clientRole || "").trim(),
          quote: s.quote || "",
          image: uploadedPhotos[i] || null,
        }))
        .filter((s) => s.clientName || s.quote.trim());

      if (sectionId) {
        await saveCustomSection(
          sectionId,
          { ...formData, testimonials: cleanStories },
          sectionSaveUrl,
        );
      } else {
        const [headerRes, repRes] = await Promise.all([
          fetch("/api/home", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section: "Testimonials", content: formData }),
          }),
          fetch("/api/home", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              section: "OurReputation",
              content: { ...reputationMeta, testimonials: cleanStories },
            }),
          }),
        ]);

        const [headerJson, repJson] = await Promise.all([headerRes.json(), repRes.json()]);
        if (!headerRes.ok || !headerJson.success || !repRes.ok || !repJson.success) {
          throw new Error(headerJson?.error || repJson?.error || "Save failed");
        }
        clearCache("/api/home");
      }

      setStories(cleanStories);
      setStoryImages(cleanStories.map((s) => s.image || null));
      toast.success("Testimonials saved and published!", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HomeSectionCard
      title="Testimonials"
      description="Client stories section header, rating score, bottom CTA, and client quotes."
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
          placeholder="e.g. (Client stories)"
        />
        <div className="grid grid-cols-2 items-end gap-3">
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

      {/* Client Quotes Repeater */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Client Quotes ({stories.length})
          </span>
          <button
            type="button"
            onClick={() => {
              setStories((prev) => [...prev, emptyStory()]);
              setStoryImages((prev) => [...prev, null]);
              setExpandedQuote(stories.length);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] hover:bg-amber-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add quote
          </button>
        </div>

        {stories.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-400">
            No client quotes added yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {stories.map((story, idx) => (
              <CollapsibleCard
                key={idx}
                badge={`(${String(idx + 1).padStart(2, "0")})`}
                title={story.clientName || `Quote #${idx + 1}`}
                subtitle={story.clientRole || undefined}
                isOpen={expandedQuote === idx}
                onToggle={() => setExpandedQuote(expandedQuote === idx ? null : idx)}
                onRemove={() => removeStory(idx)}
              >
                <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2">
                  <InputField
                    label="Client Name"
                    value={story.clientName || ""}
                    onChange={(e) => updateStory(idx, { clientName: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                  />
                  <InputField
                    label="Client Role / Company"
                    value={story.clientRole || ""}
                    onChange={(e) => updateStory(idx, { clientRole: e.target.value })}
                    placeholder="e.g. CEO, TechCorp"
                  />
                  <TextAreaField
                    label="Quote"
                    value={story.quote || ""}
                    onChange={(e) => updateStory(idx, { quote: e.target.value })}
                    rows={3}
                    placeholder="Enter the client's testimonial quote..."
                    containerClassName="md:col-span-2"
                  />
                  <div className="md:col-span-2">
                    <ImageUploadField
                      label="Client Photo (Optional)"
                      images={storyImages[idx] ? [storyImages[idx]] : []}
                      onImagesChange={(imgs) =>
                        setStoryImages((prev) => {
                          const next = [...prev];
                          next[idx] = imgs[0] || null;
                          return next;
                        })
                      }
                      maxImages={1}
                    />
                  </div>
                </div>
              </CollapsibleCard>
            ))}
          </div>
        )}
      </div>
    </HomeSectionCard>
  );
}
