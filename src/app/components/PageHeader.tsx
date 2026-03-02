import React, { Dispatch, SetStateAction } from "react";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
  };
  setIsOpen?: Dispatch<SetStateAction<boolean>>;
}

export function PageHeader({
  title,
  description,
  action,
  setIsOpen,
}: PageHeaderProps) {
  return (
    <header className=" flex justify-between items-center">
      <div className=" flex flex-col gap-2.5">
        <h3 className="text-3xl font-bold text-gray-900 leading-tight">
          {title}
        </h3>
        <p className="text-gray-400 text-base leading-relaxed font-medium">
          {description}
        </p>
      </div>
      {action && (
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            onClick={() => setIsOpen?.(true)}
            className="inline-flex items-center gap-2 w-fit px-6 bg-[#0B0F29] text-white font-semibold py-3 rounded-full hover:bg-black transition-all hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
          >
            <Plus
              className="-ml-0.5 h-4 w-4"
              strokeWidth={3}
              aria-hidden="true"
            />

            {action.label}
          </button>
        </div>
      )}
    </header>
  );
}
