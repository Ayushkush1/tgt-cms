"use client";

import React, { useState } from "react";
import { Eye, EyeOff, HelpCircle } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
  tooltip?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  containerClassName = "",
  className = "",
  type = "text",
  icon,
  tooltip,
  placeholder,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const resolvedPlaceholder =
    placeholder ?? (label ? `Enter ${label.toLowerCase()}…` : "Enter value…");
  const inputClass = `w-full ${icon ? "pl-12 pr-5" : "px-5"} py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-[#0B0F29] placeholder:text-gray-400 focus:outline-none focus:border-[#0B0F29] focus:ring-2 focus:ring-[#0B0F29]/15 outline-none transition-all ${className}`;

  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  const inputElement = (
    <div className="relative w-full">
      {icon && <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input
        className={inputClass}
        type={currentType}
        placeholder={resolvedPlaceholder}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName} px-0.5`}>
      {label && (
        <label className="relative ml-4 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          {label}
          {tooltip && (
            <div className="group relative flex items-center">
              <HelpCircle className="h-3.5 w-3.5 cursor-help text-gray-300 transition-colors hover:text-[#D4AF37]" />
              {/* Tooltip Bubble */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-max max-w-[280px] -translate-x-1/2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-center text-[11px] leading-relaxed font-medium tracking-normal text-gray-900 normal-case opacity-0 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
              </div>
            </div>
          )}
        </label>
      )}
      {inputElement}
    </div>
  );
};
