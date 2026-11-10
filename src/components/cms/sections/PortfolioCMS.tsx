"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { fetchWithCache } from "@/app/lib/apiCache";
import { InputField } from "@/app/components/InputField";
import { SaveButton } from "@/app/components/SaveButton";
import { SectionHeader } from "@/app/components/SectionHeader";
import { TextAreaField } from "@/app/components/TextAreaField";
import { ImageUploadField } from "@/app/components/ImageUploadField";
import { uploadFiles } from "@/lib/uploadHelpers";

interface PortfolioStat {
  label: string;
  value: string;
}

interface PortfolioService {
  number: string;
  title: string;
  category: string;
  description: string;
  tags: string; // Comma separated for editing
  outcome: string;
}

export interface PortfolioItem {
  id: string | number;
  title: string;
  subtitle: string;
  image: (File | string | null)[];
  CTA: string;
  link: string;
  date: string;
  description: string;
  stats: PortfolioStat[];
  SERVICES: PortfolioService[];
  isExpanded?: boolean;
}

const defaultStat = (): PortfolioStat => ({ label: "", value: "" });

const defaultService = (count: number): PortfolioService => ({
  number: (count + 1).toString().padStart(2, "0"),
  title: "",
  category: "",
  description: "",
  tags: "",
  outcome: "",
});

const defaultPortfolio = (): PortfolioItem => ({
  id: Date.now(),
  title: "",
  subtitle: "",
  image: [],
  CTA: "",
  link: "",
  date: "",
  description: "",
  stats: [defaultStat()],
  SERVICES: [],
  isExpanded: true,
});

interface PortfolioCMSProps {
  sectionId?: string;
  initialData?: PortfolioItem[];
  saveUrl?: string;
  responseKey?: string;
  sectionName?: string;
  onSave?: (data: PortfolioItem[]) => void;
}

