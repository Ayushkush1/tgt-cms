"use client";
import { useState, useEffect } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadFiles } from "@/lib/uploadHelpers";

const SECTION_KEY = "OurTeam";

interface TeamMember {
  name: string;
  designation: string;
  col: number;
  linkedinUrl: string;
  image: (File | string | null)[];
}

const defaultMember = (): TeamMember => ({
  name: "",
  designation: "",
  col: 0,
  linkedinUrl: "",
  image: [],
});

const defaultFormData = {
  topLabel: "",
  headingLine1: "",
  headingLine2: "",
  descriptionText: "",
  members: [defaultMember()] as TeamMember[],
};

export default function OurTeam() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchWithCache("/api/about")
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          const data = json.data[SECTION_KEY];
          const parsedMembers = Array.isArray(data.members)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (data.members as Record<string, any>[]).map((m) => ({
                ...m,
                image: m.imageUrl ? [m.imageUrl as string] : [],
              }))
            : [defaultMember()];

          setFormData({
            ...defaultFormData,
            ...data,
            members: parsedMembers,
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (
    index: number,
    field: keyof TeamMember,
    value: TeamMember[keyof TeamMember],
  ) => {
    setFormData((prev) => {
      const updated = [...prev.members];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, members: updated };
    });
  };

  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, defaultMember()],
    }));
  };

  const removeMember = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleSave = async () => {
    const errs: string[] = [];
    if (!formData.headingLine1?.trim()) errs.push("Heading Line 1 is required");

    formData.members.forEach((m, i) => {
      if (!m.name.trim()) errs.push(`Member ${i + 1} Name is required`);
    });

    if (errs.length > 0) {
      errs.forEach((m) => toast.error(m));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");

    try {
      // Process images for all members
      const processedMembers = await Promise.all(
        formData.members.map(async (member) => {
          const uploadedUrls = await uploadFiles(member.image);
          const validUrl = uploadedUrls.find((url) => url !== null) || null;
          return {
            name: member.name,
            designation: member.designation,
            col: Number(member.col) || 0,
            linkedinUrl: member.linkedinUrl,
            imageUrl: validUrl, // Keep standard URL reference in DB
          };
        }),
      );

      const payload = {
        topLabel: formData.topLabel,
        headingLine1: formData.headingLine1,
        headingLine2: formData.headingLine2,
        descriptionText: formData.descriptionText,
        members: processedMembers,
      };

      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Our Team section saved!", { id: toastId });
      } else {
        toast.error("Save failed. Please try again.", { id: toastId });
      }
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all">
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
          <div className={isOpen ? "overflow-visible" : "overflow-hidden"}>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <h1 className="col-span-2 mt-2 text-base font-bold text-gray-500">Section Content</h1>
              <InputField
                label="Eyebrow Text (Top Label)"
                name="topLabel"
                value={formData.topLabel}
                onChange={handleChange}
                placeholder="e.g. Meet Our Team"
                containerClassName="col-span-2"
              />

              <InputField
                label="Heading"
                name="headingLine1"
                value={formData.headingLine1}
                onChange={handleChange}
                placeholder="e.g. Growth Driving Innovation"
                containerClassName="col-span-2"
              />
              <TextAreaField
                label="Description text"
                name="descriptionText"
                value={formData.descriptionText}
                onChange={handleChange}
                placeholder="e.g. The Gold Technologies, our team is made up of..."
                containerClassName="col-span-2"
                rows={3}
              />

              {/* --- Team Members Repeater --- */}
              <div className="col-span-2 mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h1 className="text-base font-bold text-gray-500">Team Members</h1>
                  <span className="text-sm font-medium text-gray-400">
                    {formData.members.length} mapped
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {formData.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-2 gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="col-span-2 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-700">
                          Team Member {idx + 1}
                        </h2>
                        {formData.members.length > 1 && (
                          <button
                            onClick={() => removeMember(idx)}
                            className="flex items-center gap-1.5 rounded-md bg-red-50 p-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        )}
                      </div>
                      <InputField
                        label="Name"
                        value={member.name}
                        onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                        placeholder="e.g. Meghna Tiwari"
                        required
                        className="bg-white"
                      />
                      <InputField
                        label="Designation"
                        value={member.designation}
                        onChange={(e) => handleMemberChange(idx, "designation", e.target.value)}
                        placeholder="e.g. Founder & CEO"
                        className="bg-white"
                      />
                      <InputField
                        label="Column Position (0-7)"
                        value={member.col.toString()}
                        onChange={(e) => handleMemberChange(idx, "col", e.target.value)}
                        placeholder="e.g. 3"
                        type="number"
                        className="bg-white"
                      />
                      <InputField
                        label="LinkedIn URL"
                        value={member.linkedinUrl}
                        onChange={(e) => handleMemberChange(idx, "linkedinUrl", e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="bg-white"
                      />
                      <div className="col-span-2">
                        <ImageUploadField
                          label="Profile Image"
                          images={member.image}
                          onImagesChange={(imgs) => handleMemberChange(idx, "image", imgs)}
                          maxImages={1}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addMember}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 font-medium text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" /> Add Team Member
                </button>
              </div>

              <SaveButton onClick={handleSave} disabled={isSaving} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
