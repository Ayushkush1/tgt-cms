import React, { Dispatch, SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
    href?: string;
  };
  setIsOpen?: Dispatch<SetStateAction<boolean>>;
  deleteAction?: {
    label: string;
    onDelete: () => void;
  };
}

export function PageHeader({
  title,
  description,
  action,
  setIsOpen,
  deleteAction,
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
      <div className="flex items-center gap-4">
        {deleteAction && (
          <button
            onClick={deleteAction.onDelete}
            className="inline-flex items-center gap-2 px-6 py-3 border border-red-100 text-red-500 font-semibold rounded-full hover:bg-red-50 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {deleteAction.label}
          </button>
        )}
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
      </div>
    </header>
  );
}
