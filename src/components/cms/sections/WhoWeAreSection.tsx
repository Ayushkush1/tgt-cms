"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

const defaultFormData = {
  headline: "",
  headlineHighlight: "",
  headlinePart3: "",
  headlinePart4: "",
  mainParagraph: "",
  upperTag: "",
  block1Headline: "",
  block1Description: "",
  block1Bullets: ["", "", "", ""],
  block2Headline: "",
  block2Description: "",
  block2CtaLabel: "",
  block2CtaUrl: "",
  block2HeadlineHighlight: "",
};

interface WhoWeAreSectionProps {
  sectionId?: string;
  initialData?: Record<string, unknown>;
  saveUrl?: string; // e.g. /api/home or /api/sections
  onSave?: (data: Record<string, unknown>) => void;
}

export function WhoWeAreSection({
  sectionId,
  initialData,
  saveUrl = "/api/home",
  onSave,
}: WhoWeAreSectionProps) {
  const [isOpen, setIsOpen] = useState(!initialData); // Default open in builder, closed in static
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      const data = { ...defaultFormData, ...initialData };
      if (!data.block1Bullets) {
        data.block1Bullets = [
          ((data as Record<string, unknown>).block1Bullet1 as string) || "",
          ((data as Record<string, unknown>).block1Bullet2 as string) || "",
          ((data as Record<string, unknown>).block1Bullet3 as string) || "",
          ((data as Record<string, unknown>).block1Bullet4 as string) || "",
        ];
      }
      setFormData(data);
    } else if (saveUrl === "/api/home") {
      fetchWithCache("/api/home")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((json: Record<string, any>) => {
          if (json.success && json.data?.WhoWeAre) {
            const data = json.data.WhoWeAre;
            if (!data.block1Bullets) {
              data.block1Bullets = [
                data.block1Bullet1 || "",
                data.block1Bullet2 || "",
                data.block1Bullet3 || "",
                data.block1Bullet4 || "",
              ];
            }
            setFormData((prev) => ({ ...prev, ...data }));
          }
        })
        .catch(console.error);
    }
  }, [initialData, saveUrl]);

  const handleBulletChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newBullets = [...prev.block1Bullets];
      newBullets[index] = value;
      return { ...prev, block1Bullets: newBullets };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const required: Array<[string, string]> = [
      ["headline", "Headline"],
      ["mainParagraph", "Main Paragraph"],
      ["block1Headline", "Block 1 Headline"],
      ["block2Headline", "Block 2 Headline"],
    ];
    const errs = required
      .filter(([key]) => {
        const value = formData[key as keyof typeof formData];
        return typeof value === "string" && !value.trim();
      })
      .map(([, label]) => `${label} is required`);

    if (errs.length > 0) {
      errs.forEach((msg) => toast.error(msg));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const body = sectionId
        ? { id: sectionId, content: formData }
        : { section: "WhoWeAre", content: formData };

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
        toast.success("Who We Are section saved!", { id: toastId });
        if (onSave) onSave(formData as unknown as Record<string, unknown>);
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
        <SectionHeader
          title="Who We Are Section"
          description="Manage the content displayed on the Who We Are section."
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
              <InputField
                label="Headline"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. We Are"
                required
              />
              <InputField
                label="Headline Highlight"
                name="headlineHighlight"
                value={formData.headlineHighlight}
                onChange={handleChange}
                placeholder="e.g. The Gold Technologies"
              />
              <InputField
                label="Headline Part 3"
                name="headlinePart3"
                value={formData.headlinePart3}
                onChange={handleChange}
                placeholder="e.g. That Drive"
              />
              <InputField
                label="Headline Part 4"
                name="headlinePart4"
                value={formData.headlinePart4}
                onChange={handleChange}
                placeholder="e.g. Real Growth"
              />
              <TextAreaField
                label="Main Paragraph"
                name="mainParagraph"
                value={formData.mainParagraph}
                onChange={handleChange}
                placeholder="e.g. Professional web development and software solutions for your business."
                containerClassName="col-span-2"
                required
              />
              <InputField
                label="Upper Tag"
                name="upperTag"
                value={formData.upperTag}
                onChange={handleChange}
                placeholder="e.g. About Us"
                containerClassName="col-span-2"
              />

              <div className="col-span-2 grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <h3 className="col-span-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Block 1: Digital Innovation
                </h3>
                <InputField
                  label="Headline"
                  name="block1Headline"
                  value={formData.block1Headline}
                  onChange={handleChange}
                  placeholder="e.g. Digital Innovation"
                  containerClassName="col-span-2"
                  required
                />
                <TextAreaField
                  label="Description"
                  name="block1Description"
                  value={formData.block1Description}
                  onChange={handleChange}
                  placeholder="e.g. We craft cutting-edge digital experiences..."
                  containerClassName="col-span-2"
                />
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  {formData.block1Bullets.map((bullet, i) => (
                    <InputField
                      key={i}
                      label={`Bullet ${i + 1}`}
                      name={`bullet-${i}`}
                      value={bullet}
                      onChange={(e) => handleBulletChange(i, e.target.value)}
                      placeholder={`Bullet ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <h3 className="col-span-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Block 2: Simple & Accessible
                </h3>
                <InputField
                  label="Headline"
                  name="block2Headline"
                  value={formData.block2Headline}
                  onChange={handleChange}
                  placeholder="e.g. Simple & Accessible"
                  required
                />
                <InputField
                  label="Headline Highlight"
                  name="block2HeadlineHighlight"
                  value={formData.block2HeadlineHighlight}
                  onChange={handleChange}
                  placeholder="e.g. Simple & Accessible"
                />
                <TextAreaField
                  label="Description"
                  name="block2Description"
                  value={formData.block2Description}
                  onChange={handleChange}
                  placeholder="e.g. We make technology accessible to everyone..."
                  containerClassName="col-span-2"
                />
                <InputField
                  label="CTA Label"
                  name="block2CtaLabel"
                  value={formData.block2CtaLabel}
                  onChange={handleChange}
                  placeholder="e.g. Learn More"
                />
                <InputField
                  label="CTA URL"
                  name="block2CtaUrl"
                  value={formData.block2CtaUrl}
                  onChange={handleChange}
                  placeholder="e.g. /about"
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
        </div>
      </div>
    </section>
  );
}
