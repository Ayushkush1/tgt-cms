"use client";

import React from "react";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";

interface CollapsibleCardProps {
  badge?: string;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  onRemove?: () => void;
  removeTitle?: string;
  children: React.ReactNode;
}

/**
 * Shared collapsible accordion item card used for repeater entries
 * (steps, quotes, service pillars, team members, milestones).
 */
export function CollapsibleCard({
  badge,
  title,
  subtitle,
  isOpen,
  onToggle,
  onRemove,
  removeTitle = "Remove item",
  children,
}: CollapsibleCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-50/50 transition-shadow hover:shadow-xs">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="flex cursor-pointer items-center justify-between gap-3 bg-white px-4 py-3.5 transition-colors hover:bg-gray-50"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-[#B8932A]" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
          )}
          {badge && (
            <span className="shrink-0 font-serif text-sm text-[#B8932A] italic">{badge}</span>
          )}
          <span className="truncate text-sm font-bold text-[#0B0F29]">{title}</span>
          {subtitle && (
            <span className="hidden truncate text-xs text-gray-400 sm:inline">· {subtitle}</span>
          )}
        </div>

        {onRemove && (
          <button
            type="button"
            title={removeTitle}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && <div className="flex flex-col gap-4 border-t border-gray-100 p-4">{children}</div>}
    </div>
  );
}
