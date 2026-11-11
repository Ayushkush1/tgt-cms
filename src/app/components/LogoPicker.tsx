"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { ImageIcon, Upload } from "lucide-react";

export type LogoValue = File | string | null;

/** Natural size of a picked image, so the website can reserve its space. */
export const imageSize = (file: File) =>
  new Promise<{ width: number; height: number }>((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

/** Small logo thumbnail; click to pick a new file (uploaded on save). */
export function LogoPicker({
  value,
  dark = false,
  size = "md",
  onChange,
}: {
  value: LogoValue;
  dark?: boolean; // show on a dark tile, for white logos
  size?: "sm" | "md";
  onChange: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileUrl = useMemo(
    () => (value && typeof value !== "string" ? URL.createObjectURL(value) : null),
    [value],
  );
  useEffect(() => {
    if (!fileUrl) return;
    return () => URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);
  const preview = typeof value === "string" ? value : fileUrl;

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      title={value ? "Change logo" : "Upload logo"}
      className={`group relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 transition-colors hover:border-[#D4AF37] ${
        size === "sm" ? "h-10 w-10 p-1.5" : "h-14 w-24 p-2"
      } ${dark ? "bg-[#0B0F29]" : "bg-white"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
          e.target.value = "";
        }}
      />
      {preview ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-h-full max-w-full object-contain" />
        </>
      ) : (
        <ImageIcon className="h-4 w-4 text-gray-300" />
      )}
      <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-white group-hover:flex">
        <Upload className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
