import { ChevronDown, Plus } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function SectionHeader({
  title,
  description,
  isOpen,
  onToggle,
  action,
}: SectionHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 pb-4">
      <div className="group flex flex-1 cursor-pointer flex-col gap-1.5" onClick={onToggle}>
        <h1 className="flex items-center gap-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#0A0F29]">
          {title}
        </h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      {!action && (
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="group ml-auto flex w-max items-center justify-center gap-2 rounded-full border border-transparent bg-[#0B0F29] px-6 py-2.5 font-semibold tracking-wide whitespace-nowrap text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-black hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:scale-110" /> {action.label}
        </button>
      )}
    </header>
  );
}
