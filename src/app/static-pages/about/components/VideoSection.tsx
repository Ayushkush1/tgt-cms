"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

export default function VideoSection() {
  const [isOpen, setIsOpen] = useState(false);

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
              <InputField label="Heading Part 1" defaultValue="Innovation " />
              <InputField
                label="Heading Highlight (Italic/Gold)"
                defaultValue="Crafted"
              />
              <InputField label="Heading Part 2" defaultValue="With " />
              <InputField
                label="Heading Highlight (Underlined)"
                defaultValue="Excellence"
              />

              <TextAreaField
                label="Description Text"
                defaultValue="We help businesses innovate, grow, and scale through smart, reliable technology solutions tailored for real results."
                containerClassName="col-span-2"
              />

              <InputField
                label="Video URL (Embed)"
                defaultValue="https://www.youtube.com/embed/Zp1fuVhlP6o?si=M7ocbQbSEnPKZ0EQ"
                containerClassName="col-span-2"
              />

              <SaveButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
