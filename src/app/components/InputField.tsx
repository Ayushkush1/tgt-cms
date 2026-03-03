import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  containerClassName = "",
  className = "",
  ...props
}) => {
  const inputClass = `w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0A0F29] focus:ring-1 focus:ring-[#0A0F29] text-gray-800 ${className}`;

  if (!label) {
    return <input className={inputClass} {...props} />;
  }

  return (
    <div className={`flex flex-col gap-1.5 mx-2 ${containerClassName}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input className={inputClass} {...props} />
    </div>
  );
};
