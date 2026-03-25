"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  containerClassName = "",
  className = "",
  type = "text",
  icon,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputClass = `w-full ${icon ? "pl-12" : "px-6"} py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:outline-none focus:border-[#0A0F29] focus:ring-1 focus:ring-[#0A0F29] outline-none transition-all text-gray-800 ${className}`;

  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  const inputElement = (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input className={inputClass} type={currentType} {...props} />
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">
          {label}
        </label>
      )}
      {inputElement}
    </div>
  );
};
