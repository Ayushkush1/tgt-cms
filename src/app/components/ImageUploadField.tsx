import React, { useState, useRef } from "react";
import { CloudUpload, X } from "lucide-react";

interface ImageUploadFieldProps {
  label?: string;
  images?: (File | string | null)[];
  onImagesChange?: (images: (File | string | null)[]) => void;
  maxImages?: number;
  containerClassName?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = "Image",
  images: controlledImages,
  onImagesChange,
  maxImages = 1,
  containerClassName = "",
}) => {
  const [internalImages, setInternalImages] = useState<
    (File | string | null)[]
  >([]);
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
    <div className={`flex flex-col gap-1.5 mx-2 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
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
        <div className="flex flex-col gap-2 mt-1 mb-1">
          {images.map((img, idx) => {
            if (!img) return null;
            return (
              <div
                key={idx}
                className="w-full border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between p-3 px-4 relative overflow-hidden group"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      typeof img === "string"
                        ? img
                        : (img as any) instanceof File ||
                            (img as any) instanceof Blob
                          ? URL.createObjectURL(img as any)
                          : ""
                    }
                    alt={`Preview ${idx + 1}`}
                    className="w-12 h-12 object-cover rounded-md shadow-sm border border-gray-200"
                  />
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-semibold text-sm truncate max-w-[200px]">
                      {typeof img === "string"
                        ? "Uploaded Image"
                        : (img as any).name || "Unknown"}
                    </span>
                    <span className="text-gray-500 font-medium text-[12px]">
                      {typeof img === "string"
                        ? "Cloud / Remote"
                        : (img as any).size
                          ? ((img as any).size / 1024 / 1024).toFixed(2) + " MB"
                          : "Unknown size"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeImage(idx);
                  }}
                  className="p-1.5 bg-white text-gray-500 hover:text-red-500 rounded-full shadow-sm ring-1 ring-gray-100 transition-colors cursor-pointer relative z-10"
                >
                  <X className="w-4 h-4" />
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
          className={`mt-1 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 lg:p-8 transition-colors cursor-pointer group
          ${
            isDragging
              ? "border-[#0A0F29] border-solid bg-gray-100"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100"
          }
        `}
        >
          <span className="text-gray-600 font-medium text-sm mb-4">
            {maxImages > 1
              ? `Slider Image (${images.length}/${maxImages} selected)`
              : "Provide an image for your Service"}
          </span>

          <div
            className={`p-3 rounded-full shadow-sm ring-1 ring-gray-100 mb-4 transition-transform
          ${isDragging ? "bg-[#0A0F29] text-white scale-110" : "bg-white text-[#0A0F29] group-hover:scale-110"}
        `}
          >
            <CloudUpload className="w-6 h-6" strokeWidth={2} />
          </div>

          <p className="text-gray-500 text-sm mb-2 text-center">
            <span className="text-[#D3AF37] font-semibold hover:underline mr-1">
              Click to upload
            </span>
            <br className="lg:hidden" />
            <span className="hidden lg:inline">or </span>drag and drop
          </p>
          <p className="text-gray-400 text-[13px] font-medium text-center">
            PNG or JPG (800×400px).{" "}
            {maxImages > 1 ? `Max ${maxImages} images.` : ""}
          </p>
        </div>
      )}
    </div>
  );
};
