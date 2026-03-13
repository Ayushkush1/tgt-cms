"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

interface StatItem {
  value: string;
  labelLine1: string;
}

const defaultStat = (): StatItem => ({
  value: "",
  labelLine1: "",
});

const defaultFormData = {
  headlinePart1: "",
  mainDescription: "",
  stats: [defaultStat()] as StatItem[],
};

interface IntegrationsSectionProps {
  sectionId?: string;
  initialData?: Record<string, unknown>;
  saveUrl?: string;
  onSave?: (data: Record<string, unknown>) => void;
}

export function IntegrationsSection({
  sectionId,
  initialData,
  saveUrl = "/api/home",
  onSave,
}: IntegrationsSectionProps) {
  const [isOpen, setIsOpen] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
    } else if (saveUrl === "/api/home") {
      fetchWithCache("/api/home")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((json: Record<string, any>) => {
          if (json.success && json.data?.Integrations) {
            setFormData((prev) => ({ ...prev, ...json.data.Integrations }));
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

  const handleStatChange = (
    index: number,
    field: keyof StatItem,
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.stats];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, stats: updated };
    });
  };

  const addStat = () => {
    setFormData((prev) => ({
      ...prev,
      stats: [...prev.stats, defaultStat()],
    }));
  };

  const removeStat = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const body = sectionId
        ? { id: sectionId, content: formData }
        : { section: "Integrations", content: formData };

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
        toast.success("Section saved!", { id: toastId });
        if (onSave) onSave(formData as unknown as Record<string, unknown>);
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
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
        <SectionHeader
          title="Integrations & Stats Section"
          description="Manage center content and statistics."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        {isOpen && (
          <div className="flex flex-col gap-8 pt-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-6">
              <InputField
                label="Headline"
                name="headlinePart1"
                value={formData.headlinePart1 || ""}
                onChange={handleChange}
                placeholder="e.g. Home to the world's"
                containerClassName="col-span-2"
                required
              />
              <TextAreaField
                label="Main Description"
                name="mainDescription"
                value={formData.mainDescription || ""}
                onChange={handleChange}
                placeholder="e.g. We integrate with over 50+ industry-leading tools to streamline your workflow."
                containerClassName="col-span-2"
                required
              />

              <div className="col-span-2 flex items-center justify-between mt-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Stats Counters ({formData.stats.length})
                </h3>
              </div>

              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.stats.map((stat, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-3xl p-6 flex flex-col gap-4 bg-white shadow-sm relative group"
                  >
                    <button
                      onClick={() => removeStat(index)}
                      className="absolute -top-3 -right-3 p-2 bg-red-50 text-red-500 rounded-full shadow-sm hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <InputField
                      label="Value"
                      value={stat.value}
                      onChange={(e) =>
                        handleStatChange(index, "value", e.target.value)
                      }
                      placeholder="e.g. 50"
                      required
                    />
                    <InputField
                      label="Label"
                      value={stat.labelLine1}
                      onChange={(e) =>
                        handleStatChange(index, "labelLine1", e.target.value)
                      }
                      placeholder="e.g. Happy Clients"
                      required
                    />
                  </div>
                ))}

                {formData.stats.length < 10 && (
                  <button
                    onClick={addStat}
                    className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all gap-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="font-semibold">Add Stat</span>
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
    </section>
  );
}
