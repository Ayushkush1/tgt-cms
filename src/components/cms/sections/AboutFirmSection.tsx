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

const defaultFormData = {
  topLabel: "",
  heading: "",
  paragraph1: "",
  paragraph2: "",
  ctaLabel: "",
  ctaUrl: "",
  images: [] as string[],
};

interface AboutFirmSectionProps {
  sectionId?: string;
  initialData?: any;
  saveUrl?: string; // e.g. /api/about or /api/sections
  onSave?: (data: any) => void;
}

export function AboutFirmSection({
  sectionId,
  initialData,
  saveUrl = "/api/about",
  onSave,
}: AboutFirmSectionProps) {
  const [isOpen, setIsOpen] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [images, setImages] = useState<(File | string | null)[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
      if (initialData.images) setImages(initialData.images);
    } else if (saveUrl === "/api/about") {
      fetchWithCache("/api/about")
        .then((json) => {
          if (json.success && json.data?.AboutFirm) {
            const data = json.data.AboutFirm;
            setFormData((prev) => ({ ...prev, ...data }));
            if (data.images) setImages(data.images);
          }
        })
        .catch(console.error);
    }
  }, [initialData, saveUrl]);

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

      const body = sectionId
        ? { id: sectionId, content: payload }
        : { section: "AboutFirm", content: payload };

      const method = sectionId
        ? "PUT"
        : saveUrl === "/api/about"
          ? "PUT"
          : "POST";

      const res = await fetch(saveUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("About Firm section saved!", { id: toastId });
        if (onSave) onSave(payload);
      } else {
        toast.error(json.error || "Save failed. Please try again.", {
          id: toastId,
        });
      }
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
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
            <div className="grid grid-cols-2 gap-6 pt-4 animate-in fade-in duration-500">
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
                placeholder="e.g. Founded in 2020, we have been at the forefront of digital transformation..."
                containerClassName="col-span-2"
                rows={3}
              />

              <TextAreaField
                label="Paragraph 2"
                name="paragraph2"
                value={formData.paragraph2}
                onChange={handleChange}
                placeholder="e.g. Our mission is to empower businesses with cutting-edge technology..."
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

              <div className="col-span-2 border border-gray-100 rounded-3xl p-6 bg-gray-50/50">
                <ImageUploadField
                  label="Section Image"
                  images={images}
                  onImagesChange={setImages}
                  maxImages={1}
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
        </div>
      </div>
    </section>
  );
}
