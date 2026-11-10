"use client";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { Plus, Trash2 } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(true);

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
        <div className="flex flex-col gap-8 pt-4">
          {services.map((service: WhatWeDoCMSItem, idx: number) => (
            <div
              key={idx}
              className="group relative grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="col-span-2 -mx-6 -mt-6 mb-2 flex items-center justify-between rounded-t-2xl border-b border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700">
                    {service.number}
                  </span>
                  <h3 className="font-bold text-gray-700">Service Card</h3>
                </div>
                <button
                  onClick={() => removeService(idx)}
                  className="flex items-center gap-1.5 rounded-lg bg-red-50 p-1 px-3 text-xs font-semibold text-red-500 transition-colors hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove Service
                </button>
              </div>

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
                containerClassName="col-span-2"
                placeholder="Briefly describe the service and its benefits"
                rows={3}
                required
              />

              <div className="col-span-1">
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
                containerClassName="col-span-1"
                required
              />
            </div>
          ))}

          <button
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
