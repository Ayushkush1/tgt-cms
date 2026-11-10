"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { NAV_PLACEMENTS, type NavPlacement } from "@/lib/navPlacement";

export const CreatePagePopUp = ({
  setIsModalOpen,
  isModalOpen,
}: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [pageName, setPageName] = useState("");
  const [placement, setPlacement] = useState<NavPlacement | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName.trim()) {
      toast.error("Please enter a page name");
      return;
    }
    if (!placement) {
      toast.error("Please choose where to show the page link");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating page...");

    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pageName, placement }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Page created successfully!", { id: toastId });
        setPageName("");
        setPlacement("");
        setIsModalOpen(false);
        // Refresh the page to show the new page in list if needed
        window.location.reload();
      } else {
        toast.error(json.error || "Failed to create page", { id: toastId });
      }
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-10 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg overflow-hidden rounded-[3rem] border border-gray-200 bg-white shadow-2xl drop-shadow-md">
              {/* Close */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-10 right-10 text-gray-400 hover:text-black"
              >
                <X />
              </button>

              {/* Content */}
              <div className="p-10">
                <h2 className="text-2xl font-semibold tracking-tight text-black">
                  Create New Page
                </h2>

                <p className="mt-3 mb-8 text-sm text-gray-500">
                  Enter a name to create a new page for your website.
                </p>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                  <div className="flex flex-col gap-2">
                    <label className="block text-sm font-semibold text-[#0B0F29]">Page Name*</label>
                    <input
                      type="text"
                      required
                      value={pageName}
                      onChange={(e) => setPageName(e.target.value)}
                      placeholder="e.g. About Us, Contact"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm text-[#0B0F29] transition-all outline-none placeholder:text-gray-400 focus:border-[#0B0F29] focus:ring-2 focus:ring-[#0B0F29]/15"
                    />
                  </div>

                  {/* Where the page's link appears on the website */}
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 block text-sm font-semibold text-[#0B0F29]">
                      Show link in*
                    </legend>
                    <div className="grid grid-cols-3 gap-2">
                      {NAV_PLACEMENTS.map((option) => (
                        <label
                          key={option.value}
                          className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-medium transition-colors ${
                            placement === option.value
                              ? "border-[#0B0F29] bg-[#0B0F29] text-white"
                              : "border-gray-200 bg-gray-50 text-black hover:border-[#D4AF37]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="placement"
                            value={option.value}
                            checked={placement === option.value}
                            onChange={() => setPlacement(option.value)}
                            required
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* CTA — SAME AS HERO BUTTON */}

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-32 items-center justify-center gap-2 rounded-full bg-[#0B0F29] py-3 font-semibold text-white transition-all hover:border-[#D4AF37] hover:bg-black hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-50"
                    >
                      {isSubmitting ? "Creating..." : "Continue"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-md rounded-full border border-gray-200 px-6 py-3 font-medium text-black transition-colors hover:border-[#D4AF37]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
