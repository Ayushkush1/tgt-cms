"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SaveButton } from "@/components/SaveButton";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { ServiceHeroCMS } from "./components/ServiceHeroCMS";
import { WhatWeDoCMS } from "./components/WhatWeDoCMS";

const SERVICE_OPTIONS = [
  { id: "accessibility-services", label: "Accessibility Services" },
  { id: "ui-ux-designing", label: "UI/UX Designing" },
  { id: "website-design-development", label: "Website Design & Development" },
  { id: "mobile-app-development", label: "Mobile App Development" },
  { id: "custom-software-development", label: "Custom Software Development" },
  { id: "business-software-solutions", label: "Business Software Solutions" },
  {
    id: "business-intelligence-solutions",
    label: "Business Intelligence Solutions",
  },
  { id: "iot-solutions", label: "IOT Solutions" },
  { id: "ai-ml-solutions", label: "AI & ML Solution" },
  { id: "branding", label: "Branding" },
  { id: "digital-marketing", label: "Digital Marketing" },
];

interface ServiceItem {
  number: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  outcome: string;
}

interface HeroData {
  label: string;
  headingLine1: string;
  headingLine2: string;
  paragraphs: string[];
  ctaText: string;
  ctaHref: string;
  imageUrl: string;
  statSince: string;
  statProjects: string;
  pillars: any[];
}

interface PageData {
  hero: HeroData;
  services: ServiceItem[];
}

const defaultData: PageData = {
  hero: {
    label: "",
    headingLine1: "",
    headingLine2: "",
    paragraphs: ["", ""],
    ctaText: "",
    ctaHref: "",
    imageUrl: "",
    statSince: "",
    statProjects: "",
    pillars: [
      { number: "01", title: "", desc: "" },
      { number: "02", title: "", desc: "" },
      { number: "03", title: "", desc: "" },
      { number: "04", title: "", desc: "" },
    ],
  },
  services: [
    {
      number: "01",
      title: "",
      category: "",
      description: "",
      tags: [] as string[],
      outcome: "",
    },
  ],
};

export default function ServicesCMS() {
  const [selectedServiceId, setSelectedServiceId] = useState(
    SERVICE_OPTIONS[0].id,
  );
  const [formData, setFormData] = useState(defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when selected service changes
  useEffect(() => {
    setIsLoading(true);
    fetchWithCache(`/api/services?id=${selectedServiceId}`)
      .then((json) => {
        if (json.success && json.data) {
          setFormData(json.data);
        } else {
          setFormData(defaultData); // Fallback to default
        }
      })
      .catch((err) => {
        console.error(err);
        setFormData(defaultData);
      })
      .finally(() => setIsLoading(false));
  }, [selectedServiceId]);

  const handleSave = async () => {
    // Validation
    const errs: string[] = [];
    if (!formData.hero.headingLine1.trim())
      errs.push("Hero Heading Line 1 is required");
    if (!formData.hero.paragraphs[0]?.trim())
      errs.push("Hero Paragraph 1 is required");

    formData.hero.pillars.forEach((p, i) => {
      if (!p.title.trim()) errs.push(`Pillar ${i + 1} Title is required`);
      if (!p.desc.trim()) errs.push(`Pillar ${i + 1} Description is required`);
    });

    formData.services.forEach((s, i) => {
      if (!s.title.trim()) errs.push(`Service Card ${i + 1} Title is required`);
      if (!s.category.trim())
        errs.push(`Service Card ${i + 1} Category is required`);
      if (!s.description.trim())
        errs.push(`Service Card ${i + 1} Description is required`);
    });

    if (errs.length > 0) {
      errs.forEach((e) => toast.error(e));
      return;
    }

    setIsSaving(true);
    const tid = toast.loading(`Saving ${selectedServiceId}...`);
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedServiceId,
          content: formData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Saved successfully!", { id: tid });
      } else {
        toast.error("Failed to save.", { id: tid });
      }
    } catch (err) {
      toast.error("Network error.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
      <PageHeader
        title="Services Pages Management"
        description="Select a service from the dropdown to manage its specific content (Hero and What We Do sections)."
      />

      {/* Service Selector */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <label className="font-bold text-gray-700">Select Service:</label>
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2  focus:ring-[#0A0F29] outline-none transition-all font-medium text-gray-700"
        >
          {SERVICE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="py-10 text-center text-gray-400 font-medium">
          Loading content...
        </div>
      ) : (
        <>
          <ServiceHeroCMS
            data={formData.hero}
            onChange={(hero) => setFormData({ ...formData, hero })}
          />

          <WhatWeDoCMS
            services={formData.services}
            onChange={(services) => setFormData({ ...formData, services })}
          />

          <div className="sticky bottom-6 flex justify-end">
            <div className="w-full max-w-xs shadow-2xl rounded-xl overflow-hidden">
              <SaveButton onClick={handleSave} disabled={isSaving} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
