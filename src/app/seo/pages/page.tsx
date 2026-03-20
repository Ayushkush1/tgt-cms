"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { Edit2, Search, ChevronDown, ChevronRight } from "lucide-react";

interface PageSEOSummary {
  id: string; // NavLink ID
  pageId: string | null; // Page ID (if matched)
  title: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  type: string;
  visibility: string;
  parent: string;
  order: number;
  description?: string;
  navTitle?: string;
  isStatic?: boolean;
}

export default function PageSEODashboard() {
  const [pages, setPages] = useState<PageSEOSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedParents, setExpandedParents] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    async function fetchPages() {
      try {
        const res = await fetch("/api/seo/pages");
        const json = await res.json();
        if (json.success) {
          setPages(json.data);
        }
      } catch (error) {
        console.error("Error fetching pages for SEO:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPages();
  }, []);

  const toggleParent = (id: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const rootLinks = filteredPages
    .filter((l) => l.parent === "-" || !pages.some((p) => p.id === l.parent))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <PageHeader
        title="Page Specific SEO"
        description="Monitor and manage SEO metadata, OG tags, and canonical URLs for every page on your site."
      />

      <div className="bg-white p-4 rounded-3xl border border-gray-50 shadow-sm flex items-center gap-4 px-6 focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search pages by title or slug..."
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {filteredPages.length} Results
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-gray-100/50">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full divide-y divide-gray-100/50">
            <thead>
              <tr>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[80px]">
                  Order
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Label / Title
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  SEO Status
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[120px]">
                  Type
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37] mx-auto"></div>
                  </td>
                </tr>
              ) : rootLinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                    No pages found matching your search.
                  </td>
                </tr>
              ) : (
                rootLinks.map((root) => {
                  const children = filteredPages
                    .filter((l) => l.parent === root.id)
                    .sort((a, b) => a.order - b.order);
                  const isExpanded = expandedParents[root.id];
                  const hasChildren = children.length > 0;

                  const hasTitle = !!root.metaTitle;
                  const hasDesc = !!root.metaDescription;

                  return (
                    <React.Fragment key={root.id}>
                      <tr className="hover:bg-[#fafafb] transition-colors group">
                        <td className="px-6 py-5 text-sm font-medium text-gray-500">
                          {root.order}
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className={`flex items-center gap-2 ${
                              hasChildren ? "cursor-pointer select-none" : ""
                            }`}
                            onClick={() => hasChildren && toggleParent(root.id)}
                          >
                            {hasChildren ? (
                              isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-[#D4AF37] shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                              )
                            ) : (
                              <div className="w-4 h-4 shrink-0" />
                            )}
                            <div className="flex flex-col">
                              <span className="font-bold text-[#0B0F29] text-[15px]">
                                {root.title}
                                {root.isStatic && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded-md bg-gray-50 text-[9px] font-bold text-gray-400 uppercase border border-gray-100">
                                    Static
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {root.type === "Dropdown" ? (
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                              Group Container
                            </span>
                          ) : (
                            <div className="flex gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  hasTitle
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-red-50 text-red-600 border border-red-100"
                                }`}
                              >
                                {hasTitle ? "Title ✓" : "Title ✗"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  hasDesc
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-red-50 text-red-600 border border-red-100"
                                }`}
                              >
                                {hasDesc ? "Desc ✓" : "Desc ✗"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              root.type === "Main Link"
                                ? "bg-blue-50 text-[#D4AF37]"
                                : root.type === "Dropdown"
                                  ? "bg-purple-50 text-purple-600"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {root.type}
                          </span>
                        </td>
                        <td className="px-6 py-5 w-10 font-mono text-xs text-gray-400">
                          {root.slug === "home" ? "/" : `/${root.slug}`}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3 justify-end">
                            {root.type !== "Dropdown" && (
                              <>
                                <Link
                                  href={`/seo/pages/${root.slug}`}
                                  className="p-2 bg-gray-50 text-brand-navy rounded-xl hover:bg-[#D4AF37] hover:text-[#0B0F29] transition-all group"
                                  title="Edit SEO"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Link>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded &&
                        children.map((child) => {
                          const childHasTitle = !!child.metaTitle;
                          const childHasDesc = !!child.metaDescription;

                          return (
                            <tr
                              key={child.id}
                              className="bg-[#fcfdff]/50 hover:bg-[#f5f8ff] transition-colors group"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-gray-400 pl-12">
                                {child.order}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3 pl-6 border-l-2 border-gray-100/50">
                                  <span className="text-gray-300 text-lg">
                                    ↳
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-xs text-gray-600 group-hover:text-[#0B0F29] transition-colors">
                                      {child.title}
                                    </span>
                                    {(child.navTitle || child.description) && (
                                      <span className="text-[11px] text-gray-400">
                                        {child.navTitle && (
                                          <span className="font-bold mr-1">
                                            {child.navTitle}:
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      childHasTitle
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                        : "bg-red-50 text-red-600 border border-red-100"
                                    }`}
                                  >
                                    {childHasTitle ? "Title ✓" : "Title ✗"}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      childHasDesc
                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                        : "bg-red-50 text-red-600 border border-red-100"
                                    }`}
                                  >
                                    {childHasDesc ? "Desc ✓" : "Desc ✗"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100">
                                  {child.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                {child.slug === "home" ? "/" : `/${child.slug}`}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3 justify-end">
                                  <Link
                                    href={`/seo/pages/${child.slug}`}
                                    className="p-1.5 bg-white border border-gray-100 text-gray-400 rounded-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
