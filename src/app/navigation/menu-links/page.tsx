"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  ExternalLink,
  FolderOpen,
  GripVertical,
  Link2,
  Lock,
  PanelBottom,
  PanelTop,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/app/components/PageHeader";
import { NAV_PLACEMENTS, navPlacementLabel, type NavPlacement } from "@/lib/navPlacement";

/** A row of the NavLink table, as returned by /api/nav-links. */
interface NavLink {
  id: string;
  label: string;
  url: string;
  type: string; // "Main Link" | "Dropdown" (a menu) | "Sub-link" (inside a menu)
  parent: string; // "-" or the id of the menu it sits in
  order: number;
  description?: string | null;
  isStatic?: boolean;
  placement?: string;
}

type Tab = "navbar" | "footer";
type EditorKind = "link" | "menu";

interface Editor {
  kind: EditorKind;
  link: NavLink | null; // null = adding a new one
}

interface FormState {
  label: string;
  url: string;
  description: string;
  parent: string; // "" = not inside a menu
  placement: NavPlacement | "";
}

interface DragItem {
  id: string;
  groupKey: string; // "root" for top-level items, or parent menu id for sub-links
}

interface DropTarget {
  id: string;
  groupKey: string;
  position: "before" | "after";
}

const EMPTY_FORM: FormState = { label: "", url: "", description: "", parent: "", placement: "" };

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: "navbar", label: "Navbar", icon: PanelTop },
  { value: "footer", label: "Footer", icon: PanelBottom },
];

// Rows saved before placement existed are navbar links (the column's default)
const placementOf = (link: NavLink) => link.placement ?? "navbar";
const shownIn = (link: NavLink, tab: Tab) =>
  placementOf(link) === tab || placementOf(link) === "both";
const isMenu = (link: NavLink) => link.type === "Dropdown";
const isExternal = (url: string) => /^https?:\/\//.test(url);
const byOrder = (a: NavLink, b: NavLink) => a.order - b.order || a.label.localeCompare(b.label);

/** Links whose deletion also deletes their page (see DELETE /api/nav-links/[id]). */
const deletesPage = (link: NavLink) =>
  (link.type === "Main Link" || link.type === "Sub-link") &&
  !link.isStatic &&
  link.url.startsWith("/") &&
  !link.url.startsWith("/service/") &&
  link.url !== "/";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#0B0F29] outline-none transition-all placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#D4AF37]";

const boxedActionButton =
  "flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/90 bg-white text-gray-500 transition-colors hover:border-[#D4AF37] hover:text-[#0B0F29]";

const typeBadgeClass = (type: string) => {
  if (type === "Dropdown") return "bg-[#F5EEFF] text-[#8B3DFF]";
  if (type === "Action Button") return "bg-[#FFF8E6] text-[#B45309] ring-1 ring-amber-200/70";
  if (type === "Sub-link") return "bg-gray-100 text-gray-600";
  return "bg-[#EFF4FF] text-[#1D2B53]";
};

const ROW_GRID =
  "grid grid-cols-[44px_1fr_auto] md:grid-cols-[52px_minmax(180px,1.4fr)_140px_minmax(170px,1.2fr)_auto] items-center gap-3 md:gap-4";

