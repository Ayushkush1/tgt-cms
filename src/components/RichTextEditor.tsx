"use client";

import dynamic from "next/dynamic";
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
  const modules = {
    toolbar: [
      [{ header: [2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

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
