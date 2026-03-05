"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadFiles } from "@/lib/uploadHelpers";

const SECTION_KEY = "AboutFirm";

const defaultFormData = {
  topLabel: "",
  heading: "",
  paragraph1: "",
  paragraph2: "",
  ctaLabel: "",
  ctaUrl: "",
  images: [] as string[],
};

export default function AboutFirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [images, setImages] = useState<(File | string | null)[]>([]);

  useEffect(() => {
    fetchWithCache("/api/about")
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          const data = json.data[SECTION_KEY];
          setFormData((prev) => ({ ...prev, ...data }));
          if (data.images) setImages(data.images);
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
    if (!formData.heading.trim()) {
      toast.error("Heading is required");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const uploadedUrls = await uploadFiles(images);
      const payload = {
        ...formData,
        images: uploadedUrls.filter((url) => url !== null),
      };

      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
      const json = await res.json();
      json.success
        ? toast.success("About Firm section saved!", { id: toastId })
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
          title="About Firm Section"
          description="Manage the content displayed on the About Firm section."
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
                label="Top Label"
                name="topLabel"
                value={formData.topLabel}
                onChange={handleChange}
                placeholder="e.g. Who We Are"
              />
              <InputField
                label="Heading"
                name="heading"
                value={formData.heading}
                onChange={handleChange}
                placeholder="e.g. The Gold Technologies"
                required
              />

              <TextAreaField
                label="Paragraph 1"
                name="paragraph1"
                value={formData.paragraph1}
                onChange={handleChange}
                containerClassName="col-span-2"
                rows={3}
              />

              <TextAreaField
                label="Paragraph 2"
                name="paragraph2"
                value={formData.paragraph2}
                onChange={handleChange}
                containerClassName="col-span-2"
                rows={3}
              />

              <InputField
                label="CTA Button Label"
                name="ctaLabel"
                value={formData.ctaLabel}
                onChange={handleChange}
                placeholder="e.g. Get in touch"
              />
              <InputField
                label="CTA Button URL"
                name="ctaUrl"
                value={formData.ctaUrl}
                onChange={handleChange}
                placeholder="e.g. /contactUs"
              />

              <div className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50">
                <ImageUploadField
                  label="Section Image"
                  images={images}
                  onImagesChange={setImages}
                  maxImages={1}
                />
              </div>

              <div className="col-span-2 mt-2">
                <SaveButton onClick={handleSave} disabled={isSaving} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