export default function NavLinksPage() {
  const [links, setLinks] = useState<NavLink[]>([]);
  const [suggestions, setSuggestions] = useState<{ url: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("navbar");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => new Set());
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/nav-links");
      const json = await res.json();
      if (json.success) setLinks(json.data);
      else toast.error("Failed to load navigation links");
    } catch {
      toast.error("Network error while loading links");
    } finally {
      setIsLoading(false);
    }
  };

  // Pages and services the "Link to" field suggests
  const fetchSuggestions = async () => {
    try {
      const [pagesRes, servicesRes] = await Promise.all([
        fetch("/api/pages?list=1").then((r) => r.json()),
        fetch("/api/services").then((r) => r.json()),
      ]);
      const pages = (pagesRes.data ?? [])
        .filter((p: { slug: string }) => p.slug && p.slug !== "services")
        .map((p: { slug: string; title: string }) => ({
          url: p.slug === "home" ? "/" : `/${p.slug}`,
          label: p.title,
        }));
      const services = (servicesRes.data ?? []).map((s: { id: string }) => ({
        url: `/service/${s.id}`,
        label: `Service: ${s.id.replace(/-/g, " ")}`,
      }));
      setSuggestions([...pages, ...services]);
    } catch {
      // Suggestions are a convenience; the field still takes any URL
    }
  };

  useEffect(() => {
    fetchLinks();
    fetchSuggestions();
  }, []);

  const menus = useMemo(() => links.filter(isMenu).sort(byOrder), [links]);
  const menuIds = useMemo(() => new Set(menus.map((m) => m.id)), [menus]);
  const isTopLevel = (link: NavLink) => link.parent === "-" || !menuIds.has(link.parent);
  const childrenOf = (menuId: string) => links.filter((l) => l.parent === menuId).sort(byOrder);

  // Top-level items in a tab (a menu brings its links with it)
  const rootsIn = (t: Tab) => links.filter((l) => isTopLevel(l) && shownIn(l, t)).sort(byOrder);
  const visibleRoots = rootsIn(tab);
  const countIn = (t: Tab) =>
    rootsIn(t).reduce((n, l) => n + (isMenu(l) ? childrenOf(l.id).length : 1), 0);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  // ---------- Editor ----------

  const openEditor = (kind: EditorKind, link: NavLink | null, parent = "") => {
    setEditor({ kind, link });
    setForm(
      link
        ? {
            label: link.label ?? "",
            url: link.url ?? "",
            description: link.description ?? "",
            parent: isTopLevel(link) ? "" : link.parent,
            placement: placementOf(link) as NavPlacement,
          }
        : { ...EMPTY_FORM, parent, placement: parent ? "" : tab },
    );
  };

  const closeEditor = () => {
    setEditor(null);
  };

  useEffect(() => {
    if (!editor) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeEditor();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editor]);

  const parentMenu = menus.find((m) => m.id === form.parent);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    const { kind, link } = editor;
    const label = form.label.trim();
    const url = form.url.trim();

    if (!label) return toast.error("Please enter a name");
    if (kind === "link" && !url) return toast.error("Please choose where the link goes");
    if (url && !/^(\/|#|https?:\/\/)/.test(url))
      return toast.error("Links start with / (a page on this site) or https:// (another website)");
    if (!parentMenu && !form.placement) return toast.error("Please choose where to show it");

    // A link inside a menu is shown wherever its menu is shown
    const placement = kind === "link" && parentMenu ? placementOf(parentMenu) : form.placement;
    const parent = kind === "link" && parentMenu ? parentMenu.id : "-";
    const type = kind === "menu" ? "Dropdown" : parent === "-" ? "Main Link" : "Sub-link";

    // Moved to another menu (or added): goes to the end of its new group
    const group = links.filter((l) => (parent === "-" ? isTopLevel(l) : l.parent === parent));
    const endOfGroup = group.reduce((max, l) => Math.max(max, l.order), 0) + 1;
    const sameGroup = !!link && (isTopLevel(link) ? "-" : link.parent) === parent;

    const payload = {
      label,
      url,
      description: form.description.trim(),
      type,
      parent,
      placement,
      order: sameGroup ? link.order : endOfGroup,
      // New links never create pages (pages are made with "Create Page"); existing ones keep their setting
      isStatic: link ? link.isStatic : true,
    };

    setIsSaving(true);
    try {
      const res = await fetch(link ? `/api/nav-links/${link.id}` : "/api/nav-links", {
        method: link ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));

      // A menu's links follow it to the navbar / footer
      if (link && kind === "menu" && placement !== placementOf(link)) {
        await Promise.all(
          childrenOf(link.id).map((child) =>
            fetch(`/api/nav-links/${child.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ placement }),
            }),
          ),
        );
      }

      toast.success(link ? "Changes saved" : kind === "menu" ? "Dropdown added" : "Link added");
      closeEditor();
      fetchLinks();
    } catch {
      toast.error("Could not save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Delete & drag-and-drop reorder ----------

  const remove = async (link: NavLink) => {
    const children = isMenu(link) ? childrenOf(link.id) : [];
    const message = isMenu(link)
      ? `Delete the "${link.label}" dropdown${children.length ? ` and the ${children.length} links inside it` : ""}?`
      : deletesPage(link)
        ? `Delete "${link.label}"? This also deletes its page (${link.url}).`
        : `Delete "${link.label}"?`;
    if (!confirm(message)) return;

    try {
      for (const item of [...children, link]) {
        const res = await fetch(`/api/nav-links/${item.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(String(res.status));
      }
      toast.success("Deleted");
    } catch {
      toast.error("Could not delete. Please try again.");
    }
    fetchLinks();
  };

  /** Moves a dragged item before or after a sibling in the same group, then renumbers 1, 2, 3… */
  const reorder = async (
    siblings: NavLink[],
    fromId: string,
    toId: string,
    position: "before" | "after",
  ) => {
    if (fromId === toId) return;
    const fromIndex = siblings.findIndex((l) => l.id === fromId);
    const toIndex = siblings.findIndex((l) => l.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...siblings];
    const [moved] = reordered.splice(fromIndex, 1);
    const targetIndex = reordered.findIndex((l) => l.id === toId);
    reordered.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, moved);

    const changed = reordered
      .map((link, i) => ({ id: link.id, before: link.order, order: i + 1 }))
      .filter((c) => c.before !== c.order);

    if (changed.length === 0) return;

    setLinks((prev) =>
      prev.map((l) => {
        const hit = changed.find((c) => c.id === l.id);
        return hit ? { ...l, order: hit.order } : l;
      }),
    );

    try {
      await Promise.all(
        changed.map(({ id, order }) =>
          fetch(`/api/nav-links/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order }),
          }).then((r) => {
            if (!r.ok) throw new Error(String(r.status));
          }),
        ),
      );
      toast.success("Order updated");
    } catch {
      toast.error("Could not save the new order");
      fetchLinks();
    }
  };

  const clearDrag = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const dragHandlers = (item: NavLink, siblings: NavLink[], groupKey: string) => ({
    draggable: siblings.length > 1,
    onDragStart: (e: React.DragEvent) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", item.id);
      setDraggedItem({ id: item.id, groupKey });
    },
    onDragOver: (e: React.DragEvent) => {
      if (!draggedItem || draggedItem.groupKey !== groupKey || draggedItem.id === item.id) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      const rect = e.currentTarget.getBoundingClientRect();
      const position: "before" | "after" =
        e.clientY < rect.top + rect.height / 2 ? "before" : "after";
      setDropTarget((prev) =>
        prev?.id === item.id && prev.groupKey === groupKey && prev.position === position
          ? prev
          : { id: item.id, groupKey, position },
      );
    },
    onDrop: (e: React.DragEvent) => {
      if (!draggedItem || draggedItem.groupKey !== groupKey) return;
      e.preventDefault();
      e.stopPropagation();
      const position = dropTarget?.id === item.id ? dropTarget.position : "before";
      const fromId = draggedItem.id;
      clearDrag();
      reorder(siblings, fromId, item.id, position);
    },
    onDragEnd: () => clearDrag(),
  });

  // ---------- Render ----------

  const otherTab: Tab = tab === "navbar" ? "footer" : "navbar";

  const renderDropLine = (id: string, groupKey: string, position: "before" | "after") =>
    dropTarget?.id === id &&
    dropTarget.groupKey === groupKey &&
    dropTarget.position === position ? (
      <div className="pointer-events-none h-0.5 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
    ) : null;

  const renderUrlCell = (link: NavLink) => {
    if (!link.url) {
      return <span className="text-xs text-gray-300">—</span>;
    }
    return (
      <div className="flex min-w-0 items-center gap-2 text-gray-400">
        {link.isStatic ? (
          <Lock className="h-3.5 w-3.5 shrink-0 text-gray-300" />
        ) : isExternal(link.url) ? (
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-blue-400" />
        ) : (
          <Link2 className="h-3.5 w-3.5 shrink-0 text-gray-300" />
        )}
        <span className="truncate font-mono text-xs">{link.url}</span>
      </div>
    );
  };

  const renderActions = (link: NavLink) => (
    <div
      className="flex shrink-0 items-center justify-end gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        title={`Edit ${link.label}`}
        aria-label={`Edit ${link.label}`}
        onClick={() => openEditor(isMenu(link) ? "menu" : "link", link)}
        className={boxedActionButton}
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        title={`Delete ${link.label}`}
        aria-label={`Delete ${link.label}`}
        onClick={() => remove(link)}
        className={`${boxedActionButton} text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Navigation Links"
        description="Manage the links in your website's navbar and footer. Drag rows to reorder them."
      />

      {/* Toolbar: where (tabs) + add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full bg-gray-100 p-1">
          {TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                tab === value
                  ? "bg-white text-[#0B0F29] shadow-sm"
                  : "text-gray-500 hover:text-[#0B0F29]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
                  tab === value ? "bg-[#0B0F29] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {isLoading ? "–" : countIn(value)}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEditor("menu", null)}
            className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B0F29] transition-colors hover:border-[#D4AF37]"
          >
            <FolderOpen className="h-4 w-4" /> Add dropdown
          </button>
          <button
            type="button"
            onClick={() => openEditor("link", null)}
            className="flex items-center gap-2 rounded-full bg-[#0B0F29] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-black hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          >
            <Plus className="h-4 w-4" /> Add link
          </button>
        </div>
      </div>

      {/* The list, in website order */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#D4AF37]" />
        </div>
      ) : visibleRoots.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[2rem] bg-white px-6 py-16 text-center ring-1 ring-gray-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
            <Link2 className="h-5 w-5" />
          </span>
          <p className="font-semibold text-[#0B0F29]">Nothing in the {tab} yet</p>
          <p className="max-w-sm text-sm text-gray-500">
            Add a link or a dropdown and choose <b>{tab === "navbar" ? "Navbar" : "Footer"}</b> or{" "}
            <b>Navbar &amp; Footer</b> to show it here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {visibleRoots.map((root, index) => {
              const menu = isMenu(root);
              const children = menu ? childrenOf(root.id) : [];
              const isExpanded = menu && expandedMenus.has(root.id);
              const isDraggingRoot = draggedItem?.id === root.id && draggedItem.groupKey === "root";
              const canDragRoot = visibleRoots.length > 1;

              return (
                <div key={root.id} className="bg-white">
                  {renderDropLine(root.id, "root", "before")}
                  <div
                    {...dragHandlers(root, visibleRoots, "root")}
                    onClick={() => menu && toggleMenu(root.id)}
                    className={`group ${ROW_GRID} px-5 py-4 transition-colors ${
                      menu ? "cursor-pointer select-none" : ""
                    } ${isDraggingRoot ? "bg-amber-50/40 opacity-50" : "hover:bg-[#FAFAFC]"}`}
                  >
                    {/* Order + drag handle */}
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span
                        title={canDragRoot ? "Drag to reorder" : undefined}
                        className={`text-gray-300 transition-colors ${
                          canDragRoot
                            ? "cursor-grab opacity-0 group-hover:opacity-100 hover:text-gray-500 active:cursor-grabbing"
                            : "opacity-0"
                        }`}
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm font-medium text-gray-600 tabular-nums">
                        {index + 1}
                      </span>
                    </div>

                    {/* Chevron spacer + label */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      {menu ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(root.id);
                          }}
                          title={isExpanded ? "Collapse links" : "Expand links"}
                          aria-expanded={isExpanded}
                          aria-label={
                            isExpanded ? `Collapse ${root.label}` : `Expand ${root.label}`
                          }
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0B0F29]"
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-90 text-[#0B0F29]" : ""
                            }`}
                          />
                        </button>
                      ) : (
                        <span className="w-6 shrink-0" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[15px] font-semibold text-[#0B0F29]">
                            {root.label}
                          </span>
                          {menu && (
                            <span className="text-xs font-medium text-gray-400 tabular-nums">
                              ({children.length})
                            </span>
                          )}
                          {placementOf(root) === "both" && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-[#9A781E]">
                              +{otherTab}
                            </span>
                          )}
                        </div>
                        {/* Mobile fallback for badge + URL */}
                        <div className="mt-1 flex flex-wrap items-center gap-2 md:hidden">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${typeBadgeClass(
                              root.type,
                            )}`}
                          >
                            {root.type}
                          </span>
                          {renderUrlCell(root)}
                        </div>
                      </div>
                    </div>

                    {/* Type pill (desktop column) */}
                    <div className="hidden justify-center md:flex">
                      <span
                        className={`rounded-full px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase ${typeBadgeClass(
                          root.type,
                        )}`}
                      >
                        {root.type}
                      </span>
                    </div>

                    {/* URL (desktop column) */}
                    <div className="hidden min-w-0 md:block">{renderUrlCell(root)}</div>

                    {/* Actions */}
                    {renderActions(root)}
                  </div>

                  {/* Expanded dropdown sub-links */}
                  <AnimatePresence initial={false}>
                    {menu && isExpanded && (
                      <motion.div
                        key="dropdown-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden border-t border-gray-100 bg-[#FAFAFC]"
                      >
                        {children.length > 0 ? (
                          <div className="divide-y divide-gray-100/80">
                            {children.map((child, childIndex) => {
                              const isDraggingChild =
                                draggedItem?.id === child.id && draggedItem.groupKey === root.id;
                              const canDragChild = children.length > 1;

                              return (
                                <div key={child.id}>
                                  {renderDropLine(child.id, root.id, "before")}
                                  <div
                                    {...dragHandlers(child, children, root.id)}
                                    className={`group/child ${ROW_GRID} py-3 pr-5 pl-10 transition-colors ${
                                      isDraggingChild
                                        ? "bg-amber-50/40 opacity-50"
                                        : "hover:bg-white"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        title={canDragChild ? "Drag to reorder" : undefined}
                                        className={`text-gray-300 transition-colors ${
                                          canDragChild
                                            ? "cursor-grab opacity-0 group-hover/child:opacity-100 hover:text-gray-500 active:cursor-grabbing"
                                            : "opacity-0"
                                        }`}
                                      >
                                        <GripVertical className="h-3.5 w-3.5" />
                                      </span>
                                      <span className="text-xs font-medium text-gray-400 tabular-nums">
                                        {childIndex + 1}
                                      </span>
                                    </div>

                                    <div className="flex min-w-0 items-center gap-2.5 pl-4">
                                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                                      <div className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-[#0B0F29]">
                                          {child.label}
                                        </span>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-2 md:hidden">
                                          {renderUrlCell(child)}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="hidden justify-center md:flex">
                                      <span
                                        className={`rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase ${typeBadgeClass(
                                          child.type,
                                        )}`}
                                      >
                                        {child.type}
                                      </span>
                                    </div>

                                    <div className="hidden min-w-0 md:block">
                                      {renderUrlCell(child)}
                                    </div>

                                    {renderActions(child)}
                                  </div>
                                  {renderDropLine(child.id, root.id, "after")}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="py-3 pl-16 text-xs text-gray-400">
                            No links in this dropdown yet.
                          </p>
                        )}

                        <div className="border-t border-gray-100/80 px-5 py-2.5 pl-14">
                          <button
                            type="button"
                            onClick={() => openEditor("link", null, root.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#9A781E] transition-colors hover:bg-amber-50"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add link to {root.label}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {renderDropLine(root.id, "root", "after")}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / edit panel */}
      <AnimatePresence onExitComplete={() => setForm(EMPTY_FORM)}>
        {editor && (
          <>
            <motion.div
              key="nav-editor-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
              onClick={closeEditor}
            />
            <motion.aside
              key="nav-editor-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl will-change-transform"
            >
              <div className="flex items-start justify-between border-b border-gray-100 p-6">
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-[#B8932A] uppercase">
                    {editor.kind === "menu" ? "Dropdown" : "Link"}
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-[#0B0F29]">
                    {editor.link
                      ? `Edit “${editor.link.label}”`
                      : editor.kind === "menu"
                        ? "Add a dropdown"
                        : "Add a link"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={save} className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    {editor.kind === "menu" ? "Dropdown name" : "Name"}
                  </span>
                  <input
                    type="text"
                    required
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder={editor.kind === "menu" ? "e.g. Services" : "e.g. About Us"}
                    className={inputClass}
                  />
                  <span className="text-xs text-gray-400">
                    The text visitors see on the website.
                  </span>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    {editor.kind === "menu"
                      ? "Opens when the dropdown name is clicked (optional)"
                      : "Link to"}
                  </span>
                  <input
                    type="text"
                    list="nav-link-suggestions"
                    required={editor.kind === "link"}
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="Pick a page, or paste https://…"
                    className={`${inputClass} font-mono`}
                  />
                  <datalist id="nav-link-suggestions">
                    {suggestions.map((s) => (
                      <option key={s.url} value={s.url} label={s.label} />
                    ))}
                  </datalist>
                  <span className="text-xs text-gray-400">
                    Start with <b>/</b> for a page on this site, or <b>https://</b> for another
                    website (opens in a new tab).
                  </span>
                </label>

                {editor.kind === "link" && (
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-gray-700">Inside a dropdown?</span>
                    <select
                      value={form.parent}
                      onChange={(e) => setForm({ ...form, parent: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">No, show it on its own</option>
                      {menus.map((menu) => (
                        <option key={menu.id} value={menu.id}>
                          Yes, inside “{menu.label}”
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {editor.kind === "link" && parentMenu ? (
                  <p className="rounded-xl bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-[#8a6d1f]">
                    This link is shown wherever the “{parentMenu.label}” dropdown is shown:{" "}
                    <b>{navPlacementLabel(placementOf(parentMenu))}</b>.
                  </p>
                ) : (
                  <fieldset className="flex flex-col gap-1.5">
                    <legend className="mb-1.5 text-sm font-semibold text-gray-700">Show in</legend>
                    <div className="grid grid-cols-3 gap-2">
                      {NAV_PLACEMENTS.map((option) => (
                        <label
                          key={option.value}
                          className={`cursor-pointer rounded-xl border px-2 py-3 text-center text-sm font-semibold transition-colors ${
                            form.placement === option.value
                              ? "border-[#0B0F29] bg-[#0B0F29] text-white"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#D4AF37]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="placement"
                            value={option.value}
                            checked={form.placement === option.value}
                            onChange={() => setForm({ ...form, placement: option.value })}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    {editor.kind === "menu" && editor.link && (
                      <span className="text-xs text-gray-400">
                        The links inside this dropdown move with it.
                      </span>
                    )}
                  </fieldset>
                )}

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold text-gray-700">
                    Short description (optional)
                  </span>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="A line shown under the name in dropdowns"
                    className={`${inputClass} resize-none`}
                  />
                </label>

                <div className="mt-auto pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full rounded-full bg-[#0B0F29] py-3.5 text-sm font-bold text-white transition-all hover:bg-black hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
