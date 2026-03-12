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
  projects: [defaultProject()] as ProjectCard[],
};

interface HeroSectionProps {
  sectionId?: string;
  initialData?: any;
  saveUrl?: string;
  onSave?: (data: any) => void;
}

export function HeroSection({
  sectionId,
  initialData,
  saveUrl = "/api/home",
  onSave,
}: HeroSectionProps) {
  const [isOpen, setIsOpen] = useState(!initialData);
  const [sliderImages, setSliderImages] = useState<(File | string | null)[]>(
    [],
  );
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
      if (initialData.projects) {
        setSliderImages(initialData.projects.map((p: any) => p.image || null));
      }
    } else if (saveUrl === "/api/home") {
      fetchWithCache("/api/home")
        .then((json) => {
          if (json.success && json.data?.HeroSection) {
            const data = json.data.HeroSection;
            setFormData((prev) => ({ ...prev, ...data }));
            if (data.projects) {
              setSliderImages(data.projects.map((p: any) => p.image || null));
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
        projects: formData.projects.map((item, idx) => ({
          ...item,
          image: uploadedUrls[idx],
        })),
      };

      const body = sectionId
        ? { id: sectionId, content: payload }
        : { section: "HeroSection", content: payload };

      const method = sectionId
        ? "PUT"
        : saveUrl === "/api/home"
          ? "PUT"
          : "POST";

      const res = await fetch(saveUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Hero section saved!", { id: toastId });
        setSliderImages(uploadedUrls.map((url) => url || null));
        if (onSave) onSave(payload);
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
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
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-6 pt-4 animate-in fade-in duration-500">
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
                placeholder="e.g. https://..."
                required
              />

              <h1 className="text-base font-bold text-gray-500 col-span-2">
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

              <div className="col-span-2 flex items-center justify-between mt-4 mb-2">
                <h1 className="text-base font-bold text-gray-500">
                  Slider Project Cards
                </h1>
                <span className="text-sm font-medium text-gray-400">
                  {formData.projects.length} / 10 cards
                </span>
              </div>

              {formData.projects.map((project, index) => (
                <div
                  key={index}
                  className="col-span-2 border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 bg-gray-50/50 relative group"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">
                      Project Card {index + 1}
                    </h2>
                    {formData.projects.length > 1 && (
                      <button
                        onClick={() => removeProject(index)}
                        className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold"
                      >
                        <Trash2 className="w-4 h-4" />
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
                        accept="image/*"
                        className="hidden"
                      />
                      {sliderImages[index] ? (
                        <div className="w-full border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between p-3 px-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                typeof sliderImages[index] === "string"
                                  ? (sliderImages[index] as string)
                                  : URL.createObjectURL(
                                      sliderImages[index] as Blob,
                                    )
                              }
                              alt={`Card ${index + 1}`}
                              className="w-12 h-12 object-cover rounded-md shadow-sm border border-gray-200"
                            />
                            <span className="text-gray-900 font-semibold text-sm truncate max-w-[200px]">
                              Image Uploaded
                            </span>
                          </div>
                          <button
                            onClick={() => removeImage(index)}
                            className="p-1.5 bg-white text-gray-500 hover:text-red-500 rounded-full shadow-sm ring-1 ring-gray-100 transition-colors"
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
                          <CloudUpload className="w-6 h-6 text-gray-400 mb-2" />
                          <p className="text-gray-500 text-sm">
                            <span className="text-[#D3AF37] font-semibold hover:underline mr-1">
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
                  className="col-span-2 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-semibold hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Project Card
                </button>
              )}

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
