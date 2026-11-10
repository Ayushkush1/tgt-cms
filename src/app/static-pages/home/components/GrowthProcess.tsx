"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { HomeSectionCard, StringListField, useHomeSection } from "./HomeSectionCard";

interface ProcessStep {
  number: string;
  title: string;
  description: string;
  deliverable: string;
}

interface GrowthProcessData {
  [key: string]: unknown;
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  description: string;
  steps: ProcessStep[];
  commitments: string[];
}

const DEFAULT_DATA: GrowthProcessData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  description: "",
  steps: [],
  commitments: [],
};

export function GrowthProcess() {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useHomeSection(
    "GrowthProcess",
    DEFAULT_DATA,
    "Growth Process",
  );

  const steps = Array.isArray(formData.steps) ? formData.steps : [];

  const setText =
    (key: keyof GrowthProcessData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const updateStep = (idx: number, patch: Partial<ProcessStep>) =>
    setFormData((prev) => ({
      ...prev,
      steps: steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));

  return (
    <HomeSectionCard
      title="Growth Process"
      description="4-step process list (Discover, Strategise, Build & Launch, Grow) and bottom commitments."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() =>
        save({
          ...formData,
          commitments: (formData.commitments || []).map((c) => c.trim()).filter(Boolean),
        })
      }
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (How we work)"
        />
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Headline Main"
            value={formData.headlineMain || ""}
            onChange={setText("headlineMain")}
            placeholder="e.g. A simple path from"
          />
          <InputField
            label="Gold Italic Highlight"
            value={formData.headlineHighlight || ""}
            onChange={setText("headlineHighlight")}
            placeholder="e.g. idea to impact."
          />
        </div>
        <TextAreaField
          label="Description"
          value={formData.description || ""}
          onChange={setText("description")}
          rows={2}
          containerClassName="md:col-span-2"
          placeholder="e.g. You get a dedicated team, weekly demos, and one Slack channel..."
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Steps ({steps.length})
          </span>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                steps: [
                  ...steps,
                  {
                    number: String(steps.length + 1).padStart(2, "0"),
                    title: "",
                    description: "",
                    deliverable: "",
                  },
                ],
              }))
            }
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] hover:bg-amber-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add step
          </button>
        </div>

        {steps.map((step, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#B8932A]">
                Step {step.number || String(idx + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, steps: steps.filter((_, i) => i !== idx) }))
                }
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <InputField
                label="Number"
                value={step.number || ""}
                onChange={(e) => updateStep(idx, { number: e.target.value })}
                placeholder="01"
              />
              <InputField
                label="Title"
                value={step.title || ""}
                onChange={(e) => updateStep(idx, { title: e.target.value })}
                placeholder="e.g. Discover"
              />
              <InputField
                label="Deliverable"
                value={step.deliverable || ""}
                onChange={(e) => updateStep(idx, { deliverable: e.target.value })}
                placeholder="e.g. Growth audit & KPI roadmap"
              />
            </div>
            <TextAreaField
              label="Description"
              value={step.description || ""}
              onChange={(e) => updateStep(idx, { description: e.target.value })}
              rows={2}
              placeholder="e.g. We audit your business, customers, and competitors to map what drives growth..."
            />
          </div>
        ))}
      </div>

      <StringListField
        label="Bottom Commitments"
        items={formData.commitments || []}
        onChange={(commitments) => setFormData((prev) => ({ ...prev, commitments }))}
        placeholder="e.g. Transparent weekly updates"
        addLabel="Add commitment"
        columns={2}
      />
    </HomeSectionCard>
  );
}
