"use client";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { Plus, Trash2 } from "lucide-react";

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
}

export function ServiceHeroCMS({
  data,
  onChange,
}: {
  data: HeroData;
  onChange: (data: HeroData) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const handlePillarChange = (
    index: number,
    field: keyof Pillar,
    value: string,
  ) => {
    const newPillars = [...data.pillars];
    newPillars[index] = { ...newPillars[index], [field]: value };
    onChange({ ...data, pillars: newPillars });
  };

  const addPillar = () => {
    if (data.pillars.length < 4) {
      onChange({
        ...data,
        pillars: [
          ...data.pillars,
          { number: `0${data.pillars.length + 1}`, title: "", desc: "" },
        ],
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
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
            <h3 className="col-span-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
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
              onChange={(e) =>
                onChange({ ...data, headingLine1: e.target.value })
              }
              placeholder="First line of main heading"
              required
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="col-span-full text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Actions & Stats
            </h3>
            <InputField
              label="CTA Text"
              value={data.ctaText}
              onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
              placeholder="Text for the main action button"
              className=" bg-white"
            />
            <InputField
              label="CTA Link"
              value={data.ctaHref}
              onChange={(e) => onChange({ ...data, ctaHref: e.target.value })}
              placeholder="URL for the action (e.g., /contact)"
              className=" bg-white"
            />
            <InputField
              label="Stat: Since (Year)"
              value={data.statSince}
              onChange={(e) => onChange({ ...data, statSince: e.target.value })}
              placeholder="Starting year (e.g., 2015)"
              className=" bg-white"
            />
            <InputField
              label="Stat: Projects Completed"
              value={data.statProjects}
              onChange={(e) =>
                onChange({ ...data, statProjects: e.target.value })
              }
              placeholder="Total project count"
              className=" bg-white"
            />
          </div>

          {/* Visuals Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Visuals
            </h3>
            <ImageUploadField
              label="Hero Image"
              images={data.imageUrl ? [data.imageUrl] : []}
              onImagesChange={(imgs) =>
                onChange({ ...data, imageUrl: imgs[0] || "" })
              }
              maxImages={1}
            />
          </div>

          {/* Pillars Section */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-gray-800">Service Pillars</h3>
                <p className="text-sm text-gray-500">
                  Key value propositions shown in the grid (Max 4).
                </p>
              </div>
              {data.pillars.length < 4 && (
                <button
                  onClick={addPillar}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-black text-white hover:text-[#D4AF37] rounded-lg font-bold text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add Pillar
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {data.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="group p-5 bg-white rounded-2xl relative border border-gray-200 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#D4AF37] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                    {pillar.number}
                  </div>
                  <button
                    onClick={() => removePillar(idx)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black hover:bg-gray-100 p-1.5 rounded-lg transition-all"
                    title="Remove Pillar"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                  <InputField
                    label="Pillar Title"
                    value={pillar.title}
                    onChange={(e) =>
                      handlePillarChange(idx, "title", e.target.value)
                    }
                    placeholder="Short summary of this pillar"
                    containerClassName="mb-4 mt-2"
                    required
                  />
                  <TextAreaField
                    label="Description"
                    value={pillar.desc}
                    onChange={(e) =>
                      handlePillarChange(idx, "desc", e.target.value)
                    }
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
