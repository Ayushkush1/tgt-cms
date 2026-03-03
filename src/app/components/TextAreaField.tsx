import React from "react";

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  containerClassName = "",
  className = "",
  rows = 4,
  ...props
}) => {
  const textareaClass = `w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0A0F29] focus:ring-1 focus:ring-[#0A0F29] text-gray-800 ${className}`;

  if (!label) {
    return <textarea rows={rows} className={textareaClass} {...props} />;
  }

  return (
    <div className={`flex flex-col mx-2 gap-1.5 ${containerClassName}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea rows={rows} className={textareaClass} {...props} />
    </div>
  );
};
