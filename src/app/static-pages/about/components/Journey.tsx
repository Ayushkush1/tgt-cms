"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";

interface Milestone {
  year: string;
  title: string;
  description: string;
}

interface JourneyData {
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  milestones: Milestone[];
}

const DEFAULT_DATA: JourneyData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  milestones: [],
};

export function Journey() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [formData, setFormData] = useState<JourneyData>(DEFAULT_DATA);
  const [ceoMain, setCeoMain] = useState<Record<string, unknown> | null>(null);
  const confirmDelete = useConfirmDelete();

  useEffect(() => {
    let active = true;
    Promise.all([fetchWithCache("/api/about"), fetch("/api/ceo").then((r) => r.json())])
      .then(([aboutJson, ceoJson]) => {
        if (!active) return;
        const incoming = aboutJson?.success ? aboutJson.data?.Journey : null;
        const ceoContent = ceoJson?.success && ceoJson.data ? ceoJson.data : null;
        if (ceoContent) setCeoMain(ceoContent);

        const ceoMilestones = Array.isArray(ceoContent?.timeline?.milestones)
          ? (ceoContent.timeline.milestones as Milestone[])
          : [];
        const journeyMilestones = Array.isArray(incoming?.milestones)
          ? (incoming.milestones as Milestone[])
          : [];

        setFormData({
          ...DEFAULT_DATA,
          ...(incoming && typeof incoming === "object" ? incoming : {}),
          milestones: journeyMilestones.length > 0 ? journeyMilestones : ceoMilestones,
        });
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  const milestones = Array.isArray(formData.milestones) ? formData.milestones : [];

  const setText = (key: keyof JourneyData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const updateMilestone = (idx: number, patch: Partial<Milestone>) =>
    setFormData((prev) => ({
      ...prev,
      milestones: milestones.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    }));

  const removeMilestone = async (idx: number) => {
    const label =
      milestones[idx]?.title?.trim() || milestones[idx]?.year || `Milestone #${idx + 1}`;
    const ok = await confirmDelete({
      title: `Delete "${label}"?`,
      message: "This milestone will be removed from About Journey and CEO Timeline once saved.",
    });
    if (!ok) return;
    setFormData((prev) => ({
      ...prev,
      milestones: milestones.filter((_, i) => i !== idx),
    }));
    setExpandedMilestone((prev) =>
      prev === idx ? null : prev !== null && prev > idx ? prev - 1 : prev,
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving Journey…");
    try {
      const cleanMilestones = milestones.filter(
        (m) => m.year.trim() || m.title.trim() || m.description.trim(),
      );
      const journeyPayload: JourneyData = { ...formData, milestones: cleanMilestones };

      const requests: Promise<Response>[] = [
        fetch("/api/about", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "Journey", content: journeyPayload }),
        }),
      ];

      if (ceoMain) {
        const existingTimeline =
          typeof ceoMain.timeline === "object" && ceoMain.timeline !== null
            ? (ceoMain.timeline as Record<string, unknown>)
            : {};
        requests.push(
          fetch("/api/ceo", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: {
                ...ceoMain,
                timeline: { ...existingTimeline, milestones: cleanMilestones },
              },
            }),
          }),
        );
      }

      const responses = await Promise.all(requests);
      const jsons = await Promise.all(responses.map((r) => r.json()));
      const failedIdx = responses.findIndex((r, i) => !r.ok || !jsons[i]?.success);
      if (failedIdx !== -1) {
        throw new Error(jsons[failedIdx]?.error || "Save failed");
      }

      clearCache("/api/about");
      clearCache("/api/ceo");
      toast.success("Journey saved and synced with CEO milestones!", { id: toastId });
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
      title="Journey"
      description="Company milestones timeline header and entries (synced with CEO timeline)."
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
          placeholder="e.g. (Our journey)"
        />
        <InputField
          label="Headline Main"
          value={formData.headlineMain || ""}
          onChange={setText("headlineMain")}
          placeholder="e.g. Founded in 2023,"
        />
        <InputField
          label="Gold Italic Highlight"
          value={formData.headlineHighlight || ""}
          onChange={setText("headlineHighlight")}
          placeholder="e.g. built on a decade."
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Milestones ({milestones.length})
          </span>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                milestones: [...milestones, { year: "", title: "", description: "" }],
              }));
              setExpandedMilestone(milestones.length);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] hover:bg-amber-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add milestone
          </button>
        </div>

        {milestones.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-400">
            No milestones added yet.
          </p>
        ) : (
          milestones.map((item, idx) => (
            <CollapsibleCard
              key={idx}
              badge={item.year || `(${String(idx + 1).padStart(2, "0")})`}
              title={item.title || `Milestone #${idx + 1}`}
              isOpen={expandedMilestone === idx}
              onToggle={() => setExpandedMilestone(expandedMilestone === idx ? null : idx)}
              onRemove={() => removeMilestone(idx)}
            >
              <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-12">
                <div className="md:col-span-3">
                  <InputField
                    label="Year"
                    value={item.year || ""}
                    onChange={(e) => updateMilestone(idx, { year: e.target.value })}
                    placeholder="e.g. 2023"
                  />
                </div>
                <div className="md:col-span-9">
                  <InputField
                    label="Title"
                    value={item.title || ""}
                    onChange={(e) => updateMilestone(idx, { title: e.target.value })}
                    placeholder="e.g. TGT Founded"
                  />
                </div>
                <TextAreaField
                  label="Description"
                  value={item.description || ""}
                  onChange={(e) => updateMilestone(idx, { description: e.target.value })}
                  rows={2}
                  containerClassName="md:col-span-12"
                  placeholder="Describe what happened at this milestone..."
                />
              </div>
            </CollapsibleCard>
          ))
        )}
      </div>
    </StaticSectionCard>
  );
}
