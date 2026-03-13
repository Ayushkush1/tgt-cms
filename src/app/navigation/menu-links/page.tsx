"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { PageHeader } from "@/app/components/PageHeader";
import toast from "react-hot-toast";

interface NavLink {
  id: string;
  label: string;
  url: string;
  type: string;
  parent: string;
  order: number;
  title?: string;
  description?: string;
  isStatic?: boolean;
}

export default function NavLinksPage() {
  const [links, setLinks] = useState<NavLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedParents, setExpandedParents] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/nav-links");
      const json = await res.json();
      if (json.success) {
        setLinks(json.data);
      } else {
        toast.error("Failed to load navigation links");
      }
    } catch (error) {
      toast.error("Network error while loading links");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleParent = (label: string) => {
    setExpandedParents((prev: Record<string, boolean>) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Process data for rendering
  const rootLinks = links
    .filter(
      (l: NavLink) =>
        l.parent === "-" || !links.some((p) => p.label === l.parent),
    )
    .sort((a: NavLink, b: NavLink) => a.order - b.order);

  return (
    <section className=" flex flex-col gap-6 ">
      <PageHeader
        title="Navigation Links"
        description="Manage the links that appear in the main website navigation bar."
      />

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
        </div>
      ) : (
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
                  <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[120px]">
                    Type
                  </th>
                  <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    URL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rootLinks.map((root: NavLink) => {
                  const children = links
                    .filter((l: NavLink) => l.parent === root.label)
                    .sort((a: NavLink, b: NavLink) => a.order - b.order);
                  const isExpanded = expandedParents[root.label];
                  const hasChildren = children.length > 0;

                  return (
                    <React.Fragment key={root.id}>
                      <tr className="hover:bg-[#fafafb] transition-colors group">
                        <td className="px-6 py-5 text-sm font-medium text-gray-500">
                          {root.order}
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className={`flex items-center gap-2 ${hasChildren ? "cursor-pointer select-none" : ""}`}
                            onClick={() =>
                              hasChildren && toggleParent(root.label)
                            }
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
                                {root.label}
                                {root.isStatic && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded-md bg-gray-50 text-[9px] font-bold text-gray-400 uppercase border border-gray-100">
                                    Static
                                  </span>
                                )}
                              </span>
                              {(root.title || root.description) && (
                                <span className="text-[11px] text-gray-400 mt-0.5">
                                  {root.title && (
                                    <span className="font-bold mr-1">
                                      {root.title}:
                                    </span>
                                  )}
                                  {root.description}
                                </span>
                              )}
                            </div>
                          </div>
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
                        <td className="px-6 py-5 text-sm font-mono text-gray-400">
                          {root.url}
                        </td>
                      </tr>
                      {isExpanded &&
                        children.map((child: NavLink) => (
                          <tr
                            key={child.id}
                            className="bg-[#fcfdff]/50 hover:bg-[#f5f8ff] transition-colors group"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-400 pl-12">
                              {child.order}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 pl-6 border-l-2 border-gray-100/50">
                                <span className="text-gray-300 text-lg">↳</span>
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-600 group-hover:text-[#0B0F29] transition-colors">
                                    {child.label}
                                    {child.isStatic && (
                                      <span className="ml-2 px-1.5 py-0.5 rounded-md bg-gray-50 text-[9px] font-bold text-gray-400 uppercase border border-gray-100">
                                        Static
                                      </span>
                                    )}
                                  </span>
                                  {(child.title || child.description) && (
                                    <span className="text-[11px] text-gray-400">
                                      {child.title && (
                                        <span className="font-bold mr-1">
                                          {child.title}:
                                        </span>
                                      )}
                                      {child.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-gray-50 text-gray-400 border border-gray-100">
                                {child.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-gray-400">
                              {child.url}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
