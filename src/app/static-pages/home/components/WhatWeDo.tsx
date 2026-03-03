"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";

export default function WhatWeDo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="What We Do Section"
          description="Manage the services and content displayed in the What We Do section."
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
                defaultValue="What We Do"
                containerClassName="col-span-2"
              />

              <InputField label="Headline (Part 1)" defaultValue="End-to-End" />
              <InputField label="Headline Highlight" defaultValue="Solutions" />
              <InputField
                label="Headline (Part 2)"
                defaultValue="for Your Digital Journey."
                containerClassName="col-span-2"
              />

              <TextAreaField
                label="Main Description"
                defaultValue="From initial concept to final deployment, we provide a full spectrum of digital services tailored to your unique business needs."
                containerClassName="col-span-2"
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Services (Up to 5)
              </h1>

              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50"
                >
                  <h2 className="text-sm font-semibold text-gray-700">
                    Service {num}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Short Title (Vertical Text)"
                      placeholder="e.g. Web Dev"
                      containerClassName="col-span-1"
                    />
                    <InputField
                      label="Full Title"
                      placeholder="e.g. Web Development"
                      containerClassName="col-span-1"
                    />
                    <TextAreaField
                      label="Description"
                      rows={2}
                      containerClassName="col-span-2"
                      placeholder="e.g. Scalable, high-performance websites built with modern tech."
                    />
                    <ImageUploadField
                      label="Service Image"
                      maxImages={1}
                      containerClassName="col-span-2"
                    />
                  </div>
                </div>
              ))}

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Bottom CTA Section
              </h1>

              <TextAreaField
                label="CTA Headline"
                defaultValue="We deliver the fastest engineering solutions for your business. 👉"
                containerClassName="col-span-2"
                rows={2}
              />

              <InputField
                label="Button Label"
                defaultValue="View All Services"
              />
              <InputField
                label="Button URL"
                defaultValue="/service/website-design-development"
              />

              <SaveButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
