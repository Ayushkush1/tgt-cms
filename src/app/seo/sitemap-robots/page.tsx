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
  robotsTxt: "User-agent: *\nAllow: /\n\nSitemap: https://tgt-landing-page-jade.vercel.app/sitemap.xml",
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
    if (!file.name.endsWith(".xml") && file.type !== "text/xml" && file.type !== "application/xml") {
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

  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || "https://tgt-landing-page-jade.vercel.app";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#475DB1]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <PageHeader
        title="Sitemap & Robots.txt"
        description="Configure search engine crawler visibility, robots rules, and dynamic sitemap options."
      />

      <div className="flex flex-col gap-8">
        {/* Live Endpoints info */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Live SEO Endpoints</h4>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <p className="text-gray-500 text-xs font-light leading-relaxed max-w-md">
              These are crawled automatically by search bots like Googlebot. Click below to inspect your live files:
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
              <a
                href={`${websiteUrl}/sitemap.xml`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 transition-all group w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  sitemap.xml
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#475DB1] transition-colors" />
              </a>

              <a
                href={`${websiteUrl}/robots.txt`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 transition-all group w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  robots.txt
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#475DB1] transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8">
          
          {/* Sitemap section */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#475DB1]" />
              Sitemap Options
            </h3>
            <p className="text-gray-400 text-xs font-light leading-relaxed">
              A sitemap tells search engines which pages and files you think are important in your site, and provides valuable information about them.
            </p>

            {/* Sitemap Toggle switch */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl mt-2">
              <div className="flex flex-col gap-1 pr-4">
                <span className="text-xs font-bold text-gray-800">Generate sitemap.xml</span>
                <span className="text-[10px] text-gray-400 font-light">Automatically compiles static links and published blogs into a sitemap format.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.sitemapEnabled}
                  onChange={(e) => setFormData({ ...formData, sitemapEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#475DB1]"></div>
              </label>
            </div>

            {/* Sitemap File Upload Options */}
            <div className="flex flex-col gap-3 p-4 border border-dashed border-gray-200 rounded-2xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-gray-800">Custom Sitemap XML File</span>
                  <span className="text-[10px] text-gray-400 font-light">Upload a custom XML sitemap to override the automatically generated version.</span>
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
                    className="flex items-center gap-1.5 py-2 px-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload .XML
                  </button>
                  
                  {formData.sitemapCustomContent && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, sitemapCustomContent: null }));
                        toast.success("Custom sitemap cleared. Auto-generation restored!");
                      }}
                      className="flex items-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl text-[11px] font-bold text-red-600 transition-colors cursor-pointer"
                      title="Delete custom sitemap"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {formData.sitemapCustomContent && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl text-[10px] text-amber-700 font-medium">
                  <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  Custom sitemap file uploaded (Auto-generation overridden). Save to apply.
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Robots.txt section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#475DB1]" />
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
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-600 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Rules (.txt)
                </button>
              </div>
            </div>

            <p className="text-gray-400 text-xs font-light leading-relaxed">
              Robots.txt file tells search engine crawlers which URLs the crawler can access on your site. This is used mainly to avoid overloading your site with requests.
            </p>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-700">robots.txt rules</span>
              <textarea
                value={formData.robotsTxt}
                onChange={(e) => setFormData({ ...formData, robotsTxt: e.target.value })}
                placeholder="User-agent: *&#10;Allow: /"
                rows={8}
                className="w-full font-mono text-xs p-4 bg-gray-50 text-gray-800 border border-gray-200 focus:border-[#475DB1] focus:bg-white transition-all rounded-2xl outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <SaveButton onClick={handleSave} disabled={isSaving} />
          </div>
        </div>
      </div>
    </div>
  );
}
