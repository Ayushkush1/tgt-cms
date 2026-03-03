"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";

export default function OurTeam() {
  const [isOpen, setIsOpen] = useState(false);

  // We are simulating an array of team members here for the CMS view.
  // In a real implementation this would come from a database.
  const [members, setMembers] = useState([
    {
      name: "Meghna Tiwari",
      designation: "Founder & CEO",
      col: 3,
      image: "/images/Meghna.jpg",
    },
    {
      name: "Saubhagya R Swain",
      designation: "Co-Founder/Director",
      col: 2,
      image: "/images/Saubhagya.jpg",
    },
  ]);

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Our Team Section"
          description="Manage the heading text and the team members displayed in the grid."
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
              {/* --- Section Content --- */}
              <h1 className="text-base font-bold text-gray-500 col-span-2 mt-2">
                Section Content
              </h1>
              <InputField
                label="Eyebrow Text (Top Label)"
                defaultValue="Meet Our Team"
              />
              <InputField
                label="Heading Line 1"
                defaultValue="People Behind Our"
              />
              <InputField
                label="Heading Line 2"
                defaultValue="Growth Driving Innovation"
              />
              <TextAreaField
                label="Description text"
                defaultValue="The Gold Technologies, our team is made up of passionate creators, strategists, and engineers committed to building impactful digital solutions and delivering real value to our clients."
                containerClassName="col-span-2"
              />

              {/* --- Team Members Repeater --- */}
              <div className="col-span-2 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-base font-bold text-gray-500">
                    Team Members
                  </h1>
                  <button
                    onClick={() =>
                      setMembers([
                        ...members,
                        {
                          name: "New Member",
                          designation: "Role",
                          col: 0,
                          image: "",
                        },
                      ])
                    }
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-lg font-medium transition-colors"
                  >
                    + Add Member
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {members.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-4 border border-gray-100 rounded-xl bg-gray-50 grid grid-cols-2 gap-4"
                    >
                      <InputField label="Name" defaultValue={member.name} />
                      <InputField
                        label="Designation"
                        defaultValue={member.designation}
                      />
                      <InputField
                        label="Column Position (0-7)"
                        defaultValue={member.col.toString()}
                      />
                      <InputField
                        label="LinkedIn URL"
                        defaultValue="https://linkedin.com/"
                      />
                      <div className="col-span-2">
                        <ImageUploadField label="Profile Image" />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={() => {
                            const newMembers = [...members];
                            newMembers.splice(idx, 1);
                            setMembers(newMembers);
                          }}
                          className="text-red-500 text-sm font-medium hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
