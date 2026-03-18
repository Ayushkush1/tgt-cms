"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import Link from "next/link";
import { Edit2, Eye, Search } from "lucide-react";

interface PageSEOSummary {
  id: string;
  title: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  type: string;
  visibility: string;
}

export default function PageSEODashboard() {
  const [pages, setPages] = useState<PageSEOSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const columns = [
    {
      header: "Page Name",
      accessorKey: (row: PageSEOSummary) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#0B0F29]">{row.title}</span>
          <span className="text-[10px] text-gray-400 font-mono">/{row.slug}</span>
        </div>
      ),
    },
    {
      header: "SEO Status",
      accessorKey: (row: PageSEOSummary) => {
        const hasTitle = !!row.metaTitle;
        const hasDesc = !!row.metaDescription;
        return (
          <div className="flex gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                hasTitle ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}
            >
              Title: {hasTitle ? "Set" : "Missing"}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                hasDesc ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}
            >
              Desc: {hasDesc ? "Set" : "Missing"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Type",
      accessorKey: "type" as keyof PageSEOSummary,
      className: "capitalize text-gray-500 font-medium",
    },
    {
      header: "Visibility",
      accessorKey: (row: PageSEOSummary) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-tighter ${
            row.visibility === "published"
              ? "bg-blue-50 text-blue-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {row.visibility}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: (row: PageSEOSummary) => (
        <div className="flex gap-2">
          <Link
            href={`/seo/pages/${row.slug}`}
            className="p-2 bg-gray-50 text-brand-navy rounded-xl hover:bg-[#D4AF37] hover:text-[#0B0F29] transition-all group"
            title="Edit SEO"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <a
            href={`/${row.slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
            title="Preview Page"
          >
            <Eye className="w-4 h-4" />
          </a>
        </div>
      ),
    },
  ];

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

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <DataTable
          data={filteredPages}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
