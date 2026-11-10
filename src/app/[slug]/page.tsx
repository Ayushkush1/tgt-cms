"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import toast from "react-hot-toast";
import { Plus, GripVertical, Trash2, FileQuestion, ChevronLeft } from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Import Shared Universal CMS Components
import { WhoWeAreSection } from "@/components/cms/sections/WhoWeAreSection";
import { WhatWeDoSection } from "@/components/cms/sections/WhatWeDoSection";
import { BlogSection } from "@/components/cms/sections/BlogSection";
import { IntegrationsSection } from "@/components/cms/sections/IntegrationsSection";
import { OurReputationSection } from "@/components/cms/sections/OurReputationSection";
import { OurPartnersSection } from "@/components/cms/sections/OurPartnersSection";
import { AboutFirmSection } from "@/components/cms/sections/AboutFirmSection";

interface SectionData {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  sections: SectionData[];
}

export default function CustomPageEditor() {
  const { slug } = useParams();
  const router = useRouter();
  const confirmDelete = useConfirmDelete();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pages/${slug}`);
      const json = await res.json();
      if (json.success) {
        setPageData(json.data);
      } else {
        toast.error(json.error || "Failed to load page");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      loadPage();
    }
  }, [slug, loadPage]);

  const deletePage = async () => {
    const confirmed = await confirmDelete({
      title: `Delete “${pageData?.title}” page?`,
      message: `All sections and content inside the “${pageData?.title}” page will be permanently removed.`,
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Page deleted successfully");
        router.push("/"); // Redirect to dashboard
      } else {
        toast.error(json.error || "Failed to delete page");
      }
    } catch {
      toast.error("Failed to delete page");
    }
  };

  const addSection = async (type: string) => {
    if (!pageData) return;

    const newOrder = pageData.sections.length;
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: pageData.id,
          type,
          content: {},
          order: newOrder,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Added ${type} section`);
        setPageData({
          ...pageData,
          sections: [...pageData.sections, json.data],
        });
      }
    } catch {
      toast.error("Failed to add section");
    }
  };

  const deleteSection = async (sectionId: string) => {
    const confirmed = await confirmDelete({
      title: "Delete this section?",
      message: "This section and all of its configured content will be removed from the page.",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/sections?id=${sectionId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Section removed");
        setPageData({
          ...pageData!,
          sections: pageData!.sections.filter((s) => s.id !== sectionId),
        });
      }
    } catch {
      toast.error("Failed to delete section");
    }
  };

  const reorderSections = async (newSections: SectionData[]) => {
    setPageData({ ...pageData!, sections: newSections });
    // In a real app, we'd sync orders to DB here or on a save button
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 flex items-center justify-center bg-white"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Logo or Main Graphic */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="relative h-24 w-24"
              >
                <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/20" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-[#D4AF37]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-2xl font-black text-[#0B0F29]">TGT</span>
                </div>
              </motion.div>

              {/* Loading Bar */}
              <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="h-full w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                />
              </div>

              {/* Text */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase"
              >
                Loading Excellence
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-20">
        {!isLoading && !pageData && (
          <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-red-50 text-red-500 shadow-inner"
            >
              <FileQuestion className="relative z-10 h-12 w-12" />
              <div className="absolute inset-0 animate-pulse rounded-[2.5rem] bg-red-500/5" />
            </motion.div>
            <div className="max-w-sm space-y-3 text-center">
              <h3 className="text-3xl font-bold tracking-tight text-[#0B0F29]">Page Not Found</h3>
              <p className="leading-relaxed font-medium text-gray-500">
                The page with slug <span className="text-[#0B0F29]">&quot;{slug}&quot;</span> could
                not be located. It may have been moved, deleted, or never existed.
              </p>
            </div>
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-full bg-[#0B0F29] px-10 py-4 font-bold text-white transition-all hover:scale-105 hover:bg-black hover:shadow-[0_20px_40px_rgba(11,15,41,0.2)]"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Return to Dashboard
            </Link>
          </div>
        )}

        {!isLoading && pageData && (
          <>
            <PageHeader
              title={`${pageData.title} Page Content`}
              description={`Manage the layout and section details for the /${pageData.slug} page.`}
              deleteAction={{
                label: "Delete Page",
                onDelete: deletePage,
              }}
            />

            <div className="flex flex-col gap-8">
              <Reorder.Group
                axis="y"
                values={pageData.sections}
                onReorder={reorderSections}
                className="flex flex-col gap-6"
              >
                {pageData.sections.map((section) => (
                  <Reorder.Item key={section.id} value={section}>
                    <div className="group relative">
                      {/* Section Controls */}
                      <div className="absolute top-0 bottom-0 -left-12 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="cursor-grab rounded-lg border border-gray-100 bg-white p-2 shadow-sm active:cursor-grabbing">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="rounded-lg border border-gray-100 bg-white p-2 text-red-500 shadow-sm transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Dynamically Render CMS Component */}
                      <div className="rounded-3xl transition-all">{renderSection(section)}</div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Add Section Action */}
              <div className="flex flex-col items-center gap-4 rounded-[3rem] border-2 border-dashed border-gray-200 bg-gray-50/50 py-10">
                <h3 className="font-semibold text-gray-500">Add a new section to your page</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "AboutFirmSection",
                    "WhoWeAre",
                    "WhatWeDo",
                    "BlogSection",
                    "Integrations",
                    "OurReputation",
                    "OurPartners",
                  ].map((type) => (
                    <button
                      key={type}
                      onClick={() => addSection(type)}
                      className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-[#D4AF37] hover:text-[#0B0F29]"
                    >
                      <Plus className="h-4 w-4" />
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function renderSection(section: SectionData) {
  const commonProps = {
    sectionId: section.id,
    initialData: section.content,
    saveUrl: "/api/sections",
  };

  switch (section.type) {
    case "HeroSection":
    case "AboutFirmSection":
      return <AboutFirmSection {...commonProps} />;
    case "WhoWeAre":
      return <WhoWeAreSection {...commonProps} />;
    case "WhatWeDo":
      return <WhatWeDoSection {...commonProps} />;
    case "BlogSection":
      return <BlogSection {...commonProps} />;
    case "Integrations":
      return <IntegrationsSection {...commonProps} />;
    case "OurReputation":
      return <OurReputationSection {...commonProps} />;
    case "OurPartners":
      return <OurPartnersSection {...commonProps} />;
    default:
      return (
        <div className="flex flex-col items-center gap-2 rounded-[2.5rem] border border-red-100 bg-red-50 p-8 text-red-500">
          <span className="text-lg font-bold">Unknown Section Type: {section.type}</span>
          <p className="max-w-md text-center text-sm opacity-80">
            The component for this section type has not yet been implemented or is missing from the
            renderer.
          </p>
        </div>
      );
  }
}
