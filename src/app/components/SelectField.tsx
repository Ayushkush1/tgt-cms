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
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">
          {label}
        </label>
      )}
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <select
          className={`w-full ${icon ? "pl-12" : "px-6"} pr-10 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all appearance-none cursor-pointer text-gray-800 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
