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
  const [expandedParents, setExpandedParents] = useState<
    Record<string, boolean>
  >({});
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
      const url = editingLink
        ? `/api/nav-links/${editingLink.id}`
        : "/api/nav-links";
      const method = editingLink ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(
          editingLink
            ? "Link updated successfully"
            : "Link created successfully",
        );
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
    <section className=" flex flex-col gap-6 ">
      <PageHeader
        title="Navigation Links"
        description="Manage the links that appear in the main website navigation bar."
        action={{ label: "Add Link", onClick: handleAddLink }}
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
                  <th className="px-6 py-5 w-[80px]"></th>
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
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditLink(root)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-500 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLink(root.id)}
                              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEditLink(child)}
                                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLink(child.id)}
                                  className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold">
                {editingLink ? "Edit Link" : "Add Link"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Label
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.label || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    URL
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.url || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    disabled={formData.isStatic}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type || "Main Link"}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  >
                    <option value="Main Link">Main Link</option>
                    <option value="Dropdown">Dropdown</option>
                    <option value="Sub-link">Sub-link</option>
                  </select>
                </div>
                {formData.type === "Dropdown" ||
                  (formData.type === "Sub-link" && (
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-sm font-medium text-gray-700">
                        Parent (if dropdown item)
                      </label>
                      <select
                        value={formData.parent || "-"}
                        onChange={(e) =>
                          setFormData({ ...formData, parent: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                      >
                        <option value="-">-</option>
                        {links
                          .filter(
                            (l) =>
                              l.type === "Dropdown" && l.id !== editingLink?.id,
                          )
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
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium text-gray-700">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5 flex items-center mt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isStatic || false}
                      onChange={(e) =>
                        setFormData({ ...formData, isStatic: e.target.checked })
                      }
                      className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37] border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Is Static Page
                    </span>
                  </label>
                </div>
              </div>

              {formData.type === "Dropdown" && (
                <>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-sm font-medium text-gray-700">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.title || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col">
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
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-[#0B0F29] text-white rounded-full hover:bg-black transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
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
