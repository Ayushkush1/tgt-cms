"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

export default function EnquirySection() {
  const [isOpen, setIsOpen] = useState(false);

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
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className=" grid grid-cols-2 gap-4 pt-2">
              <h1 className=" text-base font-bold text-gray-500 col-span-2">
                Header & Intro text
              </h1>

              <InputField
                label="Upper Tag"
                defaultValue="Contact Us"
                containerClassName="col-span-2"
              />

              <InputField
                label="Headline (Part 1)"
                defaultValue="Let's build"
              />
              <InputField
                label="Headline (Highlight - Italic)"
                defaultValue="something amazing"
              />

              <TextAreaField
                label="Intro Description"
                defaultValue="Have a project in mind? We'd love to hear about it. Send us a message and we'll get back to you within 24 hours."
                containerClassName="col-span-2"
                rows={2}
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Contact Information
              </h1>

              <InputField
                label="Email Address"
                defaultValue="hello@thegoldtech.com"
                containerClassName="col-span-1"
              />
              <InputField
                label="Phone Number"
                defaultValue="+1 (555) 123-4567"
                containerClassName="col-span-1"
              />
              <TextAreaField
                label="Physical Address"
                defaultValue="123 Innovation Dr, Tech City, CA"
                containerClassName="col-span-2"
                rows={2}
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Form Configuration
              </h1>

              <TextAreaField
                label="'I'm interested in...' Options (Comma separated)"
                defaultValue="Web Development, Mobile App, UI/UX Design, Consulting, Other"
                containerClassName="col-span-2"
                rows={2}
              />

              <TextAreaField
                label="'Project Budget' Options (Comma separated)"
                defaultValue="$5k - $10k, $10k - $25k, $25k - $50k, $50k+, Not sure yet"
                containerClassName="col-span-2"
                rows={2}
              />

              <InputField
                label="Submit Button Text"
                defaultValue="SEND MESSAGE"
                containerClassName="col-span-2"
              />

              <div className="col-span-2 mt-2">
                <SaveButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
