"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { SaveButton } from "@/components/SaveButton";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadFiles } from "@/app/lib/uploadHelpers";
import toast from "react-hot-toast";
import { ChevronLeft, Layout, Share2, Target, Search } from "lucide-react";
import Link from "next/link";

interface PageSEOData {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string;
  canonicalUrl: string;
  noIndex: boolean;
  featuredImage: (File | string | null)[];
  ogTitle: string;
  ogDescription: string;
  ogImage: (File | string | null)[];
  headingOptions: {
    h1: string;
    h2: string;
    h3: string;
  };
}

const defaultData: PageSEOData = {
  title: "",
  slug: "",
  metaTitle: "",
  metaDescription: "",
  targetKeywords: "",
  canonicalUrl: "",
  noIndex: false,
  featuredImage: [],
  ogTitle: "",
  ogDescription: "",
  ogImage: [],
  headingOptions: {
    h1: "",
    h2: "",
    h3: "",
  },
};

export default function PageSEOEditor() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const [formData, setFormData] = useState<PageSEOData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSEO() {
      try {
        const res = await fetch(`/api/seo/pages/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data;
          setFormData({
            ...defaultData,
            ...data,
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
            targetKeywords: data.targetKeywords || "",
            canonicalUrl: data.canonicalUrl || "",
            ogTitle: data.ogTitle || "",
            ogDescription: data.ogDescription || "",
            featuredImage: data.featuredImage ? [data.featuredImage] : [],
            ogImage: data.ogImage ? [data.ogImage] : [],
            headingOptions: data.headingOptions || defaultData.headingOptions,
          });
        }
      } catch (error) {
        console.error("Error fetching page SEO:", error);
        toast.error("Failed to load page SEO.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSEO();
  }, [slug]);

  const handleSave = async () => {
    setIsSaving(true);
    const tid = toast.loading("Saving page SEO...");

    try {
      // 1. Upload images
      const [featUrls, ogUrls] = await Promise.all([
        uploadFiles(formData.featuredImage),
        uploadFiles(formData.ogImage),
      ]);

      const payload = {
        ...formData,
        featuredImage: featUrls[0] || null,
        ogImage: ogUrls[0] || null,
      };

      const res = await fetch(`/api/seo/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo: payload }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Page SEO updated!", { id: tid });
        router.refresh();
      } else {
        const errMsg = typeof json.error === "string" ? json.error : json.error?.message || "Update failed.";
        console.error("Page SEO update error details:", json.error);
        toast.error(errMsg, { id: tid });
      }
    } catch (error) {
      console.error("Error saving page SEO:", error);
      toast.error("Network error.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-pulse text-gray-400 font-medium font-mono text-xs tracking-widest uppercase">
          Fetching metadata...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        <Link
          href="/seo/pages"
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-navy transition-colors w-fit group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Pages
        </Link>
        <div className="flex justify-between items-end">
          <PageHeader
            title={`SEO: ${formData.title}`}
            description={`Manage the search engine visibility and social appearance for the /${formData.slug} page.`}
          />
          <div className="mb-2">
            <SaveButton onClick={handleSave} disabled={isSaving} className="w-auto px-10" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Search Engine Optimization */}
        <div className="lg:col-span-2 flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Search className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#0B0F29]">Search Engine Meta</h2>
          </div>

          <InputField
            label="Meta Title (Browser Tab)"
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            placeholder="e.g. Services | My Awesome Agency"
          />
          <TextAreaField
            label="Meta Description"
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            placeholder="A compelling summary for search result snippets (keep under 160 chars)."
            rows={4}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Target Keywords"
              value={formData.targetKeywords}
              onChange={(e) => setFormData({ ...formData, targetKeywords: e.target.value })}
              placeholder="e.g. web design, dev, agency"
            />
            <InputField
              label="Canonical URL"
              value={formData.canonicalUrl}
              onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
              placeholder="https://mysite.com/page"
            />
          </div>

          <div className="flex items-center gap-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="flex-1">
              <h4 className="font-bold text-[#0B0F29] text-sm mb-1 uppercase tracking-tight">Index Visibility</h4>
              <p className="text-xs text-gray-500">Should search engines find and index this page?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!formData.noIndex}
                onChange={(e) => setFormData({ ...formData, noIndex: !e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-3 text-sm font-bold text-gray-700">{formData.noIndex ? "No-Index" : "Index"}</span>
            </label>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#0B0F29]">Heading Structure (H1-H3)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="H1 Heading"
                value={formData.headingOptions.h1}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  headingOptions: { ...formData.headingOptions, h1: e.target.value } 
                })}
                placeholder="Primary heading..."
              />
              <InputField
                label="H2 Sub-heading"
                value={formData.headingOptions.h2}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  headingOptions: { ...formData.headingOptions, h2: e.target.value } 
                })}
                placeholder="Important sub-heading..."
              />
              <InputField
                label="H3 Group heading"
                value={formData.headingOptions.h3}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  headingOptions: { ...formData.headingOptions, h3: e.target.value } 
                })}
                placeholder="Section heading..."
              />
            </div>
          </div>
        </div>

        {/* Preview / Social Sidebar */}
        <div className="flex flex-col gap-8">
          {/* Social / OG Settings */}
          <div className="flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
                <Share2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#0B0F29]">Social Sharing</h2>
            </div>

            <InputField
              label="OG Title"
              value={formData.ogTitle}
              onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
              placeholder="Title for FB/LinkedIn/Twitter"
            />
            <TextAreaField
              label="OG Description"
              value={formData.ogDescription}
              onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
              placeholder="Description for social cards"
              rows={3}
            />
            <ImageUploadField
              label="Social Share Image (OG Image)"
              images={formData.ogImage}
              onImagesChange={(imgs) => setFormData({ ...formData, ogImage: imgs })}
              maxImages={1}
            />
          </div>

          {/* Featured Image */}
          <div className="flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                <Layout className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-[#0B0F29]">Page Assets</h2>
            </div>
            <ImageUploadField
              label="Featured Image (Thumbnail)"
              images={formData.featuredImage}
              onImagesChange={(imgs) => setFormData({ ...formData, featuredImage: imgs })}
              maxImages={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
