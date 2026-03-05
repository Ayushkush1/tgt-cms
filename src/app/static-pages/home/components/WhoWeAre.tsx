"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

const SECTION_KEY = "WhoWeAre";

const defaultFormData = {
  headline: "",
  headlineHighlight: "",
  headlinePart3: "",
  headlinePart4: "",
  mainParagraph: "",
  upperTag: "",
  block1Headline: "",
  block1Description: "",
  block1Bullet1: "",
  block1Bullet2: "",
  block1Bullet3: "",
  block1Bullet4: "",
  block2Headline: "",
  block2Description: "",
  block2CtaLabel: "",
  block2CtaUrl: "",
};

export default function WhoWeAre() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchWithCache("/api/home")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          setFormData((prev) => ({ ...prev, ...json.data[SECTION_KEY] }));
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const required: Array<[string, string]> = [
      ["headline", "Headline"],
      ["mainParagraph", "Main Paragraph"],
      ["block1Headline", "Block 1 Headline"],
      ["block2Headline", "Block 2 Headline"],
    ];
    const errs = required
      .filter(([key]) => !formData[key as keyof typeof formData]?.trim())
      .map(([, label]) => `${label} is required`);

    if (errs.length > 0) {
      errs.forEach((msg) => toast.error(msg));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: formData }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Who We Are section saved!", { id: toastId });
      } else {
        toast.error("Save failed. Please try again.", { id: toastId });
      }
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Who We Are Section"
          description="Manage the content displayed on the Who We Are section."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <InputField
                label="Headline"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. We Are"
                required
              />
              <InputField
                label="Headline Highlight (Gold/Italic)"
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
                label="Headline Part 4 (Highlight/Underline)"
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
                placeholder="e.g. Professional web development and software solutions for your business."
                containerClassName="col-span-2 mx-2"
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

              <h1 className="text-base font-bold text-gray-500 col-span-2">
                Block 1: Digital Innovation
              </h1>
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
                placeholder="e.g. We craft cutting-edge digital experiences..."
                containerClassName="col-span-2"
              />
              <div className="col-span-2 mx-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Bullet Points (Up to 4)
                </label>
                {(
                  [
                    "block1Bullet1",
                    "block1Bullet2",
                    "block1Bullet3",
                    "block1Bullet4",
                  ] as const
                ).map((key, i) => (
                  <InputField
                    key={key}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    placeholder={`Bullet ${i + 1}`}
                  />
                ))}
              </div>

              <h1 className="text-base font-bold text-gray-500 col-span-2">
                Block 2: Simple &amp; Accessible
              </h1>
              <InputField
                label="Headline"
                name="block2Headline"
                value={formData.block2Headline}
                onChange={handleChange}
                placeholder="e.g. Simple & Accessible"
                containerClassName="col-span-2"
                required
              />
              <TextAreaField
                label="Description"
                name="block2Description"
                value={formData.block2Description}
                onChange={handleChange}
                placeholder="e.g. We make technology accessible to everyone..."
                containerClassName="col-span-2"
              />
              <InputField
                label="CTA Button Label"
                name="block2CtaLabel"
                value={formData.block2CtaLabel}
                onChange={handleChange}
                placeholder="e.g. Learn More"
              />
              <InputField
                label="CTA Button URL"
                name="block2CtaUrl"
                value={formData.block2CtaUrl}
                onChange={handleChange}
                placeholder="e.g. /about"
              />

              <SaveButton onClick={handleSave} disabled={isSaving} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
