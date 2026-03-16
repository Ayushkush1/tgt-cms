"use client";
import { useState, useEffect, useRef } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { CloudUpload, X, Plus } from "lucide-react";
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
}

const defaultService = (): ServiceItem => ({
  shortTitle: "",
  fullTitle: "",
  description: "",
  image: "",
  link: "",
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
  const [isOpen, setIsOpen] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceImages, setServiceImages] = useState<(File | string | null)[]>(
    [],
  );
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
      if (initialData.services && Array.isArray(initialData.services)) {
        setServiceImages(
          (initialData.services as ServiceItem[]).map(
            (s: ServiceItem) => s.image || null,
          ),
        );
      }
    } else {
      fetchWithCache<Record<string, unknown>>(saveUrl)
        .then((json) => {
          if (json.success && json.data) {
            const data = (responseKey
              ? (json.data as Record<string, unknown>)[responseKey]
              : json.data) as Record<string, unknown>;
            if (data) {
              setFormData((prev) => ({ ...prev, ...data }));
              if (data.services && Array.isArray(data.services)) {
                setServiceImages(
                  (data.services as ServiceItem[]).map(
                    (s: ServiceItem) => s.image || null,
                  ),
                );
              }
            }
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

  const handleServiceChange = (
    index: number,
    field: keyof ServiceItem,
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.services];
      updated[index] = { ...updated[index], [field]: value };
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
    const errs: string[] = [];
    if (!formData.upperTag?.trim()) errs.push("Upper Tag is required");
    if (!formData.headlinePart1?.trim())
      errs.push("Headline (Part 1) is required");
    if (!formData.mainDescription?.trim())
      errs.push("Main Description is required");
    formData.services.forEach((s, i) => {
      if (!s.fullTitle.trim())
        errs.push(`Service ${i + 1} Full Title is required`);
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
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
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-6 pt-4 animate-in fade-in duration-500">
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

              <div className="col-span-2 flex items-center justify-between mt-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Services ({formData.services.length})
                </h3>
              </div>

              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.services.map((service, index) => (
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
                      placeholder="e.g. Web Dev"
                      value={service.shortTitle}
                      onChange={(e) =>
                        handleServiceChange(index, "shortTitle", e.target.value)
                      }
                    />
                    <InputField
                      label="Full Title"
                      placeholder="e.g. Web Development"
                      value={service.fullTitle}
                      onChange={(e) =>
                        handleServiceChange(index, "fullTitle", e.target.value)
                      }
                      required
                    />
                    <TextAreaField
                      label="Description"
                      rows={2}
                      placeholder="e.g. Scalable, high-performance websites..."
                      value={service.description}
                      onChange={(e) =>
                        handleServiceChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                    <InputField
                      label="Service Link"
                      placeholder="e.g. /services/web-development"
                      value={service.link || ""}
                      onChange={(e) =>
                        handleServiceChange(index, "link", e.target.value)
                      }
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Service Image
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
                          {/* eslint-disable-next-line @next/next/no-img-element */}
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
                          className={`aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors cursor-pointer group ${
                            isDragging === index
                              ? "border-[#0A0F29] border-solid bg-gray-100"
                              : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                          }`}
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

                {formData.services.length < 10 && (
                  <button
                    onClick={addService}
                    className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all gap-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="font-semibold">Add Service</span>
                  </button>
                )}
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <h3 className="col-span-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
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
