"use client";

import { useState, useRef, useEffect } from "react";
import { CloudUpload, X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { TextAreaField } from "@/components/TextAreaField";
import { uploadFiles } from "@/lib/uploadHelpers";
import { SectionHeader } from "@/components/SectionHeader";

const SECTION_KEY = "HeroSection";

interface ProjectCard {
  title: string;
  category: string;
}

const defaultProject = (): ProjectCard => ({ title: "", category: "" });

const defaultFormData = {
  badgeCount: "",
  badgeLabel: "",
  headlineMain: "",
  headlineItalicHighlight: "",
  heroSubtextDescription: "",
  primaryButtonLabel: "",
  primaryDestinationUrl: "",
  secondaryButtonLabel: "",
  secondaryDestinationUrl: "",
  projects: [defaultProject()] as ProjectCard[],
};

export default function HeroSection() {
  const [isOpen, setIsOpen] = useState(false);
  // Store up to N slider images, synced with projects array length
  const [sliderImages, setSliderImages] = useState<(File | null)[]>([null]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          const data = json.data[SECTION_KEY];
          setFormData((prev) => ({ ...prev, ...data }));
          // Ensure sliderImages array matches projects length
          if (data.projects) {
            setSliderImages(Array(data.projects.length).fill(null));
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

  const handleProjectChange = (
    index: number,
    field: keyof ProjectCard,
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, defaultProject()],
    }));
    setSliderImages((prev) => [...prev, null]);
  };

  const removeProject = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== indexToRemove),
    }));
    setSliderImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSliderImages((prev) => {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      });
    }
  };

  const removeImage = (index: number) => {
    setSliderImages((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const handleSave = async () => {
    const errs: string[] = [];
    if (!formData.headlineMain?.trim())
      errs.push("Headline (Main) is required");
    if (!formData.heroSubtextDescription?.trim())
      errs.push("Hero Subtext Description is required");
    if (!formData.primaryButtonLabel?.trim())
      errs.push("Primary Button Label is required");
    if (!formData.primaryDestinationUrl?.trim())
      errs.push("Primary Destination URL is required");
    formData.projects.forEach((p, i) => {
      if (!p.title.trim()) errs.push(`Project ${i + 1} Title is required`);
      if (!p.category.trim())
        errs.push(`Project ${i + 1} Category is required`);
    });
    if (errs.length > 0) {
      errs.forEach((m) => toast.error(m));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const uploadedUrls = await uploadFiles(sliderImages);
      const payload = {
        ...formData,
        projects: formData.projects.map((item, idx) => ({ ...item, image: uploadedUrls[idx] }))
      };
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
      const json = await res.json();
      json.success
        ? toast.success("Hero section saved!", { id: toastId })
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
          title="Hero Text Elements"
          description="Manage the content displayed on the main landing page hero section."
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
              {/* ── Headline ── */}
              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-2">
                Headline
              </h1>
              <InputField
                label="Headline (Main)"
                name="headlineMain"
                value={formData.headlineMain || ""}
                onChange={handleChange}
                placeholder="e.g. Software artisans"
                required
              />
              <InputField
                label="Headline (Italic Highlight)"
                name="headlineItalicHighlight"
                value={formData.headlineItalicHighlight || ""}
                onChange={handleChange}
                placeholder="e.g. crafting digital reality."
              />

              {/* ── Subtext ── */}
              <TextAreaField
                label="Hero Subtext Description"
                name="heroSubtextDescription"
                value={formData.heroSubtextDescription || ""}
                onChange={handleChange}
                placeholder="e.g. Professional web development and software solutions for your business."
                containerClassName="col-span-2"
                required
              />

              {/* ── Trust Badge ── */}
              <InputField
                label="Trust Badge"
                name="badgeLabel"
                value={formData.badgeLabel || ""}
                onChange={handleChange}
                placeholder="e.g. businesses"
                containerClassName="col-span-2"
              />

              {/* ── Primary Button ── */}
              <h1 className="text-base font-bold text-gray-500 col-span-2">
                Primary Action Button
              </h1>
              <InputField
                label="Button Label"
                name="primaryButtonLabel"
                value={formData.primaryButtonLabel || ""}
                onChange={handleChange}
                placeholder="e.g. Book Free Consultation"
                required
              />
              <InputField
                label="Destination URL"
                name="primaryDestinationUrl"
                value={formData.primaryDestinationUrl || ""}
                onChange={handleChange}
                placeholder="e.g. https://calendar.app.google/..."
                required
              />

              {/* ── Secondary Button ── */}
              <h1 className="text-base font-bold text-gray-500 col-span-2">
                Secondary Action Button
              </h1>
              <InputField
                label="Button Label"
                name="secondaryButtonLabel"
                value={formData.secondaryButtonLabel || ""}
                onChange={handleChange}
                placeholder="e.g. Request Quote"
              />
              <InputField
                label="Destination URL"
                name="secondaryDestinationUrl"
                value={formData.secondaryDestinationUrl || ""}
                onChange={handleChange}
                placeholder="e.g. /contactUs"
              />

              {/* ── Dynamic Slider Project Cards ── */}
              <div className="col-span-2 flex items-center justify-between mt-4 mb-2">
                <h1 className="text-base font-bold text-gray-500">
                  Slider Project Cards
                </h1>
                <span className="text-sm font-medium text-gray-400">
                  {formData.projects.length} / 10 cards mapped
                </span>
              </div>

              {formData.projects.map((project, index) => (
                <div
                  key={index}
                  className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50 relative group"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">
                      Project Card {index + 1}
                    </h2>
                    {formData.projects.length > 1 && (
                      <button
                        onClick={() => removeProject(index)}
                        className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Title"
                      placeholder="e.g. FinTech Evolution"
                      value={project.title}
                      onChange={(e) =>
                        handleProjectChange(index, "title", e.target.value)
                      }
                      required
                    />
                    <InputField
                      label="Category"
                      placeholder="e.g. System Architecture"
                      value={project.category}
                      onChange={(e) =>
                        handleProjectChange(index, "category", e.target.value)
                      }
                      required
                    />

                    {/* Per-card image upload */}
                    <div className="col-span-2 flex flex-col gap-1.5 mx-2">
                      <label className="text-sm font-medium text-gray-700">
                        Card Background Image
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
                      {sliderImages[index] ? (
                        <div className="w-full border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between p-3 px-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={typeof sliderImages[index] === "string" ? sliderImages[index] : URL.createObjectURL(sliderImages[index]!)}
                              alt={`Card ${index + 1}`}
                              className="w-12 h-12 object-cover rounded-md shadow-sm border border-gray-200"
                            />
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-semibold text-sm truncate max-w-[200px]">
                                {sliderImages[index]!.name}
                              </span>
                              <span className="text-gray-500 text-[12px]">
                                {(
                                  sliderImages[index]!.size /
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
                              setSliderImages((prev) => {
                                const updated = [...prev];
                                updated[index] = file;
                                return updated;
                              });
                            }
                          }}
                          onClick={() => fileInputRefs.current[index]?.click()}
                          className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors cursor-pointer group ${
                            isDragging === index
                              ? "border-[#0A0F29] border-solid bg-gray-100"
                              : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                          }`}
                        >
                          <div
                            className={`p-2.5 rounded-full shadow-sm ring-1 ring-gray-100 mb-2 transition-transform ${
                              isDragging === index
                                ? "bg-[#0A0F29] text-white scale-110"
                                : "bg-white text-[#0A0F29] group-hover:scale-110"
                            }`}
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

              {formData.projects.length < 10 && (
                <button
                  onClick={addProject}
                  className="col-span-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Project Card
                </button>
              )}

              <SaveButton onClick={handleSave} disabled={isSaving} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
