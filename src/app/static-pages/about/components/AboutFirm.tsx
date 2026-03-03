"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";

export default function AboutFirm() {
  // Controls the expanded/collapsed state of the accordion form (default: closed)
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      {/* Accordion Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        {/* Accordion Header (Click to toggle) */}
        <SectionHeader
          title="About Firm Section"
          description="Manage the content displayed on the About Firm section."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        {/* 
            Accordion Body with CSS Grid Transition Effect 
            Uses 'grid-rows-[1fr]' to expand naturally and 'grid-rows-[0fr]' to collapse smoothly.
        */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          {/* overflow-hidden is required to hide the content when grid-rows collapses to 0 */}
          <div className="overflow-hidden">
            <div className=" grid grid-cols-2 gap-4 pt-2">
              <InputField label="Top Label" defaultValue="Who We Are" />
              <InputField
                label="Heading"
                defaultValue="The \n Gold \n Technologies"
              />

              <TextAreaField
                label="Paragraph 1"
                defaultValue="We are a dynamic IT solutions and consulting firm dedicated to empowering businesses through technology-driven solutions. With a client-focused approach and a commitment to innovation, we specialize in transforming our clients' digital journeys."
                containerClassName="col-span-2"
              />

              <TextAreaField
                label="Paragraph 2"
                defaultValue="Since 2015, we have been your dedicated partner in the digital age — providing comprehensive IT consultation and cutting-edge solutions to help you navigate the ever-evolving landscape of technology."
                containerClassName="col-span-2"
              />

              <InputField
                label="CTA Button Label"
                defaultValue="Get in touch"
              />
              <InputField label="CTA Button URL" defaultValue="/contactUs" />

              <div className="col-span-2">
                <ImageUploadField label="Section Image" />
              </div>

              <SaveButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
