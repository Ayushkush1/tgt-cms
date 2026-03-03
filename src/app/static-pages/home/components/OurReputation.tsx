"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";

export default function OurReputation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Our Reputation Section"
          description="Manage the testimonials and footer content displayed in the Our Reputation block."
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
                defaultValue="Our Reputation"
                containerClassName="col-span-2"
              />

              <InputField label="Headline (Part 1)" defaultValue="Loved by" />
              <InputField
                label="Headline (Highlight 1 - Italic)"
                defaultValue="businesses"
              />

              <InputField
                label="Headline (Part 2)"
                defaultValue="and individuals"
              />
              <InputField
                label="Headline (Highlight 2 - Underlined)"
                defaultValue="across the globe"
              />

              <TextAreaField
                label="Main Description"
                defaultValue="Hear from our partners who have successfully transformed their businesses with our innovative digital solutions."
                containerClassName="col-span-2"
                rows={2}
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Testimonials (Up to 3)
              </h1>

              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50"
                >
                  <h2 className="text-sm font-semibold text-gray-700">
                    Testimonial {num}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Client Name"
                      placeholder="e.g. Sarah Mitchell"
                      containerClassName="col-span-1"
                    />
                    <InputField
                      label="Client Role / Company"
                      placeholder="e.g. CEO, InnovateCo"
                      containerClassName="col-span-1"
                    />

                    <TextAreaField
                      label="Quote block"
                      rows={2}
                      containerClassName="col-span-2"
                      placeholder="e.g. Working with The Gold Technologies was a game-changer..."
                    />

                    <ImageUploadField
                      label="Client Avatar Image"
                      maxImages={1}
                      containerClassName="col-span-2"
                    />
                  </div>
                </div>
              ))}

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Footer CTA Section
              </h1>
              <InputField
                label="Footer CTA Text"
                defaultValue="See how impactful design makes a difference?"
                containerClassName="col-span-2"
              />
              <InputField label="Button Label" defaultValue="SCHEDULE A CALL" />
              <InputField
                label="Button URL"
                defaultValue="https://calendar.app.google/5nNHP69fUR5WEMvt9"
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
