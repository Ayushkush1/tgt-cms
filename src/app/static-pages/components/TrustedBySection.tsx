"use client";

import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadFiles } from "@/lib/uploadHelpers";

const SECTION_KEY = "TrustedBySection";

const defaultFormData = {
  mainLabel: "",
  subLabel: "",
};

export default function TrustedBySection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [images, setImages] = useState<(File | string | null)[]>([]);

  useEffect(() => {
    fetchWithCache("/api/home")
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          const data = json.data[SECTION_KEY];
          setFormData({
            mainLabel: data.mainLabel || "",
            subLabel: data.subLabel || "",
          });
          if (data.images) setImages(data.images);
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.mainLabel.trim()) {
      toast.error("Main Label is required");
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

      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Trusted By section saved!", { id: toastId });
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
          title="Trusted By Section"
          description="Manage the content displayed on the trusted by section."
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
                label="Main Label"
                name="mainLabel"
                value={formData.mainLabel}
                onChange={handleChange}
                placeholder="e.g. Trusted by"
                required
              />
              <InputField
                label="Sub Label"
                name="subLabel"
                value={formData.subLabel}
                onChange={handleChange}
                placeholder="e.g. over 500+ companies"
              />

              <h1 className="text-base font-bold text-gray-500 col-span-2 pt-2">
                Slider Images
              </h1>
              <div className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50">
                <ImageUploadField
                  label="Upload Slider Images"
                  images={images}
                  onImagesChange={setImages}
                  maxImages={50}
                  containerClassName="col-span-2"
                />
                <p className="text-xs text-gray-500 mx-2">
                  Upload SVG or transparent PNG logos for the slider. You can
                  select multiple files at once. Max 4 images.
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
