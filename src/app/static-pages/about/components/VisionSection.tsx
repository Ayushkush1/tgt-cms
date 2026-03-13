"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

const SECTION_KEY = "VisionSection";

const defaultFormData = {
  topLabel: "",
  headingPart1: "",
  headingHighlight1: "",
  headingPart2: "",
  headingHighlight2: "",
  headerDescription: "",
  block1Heading: "",
  block1Description: "",
  block1Checklist: [""] as string[],
  block2Heading: "",
  block2Description: "",
  ctaLabel: "",
  ctaUrl: "",
};

export default function VisionSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchWithCache("/api/about")
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          const data = json.data[SECTION_KEY];
          setFormData((prev) => ({
            ...prev,
            ...data,
            block1Checklist:
              Array.isArray(data.block1Checklist) &&
              data.block1Checklist.length > 0
                ? data.block1Checklist
                : [""],
          }));
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

  const handleChecklistChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newChecklist = [...prev.block1Checklist];
      newChecklist[index] = value;
      return { ...prev, block1Checklist: newChecklist };
    });
  };

  const handleSave = async () => {
    if (!formData.headingPart1.trim()) {
      toast.error("Heading Part 1 is required");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: formData }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Vision section saved!", { id: toastId });
      } else {
        toast.error("Save failed. Please try again.", { id: toastId });
      }
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
          title="Vision Section"
          description="Manage the content displayed on the Vision Section."
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
              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-2">
                Section Header
              </h1>
              <InputField
                label="Eyebrow Text (Top Label)"
                name="topLabel"
                value={formData.topLabel}
                onChange={handleChange}
                placeholder="e.g. Our Foundation"
                containerClassName="col-span-2"
              />
              <InputField
                label="Heading Part 1"
                name="headingPart1"
                value={formData.headingPart1}
                onChange={handleChange}
                placeholder="e.g. The"
                required
              />
              <InputField
                label="Heading Highlight (Italic/Gold)"
                name="headingHighlight1"
                value={formData.headingHighlight1}
                onChange={handleChange}
                placeholder="e.g. Expertise"
              />
              <InputField
                label="Heading Part 2"
                name="headingPart2"
                value={formData.headingPart2}
                onChange={handleChange}
                placeholder="e.g. Driving"
              />
              <InputField
                label="Heading Highlight 2 (Underlined)"
                name="headingHighlight2"
                value={formData.headingHighlight2}
                onChange={handleChange}
                placeholder="e.g. Innovation"
              />

              <TextAreaField
                label="Header Description"
                name="headerDescription"
                value={formData.headerDescription}
                onChange={handleChange}
                placeholder="e.g. , we combine strategy, technology..."
                containerClassName="col-span-2"
                rows={3}
              />

              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-6">
                Block 1: Your Partner
              </h1>
              <InputField
                label="Block 1 Heading"
                name="block1Heading"
                value={formData.block1Heading}
                onChange={handleChange}
                placeholder="e.g. Your Partner in Digital Innovation"
                containerClassName="col-span-2"
              />
              <TextAreaField
                label="Block 1 Description"
                name="block1Description"
                value={formData.block1Description}
                onChange={handleChange}
                placeholder="e.g. To establish ourselves as a trusted leader..."
                containerClassName="col-span-2"
                rows={4}
              />

              {/* Dynamic Checklist Items */}
              <div className="col-span-2 mx-2 flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Checklist Items
                </label>

                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <InputField
                      key={i}
                      name={`block1Checklist-${i}`}
                      value={formData.block1Checklist[i] || ""}
                      onChange={(e) => handleChecklistChange(i, e.target.value)}
                      placeholder={`Bullet ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-6">
                Block 2: Delivering Smart
              </h1>
              <InputField
                label="Block 2 Heading"
                name="block2Heading"
                value={formData.block2Heading}
                onChange={handleChange}
                placeholder="e.g. Delivering Smart That Drive Growth"
                containerClassName="col-span-2"
              />
              <TextAreaField
                label="Block 2 Description"
                name="block2Description"
                value={formData.block2Description}
                onChange={handleChange}
                placeholder="e.g. To deliver innovative and scalable IT solutions..."
                containerClassName="col-span-2"
                rows={4}
              />

              <InputField
                label="CTA Button Label"
                name="ctaLabel"
                value={formData.ctaLabel}
                onChange={handleChange}
                placeholder="e.g. Learn More"
              />
              <InputField
                label="CTA Button URL"
                name="ctaUrl"
                value={formData.ctaUrl}
                onChange={handleChange}
                placeholder="e.g. #"
              />

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
