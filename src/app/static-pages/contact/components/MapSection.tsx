"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";

const SECTION_KEY = "MapSection";

const defaultFormData = {
  upperTag: "",
  headlinePart1: "",
  headlineHighlight: "",
  headlinePart3: "",
  headlinePart4: "",
  mainParagraph: "",
  mapEmbedUrl: "",
};

export default function MapSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
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
    const errs: string[] = [];
    if (!formData.upperTag.trim()) errs.push("Upper Tag is required");
    if (!formData.headlinePart1.trim())
      errs.push("Headline Part 1 is required");
    if (!formData.mainParagraph.trim()) errs.push("Main Paragraph is required");
    if (!formData.mapEmbedUrl.trim()) errs.push("Map Embed URL is required");

    if (errs.length > 0) {
      errs.forEach((m) => toast.error(m));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: formData }),
      });
      const json = await res.json();
      json.success
        ? toast.success("Map Section saved!", { id: toastId })
        : toast.error("Save failed. Please try again.", { id: toastId });
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
          title="Map Section"
          description="Manage the map embed and heading text for the location section."
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
              <h1 className="text-base font-bold text-gray-500 col-span-2">
                Header text
              </h1>
              <InputField
                label="Upper Tag"
                name="upperTag"
                value={formData.upperTag}
                onChange={handleChange}
                placeholder="e.g. Our Location"
                containerClassName="col-span-2"
                required
              />
              <InputField
                label="Headline Part 1"
                name="headlinePart1"
                value={formData.headlinePart1}
                onChange={handleChange}
                placeholder="e.g. Visit"
                required
              />
              <InputField
                label="Headline (Highlight - Italic/Gold)"
                name="headlineHighlight"
                value={formData.headlineHighlight}
                onChange={handleChange}
                placeholder="e.g. Our Office"
              />
              <InputField
                label="Headline Part 3"
                name="headlinePart3"
                value={formData.headlinePart3}
                onChange={handleChange}
                placeholder="e.g. And Let's Build"
              />
              <InputField
                label="Headline Part 4 (Highlight/Underline)"
                name="headlinePart4"
                value={formData.headlinePart4}
                onChange={handleChange}
                placeholder="e.g. Something Great"
              />

              <TextAreaField
                label="Main Paragraph"
                name="mainParagraph"
                value={formData.mainParagraph}
                onChange={handleChange}
                placeholder="e.g. Find us at our office location..."
                containerClassName="col-span-2"
                required
                rows={3}
              />

              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-4">
                Map Embed
              </h1>
              <div className="col-span-2 text-sm text-gray-500 mb-2">
                Go to Google Maps, search for your location, click "Share",
                choose "Embed a map", and extract just the {"`src`"} URL from
                the iframe code.
              </div>
              <TextAreaField
                label="Google Maps Embed URL (src only)"
                name="mapEmbedUrl"
                value={formData.mapEmbedUrl}
                onChange={handleChange}
                placeholder="e.g. https://www.google.com/maps/embed?pb=!1m18..."
                containerClassName="col-span-2"
                required
                rows={3}
              />

              <div className="col-span-2 mt-4">
                <SaveButton onClick={handleSave} disabled={isSaving} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
