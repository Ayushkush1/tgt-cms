"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { CloudUpload, X, Plus } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { uploadFiles } from "@/lib/uploadHelpers";

interface TestimonialItem {
  clientName: string;
  clientRole: string;
  quote: string;
  image?: string;
}

const defaultTestimonial = (): TestimonialItem => ({
  clientName: "",
  clientRole: "",
  quote: "",
});

const defaultFormData = {
  upperTag: "",
  headlinePart1: "",
  headlineHighlight1: "",
  headlinePart2: "",
  headlineHighlight2: "",
  mainDescription: "",
  footerCtaText: "",
  footerButtonLabel: "",
  footerButtonUrl: "",
  testimonials: [defaultTestimonial()] as TestimonialItem[],
};

interface OurReputationCMSProps {
  sectionId?: string;
  initialData?: Record<string, unknown>;
  saveUrl?: string;
  onSave?: (data: Record<string, unknown>) => void;
}

export function OurReputationCMS({
  sectionId,
  initialData,
  saveUrl = "/api/sections",
  onSave,
}: OurReputationCMSProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarImages, setAvatarImages] = useState<(File | string | null)[]>([
    null,
  ]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    ...defaultFormData,
    ...(initialData || {}),
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev: typeof defaultFormData) => ({
        ...defaultFormData,
        ...prev,
        ...initialData,
      }));
      if (initialData.testimonials) {
        setAvatarImages(
          (initialData.testimonials as Record<string, unknown>[]).map(
            (t) => (t.image as string) || null,
          ),
        );
      }
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: typeof defaultFormData) => ({ ...prev, [name]: value }));
  };

  const handleTestimonialChange = (
    index: number,
    field: keyof TestimonialItem,
    value: string,
  ) => {
    setFormData((prev: typeof defaultFormData) => {
      const updated = [...prev.testimonials];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, testimonials: updated };
    });
  };

  const addTestimonial = () => {
    setFormData((prev: typeof defaultFormData) => ({
      ...prev,
      testimonials: [...prev.testimonials, defaultTestimonial()],
    }));
    setAvatarImages((prev) => [...prev, null]);
  };

  const removeTestimonial = (indexToRemove: number) => {
    setFormData((prev: typeof defaultFormData) => ({
      ...prev,
      testimonials: prev.testimonials.filter(
        (_: unknown, i: number) => i !== indexToRemove,
      ),
    }));
    setAvatarImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatarImages((prev) => {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      });
    }
  };

  const removeImage = (index: number) => {
    setAvatarImages((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const uploadedUrls = await uploadFiles(avatarImages);
      const payload = {
        ...formData,
        testimonials: formData.testimonials.map(
          (item: TestimonialItem, idx: number) => ({
            ...item,
            image: uploadedUrls[idx],
          }),
        ),
      };

      const body = sectionId
        ? { id: sectionId, content: payload }
        : { section: "OurReputation", content: payload };

      const res = await fetch(saveUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Section saved!", { id: toastId });
        if (onSave) onSave(payload);
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
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="Our Reputation Section"
        description="Manage testimonials and CTAs."
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="flex flex-col gap-8 pt-4 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 gap-6">
            <InputField
              label="Upper Tag"
              name="upperTag"
              value={formData.upperTag || ""}
              onChange={handleChange}
              placeholder="e.g. Our Reputation"
              containerClassName="col-span-2"
            />
            <InputField
              label="Headline Part 1"
              name="headlinePart1"
              value={formData.headlinePart1 || ""}
              onChange={handleChange}
              required
            />
            <InputField
              label="Headline Highlight 1"
              name="headlineHighlight1"
              value={formData.headlineHighlight1 || ""}
              onChange={handleChange}
            />
            <InputField
              label="Headline Part 2"
              name="headlinePart2"
              value={formData.headlinePart2 || ""}
              onChange={handleChange}
            />
            <InputField
              label="Headline Highlight 2"
              name="headlineHighlight2"
              value={formData.headlineHighlight2 || ""}
              onChange={handleChange}
            />
            <TextAreaField
              label="Description"
              name="mainDescription"
              value={formData.mainDescription || ""}
              onChange={handleChange}
              containerClassName="col-span-2"
              required
            />

            <div className="col-span-2 flex items-center justify-between mt-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Testimonials ({(formData.testimonials || []).length})
              </h3>
            </div>

            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {(formData.testimonials || []).map(
                (item: TestimonialItem, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-3xl p-6 flex flex-col gap-4 bg-white shadow-sm relative group"
                  >
                    <button
                      onClick={() => removeTestimonial(index)}
                      className="absolute -top-3 -right-3 p-2 bg-red-50 text-red-500 rounded-full shadow-sm hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <InputField
                      label="Client Name"
                      value={item.clientName}
                      onChange={(e) =>
                        handleTestimonialChange(
                          index,
                          "clientName",
                          e.target.value,
                        )
                      }
                      required
                    />
                    <InputField
                      label="Role / Company"
                      value={item.clientRole}
                      onChange={(e) =>
                        handleTestimonialChange(
                          index,
                          "clientRole",
                          e.target.value,
                        )
                      }
                    />
                    <TextAreaField
                      label="Quote"
                      value={item.quote}
                      onChange={(e) =>
                        handleTestimonialChange(index, "quote", e.target.value)
                      }
                      required
                    />

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Client Avatar
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
                      {avatarImages[index] ? (
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-200 bg-gray-50 group/img">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              typeof avatarImages[index] === "string"
                                ? (avatarImages[index] as string)
                                : URL.createObjectURL(
                                    avatarImages[index] as Blob,
                                  )
                            }
                            className="w-full h-full object-cover"
                            alt="Avatar"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRefs.current[index]?.click()}
                          className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-full flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <CloudUpload className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}

              {(formData.testimonials || []).length < 10 && (
                <button
                  onClick={addTestimonial}
                  className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span className="font-semibold">Add Testimonial</span>
                </button>
              )}
            </div>

            <div className="col-span-2 grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100 mt-4">
              <h3 className="col-span-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                Footer CTA
              </h3>
              <InputField
                label="CTA Text"
                name="footerCtaText"
                value={formData.footerCtaText || ""}
                onChange={handleChange}
                containerClassName="col-span-2"
              />
              <InputField
                label="Button Label"
                name="footerButtonLabel"
                value={formData.footerButtonLabel || ""}
                onChange={handleChange}
              />
              <InputField
                label="Button URL"
                name="footerButtonUrl"
                value={formData.footerButtonUrl || ""}
                onChange={handleChange}
              />
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
