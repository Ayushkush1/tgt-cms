import { ChevronDown } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function SectionHeader({
  title,
  description,
  isOpen,
  onToggle,
}: SectionHeaderProps) {
  return (
    <header
      onClick={onToggle}
      className="flex items-center justify-between border-b border-gray-100 pb-4 cursor-pointer group"
    >
      <div className="flex flex-col gap-1.5">
        <h1 className="text-gray-900 text-lg font-bold group-hover:text-[#0A0F29] transition-colors">
          {title}
        </h1>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      <ChevronDown
        className={`cursor-pointer text-gray-500 h-6 w-6 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
      />
    </header>
  );
}
