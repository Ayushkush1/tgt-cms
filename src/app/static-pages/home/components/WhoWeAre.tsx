"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

export default function WhoWeAre() {
  // Controls the expanded/collapsed state of the accordion form (default: closed)
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      {/* Accordion Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        {/* Accordion Header (Click to toggle) */}
        <SectionHeader
          title="Who We Are Section"
          description="Manage the content displayed on the Who We Are section."
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
              <InputField label="Headline" />

              {/*  */}

              <InputField label="Headline Highlight (Gold/Italic)" />
              <InputField label="Headline Part 3" />

              <TextAreaField
                label="Main Paragraph"
                defaultValue="Professional web development and software solutions for your business. Modern, fast, and built to grow with you."
                containerClassName="col-span-2 mx-2"
              />

              <InputField label="Upper Tag" containerClassName="col-span-2" />

              {/* Primary Action Button */}
              <h1 className=" text-base font-bold text-gray-500 col-span-2">
                Block 1: Digital Innovation
              </h1>

              <InputField label="Headline" containerClassName="col-span-2" />

              <TextAreaField
                label="Description"
                defaultValue="Professional web development and software solutions for your business. Modern, fast, and built to grow with you."
                containerClassName="col-span-2"
              />

              <div className=" col-span-2 mx-2 flex flex-col gap-2">
                <label className=" text-sm font-medium text-gray-700">
                  Bullet Points (Up to 4)
                </label>
                {[...Array(4)].map((_, index) => (
                  <InputField key={index} placeholder={`Bullet ${index + 1}`} />
                ))}
              </div>

              {/* Primary Action Button */}
              <h1 className=" text-base font-bold text-gray-500 col-span-2">
                Block 2: Simple & Accessible
              </h1>

              <InputField label="Headline" containerClassName="col-span-2" />

              <TextAreaField
                label="Description"
                defaultValue="Professional web development and software solutions for your business. Modern, fast, and built to grow with you."
                containerClassName="col-span-2"
              />

              <InputField label="CTA Button Label" />
              <InputField label="CTA Button URL" />

              <SaveButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
