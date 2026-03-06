"use client";

import { useState, useRef, useEffect } from "react";
import { CloudUpload, X, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { TextAreaField } from "@/components/TextAreaField";
import { uploadFiles } from "@/lib/uploadHelpers";
import { SectionHeader } from "@/components/SectionHeader";

interface ProjectCard {
  title: string;
  category: string;
  image?: string;
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

interface HeroSectionCMSProps {
  sectionId?: string;
  initialData?: any;
  saveUrl?: string;
  onSave?: (data: any) => void;
}

export function HeroSectionCMS({
  sectionId,
  initialData,
  saveUrl = "/api/sections",
  onSave,
}: HeroSectionCMSProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [sliderImages, setSliderImages] = useState<(File | string | null)[]>([
    null,
  ]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(initialData || defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.projects) {
        setSliderImages(initialData.projects.map((p: any) => p.image || null));
      }
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (
    index: number,
    field: keyof ProjectCard,
    value: string,
  ) => {
    setFormData((prev: any) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const addProject = () => {
    setFormData((prev: any) => ({
      ...prev,
      projects: [...prev.projects, defaultProject()],
    }));
    setSliderImages((prev) => [...prev, null]);
  };

  const removeProject = (indexToRemove: number) => {
    setFormData((prev: any) => ({
      ...prev,
      projects: prev.projects.filter(
        (_: any, i: number) => i !== indexToRemove,
      ),
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
    formData.projects.forEach((p: any, i: number) => {
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
        projects: formData.projects.map((item: any, idx: number) => ({
          ...item,
          image: uploadedUrls[idx],
        })),
      };

      const body = sectionId
        ? { id: sectionId, content: payload }
        : { section: "HeroSection", content: payload };

      const res = await fetch(saveUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Hero section saved!", { id: toastId });
        if (onSave) onSave(payload);
      } else {
        toast.error(json.error || "Save failed", { id: toastId });
      }
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="Hero Section"
        description="Manage the main landing page hero section."
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="flex flex-col gap-8 pt-4 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 gap-6">
            <InputField
              label="Headline (Main)"
              name="headlineMain"
              value={formData.headlineMain || ""}
              onChange={handleChange}
              placeholder="e.g. Software artisans"
              required
            />
            <InputField
              label="Headline (Highlight)"
              name="headlineItalicHighlight"
              value={formData.headlineItalicHighlight || ""}
              onChange={handleChange}
              placeholder="e.g. crafting digital reality."
            />
            <TextAreaField
              label="Hero Subtext"
              name="heroSubtextDescription"
              value={formData.heroSubtextDescription || ""}
              onChange={handleChange}
              placeholder="Primary description"
              containerClassName="col-span-2"
              required
            />
            <InputField
              label="Badge Label"
              name="badgeLabel"
              value={formData.badgeLabel || ""}
              onChange={handleChange}
              placeholder="e.g. Trusted by 50+ businesses"
              containerClassName="col-span-2"
            />

            <div className="col-span-2 grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <h3 className="col-span-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                Actions
              </h3>
              <InputField
                label="Primary Button Label"
                name="primaryButtonLabel"
                value={formData.primaryButtonLabel || ""}
                onChange={handleChange}
                required
              />
              <InputField
                label="Primary Destination"
                name="primaryDestinationUrl"
                value={formData.primaryDestinationUrl || ""}
                onChange={handleChange}
                required
              />
              <InputField
                label="Secondary Button Label"
                name="secondaryButtonLabel"
                value={formData.secondaryButtonLabel || ""}
                onChange={handleChange}
              />
              <InputField
                label="Secondary Destination"
                name="secondaryDestinationUrl"
                value={formData.secondaryDestinationUrl || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-span-2 flex items-center justify-between mt-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Slider Project Cards ({formData.projects.length})
              </h3>
            </div>

            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.projects.map((project: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-3xl p-6 flex flex-col gap-4 bg-white shadow-sm relative group"
                >
                  <button
                    onClick={() => removeProject(index)}
                    className="absolute -top-3 -right-3 p-2 bg-red-50 text-red-500 rounded-full shadow-sm hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <InputField
                    label="Title"
                    value={project.title}
                    onChange={(e) =>
                      handleProjectChange(index, "title", e.target.value)
                    }
                    required
                  />
                  <InputField
                    label="Category"
                    value={project.category}
                    onChange={(e) =>
                      handleProjectChange(index, "category", e.target.value)
                    }
                    required
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
                    {sliderImages[index] ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group/img">
                        <img
                          src={
                            typeof sliderImages[index] === "string"
                              ? sliderImages[index]
                              : URL.createObjectURL(sliderImages[index]!)
                          }
                          className="w-full h-full object-cover"
                          alt="Project"
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

              {formData.projects.length < 10 && (
                <button
                  onClick={addProject}
                  className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span className="font-semibold">Add Project Card</span>
                </button>
              )}
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
