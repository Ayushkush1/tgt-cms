"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { Edit2, Search, ChevronDown, ChevronRight } from "lucide-react";
import { encodeSlugPath } from "@/lib/blogSlug";

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

const formatDisplayUrl = (slug: string) => {
  if (!slug) return "—";
  if (slug === "home") return "/";
  return /^https?:\/\//.test(slug) ? slug : `/${slug}`;
};

export default function PageSEODashboard() {
  const [pages, setPages] = useState<PageSEOSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

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
    .filter((l) => l.parent === "-" || !filteredPages.some((p) => p.id === l.parent))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="animate-in fade-in mx-auto flex max-w-6xl flex-col gap-6 pb-20 duration-500">
      <PageHeader
        title="Page Specific SEO"
        description="Monitor and manage SEO metadata, OG tags, and canonical URLs for every page on your site."
      />

      <div className="flex items-center gap-4 rounded-3xl border border-gray-50 bg-white p-4 px-6 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#D4AF37]/20">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search pages by title or slug..."
          className="flex-1 border-none bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">
          {filteredPages.length} Results
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-gray-100/50">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full divide-y divide-gray-100/50">
            <thead>
              <tr>
                <th className="w-[80px] px-6 py-5 text-left text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  Order
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  Label / Title
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  SEO Status
                </th>
                <th className="w-[120px] px-6 py-5 text-left text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  URL
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[#D4AF37]"></div>
                  </td>
                </tr>
              ) : rootLinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                    No pages found matching your search.
                  </td>
                </tr>
              ) : (
                rootLinks.map((root, rootIndex) => {
                  const children = filteredPages
                    .filter((l) => l.parent === root.id)
                    .sort((a, b) => a.order - b.order);
                  const isExpanded = expandedParents[root.id];
                  const hasChildren = children.length > 0;

                  const hasTitle = !!root.metaTitle;
                  const hasDesc = !!root.metaDescription;
                  const rootUrl = formatDisplayUrl(root.slug);

                  return (
                    <React.Fragment key={root.id}>
                      <tr className="group transition-colors hover:bg-[#fafafb]">
                        <td className="px-6 py-5 text-sm font-medium text-gray-500 tabular-nums">
                          {rootIndex + 1}
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
                                <ChevronDown className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                              ) : (
                                <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                              )
                            ) : (
                              <div className="h-4 w-4 shrink-0" />
                            )}
                            <div className="flex max-w-[240px] min-w-0 items-center gap-2">
                              <span
                                title={root.title}
                                className="line-clamp-2 text-[15px] font-bold text-[#0B0F29]"
                              >
                                {root.title}
                              </span>
                              {root.isStatic && (
                                <span className="shrink-0 rounded-md border border-gray-100 bg-gray-50 px-1.5 py-0.5 text-[9px] font-bold text-gray-400 uppercase">
                                  Static
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {root.type === "Dropdown" && !root.slug ? (
                            <span className="text-[10px] font-bold tracking-widest whitespace-nowrap text-gray-300 uppercase">
                              Group Container
                            </span>
                          ) : (
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase ${
                                  hasTitle
                                    ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                                    : "border border-red-100 bg-red-50 text-red-600"
                                }`}
                              >
                                {hasTitle ? "Title ✓" : "Title ✗"}
                              </span>
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase ${
                                  hasDesc
                                    ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                                    : "border border-red-100 bg-red-50 text-red-600"
                                }`}
                              >
                                {hasDesc ? "Desc ✓" : "Desc ✗"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase ${
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
                        <td className="px-6 py-5">
                          <div
                            title={rootUrl}
                            className="line-clamp-2 max-w-[260px] font-mono text-xs break-all text-gray-400"
                          >
                            {rootUrl}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-3">
                            {!(root.type === "Dropdown" && !root.slug) && (
                              <>
                                <Link
                                  href={`/seo/pages/${encodeSlugPath(root.slug)}`}
                                  className="text-brand-navy group rounded-xl bg-gray-50 p-2 transition-all hover:bg-[#D4AF37] hover:text-[#0B0F29]"
                                  title="Edit SEO"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Link>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded &&
                        children.map((child, childIndex) => {
                          const grandChildren = filteredPages
                            .filter((l) => l.parent === child.id)
                            .sort((a, b) => a.order - b.order);
                          const hasGrandChildren = grandChildren.length > 0;
                          const isChildExpanded = expandedParents[child.id];
                          const childHasTitle = !!child.metaTitle;
                          const childHasDesc = !!child.metaDescription;
                          const childUrl = formatDisplayUrl(child.slug);

                          return (
                            <React.Fragment key={child.id}>
                              <tr className="group bg-[#fcfdff]/50 transition-colors hover:bg-[#f5f8ff]">
                                <td className="px-6 py-4 pl-10 text-sm font-medium text-gray-400 tabular-nums">
                                  {childIndex + 1}
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    className={`flex items-center gap-3 border-l-2 border-gray-100/50 pl-6 ${
                                      hasGrandChildren ? "cursor-pointer select-none" : ""
                                    }`}
                                    onClick={() => hasGrandChildren && toggleParent(child.id)}
                                  >
                                    {hasGrandChildren ? (
                                      isChildExpanded ? (
                                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
                                      ) : (
                                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                      )
                                    ) : (
                                      <span className="shrink-0 text-lg text-gray-300">↳</span>
                                    )}
                                    <div className="flex max-w-[220px] min-w-0 flex-col">
                                      <span
                                        title={child.title}
                                        className="line-clamp-2 text-xs font-medium text-gray-600 transition-colors group-hover:text-[#0B0F29]"
                                      >
                                        {child.title}
                                      </span>
                                      {(child.navTitle || child.description) && (
                                        <span className="line-clamp-1 text-[11px] text-gray-400">
                                          {child.navTitle && (
                                            <span className="mr-1 font-bold">
                                              {child.navTitle}:
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2 whitespace-nowrap">
                                    <span
                                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase ${
                                        childHasTitle
                                          ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                                          : "border border-red-100 bg-red-50 text-red-600"
                                      }`}
                                    >
                                      {childHasTitle ? "Title ✓" : "Title ✗"}
                                    </span>
                                    <span
                                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase ${
                                        childHasDesc
                                          ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                                          : "border border-red-100 bg-red-50 text-red-600"
                                      }`}
                                    >
                                      {childHasDesc ? "Desc ✓" : "Desc ✗"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-block rounded-full border border-gray-100 bg-gray-50 px-2.5 py-0.5 text-[9px] font-bold tracking-widest whitespace-nowrap text-gray-400 uppercase">
                                    {child.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    title={childUrl}
                                    className="line-clamp-2 max-w-[260px] font-mono text-xs break-all text-gray-400"
                                  >
                                    {childUrl}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end gap-3">
                                    <Link
                                      href={`/seo/pages/${encodeSlugPath(child.slug)}`}
                                      className="rounded-lg border border-gray-100 bg-white p-1.5 text-gray-400 transition-all hover:border-[#D4AF37] hover:text-[#D4AF37]"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                              {isChildExpanded &&
                                grandChildren.map((post, postIndex) => {
                                  const postHasTitle = !!post.metaTitle;
                                  const postHasDesc = !!post.metaDescription;
                                  const postUrl = formatDisplayUrl(post.slug);

                                  return (
                                    <tr
                                      key={post.id}
                                      className="group bg-[#fafbfd] transition-colors hover:bg-[#f5f8ff]"
                                    >
                                      <td className="px-6 py-3.5 pl-14 text-xs font-medium text-gray-400 tabular-nums">
                                        {childIndex + 1}.{postIndex + 1}
                                      </td>
                                      <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-3 border-l-2 border-amber-200/70 pl-10">
                                          <span className="shrink-0 text-sm text-gray-300">↳</span>
                                          <span
                                            title={post.title}
                                            className="line-clamp-2 max-w-[220px] text-xs font-medium text-gray-600 transition-colors group-hover:text-[#0B0F29]"
                                          >
                                            {post.title}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-3.5 whitespace-nowrap">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                          <span
                                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase ${
                                              postHasTitle
                                                ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                                                : "border border-red-100 bg-red-50 text-red-600"
                                            }`}
                                          >
                                            {postHasTitle ? "Title ✓" : "Title ✗"}
                                          </span>
                                          <span
                                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase ${
                                              postHasDesc
                                                ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                                                : "border border-red-100 bg-red-50 text-red-600"
                                            }`}
                                          >
                                            {postHasDesc ? "Desc ✓" : "Desc ✗"}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-3.5 whitespace-nowrap">
                                        <span className="inline-block rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[9px] font-bold tracking-widest whitespace-nowrap text-[#B68D18] uppercase">
                                          {post.type}
                                        </span>
                                      </td>
                                      <td className="px-6 py-3.5">
                                        <div
                                          title={postUrl}
                                          className="line-clamp-2 max-w-[260px] font-mono text-xs break-all text-gray-400"
                                        >
                                          {postUrl}
                                        </div>
                                      </td>
                                      <td className="px-6 py-3.5">
                                        <div className="flex items-center justify-end gap-3">
                                          <Link
                                            href={`/seo/pages/${encodeSlugPath(post.slug)}`}
                                            className="rounded-lg border border-gray-100 bg-white p-1.5 text-gray-400 transition-all hover:border-[#D4AF37] hover:text-[#D4AF37]"
                                            title="Edit Blog Post SEO"
                                          >
                                            <Edit2 className="h-3.5 w-3.5" />
                                          </Link>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </React.Fragment>
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
