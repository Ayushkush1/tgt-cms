"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { CreatePagePopUp } from "./CreatePagePopUp";

export function AdminHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className=" flex flex-col gap-6">
      <header className=" flex justify-between items-center w-full">
        <h1 className="text-[28px] font-bold tracking-tight text-[#0B0F29] flex items-center gap-2">
          Welcome back Admin{" "}
          <span className="text-2xl animate-bounce origin-bottom-right delay-700">
            👋
          </span>
        </h1>

        <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=d9f969`}
            alt="Profile"
            className="object-cover w-full h-full"
          />
        </div>
      </header>

      <div className=" flex justify-between items-center">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#0B0F29] transition-colors" />
          <input
            type="text"
            placeholder="Search content..."
            className="pl-10 pr-4 py-3.5 bg-white border-0 ring-1 ring-gray-100 w-[350px] rounded-full text-sm font-medium focus:ring-2 focus:ring-[#D4AF37] focus:outline-none  shadow-sm transition-all"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0B0F29] w-max text-white px-8 py-3 rounded-full font-semibold tracking-wide hover:bg-black transition-all duration-300 border border-transparent hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center gap-3 group"
        >
          <Plus className="w-4 h-4" />
          Create Page
        </button>
      </div>

      {/* Create Page Modal */}
      <CreatePagePopUp
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </section>
  );
}
