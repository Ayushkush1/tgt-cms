"use client";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { Plus } from "lucide-react";

interface WhatWeDoCMSItem {
  number: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  outcome: string;
}

export function WhatWeDoCMS({
  services,
  onChange,
}: {
  services: WhatWeDoCMSItem[];
  onChange: (services: WhatWeDoCMSItem[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedService, setExpandedService] = useState<number | null>(null);

  const addService = () => {
    const nextNum = (services.length + 1).toString().padStart(2, "0");
    onChange([
      ...services,
      {
        number: nextNum,
        title: "",
        category: "",
        description: "",
        tags: [],
        outcome: "",
      },
    ]);
    setExpandedService(services.length);
  };

  const removeService = (index: number) => {
    onChange(services.filter((_, i) => i !== index));
  };

  const handleUpdate = (
    index: number,
    field: keyof WhatWeDoCMSItem,
    value: WhatWeDoCMSItem[keyof WhatWeDoCMSItem],
  ) => {
    const updated = services.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange(updated);
  };

  const handleTagsChange = (index: number, value: string) => {
    const updated = services.map((s, i) =>
      i === index
        ? {
            ...s,
            tags: value.split(","),
          }
        : s,
    );
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        title="What We Do / Services Section"
        description="Add, remove, or edit the service cards displayed in the accordion/grid."
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="flex flex-col gap-4 pt-4">
          {services.map((service: WhatWeDoCMSItem, idx: number) => (
            <CollapsibleCard
              key={idx}
              badge={`(${service.number || String(idx + 1).padStart(2, "0")})`}
              title={service.title || `Service ${idx + 1}`}
              subtitle={service.category || undefined}
              isOpen={expandedService === idx}
              onToggle={() => setExpandedService(expandedService === idx ? null : idx)}
              onRemove={() => removeService(idx)}
            >
              <div className="grid grid-cols-1 items-end gap-x-6 gap-y-4 md:grid-cols-2">
                <InputField
                  label="Service Title"
                  value={service.title}
                  onChange={(e) => handleUpdate(idx, "title", e.target.value)}
                  placeholder="Enter service name"
                  required
                />
                <InputField
                  label="Category / Subtitle"
                  value={service.category}
                  onChange={(e) => handleUpdate(idx, "category", e.target.value)}
                  placeholder="Service category or short label"
                  required
                />

                <TextAreaField
                  label="Description"
                  value={service.description}
                  onChange={(e) => handleUpdate(idx, "description", e.target.value)}
                  containerClassName="md:col-span-2"
                  placeholder="Briefly describe the service and its benefits"
                  rows={3}
                  required
                />

                <div>
                  <InputField
                    label="Tags"
                    value={Array.isArray(service.tags) ? service.tags.join(",") : ""}
                    onChange={(e) => handleTagsChange(idx, e.target.value)}
                    placeholder="e.g., Tag 1, Tag 2, Tag 3"
                  />
                  <p className="mt-1 ml-1 text-[11px] text-gray-400 italic">
                    Separate tags with commas
                  </p>
                </div>

                <InputField
                  label="Expected Outcome"
                  value={service.outcome}
                  onChange={(e) => handleUpdate(idx, "outcome", e.target.value)}
                  placeholder="Primary result for the client"
                  required
                />
              </div>
            </CollapsibleCard>
          ))}

          <button
            type="button"
            onClick={addService}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 font-bold text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
            Add New Service Card
          </button>
        </div>
      )}
    </div>
  );
}
