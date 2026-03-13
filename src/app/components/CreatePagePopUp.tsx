"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export const CreatePagePopUp = ({
  setIsModalOpen,
  isModalOpen,
}: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [pageName, setPageName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName.trim()) {
      toast.error("Please enter a page name");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating page...");

    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: pageName }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Page created successfully!", { id: toastId });
        setPageName("");
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10"
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
            <div className="relative w-full max-w-lg rounded-[3rem] bg-white border drop-shadow-md border-gray-200 shadow-2xl overflow-hidden">
              {/* Close */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-10 top-10 text-gray-400 hover:text-black"
              >
                <X />
              </button>

              {/* Content */}
              <div className="p-10 ">
                <h2 className="text-2xl font-semibold text-black tracking-tight">
                  Create New Page
                </h2>

                <p className="text-gray-500 text-sm mt-3 mb-8">
                  Enter a name to create a new page for your website.
                </p>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                  <div className=" flex flex-col gap-2">
                    <label className="block text-sm font-semibold text-[#0B0F29]">
                      Page Name*
                    </label>
                    <input
                      type="text"
                      required
                      value={pageName}
                      onChange={(e) => setPageName(e.target.value)}
                      placeholder="e.g. About Us, Contact"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none"
                    />
                  </div>

                  {/* CTA — SAME AS HERO BUTTON */}

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className=" w-32 bg-[#0B0F29] text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-all hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-50"
                    >
                      {isSubmitting ? "Creating..." : "Continue"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="text-black px-6 py-3 border-gray-200 rounded-full text-md font-medium transition-colors border hover:border-[#D4AF37]"
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
