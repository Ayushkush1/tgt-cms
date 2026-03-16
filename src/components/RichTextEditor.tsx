"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import "@/styles/quill-custom.css";

// Dynamically import ReactQuill to avoid "document is not defined" SSR errors
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-64 md:h-96 w-full animate-pulse bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
      <span className="text-gray-400 font-medium text-sm">Loading Editor...</span>
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
        className="bg-white rounded-2xl overflow-hidden shadow-sm"
      />
    </div>
  );
}
