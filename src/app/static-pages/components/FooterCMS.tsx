"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

export default function FooterCMS() {
  const [isOpen, setIsOpen] = useState(false);

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
                defaultValue="THE GOLD TECHNOLOGIES"
                containerClassName="col-span-1"
              />
              <InputField
                label="Company Initials"
                defaultValue="GT"
                containerClassName="col-span-1"
              />

              <TextAreaField
                label="Footer Description/Tagline"
                defaultValue="Empowering visionaries with cutting-edge digital solutions. We turn complex challenges into elegant, scalable technology."
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
                <InputField label="Country/Region" defaultValue="INDIA" />
                <TextAreaField
                  label="Full Address"
                  defaultValue="SD-369, D block, Shastri Nagar, Ghaziabad, Uttar Pradesh, India - 201002"
                  rows={3}
                />
              </div>

              {/* USA */}
              <div className="col-span-2 md:col-span-1 border border-gray-100 rounded-xl p-4 bg-gray-50/50 flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-gray-700">
                  Location 2
                </h2>
                <InputField label="Country/Region" defaultValue="USA" />
                <TextAreaField
                  label="Full Address"
                  defaultValue="Accessible minds 1309- Coffeen Avenue, STE 1200 Sheridan Wyoming- 82801, USA"
                  rows={3}
                />
              </div>

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Global Contact Info
              </h1>

              <InputField
                label="Phone Number"
                defaultValue="+91 8368198551"
                containerClassName="col-span-1"
              />
              <InputField
                label="Email Address"
                defaultValue="info@thegoldtechnologies.com"
                containerClassName="col-span-1"
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Background Massive Text
              </h1>

              <InputField label="Left Text" defaultValue="THE" />
              <InputField label="Right Text" defaultValue="NOLOGIES" />
              <InputField
                label="Center Main Text"
                defaultValue="GOLD TECH"
                containerClassName="col-span-2"
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Social Media Links
              </h1>

              <InputField
                label="Facebook URL"
                placeholder="https://facebook.com/..."
              />
              <InputField
                label="Twitter/X URL"
                placeholder="https://twitter.com/..."
              />
              <InputField
                label="Instagram URL"
                placeholder="https://instagram.com/..."
              />
              <InputField
                label="LinkedIn URL"
                placeholder="https://linkedin.com/in/..."
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
