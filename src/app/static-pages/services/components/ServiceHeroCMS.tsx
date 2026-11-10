"use client";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { Plus, Trash2 } from "lucide-react";
import { SelectField } from "@/components/SelectField";

interface Pillar {
  number: string;
  title: string;
  desc: string;
}

interface HeroData {
  label: string;
  headingLine1: string;
  headingLine2: string;
  paragraphs: string[];
  ctaText: string;
  ctaHref: string;
  imageUrl: string | File;
  statSince: string;
  statProjects: string;
  pillars: Pillar[];
  headingTag?: string;
}

export function ServiceHeroCMS({
  data,
  onChange,
}: {
  data: HeroData;
  onChange: (data: HeroData) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const handlePillarChange = (index: number, field: keyof Pillar, value: string) => {
    const newPillars = [...data.pillars];
    newPillars[index] = { ...newPillars[index], [field]: value };
    onChange({ ...data, pillars: newPillars });
  };

  const addPillar = () => {
    if (data.pillars.length < 4) {
      onChange({
        ...data,
        pillars: [...data.pillars, { number: `0${data.pillars.length + 1}`, title: "", desc: "" }],
      });
    }
  };

  const removePillar = (index: number) => {
    onChange({
      ...data,
      pillars: data.pillars.filter((_, i) => i !== index),
    });
  };

  const handleParagraphChange = (index: number, value: string) => {
    const newParagraphs = [...data.paragraphs];
    newParagraphs[index] = value;
    onChange({ ...data, paragraphs: newParagraphs });
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        title="Service Hero Content"
        description="Manage the main heading, background image, and the four key pillars."
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="flex flex-col gap-8 pt-4">
          {/* Main Text Section */}
          <div className="grid grid-cols-2 gap-4">
            <h3 className="col-span-2 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Main Content
            </h3>
            <InputField
              label="Eyebrow Label"
              value={data.label}
              onChange={(e) => onChange({ ...data, label: e.target.value })}
              placeholder="e.g. Our Services"
            />

            <InputField
              label="Heading Line "
              value={data.headingLine1}
              onChange={(e) => onChange({ ...data, headingLine1: e.target.value })}
              placeholder="First line of main heading"
              required
            />

            <SelectField
              label="Heading HTML Tag"
              value={data.headingTag || "h1"}
              onChange={(e) => onChange({ ...data, headingTag: e.target.value })}
              options={[
                { value: "h1", label: "H1" },
                { value: "h2", label: "H2" },
                { value: "h3", label: "H3" },
                { value: "h4", label: "H4" },
                { value: "h5", label: "H5" },
                { value: "h6", label: "H6" },
              ]}
              containerClassName="col-span-2"
            />

            <TextAreaField
              label="Paragraph 1"
              value={data.paragraphs[0] || ""}
              onChange={(e) => handleParagraphChange(0, e.target.value)}
              placeholder="Primary service overview text"
              containerClassName="col-span-2"
              required
            />
            <TextAreaField
              label="Paragraph 2"
              value={data.paragraphs[1] || ""}
              onChange={(e) => handleParagraphChange(1, e.target.value)}
              placeholder="Additional supporting details"
              containerClassName="col-span-2"
            />
          </div>

          {/* Action & Stats Section */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 lg:grid-cols-4">
            <h3 className="col-span-full mb-2 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Actions & Stats
            </h3>
            <InputField
              label="CTA Text"
              value={data.ctaText}
              onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
              placeholder="Text for the main action button"
              className="bg-white"
            />
            <InputField
              label="CTA Link"
              value={data.ctaHref}
              onChange={(e) => onChange({ ...data, ctaHref: e.target.value })}
              placeholder="URL for the action (e.g., /contact)"
              className="bg-white"
            />
            <InputField
              label="Stat: Since (Year)"
              value={data.statSince}
              onChange={(e) => onChange({ ...data, statSince: e.target.value })}
              placeholder="Starting year (e.g., 2015)"
              className="bg-white"
            />
            <InputField
              label="Stat: Projects Completed"
              value={data.statProjects}
              onChange={(e) => onChange({ ...data, statProjects: e.target.value })}
              placeholder="Total project count"
              className="bg-white"
            />
          </div>

          {/* Visuals Section */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Visuals
            </h3>
            <ImageUploadField
              label="Hero Image"
              images={data.imageUrl ? [data.imageUrl] : []}
              onImagesChange={(imgs) => onChange({ ...data, imageUrl: imgs[0] || "" })}
              maxImages={1}
            />
          </div>

          {/* Pillars Section */}
          <div className="border-t border-gray-100 pt-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">Service Pillars</h3>
                <p className="text-sm text-gray-500">
                  Key value propositions shown in the grid (Max 4).
                </p>
              </div>
              {data.pillars.length < 4 && (
                <button
                  onClick={addPillar}
                  className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-black hover:text-[#D4AF37] hover:shadow active:scale-95"
                >
                  <Plus className="h-4 w-4" /> Add Pillar
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {data.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF37] text-sm font-bold text-white shadow-lg transition-transform group-hover:scale-110">
                    {pillar.number}
                  </div>
                  <button
                    onClick={() => removePillar(idx)}
                    className="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-black"
                    title="Remove Pillar"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                  <InputField
                    label="Pillar Title"
                    value={pillar.title}
                    onChange={(e) => handlePillarChange(idx, "title", e.target.value)}
                    placeholder="Short summary of this pillar"
                    containerClassName="mb-4 mt-2"
                    required
                  />
                  <TextAreaField
                    label="Description"
                    value={pillar.desc}
                    onChange={(e) => handlePillarChange(idx, "desc", e.target.value)}
                    placeholder="Brief description of the value provided"
                    rows={3}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
