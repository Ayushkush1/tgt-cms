"use client";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";

export interface ProductHeroData {
  label: string;
  headingLine: string;
  paragraphs: string[];
  ctaText: string;
  ctaHref: string;
  statSince: string;
  statProjects: string;
}

export function ProductHeroCMS({
  data,
  onChange,
}: {
  data: ProductHeroData;
  onChange: (data: ProductHeroData) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const handleParagraphChange = (index: number, value: string) => {
    const paras = [...data.paragraphs];
    paras[index] = value;
    onChange({ ...data, paragraphs: paras });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
      <SectionHeader
        title="Product Page Hero"
        description="Manage headings, descriptions, stats, and the primary call-to-action."
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="flex flex-col gap-8 pt-4 animate-in fade-in">
          {/* Main Content */}
          <div className="grid grid-cols-2 gap-4">
            <h3 className="col-span-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Main Header & Text
            </h3>
            <InputField
              label="Eyebrow Label"
              value={data.label}
              onChange={(e) => onChange({ ...data, label: e.target.value })}
              placeholder="e.g. Our Product"
              containerClassName="col-span-2"
            />

            <InputField
              label="Heading Line"
              value={data.headingLine || ""}
              onChange={(e) =>
                onChange({ ...data, headingLine: e.target.value })
              }
              placeholder="Primary heading line"
              containerClassName="col-span-2"
            />
            <TextAreaField
              label="Overview Paragraph 1"
              value={data.paragraphs[0] || ""}
              onChange={(e) => handleParagraphChange(0, e.target.value)}
              containerClassName="col-span-2"
              placeholder="Primary description text"
            />
            <TextAreaField
              label="Overview Paragraph 2"
              value={data.paragraphs[1] || ""}
              onChange={(e) => handleParagraphChange(1, e.target.value)}
              containerClassName="col-span-2"
              placeholder="Secondary description text"
            />
          </div>

          {/* Stats & CTA */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="col-span-full text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Actions & Stats
            </h3>
            <InputField
              label="CTA Text"
              value={data.ctaText}
              onChange={(e) => onChange({ ...data, ctaText: e.target.value })}
              placeholder="Explore Product"
              className=" bg-white"
            />
            <InputField
              label="CTA Link"
              value={data.ctaHref}
              onChange={(e) => onChange({ ...data, ctaHref: e.target.value })}
              placeholder="/products"
              className=" bg-white"
            />
            <InputField
              label="Since (Year)"
              value={data.statSince}
              onChange={(e) => onChange({ ...data, statSince: e.target.value })}
              placeholder="2015"
              className=" bg-white"
            />
            <InputField
              label="Projects Count"
              value={data.statProjects}
              onChange={(e) =>
                onChange({ ...data, statProjects: e.target.value })
              }
              placeholder="500+"
              className=" bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
