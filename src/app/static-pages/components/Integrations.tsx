"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";

export default function Integrations() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Integrations & Stats Section"
          description="Manage the content displayed in the center of the Integrations section."
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
                Center Content Section
              </h1>

              <InputField
                label="Headline (Part 1)"
                defaultValue="Home to the world's"
                containerClassName="col-span-1"
              />
              <InputField
                label="Headline (Part 2)"
                defaultValue="software teams"
                containerClassName="col-span-1"
              />

              <TextAreaField
                label="Main Description"
                defaultValue="Meet your developers where they already are. We integrate with over 50+ industry leading tools to create the perfect ecosystem."
                containerClassName="col-span-2"
                rows={3}
              />

              <h1 className=" text-base font-bold text-gray-500 col-span-2 mt-4">
                Stats Counters (3 items)
              </h1>

              {/* Stat 1 */}
              <div className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700">Stat 1</h2>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Value (Number)" defaultValue="50" />
                  <InputField label="Suffix" defaultValue="+" />
                  <InputField label="Label (Line 1)" defaultValue="Happy" />
                  <InputField label="Label (Line 2)" defaultValue="Clients" />
                </div>
              </div>

              {/* Stat 2 */}
              <div className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700">Stat 2</h2>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Value (Number)" defaultValue="70" />
                  <InputField label="Suffix" defaultValue="+" />
                  <InputField label="Label (Line 1)" defaultValue="Completed" />
                  <InputField label="Label (Line 2)" defaultValue="Projects" />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700">Stat 3</h2>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Value (Number)" defaultValue="7" />
                  <InputField label="Suffix" defaultValue="+" />
                  <InputField label="Label (Line 1)" defaultValue="Countries" />
                  <InputField label="Label (Line 2)" defaultValue="Served" />
                </div>
              </div>

              <SaveButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
