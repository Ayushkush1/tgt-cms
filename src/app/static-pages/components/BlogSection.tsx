"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";

export default function BlogSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Blog Highlights Section"
          description="Manage the featured blog posts and header content displayed on the page."
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
                defaultValue="Our Blog"
                containerClassName="col-span-2"
              />

              <InputField label="Headline (Part 1)" defaultValue="Insights &" />
              <InputField
                label="Headline (Highlight)"
                defaultValue="Perspectives"
              />

              <InputField
                label="View All Button Label"
                defaultValue="View All Articles"
              />
              <InputField label="View All Button URL" defaultValue="/blog" />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Featured Blogs (Up to 3)
              </h1>

              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50"
                >
                  <h2 className="text-sm font-semibold text-gray-700">
                    Featured Blog {num}
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Category"
                      placeholder="e.g. Tech Trends"
                      containerClassName="col-span-1"
                    />
                    <InputField
                      label="Title"
                      placeholder="e.g. Future of AI in Web Development"
                      containerClassName="col-span-1"
                    />

                    <TextAreaField
                      label="Excerpt"
                      rows={2}
                      containerClassName="col-span-2"
                      placeholder="e.g. How artificial intelligence is reshaping digital platforms..."
                    />

                    <InputField
                      label="Author Name"
                      placeholder="e.g. Sarah Jenkins"
                      containerClassName="col-span-1"
                    />
                    <InputField
                      label="Date Published"
                      placeholder="e.g. 2 Days ago"
                      containerClassName="col-span-1"
                    />

                    <InputField
                      label="Read Time"
                      placeholder="e.g. 5m"
                      containerClassName="col-span-1"
                    />
                    <InputField
                      label="Views count"
                      placeholder="e.g. 1.2k"
                      containerClassName="col-span-1"
                    />

                    <ImageUploadField
                      label="Blog Cover Image"
                      maxImages={1}
                      containerClassName="col-span-2"
                    />
                  </div>
                </div>
              ))}

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
