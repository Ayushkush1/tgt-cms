"use client";

import { PageHeader } from "../../components/PageHeader";

export default function GeneralSettingsPage() {
  return (
    <section className=" flex flex-col gap-6 ">
      <PageHeader
        title="General Settings"
        description="Manage your site's core information and contact details."
      />

      <section className="  border border-gray-300 px-8 py-10 rounded-4xl">
        <form className=" flex flex-col gap-4.5">
          {/* logo and email */}
          <div className=" grid grid-cols-2 gap-6">
            <div className=" flex flex-col gap-3.5">
              <label className="block text-sm font-semibold text-[#0B0F29]">
                Site Name / Logo Text
              </label>
              <input
                type="text"
                required
                placeholder="e.g. About Us, Contact"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-2.5 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none"
              />
            </div>
            <div className=" flex flex-col gap-3.5">
              <label className="block text-sm font-semibold text-[#0B0F29]">
                Contact Email
              </label>
              <input
                type="text"
                required
                placeholder="e.g. About Us, Contact"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-2.5 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none"
              />
            </div>
          </div>

          {/* phone */}
          <div className=" flex flex-col gap-3.5">
            <label className="block text-sm font-semibold text-[#0B0F29]">
              Contact Phone
            </label>
            <input
              type="text"
              required
              placeholder="e.g. About Us, Contact"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-2.5 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none"
            />
          </div>

          {/* textarea */}
          <div className=" flex flex-col gap-3.5">
            <label className="block text-sm font-semibold text-[#0B0F29]">
              Physical Address
            </label>
            <textarea
              cols={4}
              required
              placeholder="e.g. About Us, Contact"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-2.5 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none"
            ></textarea>
          </div>

          {/* Footer Copyright Text*/}
          <div className=" flex flex-col gap-3.5">
            <label className="block text-sm font-semibold text-[#0B0F29]">
              Footer Copyright Text
            </label>
            <input
              type="text"
              required
              placeholder="e.g. About Us, Contact"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-2.5 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none"
            />
          </div>
          <hr className=" text-gray-200 mb-4 mt-9" />

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              className="text-black px-6 py-3 border-transparent rounded-full text-md font-medium transition-colors border hover:border-[#D4AF37]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className=" w-40 bg-[#0B0F29] text-white font-semibold py-3 rounded-full hover:bg-black transition-all hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            >
              Save Settings
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
