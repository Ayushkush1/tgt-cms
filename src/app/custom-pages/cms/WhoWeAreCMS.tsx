"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

const defaultFormData = {
  headline: "",
  headlineHighlight: "",
  headlinePart3: "",
  headlinePart4: "",
  mainParagraph: "",
  upperTag: "",
  block1Headline: "",
  block1Description: "",
  block1Bullets: ["", "", "", ""],
  block2Headline: "",
  block2Description: "",
  block2CtaLabel: "",
  block2CtaUrl: "",
};

interface WhoWeAreCMSProps {
  sectionId?: string;
  initialData?: any;
  saveUrl?: string; // Optional override for static pages
  onSave?: (data: any) => void;
}

export function WhoWeAreCMS({
  sectionId,
  initialData,
  saveUrl = "/api/sections",
  onSave,
}: WhoWeAreCMSProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...(initialData || {}),
  });

  // Sync state if initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData((prev: any) => {
        const data = { ...defaultFormData, ...prev, ...initialData };
        // Fallback for legacy data structure
        if (!data.block1Bullets) {
          data.block1Bullets = [
            data.block1Bullet1 || "",
            data.block1Bullet2 || "",
            data.block1Bullet3 || "",
            data.block1Bullet4 || "",
          ];
        }
        return data;
      });
    }
  }, [initialData]);

  const handleBulletChange = (index: number, value: string) => {
    setFormData((prev: any) => {
      const newBullets = [...prev.block1Bullets];
      newBullets[index] = value;
      return { ...prev, block1Bullets: newBullets };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const required: Array<[string, string]> = [
      ["headline", "Headline"],
      ["mainParagraph", "Main Paragraph"],
      ["block1Headline", "Block 1 Headline"],
      ["block2Headline", "Block 2 Headline"],
    ];
    const errs = required
      .filter(([key]) => {
        const value = formData[key as keyof typeof formData];
        return typeof value === "string" && !value.trim();
      })
      .map(([, label]) => `${label} is required`);

    if (errs.length > 0) {
      errs.forEach((msg) => toast.error(msg));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const body = sectionId
        ? { id: sectionId, content: formData }
        : { section: "WhoWeAre", content: formData };

      const res = await fetch(saveUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Section saved!", { id: toastId });
        if (onSave) onSave(formData);
      } else {
        toast.error(json.error || "Save failed", { id: toastId });
      }
    } catch {
      toast.error("Network error", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="Who We Are Section"
        description="Manage the content displayed on the Who We Are section."
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div className="flex flex-col gap-8 pt-4 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 gap-6">
            <InputField
              label="Headline"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder="e.g. We Are"
              required
            />
            <InputField
              label="Headline Highlight"
              name="headlineHighlight"
              value={formData.headlineHighlight}
              onChange={handleChange}
              placeholder="e.g. The Gold Technologies"
            />
            <InputField
              label="Headline Part 3"
              name="headlinePart3"
              value={formData.headlinePart3}
              onChange={handleChange}
              placeholder="e.g. That Drive"
            />
            <InputField
              label="Headline Part 4"
              name="headlinePart4"
              value={formData.headlinePart4}
              onChange={handleChange}
              placeholder="e.g. Real Growth"
            />
            <TextAreaField
              label="Main Paragraph"
              name="mainParagraph"
              value={formData.mainParagraph}
              onChange={handleChange}
              placeholder="Describe what your company does"
              containerClassName="col-span-2"
              required
            />
            <InputField
              label="Upper Tag"
              name="upperTag"
              value={formData.upperTag}
              onChange={handleChange}
              placeholder="e.g. About Us"
              containerClassName="col-span-2"
            />

            <div className="col-span-2 grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <h3 className="col-span-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                Block 1: Digital Innovation
              </h3>
              <InputField
                label="Headline"
                name="block1Headline"
                value={formData.block1Headline}
                onChange={handleChange}
                placeholder="e.g. Digital Innovation"
                containerClassName="col-span-2"
                required
              />
              <TextAreaField
                label="Description"
                name="block1Description"
                value={formData.block1Description}
                onChange={handleChange}
                containerClassName="col-span-2"
              />
              <div className="col-span-2 grid grid-cols-2 gap-4">
                {(formData.block1Bullets || []).map(
                  (bullet: string, i: number) => (
                    <InputField
                      key={i}
                      label={`Bullet ${i + 1}`}
                      name={`bullet-${i}`}
                      value={bullet}
                      onChange={(e) => handleBulletChange(i, e.target.value)}
                    />
                  ),
                )}
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <h3 className="col-span-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                Block 2: Simple & Accessible
              </h3>
              <InputField
                label="Headline"
                name="block2Headline"
                value={formData.block2Headline}
                onChange={handleChange}
                containerClassName="col-span-2"
                required
              />
              <InputField
                label="Headline2"
                name="block2Headline2"
                value={formData.block2Headline}
                onChange={handleChange}
                containerClassName="col-span-2"
                required
              />
              <TextAreaField
                label="Description"
                name="block2Description"
                value={formData.block2Description}
                onChange={handleChange}
                containerClassName="col-span-2"
              />
              <InputField
                label="CTA Label"
                name="block2CtaLabel"
                value={formData.block2CtaLabel}
                onChange={handleChange}
              />
              <InputField
                label="CTA URL"
                name="block2CtaUrl"
                value={formData.block2CtaUrl}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-2 flex justify-end pt-4">
              <SaveButton
                onClick={handleSave}
                disabled={isSaving}
                className="w-40"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
