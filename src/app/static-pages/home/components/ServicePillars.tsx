"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { HomeSectionCard, useHomeSection, type SectionInstanceProps } from "./HomeSectionCard";

interface PillarService {
  name: string;
  href: string;
  items: string[];
}

interface Pillar {
  id: string;
  number: string;
  name: string;
  title: string;
  description: string;
  outcome: string;
  services: PillarService[];
}

interface ServicePillarsData {
  [key: string]: unknown;
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  pillars: Pillar[];
}

const DEFAULT_DATA: ServicePillarsData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  description: "",
  ctaLabel: "",
  ctaUrl: "",
  pillars: [],
};

const PILLAR_IDS = [
  { value: "brand", label: "brand" },
  { value: "build", label: "build" },
  { value: "grow", label: "grow" },
  { value: "scale", label: "scale" },
];

export function ServicePillars(sectionProps?: SectionInstanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);
  const { formData, setFormData, isSaving, save } = useHomeSection(
    "ServicePillars",
    DEFAULT_DATA,
    "Service Pillars",
    sectionProps,
  );

  const pillars = Array.isArray(formData.pillars) ? formData.pillars : [];

  const setText =
    (key: keyof ServicePillarsData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const updatePillar = (idx: number, patch: Partial<Pillar>) =>
    setFormData((prev) => ({
      ...prev,
      pillars: pillars.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));

  const updateService = (pIdx: number, sIdx: number, patch: Partial<PillarService>) => {
    const services = Array.isArray(pillars[pIdx]?.services) ? pillars[pIdx].services : [];
    updatePillar(pIdx, {
      services: services.map((s, i) => (i === sIdx ? { ...s, ...patch } : s)),
    });
  };

  return (
    <HomeSectionCard
      title="Service Pillars"
      description="Brand, Build, Grow & Scale stacking service cards and section header."
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
          placeholder="e.g. (What we do)"
        />
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Headline Main"
            value={formData.headlineMain || ""}
            onChange={setText("headlineMain")}
            placeholder="e.g. Everything you need to grow."
          />
          <InputField
            label="Gold Italic Highlight"
            value={formData.headlineHighlight || ""}
            onChange={setText("headlineHighlight")}
            placeholder="e.g. Under one roof."
          />
        </div>
        <TextAreaField
          label="Description"
          value={formData.description || ""}
          onChange={setText("description")}
          rows={2}
          containerClassName="md:col-span-2"
          placeholder="Eleven services organised around the four stages of growth..."
        />
        <InputField
          label="CTA Label"
          value={formData.ctaLabel || ""}
          onChange={setText("ctaLabel")}
          placeholder="e.g. Not sure where to start? Get a free audit"
        />
        <InputField
          label="CTA URL"
          value={formData.ctaUrl || ""}
          onChange={setText("ctaUrl")}
          placeholder="https://calendar.app.google/..."
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Pillars ({pillars.length})
          </span>
          <button
            type="button"
            onClick={() => {
              const nextNum = String(pillars.length + 1).padStart(2, "0");
              setFormData((prev) => ({
                ...prev,
                pillars: [
                  ...pillars,
                  {
                    id: "",
                    number: nextNum,
                    name: "",
                    title: "",
                    description: "",
                    outcome: "",
                    services: [],
                  },
                ],
              }));
              setExpandedPillar(pillars.length);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] transition-colors hover:bg-amber-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add pillar
          </button>
        </div>

        {pillars.map((pillar, pIdx) => {
          const open = expandedPillar === pIdx;
          const services = Array.isArray(pillar.services) ? pillar.services : [];

          return (
            <CollapsibleCard
              key={pIdx}
              badge={`(${pillar.number || String(pIdx + 1).padStart(2, "0")})`}
              title={pillar.name || `Pillar ${pIdx + 1}`}
              subtitle={`${services.length} ${services.length === 1 ? "service" : "services"}`}
              isOpen={open}
              onToggle={() => setExpandedPillar(open ? null : pIdx)}
              onRemove={() =>
                setFormData((prev) => ({
                  ...prev,
                  pillars: pillars.filter((_, i) => i !== pIdx),
                }))
              }
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-1.5 px-0.5">
                  <label className="ml-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                    Pillar ID
                  </label>
                  <select
                    value={pillar.id || ""}
                    onChange={(e) => updatePillar(pIdx, { id: e.target.value })}
                    className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm text-[#0B0F29] transition-all outline-none focus:border-[#0B0F29] focus:ring-2 focus:ring-[#0B0F29]/15"
                  >
                    <option value="">Select pillar ID</option>
                    {PILLAR_IDS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <InputField
                  label="Number"
                  value={pillar.number || ""}
                  onChange={(e) => updatePillar(pIdx, { number: e.target.value })}
                  placeholder="e.g. 01"
                />
                <InputField
                  label="Pillar Name"
                  value={pillar.name || ""}
                  onChange={(e) => updatePillar(pIdx, { name: e.target.value })}
                  placeholder="e.g. Brand"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InputField
                  label="Card Title"
                  value={pillar.title || ""}
                  onChange={(e) => updatePillar(pIdx, { title: e.target.value })}
                  placeholder="e.g. Look the part. Be remembered."
                />
                <InputField
                  label="Outcome Line"
                  value={pillar.outcome || ""}
                  onChange={(e) => updatePillar(pIdx, { outcome: e.target.value })}
                  placeholder="e.g. A brand customers trust at first glance."
                />
                <TextAreaField
                  label="Description"
                  value={pillar.description || ""}
                  onChange={(e) => updatePillar(pIdx, { description: e.target.value })}
                  rows={2}
                  containerClassName="md:col-span-2"
                  placeholder="e.g. A business without a strong identity looks forgettable..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                    Services in {pillar.name || "Pillar"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updatePillar(pIdx, {
                        services: [...services, { name: "", href: "", items: [] }],
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:border-[#D4AF37]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add service
                  </button>
                </div>

                {services.map((svc, sIdx) => (
                  <div
                    key={sIdx}
                    className="grid grid-cols-1 items-end gap-2 rounded-xl border border-gray-200/70 bg-white p-3 md:grid-cols-[1fr_1fr_1.4fr_auto]"
                  >
                    <InputField
                      label="Service Name"
                      value={svc.name || ""}
                      onChange={(e) => updateService(pIdx, sIdx, { name: e.target.value })}
                      placeholder="e.g. Branding & Identity"
                    />
                    <InputField
                      label="Route / Href"
                      value={svc.href || ""}
                      onChange={(e) => updateService(pIdx, sIdx, { href: e.target.value })}
                      placeholder="e.g. /service/branding"
                    />
                    <InputField
                      label="Sub-items (comma separated)"
                      value={(Array.isArray(svc.items) ? svc.items : []).join(", ")}
                      onChange={(e) =>
                        updateService(pIdx, sIdx, {
                          items: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Strategy, Logo, Voice"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updatePillar(pIdx, {
                          services: services.filter((_, i) => i !== sIdx),
                        })
                      }
                      className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          );
        })}
      </div>
    </HomeSectionCard>
  );
}
