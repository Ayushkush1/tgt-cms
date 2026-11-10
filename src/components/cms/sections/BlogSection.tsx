"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { CloudUpload, X, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
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
  authorTitle?: string;
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
  authorTitle: "",
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
  relatedTitle: "",
  relatedDescription: "",
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
        setBlogImages((initialData.blogs as BlogItem[]).map((b) => b.image || null));
      }
    } else if (saveUrl === "/api/home") {
      fetchWithCache("/api/home")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((json: Record<string, any>) => {
          if (json.success && json.data?.BlogSection) {
            const data = json.data.BlogSection;
            setFormData((prev) => ({ ...prev, ...data }));
            if (data.blogs && Array.isArray(data.blogs)) {
              setBlogImages((data.blogs as BlogItem[]).map((b) => b.image || null));
            }
          }
        })
        .catch(console.error);
    }
  }, [initialData, saveUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlogChange = (index: number, field: keyof BlogItem, value: string) => {
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

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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

      const method = sectionId ? "PUT" : saveUrl === "/api/home" ? "PUT" : "POST";

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
      <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all">
        <SectionHeader
          title="Blog Highlights Section"
          description="Manage featured blog posts."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        {isOpen && (
          <div className="animate-in fade-in flex flex-col gap-8 pt-4 duration-500">
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
              <InputField
                label="Related Posts Title (Blog Page)"
                name="relatedTitle"
                value={formData.relatedTitle || ""}
                onChange={handleChange}
                placeholder="e.g. Continue Reading"
              />
              <InputField
                label="Related Posts Subtitle (Blog Page)"
                name="relatedDescription"
                value={formData.relatedDescription || ""}
                onChange={handleChange}
                placeholder="e.g. More on design, engineering, and craft"
                containerClassName="col-span-2"
              />
            </div>

            {/* 2. Blog List Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                  Featured Blogs ({formData.blogs.length})
                </h3>
              </div>

              <div className="space-y-6">
                {(formData.blogs || []).map((blog, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-gray-50/50 transition-all duration-300"
                  >
                    {/* Header */}
                    <div
                      className="flex cursor-pointer items-center justify-between bg-white p-5 px-6 hover:bg-gray-50"
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="cursor-grab rounded-xl border border-transparent bg-gray-50 p-2.5 text-gray-400 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm active:cursor-grabbing">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[15px] font-semibold text-gray-900">
                            {blog.title || "Untitled Blog Post"}
                          </span>
                          {blog.category && (
                            <span className="text-xs font-medium text-gray-500">
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
                            className="mr-2 flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {blog.isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Body Content */}
                    {blog.isExpanded && (
                      <div className="grid grid-cols-2 gap-4 border-t border-gray-100 bg-white p-6 pt-2">
                        <InputField
                          label="Category"
                          value={blog.category}
                          onChange={(e) => handleBlogChange(index, "category", e.target.value)}
                          placeholder="e.g. Technology"
                        />
                        <InputField
                          label="Title"
                          value={blog.title}
                          onChange={(e) => handleBlogChange(index, "title", e.target.value)}
                          placeholder="e.g. The Future of AI in Web Development"
                          required
                        />
                        <TextAreaField
                          label="Excerpt"
                          value={blog.excerpt}
                          onChange={(e) => handleBlogChange(index, "excerpt", e.target.value)}
                          placeholder="e.g. Exploring how artificial intelligence is reshaping the landscape of modern web development..."
                        />
                        <InputField
                          label="Author"
                          value={blog.authorName}
                          onChange={(e) => handleBlogChange(index, "authorName", e.target.value)}
                          placeholder="e.g. John Doe"
                        />
                        <InputField
                          label="Author Title / Designation"
                          value={blog.authorTitle || ""}
                          onChange={(e) => handleBlogChange(index, "authorTitle", e.target.value)}
                          placeholder="e.g. Senior Design Engineer · Studio Volta"
                        />

                        <div className="col-span-2 grid grid-cols-2 gap-4">
                          <InputField
                            label="Published"
                            value={blog.datePublished}
                            onChange={(e) =>
                              handleBlogChange(index, "datePublished", e.target.value)
                            }
                            placeholder="e.g. Oct 24, 2023"
                          />
                          <InputField
                            label="Read Time"
                            value={blog.readTime}
                            onChange={(e) => handleBlogChange(index, "readTime", e.target.value)}
                            placeholder="e.g. 5 min read"
                          />
                        </div>

                        <div className="col-span-2 flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">Cover Image</label>
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
                            <div className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3 px-4">
                              <div className="flex items-center gap-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={
                                    typeof blogImages[index] === "string"
                                      ? (blogImages[index] as string)
                                      : URL.createObjectURL(blogImages[index] as Blob)
                                  }
                                  alt={`Blog Image ${index + 1}`}
                                  className="h-12 w-12 rounded-full border border-gray-200 object-cover shadow-sm"
                                />
                                <span className="max-w-[200px] truncate text-sm font-semibold text-gray-900">
                                  Image Uploaded
                                </span>
                              </div>
                              <button
                                onClick={() => removeImage(index)}
                                className="rounded-full bg-white p-1.5 text-gray-500 shadow-sm ring-1 ring-gray-100 transition-colors hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
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
                              onClick={() => fileInputRefs.current[index]?.click()}
                              className={`group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
                                isDragging === index
                                  ? "border-solid border-[#0A0F29] bg-gray-100"
                                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              <CloudUpload className="mb-2 h-6 w-6 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                <span className="mr-1 font-semibold text-[#D3AF37] hover:underline">
                                  Click to upload
                                </span>
                                or drag and drop
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="col-span-2 mt-4 flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Blog Content Editor
                          </label>
                          <RichTextEditor
                            value={blog.contentHtml || ""}
                            onChange={(val) => handleBlogChange(index, "contentHtml", val)}
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
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 font-semibold text-gray-500 transition-colors hover:bg-gray-50"
                >
                  <Plus className="h-5 w-5" /> Add Blog Post
                </button>
              )}

              <div className="flex justify-end pt-4">
                <SaveButton onClick={handleSave} disabled={isSaving} className="w-40" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
