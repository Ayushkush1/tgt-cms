"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";

/**
 * Loads and saves a single section on the Home page (/api/home) with shared
 * loading, toast feedback, and cache invalidation.
 */
export function useHomeSection<T extends Record<string, unknown>>(
  sectionKey: string,
  defaultValue: T,
  displayName: string,
) {
  const [formData, setFormData] = useState<T>(defaultValue);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchWithCache("/api/home")
      .then((json) => {
        if (!active) return;
        const incoming = json?.success ? json?.data?.[sectionKey] : null;
        if (incoming && typeof incoming === "object") {
          setFormData({ ...defaultValue, ...incoming });
        }
      })
      .catch(console.error);
    return () => {
      active = false;
    };
    // defaultValue is module-level constant per section
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  const save = async (override?: T) => {
    const payload = override ?? formData;
    setIsSaving(true);
    const toastId = toast.loading(`Saving ${displayName}…`);
    try {
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionKey, content: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Save failed");
      }
      clearCache("/api/home");
      toast.success(`${displayName} saved and published!`, { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { formData, setFormData, isSaving, save };
}

interface HomeSectionCardProps {
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  isSaving: boolean;
  onSave: () => void;
  children: React.ReactNode;
}

/** Collapsible card wrapper matching the CMS static-page section editors. */
export function HomeSectionCard({
  title,
  description,
  isOpen,
  onToggle,
  isSaving,
  onSave,
  children,
}: HomeSectionCardProps) {
  return (
    <section>
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all">
        <SectionHeader
          title={title}
          description={description}
          isOpen={isOpen}
          onToggle={onToggle}
        />
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-5 pt-2">
              {children}
              <div className="pt-2">
                <SaveButton onClick={onSave} disabled={isSaving} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface StringListFieldProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  columns?: 1 | 2 | 3;
}

/** Reusable editable list of short text items (e.g. ticker tags, assurances, commitments). */
export function StringListField({
  label,
  items,
  onChange,
  placeholder = "Enter value…",
  addLabel = "Add item",
  columns = 2,
}: StringListFieldProps) {
  const safeItems = Array.isArray(items) ? items : [];
  const gridClass =
    columns === 3
      ? "grid-cols-1 md:grid-cols-3"
      : columns === 1
        ? "grid-cols-1"
        : "grid-cols-1 md:grid-cols-2";

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          {label} ({safeItems.length})
        </span>
        <button
          type="button"
          onClick={() => onChange([...safeItems, ""])}
          className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-[#B8932A] transition-colors hover:bg-amber-100"
        >
          <Plus className="h-3.5 w-3.5" /> {addLabel}
        </button>
      </div>

      {safeItems.length === 0 ? (
        <p className="rounded-2xl bg-gray-50 px-4 py-3 text-xs text-gray-400">
          No items added yet.
        </p>
      ) : (
        <div className={`grid gap-2.5 ${gridClass}`}>
          {safeItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={item || ""}
                onChange={(e) => {
                  const next = [...safeItems];
                  next[idx] = e.target.value;
                  onChange(next);
                }}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm text-[#0B0F29] transition-all outline-none placeholder:text-gray-400 focus:border-[#0B0F29] focus:ring-2 focus:ring-[#0B0F29]/15"
              />
              <button
                type="button"
                title="Remove"
                onClick={() => onChange(safeItems.filter((_, i) => i !== idx))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
