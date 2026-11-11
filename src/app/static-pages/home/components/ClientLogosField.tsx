"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { LogoPicker, imageSize, type LogoValue } from "@/app/components/LogoPicker";

/**
 * Home "TrustedBySection".logos: the one list of client logos.
 * - showInHero: shown in the Growth Hero logo pill (also saved as TrustedBySection.images).
 * - name: service pages show a client's logo where their "Brands We've Built For" list has the
 *   same name.
 */
export interface ClientLogo {
  name: string;
  image: string;
  width: number;
  height: number;
  dark: boolean; // a white logo, darkened on light backgrounds
  showInHero: boolean;
}

export type ClientLogoRow = Omit<ClientLogo, "image"> & { id: string; image: LogoValue };

export const newClientLogoRow = (logo: Partial<ClientLogo> = {}): ClientLogoRow => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Math.random()}`,
  name: typeof logo.name === "string" ? logo.name : "",
  image: typeof logo.image === "string" && logo.image ? logo.image : null,
  width: typeof logo.width === "number" ? logo.width : 0,
  height: typeof logo.height === "number" ? logo.height : 0,
  dark: logo.dark === true,
  showInHero: logo.showInHero !== false,
});

/** Rows from saved content: `logos`, or the older plain `images` list (all shown in the hero). */
export function clientLogoRows(trusted: Record<string, unknown>): ClientLogoRow[] {
  if (Array.isArray(trusted.logos)) return trusted.logos.map((l) => newClientLogoRow(l ?? {}));
  if (Array.isArray(trusted.images))
    return trusted.images
      .filter((url): url is string => typeof url === "string" && !!url)
      .map((image) => newClientLogoRow({ image, showInHero: true }));
  return [];
}

const toggle =
  "flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 whitespace-nowrap";

export function ClientLogosField({
  rows,
  onChange,
}: {
  rows: ClientLogoRow[];
  onChange: (rows: ClientLogoRow[]) => void;
}) {
  const update = (id: string, patch: Partial<ClientLogoRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const inHero = rows.filter((r) => r.showInHero).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#0B0F29]">
            Client Logos{" "}
            <span className="text-xs font-normal text-gray-500">
              ({rows.length} logos, {inHero} in the hero pill)
            </span>
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Tick “Hero pill” to show a logo in the headline. The name links the logo to service
            pages that list the same client under “Brands We&apos;ve Built For”.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...rows, newClientLogoRow()])}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0B0F29] transition-colors hover:border-[#D4AF37]"
        >
          <Plus className="h-3.5 w-3.5" /> Add logo
        </button>
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5"
          >
            <LogoPicker
              value={r.image}
              dark={r.dark}
              onChange={async (file) => update(r.id, { image: file, ...(await imageSize(file)) })}
            />
            <input
              value={r.name ?? ""}
              onChange={(e) => update(r.id, { name: e.target.value })}
              placeholder="Client name"
              aria-label="Client name"
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0B0F29] outline-none placeholder:text-gray-400 focus:border-[#0B0F29]"
            />
            <div className="flex flex-col gap-1">
              <label className={toggle}>
                <input
                  type="checkbox"
                  checked={r.showInHero}
                  onChange={(e) => update(r.id, { showInHero: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[#D4AF37]"
                />
                Hero pill
              </label>
              <label className={toggle} title="A white logo: darkened on light backgrounds">
                <input
                  type="checkbox"
                  checked={r.dark}
                  onChange={(e) => update(r.id, { dark: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[#D4AF37]"
                />
                White logo
              </label>
            </div>
            <button
              type="button"
              title="Remove"
              aria-label={`Remove ${r.name || "logo"}`}
              onClick={() => onChange(rows.filter((x) => x.id !== r.id))}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
