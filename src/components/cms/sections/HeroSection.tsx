"use client";
import { useState, useRef, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
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
  headingTag: "h1",
  projects: [defaultProject()] as ProjectCard[],
};

interface HeroSectionProps {
  sectionId?: string;
  initialData?: Record<string, unknown>;
  saveUrl?: string;
  onSave?: (data: Record<string, unknown>) => void;
}

export function HeroSection({
  sectionId,
  initialData,
  saveUrl = "/api/home",
  onSave,
}: HeroSectionProps) {
  const [isOpen, setIsOpen] = useState(!initialData);
  const [sliderImages, setSliderImages] = useState<(File | string | null)[]>([]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
      if (initialData.projects && Array.isArray(initialData.projects)) {
        setSliderImages((initialData.projects as ProjectCard[]).map((p) => p.image || null));
      }
    } else if (saveUrl === "/api/home") {
      fetchWithCache("/api/home")
        .then((json) => {
          if (json.success && json.data?.HeroSection) {
            const data = json.data.HeroSection;
            setFormData((prev) => ({ ...prev, ...data }));
            if (data.projects && Array.isArray(data.projects)) {
              setSliderImages((data.projects as ProjectCard[]).map((p) => p.image || null));
            }
          }
        })
        .catch(console.error);
    }
  }, [initialData, saveUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProjectChange = (index: number, field: keyof ProjectCard, value: string) => {
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

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!formData.headlineMain?.trim()) errs.push("Headline (Main) is required");
    if (!formData.heroSubtextDescription?.trim()) errs.push("Hero Subtext Description is required");
    if (!formData.primaryButtonLabel?.trim()) errs.push("Primary Button Label is required");
    if (!formData.primaryDestinationUrl?.trim()) errs.push("Primary Destination URL is required");
    formData.projects.forEach((p, i) => {
      if (!p.title.trim()) errs.push(`Project ${i + 1} Title is required`);
      if (!p.category.trim()) errs.push(`Project ${i + 1} Category is required`);
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
        projects: formData.projects.map((item, idx) => ({
          ...item,
          image: uploadedUrls[idx] || undefined,
        })),
      };

      const body = sectionId
        ? { id: sectionId, content: payload }
        : { section: "HeroSection", content: payload };

      const method = sectionId ? "PUT" : saveUrl === "/api/home" ? "PUT" : "POST";

      const res = await fetch(saveUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Hero section saved!", { id: toastId });
        setSliderImages(uploadedUrls.map((url) => url || null));
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
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all">
        <SectionHeader
          title="Hero Section"
          description="Manage the content displayed on the main landing page hero section."
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
              <h1 className="col-span-2 mt-2 text-base font-bold text-gray-500">Headline</h1>
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

              <TextAreaField
                label="Hero Subtext Description"
                name="heroSubtextDescription"
                value={formData.heroSubtextDescription || ""}
                onChange={handleChange}
                placeholder="e.g. Professional web development and software solutions..."
                containerClassName="col-span-2"
                required
              />

              <InputField
                label="Trust Badge"
                name="badgeLabel"
                value={formData.badgeLabel || ""}
                onChange={handleChange}
                placeholder="e.g. businesses"
                containerClassName="col-span-2"
              />

              <h1 className="col-span-2 text-base font-bold text-gray-500">
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
                placeholder="e.g. https://..."
                required
              />

              <h1 className="col-span-2 text-base font-bold text-gray-500">
                Secondary Action Button
              </h1>
              <InputField
                label="Button Label"
                name="secondaryButtonLabel"
                value={formData.secondaryButtonLabel || ""}
                onChange={handleChange}
                placeholder="e.g. View Case Studies"
              />
              <InputField
                label="Destination URL"
                name="secondaryDestinationUrl"
                value={formData.secondaryDestinationUrl || ""}
                onChange={handleChange}
                placeholder="e.g. /projects"
              />

              <div className="col-span-2 mt-4 mb-2 flex items-center justify-between">
                <h1 className="text-base font-bold text-gray-500">Slider Project Cards</h1>
                <span className="text-sm font-medium text-gray-400">
                  {formData.projects.length} / 10 cards
                </span>
              </div>

              {formData.projects.map((project, index) => (
                <div
                  key={index}
                  className="group relative col-span-2 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">
                      Project Card {index + 1}
                    </h2>
                    {formData.projects.length > 1 && (
                      <button
                        onClick={() => removeProject(index)}
                        className="flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Title"
                      placeholder="e.g. FinTech Evolution"
                      value={project.title}
                      onChange={(e) => handleProjectChange(index, "title", e.target.value)}
                      required
                    />
                    <InputField
                      label="Category"
                      placeholder="e.g. System Architecture"
                      value={project.category}
                      onChange={(e) => handleProjectChange(index, "category", e.target.value)}
                      required
                    />

                    <div className="col-span-2 mx-2 flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Card Background Image
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
                        <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 px-4">
                          <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                typeof sliderImages[index] === "string"
                                  ? (sliderImages[index] as string)
                                  : URL.createObjectURL(sliderImages[index] as Blob)
                              }
                              alt={`Card ${index + 1}`}
                              className="h-12 w-12 rounded-md border border-gray-200 object-cover shadow-sm"
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
                              setSliderImages((prev) => {
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
                </div>
              ))}

              {formData.projects.length < 10 && (
                <button
                  onClick={addProject}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 font-semibold text-gray-500 transition-colors hover:bg-gray-50"
                >
                  <Plus className="h-5 w-5" />
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
