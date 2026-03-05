"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { CloudUpload, X, Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { uploadFiles } from "@/lib/uploadHelpers";

const SECTION_KEY = "OurReputation";

interface TestimonialItem {
  clientName: string;
  clientRole: string;
  quote: string;
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

export default function OurReputation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarImages, setAvatarImages] = useState<(File | null)[]>([null]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetch("/api/home")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          const data = json.data[SECTION_KEY];
          setFormData((prev) => ({ ...prev, ...data }));
          if (data.testimonials) {
            setAvatarImages(Array(data.testimonials.length).fill(null));
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

  const handleTestimonialChange = (
    index: number,
    field: keyof TestimonialItem,
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.testimonials];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, testimonials: updated };
    });
  };

  const addTestimonial = () => {
    setFormData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, defaultTestimonial()],
    }));
    setAvatarImages((prev) => [...prev, null]);
  };

  const removeTestimonial = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== indexToRemove),
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
    const errs: string[] = [];
    if (!formData.upperTag?.trim()) errs.push("Upper Tag is required");
    if (!formData.headlinePart1?.trim())
      errs.push("Headline (Part 1) is required");
    if (!formData.mainDescription?.trim())
      errs.push("Main Description is required");
    formData.testimonials.forEach((t, i) => {
      if (!t.clientName.trim())
        errs.push(`Testimonial ${i + 1} Client Name is required`);
      if (!t.quote.trim()) errs.push(`Testimonial ${i + 1} Quote is required`);
    });
    if (errs.length > 0) {
      errs.forEach((m) => toast.error(m));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const uploadedUrls = await uploadFiles(avatarImages);
      const payload = {
        ...formData,
        testimonials: formData.testimonials.map((item, idx) => ({ ...item, image: uploadedUrls[idx] }))
      };
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
      const json = await res.json();
      json.success
        ? toast.success("Our Reputation section saved!", { id: toastId })
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
          title="Our Reputation Section"
          description="Manage the testimonials and footer content displayed in the Our Reputation block."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
        <div
          className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <h1 className="text-base font-bold text-gray-500 col-span-2">
                Header Section
              </h1>
              <InputField
                label="Upper Tag"
                name="upperTag"
                value={formData.upperTag || ""}
                onChange={handleChange}
                placeholder="e.g. Our Reputation"
                containerClassName="col-span-2"
                required
              />
              <InputField
                label="Headline (Part 1)"
                name="headlinePart1"
                value={formData.headlinePart1 || ""}
                onChange={handleChange}
                placeholder="e.g. Loved by"
                required
              />
              <InputField
                label="Headline (Highlight 1 - Italic)"
                name="headlineHighlight1"
                value={formData.headlineHighlight1 || ""}
                onChange={handleChange}
                placeholder="e.g. businesses"
              />
              <InputField
                label="Headline (Part 2)"
                name="headlinePart2"
                value={formData.headlinePart2 || ""}
                onChange={handleChange}
                placeholder="e.g. and individuals"
              />
              <InputField
                label="Headline (Highlight 2 - Underlined)"
                name="headlineHighlight2"
                value={formData.headlineHighlight2 || ""}
                onChange={handleChange}
                placeholder="e.g. across the globe"
              />
              <TextAreaField
                label="Main Description"
                name="mainDescription"
                value={formData.mainDescription || ""}
                onChange={handleChange}
                placeholder="e.g. Hear from our partners who have successfully transformed their businesses..."
                containerClassName="col-span-2"
                rows={2}
                required
              />

              {/* ── Dynamic Testimonials List ── */}
              <div className="col-span-2 flex items-center justify-between mt-4 mb-2">
                <h1 className="text-base font-bold text-gray-500">
                  Testimonials
                </h1>
                <span className="text-sm font-medium text-gray-400">
                  {formData.testimonials.length} mapped
                </span>
              </div>

              {formData.testimonials.map((item, index) => (
                <div
                  key={index}
                  className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">
                      Testimonial {index + 1}
                    </h2>
                    {formData.testimonials.length > 1 && (
                      <button
                        onClick={() => removeTestimonial(index)}
                        className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Client Name"
                      placeholder="e.g. Sarah Mitchell"
                      value={item.clientName}
                      onChange={(e) =>
                        handleTestimonialChange(
                          index,
                          "clientName",
                          e.target.value,
                        )
                      }
                      containerClassName="col-span-1"
                      required
                    />
                    <InputField
                      label="Client Role / Company"
                      placeholder="e.g. CEO, InnovateCo"
                      value={item.clientRole}
                      onChange={(e) =>
                        handleTestimonialChange(
                          index,
                          "clientRole",
                          e.target.value,
                        )
                      }
                      containerClassName="col-span-1"
                    />
                    <TextAreaField
                      label="Quote block"
                      rows={2}
                      containerClassName="col-span-2"
                      placeholder="e.g. Working with The Gold Technologies was a game-changer..."
                      value={item.quote}
                      onChange={(e) =>
                        handleTestimonialChange(index, "quote", e.target.value)
                      }
                      required
                    />

                    {/* Per-testimonial image upload */}
                    <div className="col-span-2 flex flex-col gap-1.5 mx-2 mt-2">
                      <label className="text-sm font-medium text-gray-700">
                        Client Avatar Image
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
                      {avatarImages[index] ? (
                        <div className="w-full border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between p-3 px-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={typeof avatarImages[index] === "string" ? avatarImages[index] : URL.createObjectURL(avatarImages[index] as Blob)}
                              alt={`Avatar ${index + 1}`}
                              className="w-12 h-12 object-cover rounded-full shadow-sm border border-gray-200"
                            />
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-semibold text-sm truncate max-w-[200px]">
                                {typeof avatarImages[index] === "string" ? "Uploaded Image" : (avatarImages[index] as File).name}
                              </span>
                              <span className="text-gray-500 text-[12px]">
                                {(
                                  avatarImages[index]!.size /
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
                              setAvatarImages((prev) => {
                                const updated = [...prev];
                                updated[index] = file;
                                return updated;
                              });
                            }
                          }}
                          onClick={() => fileInputRefs.current[index]?.click()}
                          className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors cursor-pointer group ${isDragging === index ? "border-[#0A0F29] border-solid bg-gray-100" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}
                        >
                          <div
                            className={`p-2.5 rounded-full shadow-sm ring-1 ring-gray-100 mb-2 transition-transform ${isDragging === index ? "bg-[#0A0F29] text-white scale-110" : "bg-white text-[#0A0F29] group-hover:scale-110"}`}
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

              <button
                onClick={addTestimonial}
                className="col-span-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Testimonial
              </button>

              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-4">
                Footer CTA Section
              </h1>
              <InputField
                label="Footer CTA Text"
                name="footerCtaText"
                value={formData.footerCtaText || ""}
                onChange={handleChange}
                placeholder="e.g. See how impactful design makes a difference?"
                containerClassName="col-span-2"
              />
              <InputField
                label="Button Label"
                name="footerButtonLabel"
                value={formData.footerButtonLabel || ""}
                onChange={handleChange}
                placeholder="e.g. SCHEDULE A CALL"
              />
              <InputField
                label="Button URL"
                name="footerButtonUrl"
                value={formData.footerButtonUrl || ""}
                onChange={handleChange}
                placeholder="e.g. https://calendar.google.com/..."
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
