import React from "react";
import { Save } from "lucide-react";

interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode;
  sticky?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  label = "Save Changes",
  icon,
  sticky = true,
  className = "",
  disabled,
  ...props
}) => {
  const button = (
    <button
      disabled={disabled}
      className={`group flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-transparent bg-[#0B0F29] px-8 py-3.5 text-sm font-semibold tracking-wide text-white shadow-sm transition-all duration-300 hover:border-[#D4AF37] hover:bg-black hover:shadow-[0_10px_28px_rgba(11,15,41,0.22)] ${disabled ? "cursor-not-allowed opacity-75" : ""} ${className}`}
      {...props}
    >
      {icon ? icon : <Save className="h-4 w-4" />}
      {disabled ? "Saving..." : label}
    </button>
  );

  if (!sticky) return button;

  return (
    <div className="sticky bottom-3 z-20 col-span-2 -mx-2 mt-2 rounded-2xl bg-white/90 px-2 pt-3 pb-1 backdrop-blur-md">
      {button}
    </div>
  );
};
