"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { HEADING_TAGS, HEADING_TAG_LABELS, toHeadingTag, type HeadingTag } from "@/lib/headingTags";

interface HeadingTagFieldProps {
  value: HeadingTag | "";
  onChange: (value: HeadingTag | "") => void;
  description: string;
  id?: string;
}

/** Semantic HTML heading tag selector shared across global and per-page SEO editors. */
export function HeadingTagField({
  value,
  onChange,
  description,
  id = "hero-headline-tag",
}: HeadingTagFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="ml-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase"
      >
        Hero Headline Tag (SEO)
      </label>
      <div className="relative w-full">
        <select
          id={id}
          value={value || "h1"}
          onChange={(e) => onChange(toHeadingTag(e.target.value))}
          className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white px-5 py-3.5 pr-11 text-sm font-medium text-[#0B0F29] transition-all outline-none focus:border-[#0B0F29] focus:ring-2 focus:ring-[#0B0F29]/15"
        >
          {HEADING_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {HEADING_TAG_LABELS[tag]}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>
      <p className="ml-4 text-xs text-gray-400">{description}</p>
    </div>
  );
}
