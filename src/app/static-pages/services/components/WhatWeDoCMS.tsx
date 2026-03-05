"use client";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { Plus, Trash2 } from "lucide-react";

interface ServiceItem {
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
  services: ServiceItem[];
  onChange: (services: ServiceItem[]) => void;
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
    field: keyof ServiceItem,
    value: any,
  ) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleTagsChange = (index: number, value: string) => {
    const updated = [...services];
    updated[index].tags = value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
      <SectionHeader
        title="What We Do / Services Section"
        description="Add, remove, or edit the service cards displayed in the accordion/grid."
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="flex flex-col gap-8 pt-4">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="group p-6 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all grid grid-cols-2 gap-x-6 gap-y-4 relative"
            >
              <div className="col-span-2 flex justify-between items-center bg-gray-50 -mx-6 -mt-6 p-4 rounded-t-2xl border-b border-gray-100 mb-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 rounded-full font-bold text-sm">
                    {service.number}
                  </span>
                  <h3 className="font-bold text-gray-700">Service Card</h3>
                </div>
                <button
                  onClick={() => removeService(idx)}
                  className="p-1 px-3 bg-red-50 text-red-500 rounded-lg text-xs flex items-center gap-1.5 hover:bg-red-100 transition-colors font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Service
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
                onChange={(e) =>
                  handleUpdate(idx, "description", e.target.value)
                }
                containerClassName="col-span-2"
                placeholder="Briefly describe the service and its benefits"
                rows={3}
                required
              />

              <div className="col-span-1">
                <InputField
                  label="Tags"
                  value={service.tags.join(", ")}
                  onChange={(e) => handleTagsChange(idx, e.target.value)}
                  placeholder="e.g., Tag 1, Tag 2, Tag 3"
                />
                <p className="text-[11px] text-gray-400 mt-1 ml-1 italic">
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
            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-2 transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Add New Service Card
          </button>
        </div>
      )}
    </div>
  );
}
