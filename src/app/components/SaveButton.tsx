import React from "react";
import { Save } from "lucide-react";

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  label = "Save Changes",
  icon,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={`group col-span-2 flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-transparent bg-[#0B0F29] px-8 py-3 font-semibold tracking-wide text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-black hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] ${disabled ? "cursor-not-allowed opacity-75" : ""} ${className}`}
      {...props}
    >
      {icon ? icon : <Save className="h-4 w-4" />}
      {disabled ? "Saving..." : label}
    </button>
  );
};
