"use client";

import { useState, useRef } from "react";
import { CloudUpload, X } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";

export default function TrustedBySection() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    mainLabel: "",
    subLabel: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Trusted By Section Form Data Saved:", formData);
    console.log("Images:", images);
    // Add API call or further logic here
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );
      setImages((prev) => {
        const newImages = [...prev, ...droppedFiles];
        return newImages.slice(0, 4);
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages((prev) => {
        const newImages = [...prev, ...selectedFiles];
        return newImages.slice(0, 4);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Trusted By Section"
          description="Manage the content displayed on the trusted by section."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className=" grid grid-cols-2 gap-4 pt-2">
              <InputField
                label="Main Label"
                name="mainLabel"
                value={formData.mainLabel}
                onChange={handleChange}
              />
              <InputField
                label="Sub Label"
                name="subLabel"
                value={formData.subLabel}
                onChange={handleChange}
              />

              {/* Image Upload */}
              <h1 className=" text-base font-bold text-gray-500 col-span-2 pt-2">
                Slider Image
              </h1>

              <div className=" col-span-2 flex flex-col gap-1.5">
                <label className=" text-sm font-medium text-gray-700">
                  Image
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg"
                  multiple
                  className="hidden"
                />

                {images.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2 mb-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="w-full border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between p-3 px-4 relative overflow-hidden group"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${idx + 1}`}
                            className="w-12 h-12 object-cover rounded-md shadow-sm border border-gray-200"
                          />
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-semibold text-sm truncate max-w-[200px]">
                              {img.name}
                            </span>
                            <span className="text-gray-500 font-medium text-[12px]">
                              {(img.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeImage(idx)}
                          className="p-1.5 bg-white text-gray-500 hover:text-red-500 rounded-full shadow-sm ring-1 ring-gray-100 transition-colors cursor-pointer relative z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {images.length < 4 && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-1 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-colors cursor-pointer group
                    ${
                      isDragging
                        ? "border-[#0A0F29] border-solid bg-gray-100"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }
                  `}
                  >
                    <span className="text-gray-600 font-medium text-sm mb-4">
                      Provide an image for your Slider ({images.length}/4
                      selected)
                    </span>

                    <div
                      className={`p-3 rounded-full shadow-sm ring-1 ring-gray-100 mb-4 transition-transform
                    ${isDragging ? "bg-[#0A0F29] text-white scale-110" : "bg-white text-[#0A0F29] group-hover:scale-110"}
                  `}
                    >
                      <CloudUpload className="w-6 h-6" strokeWidth={2} />
                    </div>

                    <p className="text-gray-500 text-sm mb-2">
                      <span className="text-blue-600 font-semibold hover:underline mr-1">
                        Click to upload
                      </span>
                      or drag and drop
                    </p>
                    <p className="text-gray-400 text-[13px] font-medium">
                      PNG or JPG (800×400px). Max 4 images.
                    </p>
                  </div>
                )}
              </div>

              <SaveButton onClick={handleSave} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
