"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { uploadFiles } from "@/lib/uploadHelpers";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  tag: string;
  photo: string;
  linkedin: string;
}

interface TeamData {
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  description: string;
  joinLabel: string;
  joinTitle: string;
  joinUrl: string;
  members: TeamMember[];
}

const DEFAULT_DATA: TeamData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  description: "",
  joinLabel: "",
  joinTitle: "",
  joinUrl: "",
  members: [],
};

const emptyMember = (): TeamMember => ({
  name: "",
  role: "",
  bio: "",
  tag: "",
  photo: "",
  linkedin: "",
});

export function Team() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedMember, setExpandedMember] = useState<number | null>(null);
  const [formData, setFormData] = useState<TeamData>(DEFAULT_DATA);
  const [ourTeamMeta, setOurTeamMeta] = useState<Record<string, unknown>>({});
  const [memberPhotos, setMemberPhotos] = useState<(File | string | null)[]>([]);
  const confirmDelete = useConfirmDelete();

  useEffect(() => {
    let active = true;
    fetchWithCache("/api/about")
      .then((json) => {
        if (!active || !json?.success) return;
        const team = json.data?.Team;
        const legacy = json.data?.OurTeam;
        if (legacy && typeof legacy === "object") {
          setOurTeamMeta(legacy as Record<string, unknown>);
        }

        const rawList = Array.isArray(team?.members)
          ? team.members
          : Array.isArray(legacy?.members)
            ? legacy.members
            : [];

        const normalized: TeamMember[] = rawList.map((m: Record<string, unknown>) => ({
          name: String(m.name || ""),
          role: String(m.role || m.designation || ""),
          bio: String(m.bio || ""),
          tag: String(m.tag || ""),
          photo: String(m.photo || m.imageUrl || ""),
          linkedin: String(m.linkedin || m.linkedinUrl || ""),
        }));

        setFormData({
          ...DEFAULT_DATA,
          ...(team && typeof team === "object" ? team : {}),
          members: normalized,
        });
        setMemberPhotos(normalized.map((m) => m.photo || null));
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  const members = Array.isArray(formData.members) ? formData.members : [];

  const setText =
    (key: keyof TeamData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const updateMember = (idx: number, patch: Partial<TeamMember>) =>
    setFormData((prev) => ({
      ...prev,
      members: members.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    }));

  const removeMember = async (idx: number) => {
    const targetName = members[idx]?.name?.trim() || `Team Member #${idx + 1}`;
    const ok = await confirmDelete({
      title: `Remove "${targetName}"?`,
      message: "This team member will be removed from the About Team section once saved.",
    });
    if (!ok) return;
    setFormData((prev) => ({
      ...prev,
      members: members.filter((_, i) => i !== idx),
    }));
    setMemberPhotos((prev) => prev.filter((_, i) => i !== idx));
    setExpandedMember((prev) =>
      prev === idx ? null : prev !== null && prev > idx ? prev - 1 : prev,
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving Team…");
    try {
      const uploadedPhotos = await uploadFiles(memberPhotos);
      const cleanMembers: TeamMember[] = members
        .map((m, i) => ({
          name: (m.name || "").trim(),
          role: (m.role || "").trim(),
          bio: m.bio || "",
          tag: (m.tag || "").trim(),
          photo: uploadedPhotos[i] || m.photo || "",
          linkedin: (m.linkedin || "").trim(),
        }))
        .filter((m) => m.name || m.role);

      const teamPayload: TeamData = {
        ...formData,
        members: cleanMembers,
      };

      const legacyMembers = cleanMembers.map((m, i) => ({
        name: m.name,
        designation: m.role,
        role: m.role,
        bio: m.bio,
        tag: m.tag,
        col: i,
        linkedinUrl: m.linkedin,
        imageUrl: m.photo,
      }));

      const [teamRes, legacyRes] = await Promise.all([
        fetch("/api/about", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "Team", content: teamPayload }),
        }),
        fetch("/api/about", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "OurTeam",
            content: { ...ourTeamMeta, members: legacyMembers },
          }),
        }),
      ]);

      const [teamJson, legacyJson] = await Promise.all([teamRes.json(), legacyRes.json()]);
      if (!teamRes.ok || !teamJson.success || !legacyRes.ok || !legacyJson.success) {
        throw new Error(teamJson?.error || legacyJson?.error || "Save failed");
      }

      setFormData(teamPayload);
      setMemberPhotos(cleanMembers.map((m) => m.photo || null));
      clearCache("/api/about");
      toast.success("Team saved and published!", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StaticSectionCard
      title="Team"
      description="Leadership & core pillars team header, hiring prompt, and member profiles (first 3 appear in Leadership)."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={handleSave}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (The team)"
        />
        <InputField
          label="Headline Main"
          value={formData.headlineMain || ""}
          onChange={setText("headlineMain")}
          placeholder="e.g. The people"
        />
        <InputField
          label="Gold Italic Highlight"
          value={formData.headlineHighlight || ""}
          onChange={setText("headlineHighlight")}
          placeholder="e.g. behind the work."
        />
        <TextAreaField
          label="Description"
          value={formData.description || ""}
          onChange={setText("description")}
          rows={2}
          containerClassName="md:col-span-3"
          placeholder="Senior strategists, designers, engineers and marketers..."
        />
        <InputField
          label="Hiring Eyebrow"
          value={formData.joinLabel || ""}
          onChange={setText("joinLabel")}
          placeholder="e.g. We're hiring"
        />
        <InputField
          label="Hiring Title"
          value={formData.joinTitle || ""}
          onChange={setText("joinTitle")}
          placeholder="e.g. Your face could be here."
        />
        <InputField
          label="Hiring Link URL"
          value={formData.joinUrl || ""}
          onChange={setText("joinUrl")}
          placeholder="mailto:info@thegoldtechnologies.com..."
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Team Members ({members.length})
          </span>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, members: [...members, emptyMember()] }));
              setMemberPhotos((prev) => [...prev, null]);
              setExpandedMember(members.length);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] hover:bg-amber-100"
          >
            <Plus className="h-3.5 w-3.5" /> Add member
          </button>
        </div>

        {members.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-400">
            No team members added yet.
          </p>
        ) : (
          members.map((member, idx) => (
            <CollapsibleCard
              key={idx}
              badge={`(${String(idx + 1).padStart(2, "0")})`}
              title={member.name || `Team Member #${idx + 1}`}
              subtitle={member.role || undefined}
              isOpen={expandedMember === idx}
              onToggle={() => setExpandedMember(expandedMember === idx ? null : idx)}
              onRemove={() => removeMember(idx)}
            >
              <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2">
                <InputField
                  label="Full Name"
                  value={member.name || ""}
                  onChange={(e) => updateMember(idx, { name: e.target.value })}
                  placeholder="e.g. Meghna Tiwari"
                />
                <InputField
                  label="Role"
                  value={member.role || ""}
                  onChange={(e) => updateMember(idx, { role: e.target.value })}
                  placeholder="e.g. Founder & CEO"
                />
                <InputField
                  label="Tag (Optional)"
                  value={member.tag || ""}
                  onChange={(e) => updateMember(idx, { tag: e.target.value })}
                  placeholder="e.g. Global"
                />
                <InputField
                  label="LinkedIn URL"
                  value={member.linkedin || ""}
                  onChange={(e) => updateMember(idx, { linkedin: e.target.value })}
                  placeholder="https://www.linkedin.com/in/..."
                />
                <TextAreaField
                  label="Short Bio"
                  value={member.bio || ""}
                  onChange={(e) => updateMember(idx, { bio: e.target.value })}
                  rows={2}
                  containerClassName="md:col-span-2"
                  placeholder="One-line bio shown on the team card..."
                />
                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Portrait Photo"
                    images={memberPhotos[idx] ? [memberPhotos[idx]] : []}
                    onImagesChange={(imgs) =>
                      setMemberPhotos((prev) => {
                        const next = [...prev];
                        next[idx] = imgs[0] || null;
                        return next;
                      })
                    }
                    maxImages={1}
                  />
                </div>
              </div>
            </CollapsibleCard>
          ))
        )}
      </div>
    </StaticSectionCard>
  );
}
