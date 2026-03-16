"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  CloudUpload,
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { uploadFiles } from "@/lib/uploadHelpers";
import { fetchWithCache } from "@/lib/apiCache";
import { RichTextEditor } from "@/components/RichTextEditor";

interface BlogItem {
  category: string;
  title: string;
  excerpt: string;
  authorName: string;
  datePublished: string;
  readTime: string;
  views: string;
  image?: string;
  contentHtml?: string;
  isExpanded?: boolean;
}

const defaultBlog = (): BlogItem => ({
  category: "",
  title: "",
  excerpt: "",
  authorName: "",
  datePublished: "",
  readTime: "",
  views: "",
  contentHtml: "",
  isExpanded: false,
});

const defaultFormData = {
  upperTag: "",
  headlinePart1: "",
  headlineHighlight: "",
  viewAllLabel: "",
  viewAllUrl: "",
  blogs: [defaultBlog()] as BlogItem[],
};

interface BlogSectionProps {
  sectionId?: string;
  initialData?: Record<string, unknown>;
  saveUrl?: string; // e.g. /api/home or /api/sections
  onSave?: (data: Record<string, unknown>) => void;
}

export function BlogSection({
  sectionId,
  initialData,
  saveUrl = "/api/home",
  onSave,
}: BlogSectionProps) {
  const [isOpen, setIsOpen] = useState(!initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [blogImages, setBlogImages] = useState<(File | string | null)[]>([]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultFormData, ...initialData });
      if (initialData.blogs && Array.isArray(initialData.blogs)) {
        setBlogImages(
          (initialData.blogs as BlogItem[]).map((b) => b.image || null),
        );
      }
    } else if (saveUrl === "/api/home") {
      fetchWithCache("/api/home")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((json: Record<string, any>) => {
          if (json.success && json.data?.BlogSection) {
            const data = json.data.BlogSection;
            setFormData((prev) => ({ ...prev, ...data }));
            if (data.blogs && Array.isArray(data.blogs)) {
              setBlogImages(
                (data.blogs as BlogItem[]).map((b) => b.image || null),
              );
            }
          }
        })
        .catch(console.error);
    }
  }, [initialData, saveUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlogChange = (
    index: number,
    field: keyof BlogItem,
    value: string,
  ) => {
    setFormData((prev) => {
      const updated = [...prev.blogs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, blogs: updated };
    });
  };

  const toggleExpand = (index: number) => {
    setFormData((prev) => {
      const updated = [...prev.blogs];
      updated[index] = {
        ...updated[index],
        isExpanded: !updated[index].isExpanded,
      };
      return { ...prev, blogs: updated };
    });
  };

  const addBlog = () => {
    setFormData((prev) => ({
      ...prev,
      blogs: [...prev.blogs, defaultBlog()],
    }));
    setBlogImages((prev) => [...prev, null]);
  };

  const removeBlog = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      blogs: prev.blogs.filter((_, i) => i !== indexToRemove),
    }));
    setBlogImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setBlogImages((prev) => {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      });
    }
  };

  const removeImage = (index: number) => {
    setBlogImages((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const uploadedUrls = await uploadFiles(blogImages);
      const payload = {
        ...formData,
        blogs: formData.blogs.map((item, idx) => ({
          ...item,
          image: uploadedUrls[idx] || undefined,
        })),
      };

      const body = sectionId
        ? { id: sectionId, content: payload }
        : { section: "BlogSection", content: payload };

      const method = sectionId
        ? "PUT"
        : saveUrl === "/api/home"
          ? "PUT"
          : "POST";

      const res = await fetch(saveUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Section saved!", { id: toastId });
        if (onSave) onSave(payload as unknown as Record<string, unknown>);
      } else {
        toast.error(json.error || "Save failed", { id: toastId });
      }
    } catch {
      toast.error("Network error", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
        <SectionHeader
          title="Blog Highlights Section"
          description="Manage featured blog posts."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        {isOpen && (
          <div className="flex flex-col gap-8 pt-4 animate-in fade-in duration-500">
            {/* 1. Header Fields Grid */}
            <div className="grid grid-cols-2 gap-6">
              <InputField
                label="Upper Tag"
                name="upperTag"
                value={formData.upperTag || ""}
                onChange={handleChange}
                placeholder="e.g. Our Blog"
                containerClassName="col-span-2"
              />
              <InputField
                label="Headline Part 1"
                name="headlinePart1"
                value={formData.headlinePart1 || ""}
                onChange={handleChange}
                placeholder="e.g. Latest Insights"
                required
              />
              <InputField
                label="Headline Highlight"
                name="headlineHighlight"
                value={formData.headlineHighlight || ""}
                onChange={handleChange}
                placeholder="e.g. and News"
              />
              <InputField
                label="View All Label"
                name="viewAllLabel"
                value={formData.viewAllLabel || ""}
                onChange={handleChange}
                placeholder="e.g. View All Posts"
              />
              <InputField
                label="View All URL"
                name="viewAllUrl"
                value={formData.viewAllUrl || ""}
                onChange={handleChange}
                placeholder="e.g. /blog"
              />
            </div>

            {/* 2. Blog List Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Featured Blogs ({formData.blogs.length})
                </h3>
              </div>

              <div className="space-y-6">
                {(formData.blogs || []).map((blog, index) => (
                  <div
                    key={index}
                    className="bg-gray-50/50 border border-gray-100 rounded-3xl overflow-hidden transition-all duration-300 relative group"
                  >
                    {/* Header */}
                    <div
                      className="p-5 px-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 bg-white"
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm rounded-xl text-gray-400 cursor-grab active:cursor-grabbing transition-all">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-gray-900 text-[15px]">
                            {blog.title || "Untitled Blog Post"}
                          </span>
                          {blog.category && (
                            <span className="text-xs text-gray-500 font-medium">
                              {blog.category} • {blog.authorName || "No author"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(formData.blogs || []).length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBlog(index);
                            }}
                            className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl transition-colors flex items-center gap-2 text-xs font-semibold mr-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {blog.isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Body Content */}
                    {blog.isExpanded && (
                      <div className="p-6 pt-2 grid grid-cols-2 gap-4 bg-white border-t border-gray-100">
                        <InputField
                          label="Category"
                          value={blog.category}
                          onChange={(e) =>
                            handleBlogChange(index, "category", e.target.value)
                          }
                          placeholder="e.g. Technology"
                        />
                        <InputField
                          label="Title"
                          value={blog.title}
                          onChange={(e) =>
                            handleBlogChange(index, "title", e.target.value)
                          }
                          placeholder="e.g. The Future of AI in Web Development"
                          required
                        />
                        <TextAreaField
                          label="Excerpt"
                          value={blog.excerpt}
                          onChange={(e) =>
                            handleBlogChange(index, "excerpt", e.target.value)
                          }
                          placeholder="e.g. Exploring how artificial intelligence is reshaping the landscape of modern web development..."
                        />
                        <InputField
                          label="Author"
                          value={blog.authorName}
                          onChange={(e) =>
                            handleBlogChange(
                              index,
                              "authorName",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. John Doe"
                        />

                        <div className="grid grid-cols-2 gap-4 col-span-2">
                          <InputField
                            label="Published"
                            value={blog.datePublished}
                            onChange={(e) =>
                              handleBlogChange(
                                index,
                                "datePublished",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. Oct 24, 2023"
                          />
                          <InputField
                            label="Read Time"
                            value={blog.readTime}
                            onChange={(e) =>
                              handleBlogChange(
                                index,
                                "readTime",
                                e.target.value,
                              )
                            }
                            placeholder="e.g. 5 min read"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-sm font-medium text-gray-700">
                            Cover Image
                          </label>
                          <input
                            type="file"
                            ref={(el) => {
                              fileInputRefs.current[index] = el;
                            }}
                            onChange={(e) => handleFileChange(index, e)}
                            accept="image/*"
                            className="hidden"
                          />
                          {blogImages[index] ? (
                            <div className="w-full border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between p-3 px-4">
                              <div className="flex items-center gap-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={
                                    typeof blogImages[index] === "string"
                                      ? (blogImages[index] as string)
                                      : URL.createObjectURL(
                                          blogImages[index] as Blob,
                                        )
                                  }
                                  alt={`Blog Image ${index + 1}`}
                                  className="w-12 h-12 object-cover rounded-full shadow-sm border border-gray-200"
                                />
                                <span className="text-gray-900 font-semibold text-sm truncate max-w-[200px]">
                                  Image Uploaded
                                </span>
                              </div>
                              <button
                                onClick={() => removeImage(index)}
                                className="p-1.5 bg-white text-gray-500 hover:text-red-500 rounded-full shadow-sm ring-1 ring-gray-100 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(index);
                              }}
                              onDragLeave={() => setIsDragging(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(null);
                                const file = e.dataTransfer.files[0];
                                if (file?.type.startsWith("image/")) {
                                  setBlogImages((prev) => {
                                    const updated = [...prev];
                                    updated[index] = file;
                                    return updated;
                                  });
                                }
                              }}
                              onClick={() =>
                                fileInputRefs.current[index]?.click()
                              }
                              className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors cursor-pointer group ${
                                isDragging === index
                                  ? "border-[#0A0F29] border-solid bg-gray-100"
                                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              <CloudUpload className="w-6 h-6 text-gray-400 mb-2" />
                              <p className="text-gray-500 text-sm">
                                <span className="text-[#D3AF37] font-semibold hover:underline mr-1">
                                  Click to upload
                                </span>
                                or drag and drop
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2 mt-4">
                          <label className="text-sm font-medium text-gray-700">
                            Blog Content Editor
                          </label>
                          <RichTextEditor
                            value={blog.contentHtml || ""}
                            onChange={(val) =>
                              handleBlogChange(index, "contentHtml", val)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {(formData.blogs || []).length < 10 && (
                <button
                  onClick={addBlog}
                  className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-semibold hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-5 h-5" /> Add Blog Post
                </button>
              )}

              <div className="flex justify-end pt-4">
                <SaveButton
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-40"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
