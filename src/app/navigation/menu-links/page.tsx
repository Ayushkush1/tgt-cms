"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Pencil, Trash2, X } from "lucide-react";
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
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NavLink | null>(null);
  const [formData, setFormData] = useState<Partial<NavLink>>({
    label: "",
    url: "/",
    type: "Main Link",
    parent: "-",
    order: 0,
    title: "",
    description: "",
    isStatic: false,
  });

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
    } catch {
      toast.error("Network error while loading links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = () => {
    setEditingLink(null);
    setFormData({
      label: "",
      url: "/",
      type: "Main Link",
      parent: "-",
      order: links.length + 1,
      title: "",
      description: "",
      isStatic: false,
    });
    setIsModalOpen(true);
  };

  const handleEditLink = (link: NavLink) => {
    setEditingLink(link);
    setFormData(link);
    setIsModalOpen(true);
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      const res = await fetch(`/api/nav-links/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Link deleted successfully");
        fetchLinks();
      } else {
        toast.error("Failed to delete link");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingLink ? `/api/nav-links/${editingLink.id}` : "/api/nav-links";
      const method = editingLink ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingLink ? "Link updated successfully" : "Link created successfully");
        setIsModalOpen(false);
        fetchLinks();
      } else {
        toast.error("Failed to save link");
      }
    } catch {
      toast.error("Network error");
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
      (l: NavLink) => l.parent === "-" || !links.some((p) => p.id === l.parent), // Checks if there's no matching ID (or it's explicitly disconnected "-")
    )
    .sort((a: NavLink, b: NavLink) => a.order - b.order);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Navigation Links"
        description="Manage the links that appear in the main website navigation bar."
        action={{ label: "Add Link", onClick: handleAddLink }}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#D4AF37]"></div>
        </div>
      ) : (
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
                  <th className="w-[120px] px-6 py-5 text-left text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-5 text-left text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                    URL
                  </th>
                  <th className="w-[80px] px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rootLinks.map((root: NavLink) => {
                  const children = links
                    .filter((l: NavLink) => l.parent === root.id)
                    .sort((a: NavLink, b: NavLink) => a.order - b.order);
                  const isExpanded = expandedParents[root.label];
                  const hasChildren = children.length > 0;

                  return (
                    <React.Fragment key={root.id}>
                      <tr className="group transition-colors hover:bg-[#fafafb]">
                        <td className="px-6 py-5 text-sm font-medium text-gray-500">
                          {root.order}
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className={`flex items-center gap-2 ${hasChildren ? "cursor-pointer select-none" : ""}`}
                            onClick={() => hasChildren && toggleParent(root.label)}
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
                            <div className="flex flex-col">
                              <span className="text-[15px] font-bold text-[#0B0F29]">
                                {root.label}
                                {root.isStatic && (
                                  <span className="ml-2 rounded-md border border-gray-100 bg-gray-50 px-1.5 py-0.5 text-[9px] font-bold text-gray-400 uppercase">
                                    Static
                                  </span>
                                )}
                              </span>
                              {(root.title || root.description) && (
                                <span className="mt-0.5 text-[11px] text-gray-400">
                                  {root.title && (
                                    <span className="mr-1 font-bold">{root.title}:</span>
                                  )}
                                  {root.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
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
                        <td className="px-6 py-5 font-mono text-sm text-gray-400">{root.url}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => handleEditLink(root)}
                              className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-500"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLink(root.id)}
                              className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded &&
                        children.map((child: NavLink) => (
                          <tr
                            key={child.id}
                            className="group bg-[#fcfdff]/50 transition-colors hover:bg-[#f5f8ff]"
                          >
                            <td className="px-6 py-4 pl-12 text-sm font-medium text-gray-400">
                              {child.order}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 border-l-2 border-gray-100/50 pl-6">
                                <span className="text-lg text-gray-300">↳</span>
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-600 transition-colors group-hover:text-[#0B0F29]">
                                    {child.label}
                                    {child.isStatic && (
                                      <span className="ml-2 rounded-md border border-gray-100 bg-gray-50 px-1.5 py-0.5 text-[9px] font-bold text-gray-400 uppercase">
                                        Static
                                      </span>
                                    )}
                                  </span>
                                  {(child.title || child.description) && (
                                    <span className="text-[11px] text-gray-400">
                                      {child.title && (
                                        <span className="mr-1 font-bold">{child.title}:</span>
                                      )}
                                      {child.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="rounded-full border border-gray-100 bg-gray-50 px-2 py-0.5 text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                                {child.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-400">
                              {child.url}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                  onClick={() => handleEditLink(child)}
                                  className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-500"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLink(child.id)}
                                  className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h3 className="text-xl font-bold">{editingLink ? "Edit Link" : "Add Link"}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Label</label>
                  <input
                    type="text"
                    required
                    value={formData.label || ""}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">URL</label>
                  <input
                    type="text"
                    required
                    value={formData.url || ""}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    disabled={formData.isStatic}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={formData.type || "Main Link"}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <option value="Main Link">Main Link</option>
                    <option value="Dropdown">Dropdown</option>
                    <option value="Sub-link">Sub-link</option>
                  </select>
                </div>
                {formData.type === "Dropdown" ||
                  (formData.type === "Sub-link" && (
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Parent (if dropdown item)
                      </label>
                      <select
                        value={formData.parent || "-"}
                        onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
                      >
                        <option value="-">-</option>
                        {links
                          .filter((l) => l.type === "Dropdown" && l.id !== editingLink?.id)
                          .map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Order</label>
                  <input
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
                  />
                </div>
                <div className="mt-8 flex items-center space-y-1.5">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isStatic || false}
                      onChange={(e) => setFormData({ ...formData, isStatic: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span className="text-sm font-medium text-gray-700">Is Static Page</span>
                  </label>
                </div>
              </div>

              {formData.type === "Dropdown" && (
                <>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Title (Optional)</label>
                    <input
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#D4AF37]"
                    />
                  </div>
                </>
              )}

              <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full px-6 py-2.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#0B0F29] px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-black hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                >
                  {editingLink ? "Update Link" : "Create Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
