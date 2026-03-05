"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

const SECTION_KEY = "FooterCMS";

const defaultFormData = {
  companyName: "",
  companyInitials: "",
  footerDescription: "",
  loc1Country: "",
  loc1Address: "",
  loc2Country: "",
  loc2Address: "",
  phoneNumber: "",
  emailAddress: "",
  leftText: "",
  rightText: "",
  centerText: "",
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
};

export default function FooterCMS() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchWithCache("/api/home")
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
    const errs: string[] = [];
    if (!formData.companyName.trim()) errs.push("Company Name is required");
    if (!formData.emailAddress.trim()) errs.push("Email Address is required");

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
        ? toast.success("Footer details saved!", { id: toastId })
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
          title="Global Footer Section"
          description="Manage the company information, addresses, navigation links, and social URLs displayed in the footer."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className=" grid grid-cols-2 gap-4 pt-2">
              <h1 className=" text-base font-bold text-gray-500 col-span-2">
                Brand Details
              </h1>

              <InputField
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                containerClassName="col-span-1"
                required
              />
              <InputField
                label="Company Initials"
                name="companyInitials"
                value={formData.companyInitials}
                onChange={handleChange}
                containerClassName="col-span-1"
              />

              <TextAreaField
                label="Footer Description/Tagline"
                name="footerDescription"
                value={formData.footerDescription}
                onChange={handleChange}
                containerClassName="col-span-2"
                rows={2}
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Office Locations
              </h1>

              {/* India */}
              <div className="col-span-2 md:col-span-1 border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-gray-700">
                  Location 1
                </h2>
                <InputField
                  label="Country/Region"
                  name="loc1Country"
                  value={formData.loc1Country}
                  onChange={handleChange}
                />
                <TextAreaField
                  label="Full Address"
                  name="loc1Address"
                  value={formData.loc1Address}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* USA */}
              <div className="col-span-2 md:col-span-1 border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-gray-700">
                  Location 2
                </h2>
                <InputField
                  label="Country/Region"
                  name="loc2Country"
                  value={formData.loc2Country}
                  onChange={handleChange}
                />
                <TextAreaField
                  label="Full Address"
                  name="loc2Address"
                  value={formData.loc2Address}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Global Contact Info
              </h1>

              <InputField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                containerClassName="col-span-1"
              />
              <InputField
                label="Email Address"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                containerClassName="col-span-1"
                required
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Background Massive Text
              </h1>

              <InputField
                label="Left Text"
                name="leftText"
                value={formData.leftText}
                onChange={handleChange}
              />
              <InputField
                label="Right Text"
                name="rightText"
                value={formData.rightText}
                onChange={handleChange}
              />
              <InputField
                label="Center Main Text"
                name="centerText"
                value={formData.centerText}
                onChange={handleChange}
                containerClassName="col-span-2"
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Social Media Links
              </h1>

              <InputField
                label="Facebook URL"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
              />
              <InputField
                label="Twitter/X URL"
                name="twitterUrl"
                value={formData.twitterUrl}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
              />
              <InputField
                label="Instagram URL"
                name="instagramUrl"
                value={formData.instagramUrl}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
              />
              <InputField
                label="LinkedIn URL"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
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
