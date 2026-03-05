"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

const SECTION_KEY = "Integrations";

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

export default function Integrations() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchWithCache("/api/home")
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY])
          setFormData((prev) => ({ ...prev, ...json.data[SECTION_KEY] }));
      })
      .catch(console.error);
  }, []);

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
    setFormData((prev) => ({ ...prev, stats: [...prev.stats, defaultStat()] }));
  };

  const removeStat = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleSave = async () => {
    const errs: string[] = [];
    if (!formData.headlinePart1?.trim())
      errs.push("Headline (Part 1) is required");
    if (!formData.mainDescription?.trim())
      errs.push("Main Description is required");
    formData.stats.forEach((s, i) => {
      if (!s.value.trim()) errs.push(`Stat ${i + 1} Value is required`);
      if (!s.labelLine1.trim())
        errs.push(`Stat ${i + 1} Label (Line 1) is required`);
    });
    if (errs.length > 0) {
      errs.forEach((m) => toast.error(m));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: formData }),
      });
      const json = await res.json();
      json.success
        ? toast.success("Integrations section saved!", { id: toastId })
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
          title="Integrations & Stats Section"
          description="Manage the content displayed in the center of the Integrations section."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
        <div
          className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <h1 className="text-base font-bold text-gray-500 col-span-2">
                Center Content Section
              </h1>
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
                placeholder="e.g. Meet your developers where they already are."
                containerClassName="col-span-2"
                rows={3}
                required
              />

              {/* ── Dynamic Stats ── */}
              <div className="col-span-2 flex items-center justify-between mt-4 mb-2">
                <h1 className="text-base font-bold text-gray-500">
                  Stats Counters
                </h1>
                <span className="text-sm font-medium text-gray-400">
                  {formData.stats.length} mapped
                </span>
              </div>

              {formData.stats.map((stat, index) => (
                <div
                  key={index}
                  className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">
                      Stat {index + 1}
                    </h2>
                    {formData.stats.length > 1 && (
                      <button
                        onClick={() => removeStat(index)}
                        className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Value (Number)"
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
                      placeholder="e.g. Happy"
                      required
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addStat}
                className="col-span-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Stat
              </button>

              <SaveButton onClick={handleSave} disabled={isSaving} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
