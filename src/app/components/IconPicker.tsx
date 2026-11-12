"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { icons, Search, Shapes, Upload, X, type LucideIcon } from "lucide-react";
import { iconNames } from "lucide-react/dynamic";
import type { LogoValue } from "./LogoPicker";

/** "bar-chart-3" → "BarChart3", the key of that icon in lucide's `icons` map. */
const toPascal = (name: string) =>
  name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

/** Every lucide icon once, as [kebab name stored in the CMS, component]. Aliases are skipped. */
const ICON_LIST: [string, LucideIcon][] = (() => {
  const seen = new Set<LucideIcon>();
  const list: [string, LucideIcon][] = [];
  for (const name of iconNames) {
    const Icon = (icons as Record<string, LucideIcon>)[toPascal(name)];
    if (!Icon || seen.has(Icon)) continue;
    seen.add(Icon);
    list.push([name, Icon]);
  }
  return list;
})();

/** The component for a stored icon name, if lucide knows it. */
export const iconFor = (name: string | null | undefined): LucideIcon | undefined =>
  name ? (icons as Record<string, LucideIcon>)[toPascal(name)] : undefined;

/** What a tile holds: an uploaded/picked image, a lucide icon, or nothing (built-in icon). */
export type LogoOrIcon = { image: LogoValue; icon: string | null };

export type LogoOrIconChange = { file: File } | { icon: string } | { clear: true };

const PAGE = 240;

/**
 * One tile per technology holding either a logo image or a library icon, never both.
 * Click it to pick an icon or upload an image; the new choice replaces the old one.
 */
export function LogoOrIconPicker({
  value,
  size = "md",
  onChange,
}: {
  value: LogoOrIcon;
  size?: "sm" | "md";
  onChange: (change: LogoOrIconChange) => void;
}) {
  const [open, setOpen] = useState(false);
  const fileUrl = useMemo(
    () => (value.image && typeof value.image !== "string" ? URL.createObjectURL(value.image) : null),
    [value.image],
  );
  useEffect(() => {
    if (!fileUrl) return;
    return () => URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);
  const preview = typeof value.image === "string" ? value.image : fileUrl;
  const icon = preview ? undefined : iconFor(value.icon);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={preview ? "Logo (click to change)" : value.icon ? `Icon: ${value.icon} (click to change)` : "Add a logo or icon"}
        className={`group relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white transition-colors hover:border-[#D4AF37] ${
          preview || icon ? "border-gray-200" : "border-dashed border-gray-200"
        } ${size === "sm" ? "h-10 w-10 p-1.5" : "h-14 w-14 p-2"}`}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="max-h-full max-w-full object-contain" />
          </>
        ) : icon ? (
          React.createElement(icon, { className: "h-5 w-5 text-[#B8932A]", strokeWidth: 1.5 })
        ) : (
          <Shapes className="h-4 w-4 text-gray-300" />
        )}
      </button>
      {open && (
        <PickerModal
          value={value}
          hasValue={Boolean(preview || value.icon)}
          onClose={() => setOpen(false)}
          onPick={(change) => {
            onChange(change);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function PickerModal({
  value,
  hasValue,
  onClose,
  onPick,
}: {
  value: LogoOrIcon;
  hasValue: boolean;
  onClose: () => void;
  onPick: (change: LogoOrIconChange) => void;
}) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, "-");
    return q ? ICON_LIST.filter(([name]) => name.includes(q)) : ICON_LIST;
  }, [query]);
  const shown = matches.slice(0, limit);
  const activeIcon = value.image ? null : value.icon;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE);
              }}
              placeholder={`Search ${ICON_LIST.length} icons, e.g. chart, mail, cloud`}
              className="w-full rounded-xl border border-gray-200 py-2.5 pr-3 pl-9 text-sm text-[#0B0F29] outline-none placeholder:text-gray-400 focus:border-[#0B0F29]"
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onPick({ file });
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0B0F29] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0B0F29]/90"
          >
            <Upload className="h-3.5 w-3.5" /> Upload image instead
          </button>
          {hasValue && (
            <button
              type="button"
              onClick={() => onPick({ clear: true })}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
            >
              Remove
            </button>
          )}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="px-4 pt-3 text-[11px] text-gray-400">
          Pick an icon or upload an image. Only one is kept: the new choice replaces the current one.
        </p>

        <div className="overflow-y-auto p-4">
          {shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No icons match “{query}”.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {shown.map(([name, Icon]) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => onPick({ icon: name })}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-gray-600 transition-colors hover:bg-amber-50 hover:text-[#B8932A] ${
                    name === activeIcon ? "bg-amber-50 text-[#B8932A] ring-1 ring-[#D4AF37]" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                  <span className="w-full truncate text-[9px] text-gray-400">{name}</span>
                </button>
              ))}
            </div>
          )}
          {matches.length > shown.length && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE)}
                className="rounded-full bg-gray-50 px-4 py-2 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:bg-gray-100"
              >
                Show more ({matches.length - shown.length} left)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
