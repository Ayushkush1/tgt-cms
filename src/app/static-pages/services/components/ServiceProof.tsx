"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { StaticSectionCard, StringListField } from "@/app/components/StaticSectionCard";
import type { ProofCase } from "../types";

interface ServiceProofProps {
  proof: ProofCase[];
  work: string[];
  onProofChange: (proof: ProofCase[]) => void;
  onWorkChange: (work: string[]) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ServiceProof({
  proof,
  work,
  onProofChange,
  onWorkChange,
  isSaving,
  onSave,
}: ServiceProofProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const cases = Array.isArray(proof) ? proof : [];

  const addCase = () => {
    const next = [...cases, { title: "", text: "", metrics: [] }];
    onProofChange(next);
    setExpandedIdx(next.length - 1);
  };

  const removeCase = (index: number) => {
    onProofChange(cases.filter((_, i) => i !== index));
    setExpandedIdx((prev) => (prev === index ? null : prev));
  };

  const updateCase = (index: number, patch: Partial<ProofCase>) => {
    onProofChange(cases.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <StaticSectionCard
      title="4. Proof & Global Reach (Proof)"
      description="Case results delivered, optional headline metrics, and the client names/brands marquee."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={onSave}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Case Proof Cards ({cases.length})
          </span>
          <button
            type="button"
            onClick={addCase}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add case proof
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {cases.map((item, idx) => {
            const metrics = Array.isArray(item.metrics) ? item.metrics : [];
            return (
              <CollapsibleCard
                key={idx}
                badge={`Case ${String(idx + 1).padStart(2, "0")}`}
                title={item.title || `Case Proof ${idx + 1}`}
                subtitle={metrics.length > 0 ? `${metrics.length} metric(s)` : undefined}
                isOpen={expandedIdx === idx}
                onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                onRemove={() => removeCase(idx)}
              >
                <div className="flex flex-col gap-4">
                  <InputField
                    label="Case Title"
                    value={item.title || ""}
                    onChange={(e) => updateCase(idx, { title: e.target.value })}
                    placeholder="e.g. GreatWaterFilters.com.au"
                  />
                  <TextAreaField
                    label="Case Summary"
                    value={item.text || ""}
                    onChange={(e) => updateCase(idx, { text: e.target.value })}
                    placeholder="e.g. A rebuilt e-commerce website for an Australian water filtration brand."
                    rows={2}
                  />

                  <div className="flex flex-col gap-2 rounded-xl border border-gray-200/80 bg-white p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Metrics ({metrics.length})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateCase(idx, { metrics: [...metrics, { value: "", label: "" }] })
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:bg-gray-100"
                      >
                        <Plus className="h-3 w-3" /> Add metric
                      </button>
                    </div>
                    {metrics.map((metric, mIdx) => (
                      <div
                        key={mIdx}
                        className="grid grid-cols-1 items-end gap-2 md:grid-cols-[1fr_1.5fr_auto]"
                      >
                        <InputField
                          label="Value"
                          value={metric.value || ""}
                          onChange={(e) => {
                            const next = metrics.map((m, k) =>
                              k === mIdx ? { ...m, value: e.target.value } : m,
                            );
                            updateCase(idx, { metrics: next });
                          }}
                          placeholder="e.g. 50%"
                        />
                        <InputField
                          label="Label"
                          value={metric.label || ""}
                          onChange={(e) => {
                            const next = metrics.map((m, k) =>
                              k === mIdx ? { ...m, label: e.target.value } : m,
                            );
                            updateCase(idx, { metrics: next });
                          }}
                          placeholder="e.g. Conversion rate"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateCase(idx, {
                              metrics: metrics.filter((_, k) => k !== mIdx),
                            })
                          }
                          className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleCard>
            );
          })}
        </div>
      </div>

      <StringListField
        label="Brands We've Built For (Client Names / Logos)"
        items={work || []}
        onChange={onWorkChange}
        placeholder="e.g. The Social Beacon"
        addLabel="Add brand"
        columns={3}
      />
    </StaticSectionCard>
  );
}
