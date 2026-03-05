"use client";
import { useState, useEffect, useRef } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { CloudUpload, X, Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { uploadFiles } from "@/lib/uploadHelpers";

const SECTION_KEY = "WhatWeDo";

interface ServiceItem {
  shortTitle: string;
  fullTitle: string;
  description: string;
}

const defaultService = (): ServiceItem => ({
  shortTitle: "",
  fullTitle: "",
  description: "",
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

export default function WhatWeDo() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceImages, setServiceImages] = useState<(File | null)[]>([null]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchWithCache("/api/home")
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          const data = json.data[SECTION_KEY];
          setFormData((prev) => ({ ...prev, ...data }));
          if (data.services) {
            setServiceImages(Array(data.services.length).fill(null));
          }
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
    if (!formData.ctaHeadline?.trim()) errs.push("CTA Headline is required");
    if (!formData.ctaButtonLabel?.trim()) errs.push("Button Label is required");
    if (!formData.ctaButtonUrl?.trim()) errs.push("Button URL is required");
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
          image: uploadedUrls[idx],
        })),
      };
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
      const json = await res.json();
      json.success
        ? toast.success("What We Do section saved!", { id: toastId })
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
          title="What We Do Section"
          description="Manage the services and content displayed in the What We Do section."
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
                label="Headline Part 4 (Highlight/Underline)"
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
                placeholder="e.g. From initial concept to final deployment..."
                containerClassName="col-span-2"
                required
              />

              {/* ── Dynamic Services List ── */}
              <div className="col-span-2 flex items-center justify-between mt-4 mb-2">
                <h1 className="text-base font-bold text-gray-500">Services</h1>
                <span className="text-sm font-medium text-gray-400">
                  {formData.services.length} mapped
                </span>
              </div>

              {formData.services.map((service, index) => (
                <div
                  key={index}
                  className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">
                      Service {index + 1}
                    </h2>
                    {formData.services.length > 1 && (
                      <button
                        onClick={() => removeService(index)}
                        className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Short Title (Vertical Text)"
                      placeholder="e.g. Web Dev"
                      value={service.shortTitle}
                      onChange={(e) =>
                        handleServiceChange(index, "shortTitle", e.target.value)
                      }
                      containerClassName="col-span-1"
                    />
                    <InputField
                      label="Full Title"
                      placeholder="e.g. Web Development"
                      value={service.fullTitle}
                      onChange={(e) =>
                        handleServiceChange(index, "fullTitle", e.target.value)
                      }
                      containerClassName="col-span-1"
                      required
                    />
                    <TextAreaField
                      label="Description"
                      rows={2}
                      containerClassName="col-span-2"
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

                    {/* Per-card image upload */}
                    <div className="col-span-2 flex flex-col gap-1.5 mx-2">
                      <label className="text-sm font-medium text-gray-700">
                        Service Image
                      </label>
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[index] = el;
                        }}
                        onChange={(e) => handleFileChange(index, e)}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                      />
                      {serviceImages[index] ? (
                        <div className="w-full border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between p-3 px-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                typeof serviceImages[index] === "string"
                                  ? serviceImages[index]
                                  : URL.createObjectURL(
                                      serviceImages[index] as Blob,
                                    )
                              }
                              alt={`Card ${index + 1}`}
                              className="w-12 h-12 object-cover rounded-md shadow-sm border border-gray-200"
                            />
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-semibold text-sm truncate max-w-[200px]">
                                {typeof serviceImages[index] === "string"
                                  ? "Uploaded Image"
                                  : (serviceImages[index] as File).name}
                              </span>
                              <span className="text-gray-500 text-[12px]">
                                {(
                                  serviceImages[index]!.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeImage(index)}
                            className="p-1.5 bg-white text-gray-500 hover:text-red-500 rounded-full shadow-sm ring-1 ring-gray-100 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
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
                          className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors cursor-pointer group ${isDragging === index ? "border-[#0A0F29] border-solid bg-gray-100" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}
                        >
                          <div
                            className={`p-2.5 rounded-full shadow-sm ring-1 ring-gray-100 mb-2 transition-transform ${isDragging === index ? "bg-[#0A0F29] text-white scale-110" : "bg-white text-[#0A0F29] group-hover:scale-110"}`}
                          >
                            <CloudUpload className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <p className="text-gray-500 text-sm">
                            <span className="text-[#D3AF37] font-semibold hover:underline mr-1">
                              Click to upload
                            </span>
                            or drag and drop
                          </p>
                          <p className="text-gray-400 text-[12px] mt-1">
                            PNG, JPG or WebP
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addService}
                className="col-span-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Service
              </button>

              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-4">
                Bottom CTA Section
              </h1>
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
              <SaveButton onClick={handleSave} disabled={isSaving} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
