"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Globe } from "lucide-react";

type GlobalSectionRefProps = {
  title: string;
  description: string;
  href?: string;
  buttonLabel?: string;
};

export function GlobalSectionRef({
  title,
  description,
  href = "/navigation/social-media#growth-cta",
  buttonLabel = "Manage in Social Media & Footer",
}: GlobalSectionRefProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-lg font-bold text-[#0B0F29]">{title}</h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#B68D18] uppercase">
            <Globe className="h-3 w-3" />
            Global Section
          </span>
        </div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      <Link
        href={href}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0B0F29] px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-black hover:shadow-[0_4px_14px_rgba(212,175,55,0.25)]"
      >
        {buttonLabel}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
