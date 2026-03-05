"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadFiles } from "@/lib/uploadHelpers";

const SECTION_KEY = "OurPartners";

const defaultFormData = {
  upperTag: "",
  headlinePart1: "",
  headlineHighlight: "",
  logos: [] as string[],
};

export default function OurPartners() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [images, setImages] = useState<(File | string | null)[]>([]);

  useEffect(() => {
    fetchWithCache("/api/home")
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          const data = json.data[SECTION_KEY];
          setFormData((prev) => ({ ...prev, ...data }));
          if (data.logos) setImages(data.logos);
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

      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
      const json = await res.json();
      json.success
        ? toast.success("Our Partners section saved!", { id: toastId })
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
          title="Our Partners Section"
          description="Manage the marquee of partner logos and header text."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
        <div
          className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4 pt-2">
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
                label="Headline (Highlight - Italic)"
                name="headlineHighlight"
                value={formData.headlineHighlight}
                onChange={handleChange}
                placeholder="e.g. Industry Leaders"
              />

              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-4">
                Partner Logos
              </h1>
              <div className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50">
                <ImageUploadField
                  label="Upload Partner Logos"
                  images={images}
                  onImagesChange={setImages}
                  maxImages={10}
                  containerClassName="col-span-2"
                />
                <p className="text-xs text-gray-500 mx-2">
                  Upload SVG or transparent PNG logos for the infinite scrolling
                  marquee. You can select multiple files at once.
                </p>
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
