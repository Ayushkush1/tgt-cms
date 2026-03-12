"use client";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { CloudUpload, X, Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { uploadFiles } from "@/lib/uploadHelpers";

interface ServiceItem {
  shortTitle: string;
  fullTitle: string;
  description: string;
  image?: string;
}

const defaultService = (): ServiceItem => ({
  shortTitle: "",
  fullTitle: "",
  description: "",
  image: "",
});

const defaultFormData = {
  upperTag: "",
  headlinePart1: "",
  headlineHighlight: "",
  headlinePart3: "",
  headlinePart4: "",
  mainDescription: "",
  ctaHeadline: "",
  ctaButtonLabel: "",
  ctaButtonUrl: "",
  services: [defaultService()] as ServiceItem[],
};

interface WhatWeDoCMSProps {
  sectionId?: string;
  initialData?: any;
  saveUrl?: string;
  onSave?: (data: any) => void;
}

export function WhatWeDoCMS({
  sectionId,
  initialData,
  saveUrl = "/api/sections",
  onSave,
}: WhatWeDoCMSProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceImages, setServiceImages] = useState<(File | string | null)[]>(
    initialData?.services?.map((s: any) => s.image || null) || [null],
  );
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...(initialData || {}),
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev: any) => ({
        ...defaultFormData,
        ...prev,
        ...initialData,
      }));
      const images = initialData.services?.map((s: any) => s.image || null) || [
        null,
      ];
      setServiceImages(images);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (
    index: number,
    field: keyof ServiceItem,
    value: string,
  ) => {
    setFormData((prev: any) => {
      const updated = [...prev.services];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, services: updated };
    });
  };

  const addService = () => {
    setFormData((prev: any) => ({
      ...prev,
      services: [...prev.services, defaultService()],
    }));
    setServiceImages((prev) => [...prev, null]);
  };

  const removeService = (indexToRemove: number) => {
    setFormData((prev: any) => ({
      ...prev,
      services: prev.services.filter(
        (_: any, i: number) => i !== indexToRemove,
      ),
    }));
    setServiceImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setServiceImages((prev) => {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      });
    }
  };

  const removeImage = (index: number) => {
    setServiceImages((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const uploadedUrls = await uploadFiles(serviceImages);
      const payload = {
        ...formData,
        services: formData.services.map((item: any, idx: number) => ({
          ...item,
          image: uploadedUrls[idx],
        })),
      };

      const body = sectionId
        ? { id: sectionId, content: payload }
        : { section: "WhatWeDo", content: payload };

      const res = await fetch(saveUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Section saved!", { id: toastId });
        // Update local state with final URLs to avoid re-uploading on next save
        setServiceImages(uploadedUrls);
        setFormData((prev: any) => ({
          ...prev,
          services: prev.services.map((item: any, idx: number) => ({
            ...item,
            image: uploadedUrls[idx],
          })),
        }));
        if (onSave) onSave(payload);
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
        title="What We Do Section"
        description="Manage the services and content."
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="flex flex-col gap-8 pt-4 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 gap-6">
            <InputField
              label="Upper Tag"
              name="upperTag"
              value={formData.upperTag || ""}
              onChange={handleChange}
              placeholder="e.g. What We Do"
              containerClassName="col-span-2"
            />
            <InputField
              label="Headline Part 1"
              name="headlinePart1"
              value={formData.headlinePart1 || ""}
              onChange={handleChange}
              required
            />
            <InputField
              label="Headline Highlight"
              name="headlineHighlight"
              value={formData.headlineHighlight || ""}
              onChange={handleChange}
            />
            <InputField
              label="Headline Part 3"
              name="headlinePart3"
              value={formData.headlinePart3 || ""}
              onChange={handleChange}
            />
            <InputField
              label="Headline Part 4"
              name="headlinePart4"
              value={formData.headlinePart4 || ""}
              onChange={handleChange}
            />
            <TextAreaField
              label="Description"
              name="mainDescription"
              value={formData.mainDescription || ""}
              onChange={handleChange}
              containerClassName="col-span-2"
              required
            />

            <div className="col-span-2 flex items-center justify-between mt-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Services ({(formData.services || []).length})
              </h3>
            </div>

            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {(formData.services || []).map((service: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-3xl p-6 flex flex-col gap-4 bg-white shadow-sm relative group"
                >
                  <button
                    onClick={() => removeService(index)}
                    className="absolute -top-3 -right-3 p-2 bg-red-50 text-red-500 rounded-full shadow-sm hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <InputField
                    label="Short Title"
                    value={service.shortTitle}
                    onChange={(e) =>
                      handleServiceChange(index, "shortTitle", e.target.value)
                    }
                  />
                  <InputField
                    label="Full Title"
                    value={service.fullTitle}
                    onChange={(e) =>
                      handleServiceChange(index, "fullTitle", e.target.value)
                    }
                    required
                  />
                  <TextAreaField
                    label="Description"
                    value={service.description}
                    onChange={(e) =>
                      handleServiceChange(index, "description", e.target.value)
                    }
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Image
                    </label>
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      onChange={(e) => handleFileChange(index, e)}
                      accept="image/*"
                      className="hidden"
                    />
                    {serviceImages[index] ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group/img">
                        <img
                          src={
                            typeof serviceImages[index] === "string"
                              ? (serviceImages[index] as string)
                              : URL.createObjectURL(
                                  serviceImages[index] as Blob,
                                )
                          }
                          className="w-full h-full object-cover"
                          alt="Service"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className="aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <CloudUpload className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 font-medium">
                          Upload Image
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {(formData.services || []).length < 10 && (
                <button
                  onClick={addService}
                  className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span className="font-semibold">Add Service</span>
                </button>
              )}
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100 mt-4">
              <h3 className="col-span-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                Bottom CTA
              </h3>
              <TextAreaField
                label="Headline"
                name="ctaHeadline"
                value={formData.ctaHeadline || ""}
                onChange={handleChange}
                containerClassName="col-span-2"
                required
              />
              <InputField
                label="Button Label"
                name="ctaButtonLabel"
                value={formData.ctaButtonLabel || ""}
                onChange={handleChange}
                required
              />
              <InputField
                label="Button URL"
                name="ctaButtonUrl"
                value={formData.ctaButtonUrl || ""}
                onChange={handleChange}
                required
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
