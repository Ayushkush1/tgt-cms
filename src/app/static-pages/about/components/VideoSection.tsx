"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

const SECTION_KEY = "VideoSection";

const defaultFormData = {
  headingPart1: "",
  headingHighlight1: "",
  headingPart2: "",
  headingHighlight2: "",
  descriptionText: "",
  videoUrl: "",
};

export default function VideoSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchWithCache("/api/about")
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          setFormData((prev) => ({ ...prev, ...json.data[SECTION_KEY] }));
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
        toast.success("Video section saved!", { id: toastId });
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
          title="Video Section"
          description="Manage the heading and video URL for the Video section."
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
              <InputField
                label="Heading Part 1"
                name="headingPart1"
                value={formData.headingPart1}
                onChange={handleChange}
                placeholder="e.g. Innovation"
                required
              />
              <InputField
                label="Heading Highlight (Italic/Gold)"
                name="headingHighlight1"
                value={formData.headingHighlight1}
                onChange={handleChange}
                placeholder="e.g. Crafted"
              />
              <InputField
                label="Heading Part 2"
                name="headingPart2"
                value={formData.headingPart2}
                onChange={handleChange}
                placeholder="e.g. With"
              />
              <InputField
                label="Heading Highlight (Underlined)"
                name="headingHighlight2"
                value={formData.headingHighlight2}
                onChange={handleChange}
                placeholder="e.g. Excellence"
              />

              <TextAreaField
                label="Description Text"
                name="descriptionText"
                value={formData.descriptionText}
                onChange={handleChange}
                placeholder="e.g. We help businesses innovate..."
                containerClassName="col-span-2"
                rows={3}
              />

              <InputField
                label="Video URL (Embed)"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="e.g. https://www.youtube.com/embed/..."
                containerClassName="col-span-2"
              />

              <div className="col-span-2 mt-2">
                <SaveButton onClick={handleSave} disabled={isSaving} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
