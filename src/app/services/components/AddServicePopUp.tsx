"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export type Service = {
  id: string;
  title: string;
  description: string;
  iconName: string;
};

export const AddServicePopUp = ({
  setIsModalOpen,
  isModalOpen,
  onSave,
  serviceToEdit,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onSave: (service: Omit<Service, "id"> | Service) => void;
  serviceToEdit?: Service | null;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState("");

  useEffect(() => {
    if (isModalOpen) {
      if (serviceToEdit) {
        setTitle(serviceToEdit.title);
        setDescription(serviceToEdit.description);
        setIconName(serviceToEdit.iconName);
      } else {
        setTitle("");
        setDescription("");
        setIconName("");
      }
    }
  }, [isModalOpen, serviceToEdit]);

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
                  {serviceToEdit ? "Edit Service" : "Add Service"}
                </h2>

                <p className="text-gray-500 text-sm mt-3 mb-8">
                  Enter the details to add a new service to your offerings.
                </p>
                {/* Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSave({
                      ...(serviceToEdit ? { id: serviceToEdit.id } : {}),
                      title,
                      description,
                      iconName,
                    });
                  }}
                  className="space-y-6 text-left"
                >
                  <div className=" flex flex-col gap-2">
                    <label className="block text-sm font-semibold text-[#0B0F29]">
                      Service Title*
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Custom Web Development"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none"
                    />
                  </div>
                  <div className=" flex flex-col gap-2">
                    <label className="block text-sm font-semibold text-[#0B0F29]">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Building scalable web applications."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none resize-none"
                    />
                  </div>
                  <div className=" flex flex-col gap-2">
                    <label className="block text-sm font-semibold text-[#0B0F29]">
                      Icon Class/Name
                    </label>
                    <input
                      type="text"
                      value={iconName}
                      onChange={(e) => setIconName(e.target.value)}
                      placeholder="e.g. Code"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none"
                    />
                  </div>

                  {/* CTA */}

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      className=" w-32 bg-[#0B0F29] text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:bg-black transition-all hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                    >
                      Save
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
