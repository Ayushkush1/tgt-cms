"use client";

import { useState } from "react";
import { PageHeader } from "../../components/PageHeader";
import { CloudUpload, Trash } from "lucide-react";

export default function AboutSettingsPage() {
  const [imageName, setImageName] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageName(e.target.files[0].name);
    } else {
      setImageName(null);
    }
  };

  return (
    <section className=" flex flex-col gap-6 ">
      <PageHeader
        title="About Section Content"
        description="Update the 'Who We Are' section on the homepage."
      />

      <section className="  border border-gray-300 px-8 py-10 rounded-4xl">
        <form className=" flex flex-col gap-4.5">
          {/* logo and email */}

          {/* phone */}
          <div className=" flex flex-col gap-3.5">
            <label className="block text-sm font-semibold text-[#0B0F29]">
              Heading Text
            </label>
            <input
              type="text"
              required
              placeholder="e.g. About Us, Contact"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-2.5 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none"
            />
          </div>

          {/* textarea */}

          <label className="block text-sm font-semibold text-[#0B0F29]">
            Main Content / Paragraph
          </label>
          <textarea
            rows={6}
            required
            placeholder="e.g. About Us, Contact"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-2.5 text-black placeholder-gray-400 focus:border-[#0B0F29] outline-none"
          ></textarea>

          {/* CTA */}

          <div className=" flex flex-col gap-3.5">
            <label className="block text-sm font-semibold text-[#0B0F29]">
              Image
            </label>
            {!imageName ? (
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-gray-300 transition-colors bg-white group">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  required
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <p className="text-sm font-medium text-gray-600 mb-4">
                  Provide an image for your Work Highlight
                </p>
                <div className="mb-4 text-black group-hover:-translate-y-1 transition-transform border border-gray-200 p-2 rounded-full shadow-sm">
                  <CloudUpload className="w-6 h-6" strokeWidth={2} />
                </div>
                <p className="text-sm font-semibold text-[#0066FF] mb-2">
                  Click to upload{" "}
                  <span className="text-gray-500 font-normal">
                    or drag and drop
                  </span>
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  PNG or JPG (800x400px for the best result)
                </p>
              </div>
            ) : (
              <div className=" border border-gray-200 flex items-center justify-between px-6 py-3.5 rounded-xl">
                <span>{imageName}</span>
                <Trash
                  color="red"
                  className=" cursor-pointer"
                  onClick={() => setImageName("")}
                />
              </div>
            )}
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
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}
