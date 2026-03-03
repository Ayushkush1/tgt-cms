import React from "react";

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  label = "Save Changes",
  className = "",
  ...props
}) => {
  return (
    <button
      className={`w-full col-span-2 bg-[#0A0F29] text-white font-semibold py-2.5 rounded-lg hover:bg-black transition-colors mt-2 ${className}`}
      {...props}
    >
      {label}
    </button>
  );
};
