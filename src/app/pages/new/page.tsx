"use client";

import { useState, Suspense } from "react";
import { ArrowLeft, Save, LayoutTemplate, Settings, Tag } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { useSearchParams } from "next/navigation";

function NewPageContent() {
  const [activeTab, setActiveTab] = useState("content");

  // Try to use URL params if the admin clicked "Create Page" from the dashboard modal popup
  const searchParams = useSearchParams();
  const initialName = searchParams.get("name") || "";
  const initialType = searchParams.get("type") || "standard";

  const [pageName, setPageName] = useState(initialName);
  const [pageSlug, setPageSlug] = useState(
    initialName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  );

  const [pageContent, setPageContent] = useState("");
  const [metaTitle, setMetaTitle] = useState(initialName);
  const [metaDescription, setMetaDescription] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [noIndex, setNoIndex] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [parentPage, setParentPage] = useState("none");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (publish: boolean) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/pages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: pageName,
            slug: pageSlug,
            content: pageContent,
            type: initialType,
            visibility: publish ? visibility : "draft",
            metaTitle: metaTitle || pageName,
            metaDescription,
            targetKeywords,
            canonicalUrl,
            noIndex,
            parentPage: parentPage === "none" ? null : parentPage,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to save page");
      alert(
        publish ? "Page published successfully!" : "Draft saved successfully!",
      );
    } catch (error) {
      console.error("Error saving page:", error);
      alert("Error saving the page. Is the backend running?");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/pages"
            className="text-sm font-medium text-gray-400 hover:text-[#0B0F29] flex items-center gap-2 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pages
          </Link>
          <h1 className="text-[28px] font-bold tracking-tight text-[#0B0F29]">
            Create New{" "}
            {initialType.charAt(0).toUpperCase() + initialType.slice(1)} Page
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-[#0B0F29] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] rounded-full text-sm font-bold text-[#0B0F29] hover:bg-[#B5952F] shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-colors transform hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Publishing..." : "Publish Page"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content Area (8 Cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl w-fit shadow-sm ring-1 ring-gray-50">
            <button
              onClick={() => setActiveTab("content")}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                activeTab === "content"
                  ? "bg-[#0B0F29] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#0B0F29]",
              )}
            >
              <LayoutTemplate className="w-4 h-4" />
              Content
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                activeTab === "seo"
                  ? "bg-[#0B0F29] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#0B0F29]",
              )}
            >
              <Tag className="w-4 h-4" />
              SEO Settings
            </button>
          </div>

          {/* Form Areas */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm ring-1 ring-gray-50">
            {activeTab === "content" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <label className="block text-sm font-bold text-[#0B0F29] mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={pageName}
                    onChange={(e) => {
                      setPageName(e.target.value);
                      setPageSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, ""),
                      );
                    }}
                    placeholder="e.g. About Us, Contact, Features"
                    className="w-full px-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl text-[15px] font-medium focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0B0F29] mb-2">
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="bg-gray-50 border-y border-l border-gray-100 px-4 py-3 rounded-l-2xl text-[15px] font-medium text-gray-400">
                      yourdomain.com/
                    </span>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value)}
                      placeholder="about-us"
                      className="w-full px-4 py-3 bg-white border-y border-r border-gray-100 rounded-r-2xl text-[15px] font-medium focus:ring-2 focus:ring-[#D4AF37] transition-all outline-none"
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-400">
                    Keep it short and lowercase, using hyphens instead of
                    spaces.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0B0F29] mb-2">
                    Page Content
                  </label>
                  <div className="w-full min-h-[300px] bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl p-4 cursor-text focus-within:ring-2 focus-within:ring-[#D4AF37] focus-within:bg-white transition-all">
                    <textarea
                      value={pageContent}
                      onChange={(e) => setPageContent(e.target.value)}
                      placeholder="Start typing your content here..."
                      className="w-full h-full min-h-[280px] bg-transparent resize-none outline-none text-[15px] font-medium"
                    ></textarea>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#0B0F29]">
                    Search Engine Optimization
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">
                    Optimize how this page appears in Google search results.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-[#0B0F29]">
                      Meta Title
                    </label>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                      Max 60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="The primary title tag for this page"
                    className="w-full px-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl text-[15px] font-medium focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-[#0B0F29]">
                      Meta Description
                    </label>
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                      Max 160 chars
                    </span>
                  </div>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Write a compelling description that encourages clicks from search results..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl text-[15px] font-medium focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0B0F29] mb-2">
                    Target Keywords
                  </label>
                  <input
                    type="text"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                    placeholder="e.g. digital marketing, seo services (comma separated)"
                    className="w-full px-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl text-[15px] font-medium focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all outline-none"
                  />
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-6">
                  <h4 className="font-bold text-[#0B0F29]">Advanced SEO</h4>

                  <div>
                    <label className="block text-sm font-bold text-[#0B0F29] mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="text"
                      value={canonicalUrl}
                      onChange={(e) => setCanonicalUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl text-[15px] font-medium focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all outline-none"
                    />
                    <p className="mt-2 text-xs font-medium text-gray-400">
                      Leave blank to default to this page's URL.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                    <input
                      type="checkbox"
                      id="noindex"
                      checked={noIndex}
                      onChange={(e) => setNoIndex(e.target.checked)}
                      className="w-5 h-5 rounded custom-checkbox accent-[#0B0F29]"
                    />
                    <label
                      htmlFor="noindex"
                      className="text-sm font-bold text-[#0B0F29] cursor-pointer"
                    >
                      Hide from Search Engines (NoIndex)
                      <span className="block text-xs font-medium text-gray-500 mt-0.5">
                        Prevent Google from indexing this page.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Area (4 Cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Publishing Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm ring-1 ring-gray-50">
            <div className="flex items-center gap-2 font-bold text-[#0B0F29] mb-6">
              <Settings className="w-5 h-5" />
              Page Settings
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl text-[14px] font-bold text-[#0B0F29] focus:ring-2 focus:ring-[#D4AF37] transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="public">🌍 Public (Published)</option>
                  <option value="draft">📝 Draft (Hidden)</option>
                  <option value="private">🔒 Private (Admins Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Parent Page
                </label>
                <select
                  value={parentPage}
                  onChange={(e) => setParentPage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl text-[14px] font-bold text-[#0B0F29] focus:ring-2 focus:ring-[#D4AF37] transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="none">None (Top Level)</option>
                  <option value="about">About</option>
                  <option value="services">Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Featured Image (OG Image)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl h-32 flex flex-col items-center justify-center text-center p-4 hover:border-[#0B0F29] hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <span className="text-lg">📸</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    Upload Social Sharing Image
                  </span>
                </div>
                <p className="mt-2 text-[11px] font-medium text-gray-400 text-center">
                  Used when sharing links on social media.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500 font-medium animate-pulse">
          Loading editor...
        </div>
      }
    >
      <NewPageContent />
    </Suspense>
  );
}
