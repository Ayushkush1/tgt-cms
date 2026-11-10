"use client";
import { useState, useEffect, useRef } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { CloudUpload, X, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
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
  link?: string;
  isExpanded?: boolean;
}

const defaultService = (): ServiceItem => ({
  shortTitle: "",
  fullTitle: "",
  description: "",
  image: "",
  link: "",
  isExpanded: false,
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

interface WhatWeDoSectionProps {
  sectionId?: string;
  initialData?: Record<string, unknown>;
  saveUrl?: string;
  /** Key in json.data where this section's data lives. Default: "WhatWeDo" */
  responseKey?: string;
  onSave?: (data: Record<string, unknown>) => void;
}

export function WhatWeDoSection({
  sectionId,
  initialData,
  saveUrl = "/api/home",
  responseKey = "WhatWeDo",
  onSave,
}: WhatWeDoSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceImages, setServiceImages] = useState<(File | string | null)[]>([]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
      if (initialData.services && Array.isArray(initialData.services)) {
        setServiceImages(
          (initialData.services as ServiceItem[]).map((s: ServiceItem) => s.image || null),
        );
      }
    } else {
      fetchWithCache<Record<string, unknown>>(saveUrl)
        .then((json) => {
          if (json.success && json.data) {
            const data = (
              responseKey ? (json.data as Record<string, unknown>)[responseKey] : json.data
            ) as Record<string, unknown>;
            if (data) {
              setFormData((prev) => ({ ...prev, ...data }));
              if (data.services && Array.isArray(data.services)) {
                setServiceImages(
                  (data.services as ServiceItem[]).map((s: ServiceItem) => s.image || null),
                );
              }
            }
          }
        })
        .catch(console.error);
    }
  }, [initialData, saveUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.services];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, services: updated };
    });
  };

  const toggleExpand = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.services];
      updated[index] = {
        ...updated[index],
        isExpanded: !updated[index].isExpanded,
      };
      return { ...prev, services: updated };
    });
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, defaultService()],
    }));
    setServiceImages((prev) => [...prev, null]);
  };

  const removeService = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== indexToRemove),
    }));
    setServiceImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
    const errs: string[] = [];
    if (!formData.upperTag?.trim()) errs.push("Upper Tag is required");
    if (!formData.headlinePart1?.trim()) errs.push("Headline (Part 1) is required");
    if (!formData.mainDescription?.trim()) errs.push("Main Description is required");
    formData.services.forEach((s, i) => {
      if (!s.fullTitle.trim()) errs.push(`Service ${i + 1} Full Title is required`);
    });
    if (errs.length > 0) {
      errs.forEach((m) => toast.error(m));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const uploadedUrls = await uploadFiles(serviceImages);
      const payload = {
        ...formData,
        services: formData.services.map((item, idx) => ({
          ...item,
          image: uploadedUrls[idx] || undefined,
        })),
      };

      const body = sectionId
        ? { id: sectionId, content: payload }
        : { section: responseKey ?? "WhatWeDo", content: payload };

      const res = await fetch(saveUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("What We Do section saved!", { id: toastId });
        setServiceImages(uploadedUrls);
        setFormData((prev) => ({
          ...prev,
          services: prev.services.map((item, idx) => ({
            ...item,
            image: uploadedUrls[idx] || undefined,
          })),
        }));
        if (onSave) onSave(payload as unknown as Record<string, unknown>);
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
      <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all">
        <SectionHeader
          title="What We Do Section"
          description="Manage the services and content displayed in the What We Do section."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className={isOpen ? "overflow-visible" : "overflow-hidden"}>
            <div className="animate-in fade-in grid grid-cols-2 gap-6 pt-4 duration-500">
              <InputField
                label="Upper Tag"
                name="upperTag"
                value={formData.upperTag || ""}
                onChange={handleChange}
                placeholder="e.g. What We Do"
                containerClassName="col-span-2"
                required
              />
              <InputField
                label="Headline (Part 1)"
                name="headlinePart1"
                value={formData.headlinePart1 || ""}
                onChange={handleChange}
                placeholder="e.g. End-to-End"
                required
              />
              <InputField
                label="Headline Highlight"
                name="headlineHighlight"
                value={formData.headlineHighlight || ""}
                onChange={handleChange}
                placeholder="e.g. Solutions"
              />
              <InputField
                label="Headline Part 3"
                name="headlinePart3"
                value={formData.headlinePart3 || ""}
                onChange={handleChange}
                placeholder="e.g. for Your"
              />
              <InputField
                label="Headline Part 4"
                name="headlinePart4"
                value={formData.headlinePart4 || ""}
                onChange={handleChange}
                placeholder="e.g. Digital Journey."
              />
              <TextAreaField
                label="Main Description"
                name="mainDescription"
                value={formData.mainDescription || ""}
                onChange={handleChange}
                placeholder="e.g. From initial concept to final deployment, we provide a full suite of digital engineering services tailor-made for your business."
                containerClassName="col-span-2"
                required
              />

              <div className="col-span-2 mt-4 flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                  Services ({formData.services.length})
                </h3>
              </div>

              <div className="col-span-2 space-y-6">
                {formData.services.map((service, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-50/50 transition-all duration-300"
                  >
                    {/* Header */}
                    <div
                      className="flex cursor-pointer items-center justify-between bg-white p-5 px-6 hover:bg-gray-50"
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="cursor-grab rounded-xl border border-transparent bg-gray-50 p-2.5 text-gray-400 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm active:cursor-grabbing">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[15px] font-semibold text-gray-900">
                            {service.fullTitle || "Untitled Service"}
                          </span>
                          {service.shortTitle && (
                            <span className="text-xs font-medium text-gray-500">
                              {service.shortTitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(formData.services || []).length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeService(index);
                            }}
                            className="mr-2 flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {service.isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Body Content */}
                    {service.isExpanded && (
                      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 bg-white p-6 pt-2">
                        <InputField
                          label="Short Title"
                          placeholder="e.g. Web Dev"
                          value={service.shortTitle}
                          onChange={(e) => handleServiceChange(index, "shortTitle", e.target.value)}
                        />
                        <InputField
                          label="Full Title"
                          placeholder="e.g. Web Development"
                          value={service.fullTitle}
                          onChange={(e) => handleServiceChange(index, "fullTitle", e.target.value)}
                          required
                        />
                        <TextAreaField
                          label="Description"
                          rows={2}
                          containerClassName="col-span-2"
                          placeholder="e.g. Scalable, high-performance websites..."
                          value={service.description}
                          onChange={(e) =>
                            handleServiceChange(index, "description", e.target.value)
                          }
                        />
                        <InputField
                          label="Service Link"
                          placeholder="e.g. /services/web-development"
                          value={service.link || ""}
                          onChange={(e) => handleServiceChange(index, "link", e.target.value)}
                          containerClassName="col-span-2"
                        />

                        <div className="col-span-2 mt-2 flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">Service Image</label>
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
                            <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 px-4">
                              <div className="flex items-center gap-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={
                                    typeof serviceImages[index] === "string"
                                      ? (serviceImages[index] as string)
                                      : URL.createObjectURL(serviceImages[index] as Blob)
                                  }
                                  alt={`Service Image ${index + 1}`}
                                  className="h-12 w-12 rounded-full border border-gray-200 object-cover shadow-sm"
                                />
                                <span className="max-w-[200px] truncate text-sm font-semibold text-gray-900">
                                  Image Uploaded
                                </span>
                              </div>
                              <button
                                onClick={() => removeImage(index)}
                                className="rounded-full bg-white p-1.5 text-gray-500 shadow-sm ring-1 ring-gray-100 transition-colors hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(index);
                              }}
                              onDragLeave={() => setIsDragging(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(null);
                                const file = e.dataTransfer.files[0];
                                if (file?.type.startsWith("image/")) {
                                  setServiceImages((prev) => {
                                    const updated = [...prev];
                                    updated[index] = file;
                                    return updated;
                                  });
                                }
                              }}
                              onClick={() => fileInputRefs.current[index]?.click()}
                              className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
                                isDragging === index
                                  ? "border-solid border-[#0A0F29] bg-gray-100"
                                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              <CloudUpload className="mb-2 h-6 w-6 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                <span className="mr-1 font-semibold text-[#D3AF37] hover:underline">
                                  Click to upload
                                </span>
                                or drag and drop
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="col-span-2 flex pt-2">
                {formData.services.length < 10 && (
                  <button
                    onClick={addService}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-3 font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                  >
                    <Plus className="h-5 w-5" /> Add Service
                  </button>
                )}
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-6 rounded-3xl border border-gray-100 bg-gray-50 p-6">
                <h3 className="col-span-2 text-sm font-bold tracking-widest text-gray-400 uppercase">
                  Bottom CTA Section
                </h3>
                <TextAreaField
                  label="CTA Headline"
                  name="ctaHeadline"
                  value={formData.ctaHeadline || ""}
                  onChange={handleChange}
                  placeholder="e.g. We deliver the fastest engineering solutions. 👉"
                  containerClassName="col-span-2"
                  rows={2}
                  required
                />
                <InputField
                  label="Button Label"
                  name="ctaButtonLabel"
                  value={formData.ctaButtonLabel || ""}
                  onChange={handleChange}
                  placeholder="e.g. View All Services"
                  required
                />
                <InputField
                  label="Button URL"
                  name="ctaButtonUrl"
                  value={formData.ctaButtonUrl || ""}
                  onChange={handleChange}
                  placeholder="e.g. /services"
                  required
                />
              </div>

              <SaveButton onClick={handleSave} disabled={isSaving} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
