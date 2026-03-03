"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

export default function VisionSection() {
  const [isOpen, setIsOpen] = useState(false);

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
              {/* --- Header Section --- */}
              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-2">
                Section Header
              </h1>
              <InputField
                label="Eyebrow Text (Top Label)"
                defaultValue="Our Foundation"
              />
              <InputField label="Heading Part 1" defaultValue="The " />
              <InputField
                label="Heading Highlight (Italic/Gold)"
                defaultValue="Expertise"
              />
              <InputField label="Heading Part 2" defaultValue="Driving " />
              <InputField
                label="Heading Highlight 2 (Underlined)"
                defaultValue="Innovation"
              />

              <InputField
                label="Description Bold Intro"
                defaultValue="At The Gold Technologies"
                containerClassName="col-span-2"
              />
              <TextAreaField
                label="Header Description"
                defaultValue=", we combine strategy, technology, and industry insight to build secure, scalable systems that power long-term business growth."
                containerClassName="col-span-2"
              />

              {/* --- Block 1: Search Feature --- */}
              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-6">
                Block 1: Your Partner
              </h1>
              <InputField
                label="Block 1 Heading"
                defaultValue="Your Partner in Digital Innovation"
                containerClassName="col-span-2"
              />
              <TextAreaField
                label="Block 1 Description"
                defaultValue="To establish ourselves as a trusted leader in IT solutions, empowering businesses to confidently embrace technology and excel in a rapidly evolving digital landscape."
                containerClassName="col-span-2"
              />

              <div className="col-span-2 mx-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Checklist Items (Block 1)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    placeholder="Item 1"
                    defaultValue="Industry Leadership"
                  />
                  <InputField
                    placeholder="Item 2"
                    defaultValue="Sustainable Growth"
                  />
                  <InputField
                    placeholder="Item 3"
                    defaultValue="Future-Ready Strategy"
                  />
                  <InputField
                    placeholder="Item 4"
                    defaultValue="Innovation Driven"
                  />
                </div>
              </div>

              {/* --- Block 2: Download Feature --- */}
              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-6">
                Block 2: Delivering Smart
              </h1>
              <InputField
                label="Block 2 Heading"
                defaultValue="Delivering Smart That Drive Growth"
                containerClassName="col-span-2"
              />
              <TextAreaField
                label="Block 2 Description"
                defaultValue="To deliver innovative and scalable IT solutions that optimize processes, enhance security, and inspire innovation, enabling businesses to thrive in a tech-driven world"
                containerClassName="col-span-2"
              />

              <InputField label="CTA Button Label" defaultValue="Learn More" />
              <InputField label="CTA Button URL" defaultValue="#" />

              <div className="col-span-2 mt-4">
                <SaveButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
