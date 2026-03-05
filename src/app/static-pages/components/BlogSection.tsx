"use client";
import { useState, useEffect, useRef } from "react";
import { fetchWithCache } from "@/lib/apiCache";
import toast from "react-hot-toast";
import { CloudUpload, X, Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { uploadFiles } from "@/lib/uploadHelpers";

const SECTION_KEY = "BlogSection";

interface BlogItem {
  category: string;
  title: string;
  excerpt: string;
  authorName: string;
  datePublished: string;
  readTime: string;
  views: string;
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

export default function BlogSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [blogImages, setBlogImages] = useState<(File | null)[]>([null]);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchWithCache("/api/home")
      .then((json) => {
        if (json.success && json.data?.[SECTION_KEY]) {
          const data = json.data[SECTION_KEY];
          setFormData((prev) => ({ ...prev, ...data }));
          if (data.blogs) {
            setBlogImages(Array(data.blogs.length).fill(null));
          }
        }
      })
      .catch(console.error);
  }, []);

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

  const addBlog = () => {
    setFormData((prev) => ({ ...prev, blogs: [...prev.blogs, defaultBlog()] }));
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
    const errs: string[] = [];
    if (!formData.upperTag?.trim()) errs.push("Upper Tag is required");
    if (!formData.headlinePart1?.trim())
      errs.push("Headline (Part 1) is required");
    formData.blogs.forEach((b, i) => {
      if (!b.title.trim()) errs.push(`Blog ${i + 1} Title is required`);
      if (!b.authorName.trim())
        errs.push(`Blog ${i + 1} Author Name is required`);
    });
    if (errs.length > 0) {
      errs.forEach((m) => toast.error(m));
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving...");
    try {
      const uploadedUrls = await uploadFiles(blogImages);
      const payload = {
        ...formData,
        blogs: formData.blogs.map((item, idx) => ({ ...item, image: uploadedUrls[idx] }))
      };
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: SECTION_KEY, content: payload }),
      });
      const json = await res.json();
      json.success
        ? toast.success("Blog section saved!", { id: toastId })
        : toast.error("Save failed. Please try again.", { id: toastId });
    } catch {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Blog Highlights Section"
          description="Manage the featured blog posts and header content displayed on the page."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
        <div
          className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <h1 className="text-base font-bold text-gray-500 col-span-2">
                Header Section
              </h1>
              <InputField
                label="Upper Tag"
                name="upperTag"
                value={formData.upperTag || ""}
                onChange={handleChange}
                placeholder="e.g. Our Blog"
                containerClassName="col-span-2"
                required
              />
              <InputField
                label="Headline (Part 1)"
                name="headlinePart1"
                value={formData.headlinePart1 || ""}
                onChange={handleChange}
                placeholder="e.g. Insights &"
                required
              />
              <InputField
                label="Headline (Highlight)"
                name="headlineHighlight"
                value={formData.headlineHighlight || ""}
                onChange={handleChange}
                placeholder="e.g. Perspectives"
              />
              <InputField
                label="View All Button Label"
                name="viewAllLabel"
                value={formData.viewAllLabel || ""}
                onChange={handleChange}
                placeholder="e.g. View All Articles"
              />
              <InputField
                label="View All Button URL"
                name="viewAllUrl"
                value={formData.viewAllUrl || ""}
                onChange={handleChange}
                placeholder="e.g. /blog"
              />

              {/* ── Dynamic Blogs List ── */}
              <div className="col-span-2 flex items-center justify-between mt-4 mb-2">
                <h1 className="text-base font-bold text-gray-500">
                  Featured Blogs
                </h1>
                <span className="text-sm font-medium text-gray-400">
                  {formData.blogs.length} mapped
                </span>
              </div>

              {formData.blogs.map((blog, index) => (
                <div
                  key={index}
                  className="col-span-2 border border-gray-100 rounded-xl p-4 flex flex-col gap-4 bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">
                      Featured Blog {index + 1}
                    </h2>
                    {formData.blogs.length > 1 && (
                      <button
                        onClick={() => removeBlog(index)}
                        className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Category"
                      placeholder="e.g. Tech Trends"
                      value={blog.category}
                      onChange={(e) =>
                        handleBlogChange(index, "category", e.target.value)
                      }
                      containerClassName="col-span-1"
                    />
                    <InputField
                      label="Title"
                      placeholder="e.g. Future of AI in Web Development"
                      value={blog.title}
                      onChange={(e) =>
                        handleBlogChange(index, "title", e.target.value)
                      }
                      containerClassName="col-span-1"
                      required
                    />
                    <TextAreaField
                      label="Excerpt"
                      rows={2}
                      containerClassName="col-span-2"
                      placeholder="e.g. How artificial intelligence is reshaping digital platforms..."
                      value={blog.excerpt}
                      onChange={(e) =>
                        handleBlogChange(index, "excerpt", e.target.value)
                      }
                    />
                    <InputField
                      label="Author Name"
                      placeholder="e.g. Sarah Jenkins"
                      value={blog.authorName}
                      onChange={(e) =>
                        handleBlogChange(index, "authorName", e.target.value)
                      }
                      containerClassName="col-span-1"
                      required
                    />
                    <InputField
                      label="Date Published"
                      placeholder="e.g. 2 Days ago"
                      value={blog.datePublished}
                      onChange={(e) =>
                        handleBlogChange(index, "datePublished", e.target.value)
                      }
                      containerClassName="col-span-1"
                    />
                    <InputField
                      label="Read Time"
                      placeholder="e.g. 5m"
                      value={blog.readTime}
                      onChange={(e) =>
                        handleBlogChange(index, "readTime", e.target.value)
                      }
                      containerClassName="col-span-1"
                    />
                    <InputField
                      label="Views count"
                      placeholder="e.g. 1.2k"
                      value={blog.views}
                      onChange={(e) =>
                        handleBlogChange(index, "views", e.target.value)
                      }
                      containerClassName="col-span-1"
                    />

                    {/* Per-blog image upload */}
                    <div className="col-span-2 flex flex-col gap-1.5 mx-2 mt-2">
                      <label className="text-sm font-medium text-gray-700">
                        Blog Cover Image
                      </label>
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[index] = el;
                        }}
                        onChange={(e) => handleFileChange(index, e)}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                      />
                      {blogImages[index] ? (
                        <div className="w-full border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between p-3 px-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={typeof blogImages[index] === "string" ? blogImages[index] : URL.createObjectURL(blogImages[index] as Blob)}
                              alt={`Blog ${index + 1}`}
                              className="w-12 h-12 object-cover rounded-md shadow-sm border border-gray-200"
                            />
                            <div className="flex flex-col">
                              <span className="text-gray-900 font-semibold text-sm truncate max-w-[200px]">
                                {typeof blogImages[index] === "string" ? "Uploaded Image" : (blogImages[index] as File).name}
                              </span>
                              <span className="text-gray-500 text-[12px]">
                                {(
                                  blogImages[index]!.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeImage(index)}
                            className="p-1.5 bg-white text-gray-500 hover:text-red-500 rounded-full shadow-sm ring-1 ring-gray-100 transition-colors cursor-pointer"
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
                          onClick={() => fileInputRefs.current[index]?.click()}
                          className={`w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors cursor-pointer group ${isDragging === index ? "border-[#0A0F29] border-solid bg-gray-100" : "border-gray-200 bg-gray-50 hover:bg-gray-100"}`}
                        >
                          <div
                            className={`p-2.5 rounded-full shadow-sm ring-1 ring-gray-100 mb-2 transition-transform ${isDragging === index ? "bg-[#0A0F29] text-white scale-110" : "bg-white text-[#0A0F29] group-hover:scale-110"}`}
                          >
                            <CloudUpload className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <p className="text-gray-500 text-sm">
                            <span className="text-[#D3AF37] font-semibold hover:underline mr-1">
                              Click to upload
                            </span>
                            or drag and drop
                          </p>
                          <p className="text-gray-400 text-[12px] mt-1">
                            PNG, JPG or WebP
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addBlog}
                className="col-span-2 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Blog Post
              </button>

              <div className="col-span-2 mt-2">
                <SaveButton onClick={handleSave} disabled={isSaving} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
