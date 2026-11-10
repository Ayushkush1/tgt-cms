"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  containerClassName = "",
  className = "",
  icon,
  options,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="ml-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {icon && (
          <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">{icon}</div>
        )}
        <select
          className={`w-full ${icon ? "pr-10 pl-12" : "px-5 pr-10"} cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white py-3.5 text-sm text-[#0B0F29] transition-all outline-none focus:border-[#0B0F29] focus:ring-2 focus:ring-[#0B0F29]/15 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
