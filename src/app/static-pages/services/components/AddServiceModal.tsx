"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SelectField } from "@/components/SelectField";
import { PILLAR_OPTIONS, toServiceSlug } from "../types";

export interface NewService {
  id: string;
  name: string;
  pillar: string;
  addToMenu: boolean;
  addToPillars: boolean;
}

/**
 * Creates a new /service/<slug> page. By default it is also linked in the Services menu
 * (which gives it SEO Page Settings and a sitemap URL) and listed under its growth stage
 * on the home page Service Pillars (which groups it under that stage in the navbar).
 */
export function AddServiceModal({
  takenIds,
  onClose,
  onCreate,
}: {
  takenIds: string[];
  onClose: () => void;
  onCreate: (service: NewService) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [pillar, setPillar] = useState("");
  const [addToMenu, setAddToMenu] = useState(true);
  const [addToPillars, setAddToPillars] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const id = slugEdited ? slug : toServiceSlug(name);
  const error = !name.trim()
    ? "Enter a service name."
    : !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)
      ? "URL slug may use only lowercase letters, numbers and single hyphens."
      : takenIds.includes(id)
        ? `/service/${id} already exists.`
        : !pillar
          ? "Choose a growth pillar."
          : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error || busy) return;
    setBusy(true);
    try {
      await onCreate({ id, name: name.trim(), pillar, addToMenu, addToPillars });
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <form
        onSubmit={submit}
        className="flex w-full max-w-lg flex-col gap-5 rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0B0F29]">Add a service</h2>
            <p className="mt-1 text-xs text-gray-400">
              Creates a new page at /service/your-slug. You can fill in its content after it&apos;s
              created.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={busy}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <InputField
          label="Service name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AI Voice Agents"
        />
        <InputField
          label="URL slug"
          value={id}
          onChange={(e) => {
            setSlugEdited(true);
            setSlug(e.target.value.toLowerCase());
          }}
          placeholder="ai-voice-agents"
        />
        <SelectField
          label="Growth pillar"
          value={pillar}
          onChange={(e) => setPillar(e.target.value)}
          options={PILLAR_OPTIONS}
        />

        <div className="flex flex-col gap-2.5 rounded-2xl bg-gray-50 p-4 text-sm text-[#0B0F29]">
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={addToMenu}
              onChange={(e) => setAddToMenu(e.target.checked)}
              className="mt-0.5 accent-[#B8932A]"
            />
            <span>
              Add to the Services menu
              <span className="block text-[11px] text-gray-400">
                Navbar and footer link, SEO → Page Settings entry and sitemap URL.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2.5">
            <input
              type="checkbox"
              checked={addToPillars}
              onChange={(e) => setAddToPillars(e.target.checked)}
              className="mt-0.5 accent-[#B8932A]"
            />
            <span>
              Add to its pillar on the home page
              <span className="block text-[11px] text-gray-400">
                Shows it in the home Service Pillars and groups it under its stage in the menu.
              </span>
            </span>
          </label>
        </div>

        {error && name && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={Boolean(error) || busy}
            className="rounded-full bg-[#0B0F29] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B0F29]/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Creating…" : "Create service"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
