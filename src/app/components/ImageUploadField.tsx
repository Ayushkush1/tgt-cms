import React, { useState, useRef } from "react";
import { CloudUpload, X, HelpCircle } from "lucide-react";

interface ImageUploadFieldProps {
  label?: string;
  images?: (File | string | null)[];
  onImagesChange?: (images: (File | string | null)[]) => void;
  maxImages?: number;
  containerClassName?: string;
  tooltip?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = "Image",
  images: controlledImages,
  onImagesChange,
  maxImages = 1,
  containerClassName = "",
  tooltip,
}) => {
  const [internalImages, setInternalImages] = useState<(File | string | null)[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = controlledImages ?? internalImages;

  const handleUpdate = (newImages: (File | string | null)[]) => {
    if (!controlledImages) {
      setInternalImages(newImages);
    }
    onImagesChange?.(newImages);
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
      const newImages = [...images, ...droppedFiles].slice(0, maxImages);
      handleUpdate(newImages);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newImages = [...images, ...selectedFiles].slice(0, maxImages);
      handleUpdate(newImages);
    }
  };

  const removeImage = (index: number) => {
    handleUpdate(images.filter((_, i) => i !== index));
  };

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="relative ml-4 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          {label}
          {tooltip && (
            <div className="group/tooltip relative flex items-center">
              <HelpCircle className="h-3.5 w-3.5 cursor-help text-gray-300 transition-colors hover:text-[#D4AF37]" />
              {/* Tooltip Bubble */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-max max-w-[280px] -translate-x-1/2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-center text-[11px] leading-relaxed font-medium tracking-normal text-gray-900 normal-case opacity-0 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-all duration-300 group-hover/tooltip:opacity-100">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
              </div>
            </div>
          )}
        </label>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg"
        multiple={maxImages > 1}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="mt-1 mb-1 flex flex-col gap-2">
          {images.map((img, idx) => {
            if (!img) return null;
            return (
              <div
                key={idx}
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-3 px-4"
              >
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={typeof img === "string" ? img : URL.createObjectURL(img as Blob)}
                    alt={`Preview ${idx + 1}`}
                    className="h-12 w-12 rounded-md border border-gray-200 object-cover shadow-sm"
                  />
                  <div className="flex flex-col">
                    <span className="max-w-[200px] truncate text-sm font-semibold text-gray-900">
                      {typeof img === "string" ? "Uploaded Image" : (img as File).name || "Unknown"}
                    </span>
                    <span className="text-[12px] font-medium text-gray-500">
                      {typeof img === "string"
                        ? "Cloud / Remote"
                        : (img as File).size
                          ? ((img as File).size / 1024 / 1024).toFixed(2) + " MB"
                          : "Unknown size"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeImage(idx);
                  }}
                  className="relative z-10 cursor-pointer rounded-full bg-white p-1.5 text-gray-500 shadow-sm ring-1 ring-gray-100 transition-colors hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group mt-1 flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors lg:p-8 ${
            isDragging
              ? "border-solid border-[#0A0F29] bg-gray-100"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100"
          } `}
        >
          <span className="mb-4 text-sm font-medium text-gray-600">
            {maxImages > 1
              ? `Slider Image (${images.length}/${maxImages} selected)`
              : "Provide an image for your Service"}
          </span>

          <div
            className={`mb-4 rounded-full p-3 shadow-sm ring-1 ring-gray-100 transition-transform ${isDragging ? "scale-110 bg-[#0A0F29] text-white" : "bg-white text-[#0A0F29] group-hover:scale-110"} `}
          >
            <CloudUpload className="h-6 w-6" strokeWidth={2} />
          </div>

          <p className="mb-2 text-center text-sm text-gray-500">
            <span className="mr-1 font-semibold text-[#D3AF37] hover:underline">
              Click to upload
            </span>
            <br className="lg:hidden" />
            <span className="hidden lg:inline">or </span>drag and drop
          </p>
          <p className="text-center text-[13px] font-medium text-gray-400">
            PNG or JPG (800×400px). {maxImages > 1 ? `Max ${maxImages} images.` : ""}
          </p>
        </div>
      )}
    </div>
  );
};
