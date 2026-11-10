import React, { Dispatch, SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
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
    <header className="flex items-center justify-between">
      <div className="flex flex-col gap-2.5">
        <h3 className="text-3xl leading-tight font-bold text-gray-900">{title}</h3>
        <p className="text-base leading-relaxed font-medium text-gray-400">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        {deleteAction && (
          <button
            onClick={deleteAction.onDelete}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-red-100 px-6 py-3 font-semibold text-red-500 transition-all hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            {deleteAction.label}
          </button>
        )}
        {action && (
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <button
              onClick={() => {
                if (action.onClick) {
                  action.onClick();
                } else {
                  setIsOpen?.(true);
                }
              }}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0B0F29] px-6 py-3 font-semibold text-white transition-all hover:border-[#D4AF37] hover:bg-black hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            >
              <Plus className="-ml-0.5 h-4 w-4" strokeWidth={3} aria-hidden="true" />

              {action.label}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
