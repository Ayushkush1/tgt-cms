"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { CreatePagePopUp } from "./CreatePagePopUp";
import { useSession } from "next-auth/react";

export function AdminHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();
  const userName = session?.user?.name || "Admin";

  return (
    <section className="flex flex-col gap-6">
      <header className="flex w-full items-center justify-between">
        <h1 className="flex items-center gap-2 text-[28px] font-bold tracking-tight text-[#0B0F29]">
          Welcome back <span className="text-[#D4AF37]">{userName}</span>
          <span className="origin-bottom-right animate-bounce text-2xl delay-700">👋</span>
        </h1>

        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=Admin&backgroundColor=d9f969`}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
      </header>

      <div className="flex items-center justify-between">
        <div className="group relative">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-[#0B0F29]" />
          <input
            type="text"
            placeholder="Search content..."
            className="w-[350px] rounded-full border-0 bg-white py-3.5 pr-4 pl-10 text-sm font-medium shadow-sm ring-1 ring-gray-100 transition-all focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex w-max items-center gap-3 rounded-full border border-transparent bg-[#0B0F29] px-8 py-3 font-semibold tracking-wide text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-black hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
        >
          <Plus className="h-4 w-4" />
          Create Page
        </button>
      </div>

      {/* Create Page Modal */}
      <CreatePagePopUp isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </section>
  );
}
