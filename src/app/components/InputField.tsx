"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  containerClassName = "",
  className = "",
  type = "text",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputClass = `w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0A0F29] focus:ring-1 focus:ring-[#0A0F29] text-gray-800 ${className}`;

  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  const inputElement = (
    <div className="relative w-full">
      <input className={inputClass} type={currentType} {...props} />
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );

  if (!label) {
    return isPassword ? inputElement : <input className={inputClass} type={type} {...props} />;
  }

  return (
    <div className={`flex flex-col gap-1.5 mx-2 ${containerClassName}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {isPassword ? inputElement : <input className={inputClass} type={type} {...props} />}
    </div>
  );
};
