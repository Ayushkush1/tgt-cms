"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { ImageUploadField } from "@/components/ImageUploadField";

export default function OurPartners() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Our Partners Section"
          description="Manage the marquee of partner logos and header text."
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
                Header Section
              </h1>

              <InputField
                label="Upper Tag"
                defaultValue="Partners"
                containerClassName="col-span-2"
              />

              <InputField label="Headline (Part 1)" defaultValue="Trusted by" />
              <InputField
                label="Headline (Highlight - Italic)"
                defaultValue="Industry Leaders"
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Partner Logos
              </h1>

              <div className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50">
                <ImageUploadField
                  label="Upload Partner Logos"
                  maxImages={10}
                  containerClassName="col-span-2"
                />
                <p className="text-xs text-gray-500 mx-2">
                  Upload SVG or transparent PNG logos for the infinite scrolling
                  marquee. You can select multiple files at once.
                </p>
              </div>

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
