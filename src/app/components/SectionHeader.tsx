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
      <div
        className="flex flex-col gap-1.5 cursor-pointer flex-1 group"
        onClick={onToggle}
      >
        <h1 className="text-gray-900 text-lg font-bold group-hover:text-[#0A0F29] transition-colors flex items-center gap-2">
          {title}
        </h1>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      {!action && (
        <ChevronDown
          className={`text-gray-400 h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="bg-[#0B0F29] w-max text-white ml-auto px-6 py-2.5 rounded-full font-semibold tracking-wide hover:bg-black transition-all duration-300 border border-transparent hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 group whitespace-nowrap"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />{" "}
          {action.label}
        </button>
      )}
    </header>
  );
}
