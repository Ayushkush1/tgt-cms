"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { SaveButton } from "@/components/SaveButton";
import { HeadingTagField } from "@/components/HeadingTagField";
import toast from "react-hot-toast";
import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";
import { isHeadingTag, legacyHeadingTag, toHeadingTag, type HeadingTag } from "@/lib/headingTags";

interface PageSEOData {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  targetKeywords: string;
  canonicalUrl: string;
  noIndex: boolean;
  schema?: string;
  headingOptions: HeadingTag | ""; // the page's main heading tag
}

const defaultData: PageSEOData = {
  title: "",
  slug: "",
  metaTitle: "",
  metaDescription: "",
  targetKeywords: "",
  canonicalUrl: "",
  noIndex: false,
  schema: "",
  headingOptions: "",
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
        const isService = slug.startsWith("service/");
        const [res, contentRes] = await Promise.all([
          fetch(`/api/seo/pages/${slug}`),
          // The page content, to pre-fill the heading tag (?slim=1: without blog bodies)
          fetch(
            isService
              ? `/api/services?id=${encodeURIComponent(slug.slice("service/".length))}`
              : `/api/pages/${encodeURIComponent(slug)}?slim=1`,
          ),
        ]);
        const json = await res.json();
        const contentJson = await contentRes.json().catch(() => null);

        // Until it's saved here, use the tag the page's main section editor stored before
        const sectionContents: unknown[] = isService
          ? [contentJson?.data?.hero]
          : (contentJson?.data?.sections ?? []).map((s: { content: unknown }) => s.content);
        const legacyTags = sectionContents.map(legacyHeadingTag).filter(isHeadingTag);
        const legacy = legacyTags.find((tag) => tag === "h1") ?? legacyTags[0] ?? "";

        if (json.success && json.data) {
          const data = json.data;
          setFormData({
            ...defaultData,
            ...data,
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
            targetKeywords: data.targetKeywords || "",
            canonicalUrl: data.canonicalUrl || "",
            schema: data.schema || "",
            headingOptions: toHeadingTag(data.headingOptions) || legacy || "h1",
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
          typeof json.error === "string" ? json.error : json.error?.message || "Update failed.";
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
        <div className="animate-pulse font-mono text-xs font-medium tracking-widest text-gray-400 uppercase">
          Fetching metadata...
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto flex max-w-6xl flex-col gap-8 pb-20 duration-500">
      <div className="flex flex-col gap-4">
        <Link
          href="/seo/pages"
          className="hover:text-brand-navy group flex w-fit items-center gap-2 text-sm font-bold text-gray-400 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
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
              className="w-auto shrink-0 px-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1">
        {/* Main Search Engine Optimization */}
        <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-2.5 text-blue-600">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-[#0B0F29]">Search Engine Meta</h2>
          </div>

          <InputField
            label="Meta Title (Browser Tab)"
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            placeholder="e.g. Services | My Awesome Agency"
            tooltip="Page-specific title. Overrides the default site title to improve search relevance for this page."
          />
          <TextAreaField
            label="Meta Description"
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            placeholder="A compelling summary for search result snippets (keep under 160 chars)."
            rows={4}
            tooltip="A brief summary of this specific page's content. Search engines use this for the result snippet."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              label="Target Keywords"
              value={formData.targetKeywords}
              onChange={(e) => setFormData({ ...formData, targetKeywords: e.target.value })}
              placeholder="e.g. web design, dev, agency"
              tooltip="Comma-separated keywords or phrases you want this specific page to rank for."
            />
            <InputField
              label="Canonical URL"
              value={formData.canonicalUrl}
              onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
              placeholder="https://mysite.com/page"
              tooltip="The preferred URL for this page. Helps prevent duplicate content issues if the page is accessible via multiple URLs."
            />
          </div>

          <HeadingTagField
            value={formData.headingOptions}
            onChange={(headingOptions) => setFormData({ ...formData, headingOptions })}
            description="Select the semantic HTML heading tag used for this page hero title."
          />

          <TextAreaField
            label="Structured Data (Schema Markup JSON-LD)"
            value={formData.schema || ""}
            onChange={(e) => setFormData({ ...formData, schema: e.target.value })}
            placeholder='e.g. { "@context": "https://schema.org", "@type": "WebPage", "name": "Portfolio" }'
            rows={6}
            className="font-mono text-xs"
            allowJsonUpload={true}
          />

          <div className="flex items-center gap-8 rounded-3xl border border-gray-100 bg-gray-50 p-6">
            <div className="flex-1">
              <h4 className="mb-1 text-sm font-bold tracking-tight text-[#0B0F29] uppercase">
                Index Visibility
              </h4>
              <p className="text-xs text-gray-500">
                Should search engines find and index this page?
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={!formData.noIndex}
                onChange={(e) => setFormData({ ...formData, noIndex: !e.target.checked })}
              />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-emerald-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
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
