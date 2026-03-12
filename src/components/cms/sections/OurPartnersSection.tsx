"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadFiles } from "@/lib/uploadHelpers";

const defaultFormData = {
  upperTag: "",
  headlinePart1: "",
  headlineHighlight: "",
  logos: [] as string[],
};

interface OurPartnersSectionProps {
  sectionId?: string;
  initialData?: any;
  saveUrl?: string; // e.g. /api/home or /api/sections
  onSave?: (data: any) => void;
}

export function OurPartnersSection({
  sectionId,
  initialData,
  saveUrl = "/api/home",
  onSave,
}: OurPartnersSectionProps) {
  const [isOpen, setIsOpen] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [images, setImages] = useState<(File | string | null)[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
      if (initialData.logos) setImages(initialData.logos);
    } else if (saveUrl === "/api/home") {
      fetchWithCache("/api/home")
        .then((json) => {
          if (json.success && json.data?.OurPartners) {
            const data = json.data.OurPartners;
            setFormData((prev) => ({ ...prev, ...data }));
            if (data.logos) setImages(data.logos);
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
    if (!formData.upperTag.trim()) {
      toast.error("Upper Tag is required");
      return;
    }
    if (!formData.headlinePart1.trim()) {
      toast.error("Headline (Part 1) is required");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const uploadedUrls = await uploadFiles(images);
      const payload = {
        ...formData,
        logos: uploadedUrls.filter((url) => url !== null),
      };

      const body = sectionId
        ? { id: sectionId, content: payload }
        : { section: "OurPartners", content: payload };

      const method = sectionId
        ? "PUT"
        : saveUrl === "/api/home"
          ? "PUT"
          : "POST";

      const res = await fetch(saveUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Our Partners section saved!", { id: toastId });
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
          title="Our Partners Section"
          description="Manage the marquee of partner logos and header text."
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
              <h1 className="text-base font-bold text-gray-500 col-span-2">
                Header Section
              </h1>
              <InputField
                label="Upper Tag"
                name="upperTag"
                value={formData.upperTag}
                onChange={handleChange}
                placeholder="e.g. Partners"
                containerClassName="col-span-2"
                required
              />
              <InputField
                label="Headline (Part 1)"
                name="headlinePart1"
                value={formData.headlinePart1}
                onChange={handleChange}
                placeholder="e.g. Trusted by"
                required
              />
              <InputField
                label="Headline (Highlight)"
                name="headlineHighlight"
                value={formData.headlineHighlight}
                onChange={handleChange}
                placeholder="e.g. Industry Leaders"
              />

              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-4">
                Partner Logos
              </h1>
              <div className="col-span-2 border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
                <ImageUploadField
                  label="Upload Partner Logos"
                  images={images}
                  onImagesChange={setImages}
                  maxImages={150}
                  containerClassName="col-span-2"
                />
                <p className="text-xs text-gray-500 mt-4 mx-2">
                  Upload SVG or transparent PNG logos for the infinite scrolling
                  marquee.
                </p>
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