export function PortfolioCMS({
  sectionId,
  initialData,
  saveUrl = "/api/about",
  responseKey = "Portfolio",
  sectionName = "Portfolio",
  onSave,
}: PortfolioCMSProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [items, setItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    if (initialData && Array.isArray(initialData)) {
      const mapped = initialData.map((item: any) => ({
        ...item,
        image: item.image ? [item.image] : [],
        isExpanded: false,
        stats: item.stats || [],
        SERVICES: (item.SERVICES || []).map((s: any) => ({
          ...s,
          tags: Array.isArray(s.tags) ? s.tags.join(", ") : s.tags || "",
        })),
      }));
      setItems(mapped.length > 0 ? mapped : [defaultPortfolio()]);
    } else {
      fetchWithCache(saveUrl)
        .then((json: any) => {
          if (json.success) {
            // Use responseKey to locate the array, or use json.data directly if responseKey is undefined/empty
            const data = responseKey ? json.data?.[responseKey] : json.data;
            if (Array.isArray(data)) {
              const mapped = data.map((item: any) => ({
                ...item,
                image: item.image ? [item.image] : [],
                isExpanded: false,
                stats: item.stats || [],
                SERVICES: (item.SERVICES || []).map((s: any) => ({
                  ...s,
                  tags: Array.isArray(s.tags) ? s.tags.join(", ") : s.tags || "",
                })),
              }));
              setItems(mapped.length > 0 ? mapped : [defaultPortfolio()]);
              return;
            }
          }
          setItems([defaultPortfolio()]);
        })
        .catch((err) => {
          console.error(err);
          setItems([defaultPortfolio()]);
        });
    }
  }, [initialData, saveUrl]);

  const handleItemChange = (idx: number, field: keyof PortfolioItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const toggleExpand = (idx: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], isExpanded: !updated[idx].isExpanded };
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, defaultPortfolio()]);
  };

  const removeItem = (idx: number) => {
    if (confirm("Are you sure you want to remove this project?")) {
      setItems((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const updateStat = (
    itemIdx: number,
    statIdx: number,
    field: keyof PortfolioStat,
    value: string,
  ) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[itemIdx].stats[statIdx][field] = value;
      return newItems;
    });
  };

  const addStat = (itemIdx: number) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[itemIdx].stats.push(defaultStat());
      return newItems;
    });
  };

  const removeStat = (itemIdx: number, statIdx: number) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[itemIdx].stats = newItems[itemIdx].stats.filter((_, i) => i !== statIdx);
      return newItems;
    });
  };

  const updateService = (
    itemIdx: number,
    srvIdx: number,
    field: keyof PortfolioService,
    value: string,
  ) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[itemIdx].SERVICES[srvIdx][field] = value;
      return newItems;
    });
  };

  const addService = (itemIdx: number) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[itemIdx].SERVICES.push(defaultService(newItems[itemIdx].SERVICES.length));
      return newItems;
    });
  };

  const removeService = (itemIdx: number, srvIdx: number) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[itemIdx].SERVICES = newItems[itemIdx].SERVICES.filter((_, i) => i !== srvIdx);
      return newItems;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving Portfolio...");

    try {
      const processedItems = await Promise.all(
        items.map(async (item) => {
          const uploadedUrls = await uploadFiles(item.image);
          const validUrl = uploadedUrls.find((url) => url !== null) || null;

          return {
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            image: validUrl,
            CTA: item.CTA,
            link: item.link,
            date: item.date,
            description: item.description,
            stats: item.stats,
            SERVICES: item.SERVICES.map((s) => ({
              ...s,
              tags: s.tags
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t !== ""),
            })),
          };
        }),
      );

      // Build request body based on context
      let body: any;
      if (sectionId) {
        // Saving an individual dynamic page section via /api/sections
        body = { id: sectionId, content: processedItems };
      } else {
        // Standard page API: { section: "Portfolio", content: [...] }
        body = { section: sectionName, content: processedItems };
      }

      const res = await fetch(saveUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Portfolio saved successfully!", { id: toastId });
        if (onSave) onSave(processedItems as any);
      } else {
        toast.error("Save failed. Please try again.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section id="portfolio-cms">
      <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <SectionHeader
          title="Portfolio Management"
          description="Build your portfolio showcases. This data links the carousel and its associated detail pages."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-8 pt-4">
              <div className="flex flex-col gap-6">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-4xl border border-gray-100 bg-gray-50/30 shadow-sm transition-all duration-500 hover:border-[#D4AF37]/30"
                  >
                    {/* Header */}
                    <div
                      className="flex cursor-pointer items-center justify-between border-b border-gray-100 bg-white px-8 py-5 transition-colors hover:bg-gray-50"
                      onClick={() => toggleExpand(idx)}
                    >
                      <div className="flex items-center gap-4">
                        <GripVertical className="h-5 w-5 text-gray-300" />
                        <span className="font-bold tracking-tight text-[#0B0F29]">
                          Project {idx + 1}: {item.title || "Untitled Showcase"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(idx);
                          }}
                          className="flex items-center gap-2 rounded-xl bg-red-50 p-2 text-xs font-bold text-red-500 transition-all hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                        {item.isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div
                      className={`transition-all duration-500 ease-in-out ${item.isExpanded ? "p-8 opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}
                    >
                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <InputField
                          label="Project Title"
                          value={item.title}
                          onChange={(e) => handleItemChange(idx, "title", e.target.value)}
                          placeholder="e.g. GreatWaterFilters.com.au"
                          required
                        />
                        <InputField
                          label="Subtitle / Industry"
                          value={item.subtitle}
                          onChange={(e) => handleItemChange(idx, "subtitle", e.target.value)}
                          placeholder="e.g. Website Development"
                        />
                        <InputField
                          label="CTA Label"
                          value={item.CTA}
                          onChange={(e) => handleItemChange(idx, "CTA", e.target.value)}
                          placeholder="e.g. View Project"
                        />
                        <InputField
                          label="External Link"
                          value={item.link}
                          onChange={(e) => handleItemChange(idx, "link", e.target.value)}
                          placeholder="#"
                        />
                        <InputField
                          label="Launch Date"
                          value={item.date}
                          onChange={(e) => handleItemChange(idx, "date", e.target.value)}
                          placeholder="e.g. Tue, 8 Mar 2022"
                        />

                        <TextAreaField
                          label="Short Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          containerClassName="col-span-2"
                          rows={3}
                          placeholder="Briefly describe the project goals and impact..."
                        />

                        <div className="col-span-2 space-y-2 rounded-3xl border border-gray-100 bg-white/50 p-6">
                          <ImageUploadField
                            label="Representative Cover Image"
                            images={item.image}
                            onImagesChange={(imgs) => handleItemChange(idx, "image", imgs)}
                            maxImages={1}
                          />
                        </div>

                        {/* Stats Section */}
                        <div className="col-span-2 mt-4 border-t border-gray-100 pt-8">
                          <div className="mb-6 flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-black tracking-widest text-[#0B0F29] uppercase">
                                Key Performance Stats
                              </h4>
                              <p className="mt-1 text-xs text-gray-400">
                                Numerical achievements to highlight success.
                              </p>
                            </div>
                            <button
                              onClick={() => addStat(idx)}
                              className="flex items-center gap-2 rounded-xl bg-[#D4AF37]/10 px-4 py-2 text-xs font-bold text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-white"
                            >
                              <Plus className="h-4 w-4" /> Add Metric
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {item.stats.map((stat, sIdx) => (
                              <div
                                key={sIdx}
                                className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                              >
                                <button
                                  onClick={() => removeStat(idx, sIdx)}
                                  className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-110"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                <div className="space-y-4">
                                  <InputField
                                    className="text-xs"
                                    label="Stat Label"
                                    value={stat.label}
                                    onChange={(e) => updateStat(idx, sIdx, "label", e.target.value)}
                                    placeholder="e.g. Conversion"
                                  />
                                  <InputField
                                    className="text-xs"
                                    label="Value"
                                    value={stat.value}
                                    onChange={(e) => updateStat(idx, sIdx, "value", e.target.value)}
                                    placeholder="60%"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Deliverables Section */}
                        <div className="col-span-2 mt-6 border-t border-gray-100 pt-8">
                          <div className="mb-6 flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-black tracking-widest text-[#0B0F29] uppercase">
                                Insider Content (Deliverables)
                              </h4>
                              <p className="mt-1 text-xs text-gray-400">
                                Deep dive into the specific services provided.
                              </p>
                            </div>
                            <button
                              onClick={() => addService(idx)}
                              className="flex items-center gap-2 rounded-xl bg-[#0B0F29] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#D4AF37]"
                            >
                              <Plus className="h-4 w-4" /> Add Deliverable
                            </button>
                          </div>
                          <div className="space-y-6">
                            {item.SERVICES.map((srv, sIdx) => (
                              <div
                                key={sIdx}
                                className="group relative rounded-4xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:border-[#D4AF37]/30"
                              >
                                <button
                                  onClick={() => removeService(idx, sIdx)}
                                  className="absolute top-6 right-6 rounded-2xl p-2.5 text-red-500 transition-all hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
                                  <div className="md:col-span-2">
                                    <InputField
                                      label="Order No."
                                      value={srv.number}
                                      onChange={(e) =>
                                        updateService(idx, sIdx, "number", e.target.value)
                                      }
                                      placeholder="01"
                                    />
                                  </div>
                                  <div className="md:col-span-5">
                                    <InputField
                                      label="Service Title"
                                      value={srv.title}
                                      onChange={(e) =>
                                        updateService(idx, sIdx, "title", e.target.value)
                                      }
                                      placeholder="e.g. UI/UX Design"
                                    />
                                  </div>
                                  <div className="md:col-span-5">
                                    <InputField
                                      label="Category"
                                      value={srv.category}
                                      onChange={(e) =>
                                        updateService(idx, sIdx, "category", e.target.value)
                                      }
                                      placeholder="Design"
                                    />
                                  </div>
                                  <div className="md:col-span-12">
                                    <TextAreaField
                                      label="Process Description"
                                      value={srv.description}
                                      onChange={(e) =>
                                        updateService(idx, sIdx, "description", e.target.value)
                                      }
                                      rows={2}
                                      placeholder="Explain the approach..."
                                    />
                                  </div>
                                  <div className="md:col-span-6">
                                    <InputField
                                      label="Tags (comma separated)"
                                      value={srv.tags}
                                      onChange={(e) =>
                                        updateService(idx, sIdx, "tags", e.target.value)
                                      }
                                      placeholder="design, prototype, user testing"
                                    />
                                  </div>
                                  <div className="md:col-span-6">
                                    <InputField
                                      label="Measurable Outcome"
                                      value={srv.outcome}
                                      onChange={(e) =>
                                        updateService(idx, sIdx, "outcome", e.target.value)
                                      }
                                      placeholder="Better engagement"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addItem}
                className="group flex w-full items-center justify-center gap-4 rounded-4xl border-2 border-dashed border-gray-200 py-4 text-xs font-black tracking-widest text-gray-400 uppercase transition-all hover:border-[#D4AF37] hover:bg-white hover:text-[#0B0F29] lg:mt-4"
              >
                <Plus className="h-5 w-5 transition-transform group-hover:scale-110" />
                Add New Project Showcase
              </button>

              <div className="flex justify-end border-t border-gray-100 pt-8">
                <SaveButton
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-14 w-52 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
