"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { imageFileToDataUrl } from "@/lib/uploadHelpers";
import "react-quill-new/dist/quill.snow.css";
import "@/styles/quill-custom.css";

// Dynamically import ReactQuill to avoid "document is not defined" SSR errors
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full animate-pulse items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 md:h-96">
      <span className="text-sm font-medium text-gray-400">Loading Editor...</span>
    </div>
  ),
});

// The parts of Quill the image handler uses (the editor is loaded dynamically, so no import)
interface QuillLike {
  getSelection: (focus?: boolean) => { index: number } | null;
  getLength: () => number;
  insertEmbed: (index: number, type: string, value: string, source?: string) => void;
  setSelection: (index: number, length?: number) => void;
}

/**
 * Toolbar "image" button: compresses the picture to WebP in the browser and shows it in the
 * post. Nothing is uploaded yet: the section's Save uploads it to Cloudinary
 * (uploadInlineImages), so unsaved edits never leave files behind.
 */
function insertImageHandler(this: { quill: QuillLike }) {
  const quill = this.quill;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png, image/jpeg, image/webp, image/gif, image/svg+xml";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await imageFileToDataUrl(file);
      const index = quill.getSelection(true)?.index ?? quill.getLength();
      quill.insertEmbed(index, "image", dataUrl, "user");
      quill.setSelection(index + 1);
    } catch {
      toast.error("Could not add that image");
    }
  };
  input.click();
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your blog content here...",
}: RichTextEditorProps) {
  // Memoised: Quill re-initialises its toolbar if this object changes between renders
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: { image: insertImageHandler },
      },
    }),
    [],
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "image",
  ];

  return (
    <div className="rich-text-container w-full">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="overflow-hidden rounded-2xl bg-white shadow-sm"
      />
    </div>
  );
}
