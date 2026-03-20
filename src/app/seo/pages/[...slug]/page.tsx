"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { SaveButton } from "@/components/SaveButton";
import toast from "react-hot-toast";
import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";

interface PageSEOData {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string;
  canonicalUrl: string;
  noIndex: boolean;
}

const defaultData: PageSEOData = {
  title: "",
  slug: "",
  metaTitle: "",
  metaDescription: "",
  targetKeywords: "",
  canonicalUrl: "",
  noIndex: false,
};

export default function PageSEOEditor() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug.join("/") : (rawSlug as string);
  const router = useRouter();
  const [formData, setFormData] = useState<PageSEOData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchSEO() {
      if (!slug) return;
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
      const res = await fetch(`/api/seo/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seo: formData }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Page SEO updated!", { id: tid });
        router.refresh();
      } else {
        const errMsg =
          typeof json.error === "string"
            ? json.error
            : json.error?.message || "Update failed.";
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
        <div className="flex justify-between gap-5">
          <PageHeader
            title={`SEO: ${formData.title}`}
            description={`Manage the search engine visibility and social appearance for the /${formData.slug} page.`}
          />
          <div className="mb-2 shrink-0">
            <SaveButton
              onClick={handleSave}
              disabled={isSaving}
              className="w-auto px-10 shrink-0"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1">
        {/* Main Search Engine Optimization */}
        <div className="lg:col-span-2 flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Search className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#0B0F29]">
              Search Engine Meta
            </h2>
          </div>

          <InputField
            label="Meta Title (Browser Tab)"
            value={formData.metaTitle}
            onChange={(e) =>
              setFormData({ ...formData, metaTitle: e.target.value })
            }
            placeholder="e.g. Services | My Awesome Agency"
          />
          <TextAreaField
            label="Meta Description"
            value={formData.metaDescription}
            onChange={(e) =>
              setFormData({ ...formData, metaDescription: e.target.value })
            }
            placeholder="A compelling summary for search result snippets (keep under 160 chars)."
            rows={4}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Target Keywords"
              value={formData.targetKeywords}
              onChange={(e) =>
                setFormData({ ...formData, targetKeywords: e.target.value })
              }
              placeholder="e.g. web design, dev, agency"
            />
            <InputField
              label="Canonical URL"
              value={formData.canonicalUrl}
              onChange={(e) =>
                setFormData({ ...formData, canonicalUrl: e.target.value })
              }
              placeholder="https://mysite.com/page"
            />
          </div>

          <div className="flex items-center gap-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <div className="flex-1">
              <h4 className="font-bold text-[#0B0F29] text-sm mb-1 uppercase tracking-tight">
                Index Visibility
              </h4>
              <p className="text-xs text-gray-500">
                Should search engines find and index this page?
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={!formData.noIndex}
                onChange={(e) =>
                  setFormData({ ...formData, noIndex: !e.target.checked })
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-3 text-sm font-bold text-gray-700">
                {formData.noIndex ? "No-Index" : "Index"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
