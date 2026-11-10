"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

export interface ConfirmDeleteOptions {
  title?: string;
  message: string;
  warning?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

type ConfirmDeleteFn = (options: string | ConfirmDeleteOptions) => Promise<boolean>;

interface PendingDialog {
  title: string;
  message: string;
  warning: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve: (confirmed: boolean) => void;
}

const ConfirmDeleteContext = createContext<ConfirmDeleteFn | null>(null);

const DEFAULT_WARNING =
  "This action cannot be undone. Once deleted, the item will be permanently removed.";

/**
 * Global delete confirmation modal provider. Mount once in RootLayout and call
 * `const confirmDelete = useConfirmDelete()` anywhere to replace browser `confirm()`.
 */
export function ConfirmDeleteProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<PendingDialog | null>(null);
  const dialogRef = useRef<PendingDialog | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const settle = useCallback((confirmed: boolean) => {
    const current = dialogRef.current;
    if (!current) return;
    dialogRef.current = null;
    setDialog(null);
    current.resolve(confirmed);
  }, []);

  const confirmDelete = useCallback<ConfirmDeleteFn>((input) => {
    if (dialogRef.current) {
      dialogRef.current.resolve(false);
    }
    const opts = typeof input === "string" ? { message: input } : input;
    return new Promise<boolean>((resolve) => {
      const next: PendingDialog = {
        title: opts.title?.trim() || "Delete this item?",
        message: opts.message,
        warning: opts.warning?.trim() || DEFAULT_WARNING,
        confirmLabel: opts.confirmLabel?.trim() || "Delete",
        cancelLabel: opts.cancelLabel?.trim() || "Cancel",
        resolve,
      };
      dialogRef.current = next;
      setDialog(next);
    });
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") settle(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog, settle]);

  useEffect(() => {
    return () => {
      if (dialogRef.current) {
        dialogRef.current.resolve(false);
        dialogRef.current = null;
      }
    };
  }, []);

  return (
    <ConfirmDeleteContext.Provider value={confirmDelete}>
      {children}

      <AnimatePresence>
        {dialog && (
          <>
            <motion.div
              key="confirm-delete-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => settle(false)}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px]"
            />

            <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-4">
              <motion.div
                key="confirm-delete-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-delete-title"
                aria-describedby="confirm-delete-message"
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => cancelBtnRef.current?.focus()}
                className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_24px_60px_rgba(11,15,41,0.22)]"
              >
                <div className="p-7 pb-6">
                  <button
                    type="button"
                    onClick={() => settle(false)}
                    aria-label="Close"
                    className="absolute top-5 right-5 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-4 ring-red-50/70">
                      <Trash2 className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1 pr-6">
                      <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase">
                        Permanent Action
                      </p>
                      <h3
                        id="confirm-delete-title"
                        className="mt-0.5 text-lg font-bold tracking-tight text-[#0B0F29]"
                      >
                        {dialog.title}
                      </h3>
                      <p
                        id="confirm-delete-message"
                        className="mt-2 text-sm leading-relaxed text-gray-600"
                      >
                        {dialog.message}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3 text-xs leading-relaxed text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <span>{dialog.warning}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 bg-gray-50/70 px-7 py-4">
                  <button
                    ref={cancelBtnRef}
                    type="button"
                    onClick={() => settle(false)}
                    className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#0B0F29]"
                  >
                    {dialog.cancelLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => settle(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-[0_4px_14px_rgba(220,38,38,0.35)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {dialog.confirmLabel}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </ConfirmDeleteContext.Provider>
  );
}

/** Returns a Promise-based delete confirmation function backed by the global popup. */
export function useConfirmDelete(): ConfirmDeleteFn {
  const ctx = useContext(ConfirmDeleteContext);
  if (!ctx) {
    throw new Error("useConfirmDelete must be used inside ConfirmDeleteProvider");
  }
  return ctx;
}
