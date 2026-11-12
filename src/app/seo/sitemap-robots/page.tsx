"use client";

import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { SaveButton } from "@/app/components/SaveButton";
import toast from "react-hot-toast";
import { Globe, FileText, CheckCircle, ExternalLink, Upload, Trash2, Check } from "lucide-react";

interface SitemapRobotsConfig {
  sitemapEnabled: boolean;
  sitemapCustomContent: string | null;
  robotsTxt: string;
}

const defaultData: SitemapRobotsConfig = {
  sitemapEnabled: true,
  sitemapCustomContent: null,
  robotsTxt: `User-agent: *\nAllow: /\n\nSitemap: ${process.env.NEXT_PUBLIC_WEBSITE_URL || ""}/sitemap.xml`,
};

export default function SitemapRobotsPage() {
  const [formData, setFormData] = useState<SitemapRobotsConfig>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const sitemapInputRef = useRef<HTMLInputElement>(null);
  const robotsInputRef = useRef<HTMLInputElement>(null);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/seo/global");
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data;
          setFormData({
            sitemapEnabled: data.sitemapEnabled !== undefined ? data.sitemapEnabled : true,
            sitemapCustomContent: data.sitemapCustomContent || null,
            robotsTxt: data.robotsTxt || "",
          });
        }
      } catch (error) {
        console.error("Error fetching sitemap & robots config:", error);
        toast.error("Failed to load settings.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const tid = toast.loading("Saving sitemap & robots settings...");

    try {
      // Fetch current configuration
      const fetchRes = await fetch("/api/seo/global");
      const fetchJson = await fetchRes.json();
      const currentConfig = fetchJson.success ? fetchJson.data : {};

      const payload = {
        ...currentConfig,
        sitemapEnabled: formData.sitemapEnabled,
        sitemapCustomContent: formData.sitemapCustomContent,
        robotsTxt: formData.robotsTxt,
      };

      const res = await fetch("/api/seo/global", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: payload }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Settings saved successfully!", { id: tid });
      } else {
        toast.error("Failed to save settings.", { id: tid });
      }
    } catch (error) {
      console.error("Error saving sitemap & robots config:", error);
      toast.error("Network error occurred.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  // Upload handlers
  const handleSitemapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check type
    if (
      !file.name.endsWith(".xml") &&
      file.type !== "text/xml" &&
      file.type !== "application/xml"
    ) {
      toast.error("Please upload a valid .xml sitemap file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setFormData((prev) => ({
          ...prev,
          sitemapCustomContent: text,
        }));
        toast.success("Sitemap XML content loaded! Save to apply changes.");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const handleRobotsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt") && file.type !== "text/plain") {
      toast.error("Please upload a valid .txt robots rules file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setFormData((prev) => ({
          ...prev,
          robotsTxt: text,
        }));
        toast.success("Robots rules loaded to editor! Review and Save to apply changes.");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
    };
    reader.readAsText(file);
  };

  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F8FA]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#475DB1]"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in mx-auto flex max-w-6xl flex-col gap-8 pb-20 duration-500">
      <PageHeader
        title="Sitemap & Robots.txt"
        description="Configure search engine crawler visibility, robots rules, and dynamic sitemap options."
      />

      <div className="flex flex-col gap-8">
        {/* Live Endpoints info */}
        <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h4 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Live SEO Endpoints
          </h4>
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="max-w-md text-xs leading-relaxed font-light text-gray-500">
              These are crawled automatically by search bots like Googlebot. Click below to inspect
              your live files:
            </p>

            <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row md:mt-0 md:w-auto">
              <a
                href={`${websiteUrl}/sitemap.xml`}
                target="_blank"
                rel="noreferrer"
                className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-100 sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  sitemap.xml
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-[#475DB1]" />
              </a>

              <a
                href={`${websiteUrl}/robots.txt`}
                target="_blank"
                rel="noreferrer"
                className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3.5 text-xs font-bold text-gray-700 transition-all hover:bg-gray-100 sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  robots.txt
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-[#475DB1]" />
              </a>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="flex flex-col gap-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          {/* Sitemap section */}
          <div className="flex flex-col gap-4">
            <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-gray-900">
              <Globe className="h-5 w-5 text-[#475DB1]" />
              Sitemap Options
            </h3>
            <p className="text-xs leading-relaxed font-light text-gray-400">
              A sitemap tells search engines which pages and files you think are important in your
              site, and provides valuable information about them.
            </p>

            {/* Sitemap Toggle switch */}
            <div className="mt-2 flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex flex-col gap-1 pr-4">
                <span className="text-xs font-bold text-gray-800">Generate sitemap.xml</span>
                <span className="text-[10px] font-light text-gray-400">
                  Automatically compiles static links and published blogs into a sitemap format.
                </span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center select-none">
                <input
                  type="checkbox"
                  checked={formData.sitemapEnabled}
                  onChange={(e) => setFormData({ ...formData, sitemapEnabled: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-[#475DB1] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            {/* Sitemap File Upload Options */}
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-gray-800">Custom Sitemap XML File</span>
                  <span className="text-[10px] font-light text-gray-400">
                    Upload a custom XML sitemap to override the automatically generated version.
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={sitemapInputRef}
                    onChange={handleSitemapUpload}
                    accept=".xml,text/xml,application/xml"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => sitemapInputRef.current?.click()}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-[11px] font-bold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload .XML
                  </button>

                  {formData.sitemapCustomContent && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, sitemapCustomContent: null }));
                        toast.success("Custom sitemap cleared. Auto-generation restored!");
                      }}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100"
                      title="Delete custom sitemap"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {formData.sitemapCustomContent && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/50 p-2.5 text-[10px] font-medium text-amber-700">
                  <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  Custom sitemap file uploaded (Auto-generation overridden). Save to apply.
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Robots.txt section */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-gray-900">
                <FileText className="h-5 w-5 text-[#475DB1]" />
                Robots.txt Rules
              </h3>

              <div className="flex gap-2">
                <input
                  type="file"
                  ref={robotsInputRef}
                  onChange={handleRobotsUpload}
                  accept=".txt,text/plain"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => robotsInputRef.current?.click()}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-gray-600 transition-colors hover:bg-gray-100"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Rules (.txt)
                </button>
              </div>
            </div>

            <p className="text-xs leading-relaxed font-light text-gray-400">
              Robots.txt file tells search engine crawlers which URLs the crawler can access on your
              site. This is used mainly to avoid overloading your site with requests.
            </p>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-700">robots.txt rules</span>
              <textarea
                value={formData.robotsTxt}
                onChange={(e) => setFormData({ ...formData, robotsTxt: e.target.value })}
                placeholder="User-agent: *&#10;Allow: /"
                rows={8}
                className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3.5 font-mono text-xs leading-relaxed text-[#0B0F29] transition-all outline-none placeholder:text-gray-400 focus:border-[#0B0F29] focus:ring-2 focus:ring-[#0B0F29]/15"
              />
            </div>
          </div>

          <SaveButton onClick={handleSave} disabled={isSaving} />
        </div>
      </div>
    </div>
  );
}
