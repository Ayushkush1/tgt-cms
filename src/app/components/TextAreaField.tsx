import React, { useState, useRef } from "react";
import { HelpCircle, Link as LinkIcon, X, Upload } from "lucide-react";
import toast from "react-hot-toast";

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
  tooltip?: string;
  allowJsonUpload?: boolean;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  containerClassName = "",
  className = "",
  rows = 4,
  tooltip,
  allowJsonUpload = false,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);

        const textarea = textareaRef.current;
        if (!textarea) return;

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          "value",
        )?.set;
        nativeInputValueSetter?.call(textarea, formatted);

        const changeEvent = new Event("input", { bubbles: true });
        textarea.dispatchEvent(changeEvent);

        toast.success("JSON loaded successfully!");
      } catch (err) {
        console.error("Invalid JSON file:", err);
        toast.error("Invalid JSON file format. Please upload valid JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const textareaClass = `w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:outline-none focus:border-[#0A0F29] focus:ring-1 focus:ring-[#0A0F29] outline-none transition-all text-gray-800 ${className}`;

  const handleOpenLinkModal = (e: React.MouseEvent) => {
    e.preventDefault();
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    setLinkText(selectedText || "");
    setLinkUrl("");
    setShowLinkModal(true);
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const finalLinkText = linkText.trim() || "link";
    const finalLinkUrl = linkUrl.trim() || "#";

    const linkMarkdown = `[${finalLinkText}](${finalLinkUrl})`;
    const newValue = text.substring(0, start) + linkMarkdown + text.substring(end);

    // Programmatically update the value and trigger parent's onChange
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    nativeInputValueSetter?.call(textarea, newValue);

    const event = new Event("input", { bubbles: true });
    textarea.dispatchEvent(event);

    setShowLinkModal(false);

    // Refocus and place cursor after the inserted link
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + linkMarkdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName} relative px-0.5`}>
      <div className="flex w-full items-center justify-between pr-4">
        {label && (
          <label className="relative ml-4 flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            {label}
            {tooltip && (
              <div className="group relative flex items-center">
                <HelpCircle className="h-3.5 w-3.5 cursor-help text-gray-300 transition-colors hover:text-[#D4AF37]" />
                {/* Tooltip Bubble */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-max max-w-[280px] -translate-x-1/2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-center text-[11px] leading-relaxed font-medium tracking-normal text-gray-900 normal-case opacity-0 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                  {tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
                </div>
              </div>
            )}
          </label>
        )}

        <div className="flex items-center gap-4">
          {allowJsonUpload && (
            <>
              <button
                type="button"
                onClick={handleUploadClick}
                className="flex cursor-pointer items-center gap-1 text-[10px] font-bold tracking-wider text-[#0A0F29] uppercase transition-colors hover:text-[#D4AF37]"
                title="Upload JSON schema file"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload JSON
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
              />
            </>
          )}

          {/* Sleek link button */}
          <button
            type="button"
            onClick={handleOpenLinkModal}
            className="flex cursor-pointer items-center gap-1 text-[10px] font-bold tracking-wider text-[#0A0F29] uppercase transition-colors hover:text-[#D4AF37]"
            title="Insert link formatting"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Add Link
          </button>
        </div>
      </div>

      <textarea ref={textareaRef} rows={rows} className={textareaClass} {...props} />

      {/* Styled Inline Link Dialog/Modal */}
      {showLinkModal && (
        <div className="animate-in fade-in absolute top-10 left-1/2 z-50 flex w-80 -translate-x-1/2 flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_15px_40px_rgba(0,0,0,0.15)] duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              Insert Link Info
            </span>
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleInsertLink} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                Link Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Click here"
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#0A0F29] focus:ring-1 focus:ring-[#0A0F29]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                Link URL
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="e.g. /our-story or https://google.com"
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#0A0F29] focus:ring-1 focus:ring-[#0A0F29]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="cursor-pointer rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-lg bg-[#0A0F29] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#D4AF37]"
              >
                Insert
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
