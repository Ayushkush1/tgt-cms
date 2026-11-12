"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GripVertical, Plus } from "lucide-react";
import { SelectField } from "@/components/SelectField";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { uploadFiles } from "@/lib/uploadHelpers";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import {
  StaticSectionCard,
  saveCustomSection,
  type SectionInstanceProps,
} from "@/app/components/StaticSectionCard";

/** Where a member shows on the About page. */
type TeamGroup = "leadership" | "pillars";

const GROUPS: { id: TeamGroup; label: string; hint: string }[] = [
  { id: "leadership", label: "Leadership", hint: "Larger cards at the top of the Team section." },
  { id: "pillars", label: "Our Pillars", hint: "The core team, below Leadership." },
];

/** Before members had a group, the website showed the first 3 as Leadership. */
const LEGACY_LEADERSHIP_COUNT = 3;
const groupOf = (raw: unknown, idx: number): TeamGroup =>
  raw === "leadership" || raw === "pillars"
    ? raw
    : idx < LEGACY_LEADERSHIP_COUNT
      ? "leadership"
      : "pillars";

interface TeamMember {
  group: TeamGroup;
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

const emptyMember = (group: TeamGroup): TeamMember => ({
  group,
  name: "",
  role: "",
  bio: "",
  tag: "",
  photo: "",
  linkedin: "",
});

/** Leadership members first, then Our Pillars, keeping each group's order. */
function leadershipFirst<T extends { group: TeamGroup }>(list: T[]): T[] {
  return [
    ...list.filter((m) => m.group === "leadership"),
    ...list.filter((m) => m.group !== "leadership"),
  ];
}

type DropTarget = { group: TeamGroup; index: number }; // insert before `index` within the group

export function Team(sectionProps?: SectionInstanceProps) {
  const sectionId = sectionProps?.sectionId;
  const initialData = sectionProps?.initialData;
  const sectionSaveUrl = sectionProps?.saveUrl;

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedMember, setExpandedMember] = useState<number | null>(null);
  const [formData, setFormData] = useState<TeamData>(DEFAULT_DATA);
  const [ourTeamMeta, setOurTeamMeta] = useState<Record<string, unknown>>({});
  const [memberPhotos, setMemberPhotos] = useState<(File | string | null)[]>([]);
  const confirmDelete = useConfirmDelete();
  // Drag-and-drop reorder, like Menu Links: the grip arms dragging for that card only
  const [armedIdx, setArmedIdx] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  useEffect(() => {
    if (sectionId) {
      const incoming = initialData || {};
      const rawList = Array.isArray(incoming.members)
        ? (incoming.members as Record<string, unknown>[])
        : [];
      const normalized: TeamMember[] = rawList.map((m, idx) => ({
        group: groupOf(m.group, idx),
        name: String(m.name || ""),
        role: String(m.role || m.designation || ""),
        bio: String(m.bio || ""),
        tag: String(m.tag || ""),
        photo: String(m.photo || m.imageUrl || ""),
        linkedin: String(m.linkedin || m.linkedinUrl || ""),
      }));
      const ordered = leadershipFirst(normalized);
      setFormData({
        ...DEFAULT_DATA,
        ...(incoming as Partial<TeamData>),
        members: ordered,
      });
      setMemberPhotos(ordered.map((m) => m.photo || null));
      return;
    }

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

        const normalized: TeamMember[] = rawList.map((m: Record<string, unknown>, idx: number) => ({
          group: groupOf(m.group, idx),
          name: String(m.name || ""),
          role: String(m.role || m.designation || ""),
          bio: String(m.bio || ""),
          tag: String(m.tag || ""),
          photo: String(m.photo || m.imageUrl || ""),
          linkedin: String(m.linkedin || m.linkedinUrl || ""),
        }));

        const ordered = leadershipFirst(normalized);
        setFormData({
          ...DEFAULT_DATA,
          ...(team && typeof team === "object" ? team : {}),
          members: ordered,
        });
        setMemberPhotos(ordered.map((m) => m.photo || null));
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, [sectionId, initialData]);

  const members = Array.isArray(formData.members) ? formData.members : [];

  const setText =
    (key: keyof TeamData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const updateMember = (idx: number, patch: Partial<TeamMember>) =>
    setFormData((prev) => ({
      ...prev,
      members: members.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    }));

  /**
   * Moves member `from` (index in the full list) to position `index` of `group`, carrying its
   * photo along; the list stays Leadership first.
   */
  const moveMember = (from: number, group: TeamGroup, index: number) => {
    const rows = members.map((m, i) => ({
      group: m.group,
      member: m,
      photo: memberPhotos[i] ?? null,
    }));
    const [row] = rows.splice(from, 1);
    if (!row) return;
    row.group = group;
    row.member = { ...row.member, group };
    const inGroup = rows.filter((r) => r.group === group);
    const others = rows.filter((r) => r.group !== group);
    inGroup.splice(Math.max(0, Math.min(index, inGroup.length)), 0, row);
    const next = leadershipFirst([...inGroup, ...others]);
    setFormData((prev) => ({ ...prev, members: next.map((r) => r.member) }));
    setMemberPhotos(next.map((r) => r.photo));
    setExpandedMember((prev) => (prev === from ? next.indexOf(row) : null));
  };

  const clearDrag = () => {
    setDraggedIdx(null);
    setDropTarget(null);
    setArmedIdx(null);
  };

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
      const cleanMembers: TeamMember[] = leadershipFirst(
        members
          .map((m, i) => ({
            group: m.group,
            name: (m.name || "").trim(),
            role: (m.role || "").trim(),
            bio: m.bio || "",
            tag: (m.tag || "").trim(),
            photo: uploadedPhotos[i] || m.photo || "",
            linkedin: (m.linkedin || "").trim(),
          }))
          .filter((m) => m.name || m.role),
      );

      const teamPayload: TeamData = {
        ...formData,
        members: cleanMembers,
      };

      if (sectionId) {
        await saveCustomSection(sectionId, teamPayload, sectionSaveUrl);
      } else {
        const legacyMembers = cleanMembers.map((m, i) => ({
          group: m.group,
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
        clearCache("/api/about");
      }

      setFormData(teamPayload);
      setMemberPhotos(cleanMembers.map((m) => m.photo || null));
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
      description="Team header, hiring prompt, and member profiles in two groups: Leadership and Our Pillars. Drag to reorder or move between groups."
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

      <div className="flex flex-col gap-6">
        <span className="px-1 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          Team Members ({members.length})
        </span>

        {GROUPS.map((group) => {
          const rows = members
            .map((member, idx) => ({ member, idx }))
            .filter((r) => r.member.group === group.id);
          const dropLine = (index: number) =>
            dropTarget?.group === group.id && dropTarget.index === index ? (
              <div className="pointer-events-none h-0.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
            ) : null;

          return (
            <div
              key={group.id}
              className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white/60 p-3"
              // Dropping on the group's empty space adds the member at the end of that group
              onDragOver={(e) => {
                if (draggedIdx === null) return;
                e.preventDefault();
                if (e.target === e.currentTarget)
                  setDropTarget({ group: group.id, index: rows.length });
              }}
              onDrop={(e) => {
                if (draggedIdx === null) return;
                e.preventDefault();
                const target = dropTarget?.group === group.id ? dropTarget.index : rows.length;
                const from = draggedIdx;
                clearDrag();
                // Indices after removing the dragged member from this group
                const fromPos = rows.findIndex((r) => r.idx === from);
                moveMember(
                  from,
                  group.id,
                  fromPos !== -1 && fromPos < target ? target - 1 : target,
                );
              }}
            >
              <div className="flex items-center justify-between gap-3 px-1">
                <div>
                  <span className="font-serif text-base text-[#B8932A] italic">{group.label}</span>
                  <span className="ml-2 text-[11px] font-semibold text-gray-400">
                    ({rows.length})
                  </span>
                  <p className="text-[11px] text-gray-400">{group.hint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // New members go at the end of their group (Leadership is listed first)
                    const added =
                      group.id === "leadership"
                        ? members.filter((m) => m.group === "leadership").length
                        : members.length;
                    const next = [...members];
                    next.splice(added, 0, emptyMember(group.id));
                    setFormData((prev) => ({ ...prev, members: next }));
                    setMemberPhotos((prev) => {
                      const photos = [...prev];
                      photos.splice(added, 0, null);
                      return photos;
                    });
                    setExpandedMember(added);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] hover:bg-amber-100"
                >
                  <Plus className="h-3.5 w-3.5" /> Add to {group.label}
                </button>
              </div>

              {rows.length === 0 && (
                <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-xs text-gray-400">
                  {draggedIdx !== null
                    ? "Drop here to move to " + group.label
                    : "No members here yet."}
                </p>
              )}

              {rows.map(({ member, idx }, pos) => (
                <div key={idx}>
                  {dropLine(pos)}
                  <div
                    draggable={armedIdx === idx}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(idx));
                      setExpandedMember(null);
                      setDraggedIdx(idx);
                    }}
                    onDragOver={(e) => {
                      if (draggedIdx === null) return;
                      e.preventDefault();
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const index = e.clientY < rect.top + rect.height / 2 ? pos : pos + 1;
                      setDropTarget((prev) =>
                        prev?.group === group.id && prev.index === index
                          ? prev
                          : { group: group.id, index },
                      );
                    }}
                    onDragEnd={clearDrag}
                    className={`flex items-start gap-2 ${draggedIdx === idx ? "opacity-50" : ""}`}
                  >
                    <span
                      title="Drag to reorder or move to the other group"
                      onMouseDown={() => setArmedIdx(idx)}
                      onMouseUp={() => setArmedIdx(null)}
                      className="mt-3.5 flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-gray-300 hover:bg-gray-100 hover:text-gray-500 active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <CollapsibleCard
                        badge={`(${String(pos + 1).padStart(2, "0")})`}
                        title={member.name || `Team Member #${idx + 1}`}
                        subtitle={member.role || undefined}
                        isOpen={expandedMember === idx}
                        onToggle={() => setExpandedMember(expandedMember === idx ? null : idx)}
                        onRemove={() => removeMember(idx)}
                      >
                        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2">
                          <SelectField
                            label="Section"
                            value={member.group}
                            onChange={(e) => {
                              const to = e.target.value as TeamGroup;
                              if (to !== member.group) moveMember(idx, to, Number.MAX_SAFE_INTEGER);
                            }}
                            options={GROUPS.map((g) => ({ value: g.id, label: g.label }))}
                            containerClassName="md:col-span-2"
                          />
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
                    </div>
                  </div>
                  {pos === rows.length - 1 && dropLine(rows.length)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </StaticSectionCard>
  );
}
