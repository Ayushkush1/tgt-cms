"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadFiles } from "@/lib/uploadHelpers";

const SECTION_KEY = "PortfolioSection";

interface PortfolioItem {
  id: number;
  title: string;
  subtitle: string;
  CTA: string;
  link: string;
  date: string;
  description: string;
  image: (File | string | null)[];
}

const defaultPortfolio = (): PortfolioItem => ({
  id: Date.now(),
  title: "",
  subtitle: "",
  CTA: "",
  link: "",
  date: "",
  description: "",
  image: [],
});

const defaultFormData = {
  portfolios: [] as PortfolioItem[],
};

export default function PortfolioSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchWithCache("/api/about")
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          const data = json.data[SECTION_KEY];
          const parsedPortfolios = Array.isArray(data.portfolios)
            ? data.portfolios.map((p: any) => ({
                ...p,
                image: p.imageUrl ? [p.imageUrl] : [],
              }))
            : [];

          setFormData({ portfolios: parsedPortfolios });
        }
      })
      .catch(console.error);
  }, []);

  const handlePortfolioChange = (
    index: number,
    field: keyof PortfolioItem,
    value: any,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.portfolios];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, portfolios: updated };
    });
  };

  const addPortfolio = () => {
    setFormData((prev) => ({
      ...prev,
      portfolios: [...prev.portfolios, defaultPortfolio()],
    }));
  };

  const removePortfolio = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      portfolios: prev.portfolios.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleSave = async () => {
    const errs: string[] = [];

    formData.portfolios.forEach((p, i) => {
      if (!p.title.trim()) errs.push(`Project ${i + 1} Title is required`);
    });

    if (errs.length > 0) {
      errs.forEach((m) => toast.error(m));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");

    try {
      const processedPortfolios = await Promise.all(
        formData.portfolios.map(async (project) => {
          const uploadedUrls = await uploadFiles(project.image);
          const validUrl = uploadedUrls.find((url) => url !== null) || null;
          return {
            id: project.id,
            title: project.title,
            subtitle: project.subtitle,
            CTA: project.CTA,
            link: project.link,
            date: project.date,
            description: project.description,
            imageUrl: validUrl,
          };
        }),
      );

      const payload = {
        portfolios: processedPortfolios,
      };

      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
      const json = await res.json();
      json.success
        ? toast.success("Portfolio section saved!", { id: toastId })
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
          title="Portfolio Carousel Section"
          description="Manage the portfolio projects shown in the interactive swiper."
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
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-base font-bold text-gray-500">
                    Portfolio Projects
                  </h1>
                  <span className="text-sm font-medium text-gray-400">
                    {formData.portfolios.length} mapped
                  </span>
                </div>

                <div className="flex flex-col gap-6">
                  {formData.portfolios.map((project, idx) => (
                    <div
                      key={project.id}
                      className="p-5 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-4"
                    >
                      {/* Project Header */}
                      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <h3 className="font-semibold text-gray-700">
                          Project #{idx + 1}
                        </h3>
                        <button
                          onClick={() => removePortfolio(idx)}
                          className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 px-3 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Project
                        </button>
                      </div>

                      {/* Project Form Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="Project Title"
                          value={project.title}
                          onChange={(e) =>
                            handlePortfolioChange(idx, "title", e.target.value)
                          }
                          placeholder="e.g. GreatWaterFilters.com.au"
                          required
                        />
                        <InputField
                          label="Subtitle / Category"
                          value={project.subtitle}
                          onChange={(e) =>
                            handlePortfolioChange(
                              idx,
                              "subtitle",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. Website Development"
                        />
                        <InputField
                          label="CTA Label / Industry"
                          value={project.CTA}
                          onChange={(e) =>
                            handlePortfolioChange(idx, "CTA", e.target.value)
                          }
                          placeholder="e.g. Water Purifier"
                        />
                        <InputField
                          label="Project Link"
                          value={project.link}
                          onChange={(e) =>
                            handlePortfolioChange(idx, "link", e.target.value)
                          }
                          placeholder="e.g. #"
                        />
                        <InputField
                          label="Date"
                          value={project.date}
                          onChange={(e) =>
                            handlePortfolioChange(idx, "date", e.target.value)
                          }
                          placeholder="e.g. Tue, 8 Mar 2022"
                        />
                        <TextAreaField
                          label="Short Description"
                          value={project.description}
                          onChange={(e) =>
                            handlePortfolioChange(
                              idx,
                              "description",
                              e.target.value,
                            )
                          }
                          containerClassName="col-span-2"
                          rows={2}
                        />

                        <div className="col-span-2">
                          <ImageUploadField
                            label="Cover Image"
                            images={project.image}
                            onImagesChange={(imgs) =>
                              handlePortfolioChange(idx, "image", imgs)
                            }
                            maxImages={1}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addPortfolio}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              </div>

              <div className="col-span-2 mt-4">
                <SaveButton onClick={handleSave} disabled={isSaving} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
