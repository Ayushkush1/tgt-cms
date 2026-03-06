"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { CloudUpload, X, Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { uploadFiles } from "@/lib/uploadHelpers";

interface BlogItem {
  category: string;
  title: string;
  excerpt: string;
  authorName: string;
  datePublished: string;
  readTime: string;
  views: string;
  image?: string;
}

const defaultBlog = (): BlogItem => ({
  category: "",
  title: "",
  excerpt: "",
  authorName: "",
  datePublished: "",
  readTime: "",
  views: "",
});

const defaultFormData = {
  upperTag: "",
  headlinePart1: "",
  headlineHighlight: "",
  viewAllLabel: "",
  viewAllUrl: "",
  blogs: [defaultBlog()] as BlogItem[],
};

interface BlogSectionCMSProps {
  sectionId?: string;
  initialData?: any;
  saveUrl?: string;
  onSave?: (data: any) => void;
}

export function BlogSectionCMS({
  sectionId,
  initialData,
  saveUrl = "/api/sections",
  onSave,
}: BlogSectionCMSProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [blogImages, setBlogImages] = useState<(File | string | null)[]>([
    null,
  ]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(initialData || defaultFormData);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.blogs) {
        setBlogImages(initialData.blogs.map((b: any) => b.image || null));
      }
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleBlogChange = (
    index: number,
    field: keyof BlogItem,
    value: string,
  ) => {
    setFormData((prev: any) => {
      const updated = [...prev.blogs];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, blogs: updated };
    });
  };

  const addBlog = () => {
    setFormData((prev: any) => ({
      ...prev,
      blogs: [...prev.blogs, defaultBlog()],
    }));
    setBlogImages((prev) => [...prev, null]);
  };

  const removeBlog = (indexToRemove: number) => {
    setFormData((prev: any) => ({
      ...prev,
      blogs: prev.blogs.filter((_: any, i: number) => i !== indexToRemove),
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
        blogs: formData.blogs.map((item: any, idx: number) => ({
          ...item,
          image: uploadedUrls[idx],
        })),
      };

      const body = sectionId
        ? { id: sectionId, content: payload }
        : { section: "BlogSection", content: payload };

      const res = await fetch(saveUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Section saved!", { id: toastId });
        if (onSave) onSave(payload);
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
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="Blog Highlights Section"
        description="Manage featured blog posts."
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="flex flex-col gap-8 pt-4 animate-in fade-in duration-500">
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
              required
            />
            <InputField
              label="Headline Highlight"
              name="headlineHighlight"
              value={formData.headlineHighlight || ""}
              onChange={handleChange}
            />
            <InputField
              label="View All Label"
              name="viewAllLabel"
              value={formData.viewAllLabel || ""}
              onChange={handleChange}
            />
            <InputField
              label="View All URL"
              name="viewAllUrl"
              value={formData.viewAllUrl || ""}
              onChange={handleChange}
            />

            <div className="col-span-2 flex items-center justify-between mt-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Featured Blogs ({formData.blogs.length})
              </h3>
            </div>

            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.blogs.map((blog: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-3xl p-6 flex flex-col gap-4 bg-white shadow-sm relative group"
                >
                  <button
                    onClick={() => removeBlog(index)}
                    className="absolute -top-3 -right-3 p-2 bg-red-50 text-red-500 rounded-full shadow-sm hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <InputField
                    label="Category"
                    value={blog.category}
                    onChange={(e) =>
                      handleBlogChange(index, "category", e.target.value)
                    }
                  />
                  <InputField
                    label="Title"
                    value={blog.title}
                    onChange={(e) =>
                      handleBlogChange(index, "title", e.target.value)
                    }
                    required
                  />
                  <TextAreaField
                    label="Excerpt"
                    value={blog.excerpt}
                    onChange={(e) =>
                      handleBlogChange(index, "excerpt", e.target.value)
                    }
                  />
                  <InputField
                    label="Author"
                    value={blog.authorName}
                    onChange={(e) =>
                      handleBlogChange(index, "authorName", e.target.value)
                    }
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Published"
                      value={blog.datePublished}
                      onChange={(e) =>
                        handleBlogChange(index, "datePublished", e.target.value)
                      }
                    />
                    <InputField
                      label="Read Time"
                      value={blog.readTime}
                      onChange={(e) =>
                        handleBlogChange(index, "readTime", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
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
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group/img">
                        <img
                          src={
                            typeof blogImages[index] === "string"
                              ? (blogImages[index] as string)
                              : URL.createObjectURL(blogImages[index] as Blob)
                          }
                          className="w-full h-full object-cover"
                          alt="Blog"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className="aspect-video border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <CloudUpload className="w-6 h-6 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 font-medium">
                          Upload Image
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {formData.blogs.length < 10 && (
                <button
                  onClick={addBlog}
                  className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span className="font-semibold">Add Blog Post</span>
                </button>
              )}
            </div>

            <div className="col-span-2 flex justify-end pt-4">
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
  );
}
