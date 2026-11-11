"use client";

import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MessageSquareText, X } from "lucide-react";

export interface SubmissionDetailMeta {
  label: string;
  value: string;
}

interface SubmissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  subtitle?: string;
  meta?: SubmissionDetailMeta[];
  bodyTitle: string;
  body: string;
  replyEmail?: string;
}

/**
 * Reusable pop-up dialog for inspecting multi-line submission messages cleanly
 * without native browser `alert()` dialogs.
 */
export function SubmissionDetailModal({
  isOpen,
  onClose,
  eyebrow,
  title,
  subtitle,
  meta = [],
  bodyTitle,
  body,
  replyEmail,
}: SubmissionDetailModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="submission-detail-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
          />

          <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              key="submission-detail-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="submission-detail-title"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => closeBtnRef.current?.focus()}
              className="pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_24px_60px_rgba(11,15,41,0.22)]"
            >
              <div className="p-7 pb-6">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-5 right-5 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#B68D18] ring-4 ring-amber-50/70">
                    <MessageSquareText className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1 pr-6">
                    <p className="text-[10px] font-bold tracking-widest text-[#B68D18] uppercase">
                      {eyebrow}
                    </p>
                    <h3
                      id="submission-detail-title"
                      className="mt-0.5 text-lg font-bold tracking-tight text-[#0B0F29]"
                    >
                      {title}
                    </h3>
                    {subtitle && (
                      <p className="mt-0.5 text-sm break-all text-gray-500">{subtitle}</p>
                    )}
                  </div>
                </div>

                {meta.length > 0 && (
                  <div
                    className={`mt-5 grid grid-cols-1 gap-2.5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 ${
                      meta.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3"
                    }`}
                  >
                    {meta.map((item) => (
                      <div key={item.label} className="min-w-0">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          {item.label}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[#0B0F29]">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5">
                  <p className="mb-2 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    {bodyTitle}
                  </p>
                  <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm leading-relaxed whitespace-pre-line text-gray-700">
                    {body}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-7 py-4">
                {replyEmail && (
                  <a
                    href={`mailto:${replyEmail}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B0F29] transition-colors hover:border-[#D4AF37] hover:text-[#9A781E]"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Reply via Email
                  </a>
                )}
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-[#0B0F29] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
