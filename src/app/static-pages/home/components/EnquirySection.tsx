"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

const SECTION_KEY = "EnquirySection";

const defaultFormData = {
  upperTag: "",
  headlinePart1: "",
  headlineHighlight: "",
  introDescription: "",
  email: "",
  phone: "",
  address: "",
  interestedInOptions: "",
  budgetOptions: "",
  submitButtonText: "",
};

export default function EnquirySection() {
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

  const handleSave = async () => {
    const required: Array<[string, string]> = [
      ["upperTag", "Upper Tag"],
      ["headlinePart1", "Headline (Part 1)"],
      ["introDescription", "Intro Description"],
      ["email", "Email Address"],
      ["phone", "Phone Number"],
      ["submitButtonText", "Submit Button Text"],
    ];
    const errs = required
      .filter(([key]) => !formData[key as keyof typeof formData]?.trim())
      .map(([, label]) => `${label} is required`);
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
      if (json.success) {
        toast.success("Enquiry section saved!", { id: toastId });
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
          title="Enquiry / Contact Section"
          description="Manage the contact information, copy, and form options shown in the Contact Us section."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
        <div
          className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <h1 className="text-base font-bold text-gray-500 col-span-2">
                Header &amp; Intro text
              </h1>
              <InputField
                label="Upper Tag"
                name="upperTag"
                value={formData.upperTag}
                onChange={handleChange}
                placeholder="e.g. Contact Us"
                containerClassName="col-span-2"
                required
              />
              <InputField
                label="Headline (Part 1)"
                name="headlinePart1"
                value={formData.headlinePart1}
                onChange={handleChange}
                placeholder="e.g. Let's build"
                required
              />
              <InputField
                label="Headline (Highlight - Italic)"
                name="headlineHighlight"
                value={formData.headlineHighlight}
                onChange={handleChange}
                placeholder="e.g. something amazing"
              />
              <TextAreaField
                label="Intro Description"
                name="introDescription"
                value={formData.introDescription}
                onChange={handleChange}
                placeholder="e.g. Have a project in mind? We'd love to hear about it."
                containerClassName="col-span-2"
                rows={2}
                required
              />

              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-4">
                Contact Information
              </h1>
              <InputField
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. hello@thegoldtech.com"
                containerClassName="col-span-1"
                required
              />
              <InputField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +1 (555) 123-4567"
                containerClassName="col-span-1"
                required
              />
              <TextAreaField
                label="Physical Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 123 Innovation Dr, Tech City, CA"
                containerClassName="col-span-2"
                rows={2}
              />

              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-4">
                Form Configuration
              </h1>
              <TextAreaField
                label="'I'm interested in...' Options (Comma separated)"
                name="interestedInOptions"
                value={formData.interestedInOptions}
                onChange={handleChange}
                placeholder="e.g. Web Development, Mobile App, UI/UX Design, Consulting, Other"
                containerClassName="col-span-2"
                rows={2}
              />
              <TextAreaField
                label="'Project Budget' Options (Comma separated)"
                name="budgetOptions"
                value={formData.budgetOptions}
                onChange={handleChange}
                placeholder="e.g. $5k - $10k, $10k - $25k, $25k - $50k, $50k+, Not sure yet"
                containerClassName="col-span-2"
                rows={2}
              />
              <InputField
                label="Submit Button Text"
                name="submitButtonText"
                value={formData.submitButtonText}
                onChange={handleChange}
                placeholder="e.g. SEND MESSAGE"
                containerClassName="col-span-2"
                required
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
