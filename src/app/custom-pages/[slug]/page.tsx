"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import toast from "react-hot-toast";
import {
  Plus,
  GripVertical,
  Trash2,
  Loader2,
  FileQuestion,
  ChevronLeft,
} from "lucide-react";
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
  content: any;
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
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPage();
    }
  }, [slug]);

  const loadPage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pages/${slug}`);
      const json = await res.json();
      if (json.success) {
        setPageData(json.data);
      } else {
        toast.error(json.error || "Failed to load page");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePage = async () => {
    if (
      !confirm(
        `Are you sure you want to delete the entire "${pageData?.title}" page? This will remove all sections and cannot be undone.`,
      )
    )
      return;

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
    } catch (err) {
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
    } catch (err) {
      toast.error("Failed to add section");
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

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
    } catch (err) {
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
                className="relative w-24 h-24"
              >
                <div className="absolute inset-0 border-4 border-[#D4AF37]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-[#D4AF37] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-[#0B0F29] font-serif">
                    TGT
                  </span>
                </div>
              </motion.div>

              {/* Loading Bar */}
              <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-full h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                />
              </div>

              {/* Text */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] tracking-[0.3em] uppercase text-gray-400 font-bold"
              >
                Loading Excellence
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
        {!isLoading && !pageData && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-28 h-28 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 shadow-inner relative"
            >
              <FileQuestion className="w-12 h-12 relative z-10" />
              <div className="absolute inset-0 bg-red-500/5 rounded-[2.5rem] animate-pulse" />
            </motion.div>
            <div className="text-center space-y-3 max-w-sm">
              <h3 className="text-3xl font-bold text-[#0B0F29] tracking-tight">
                Page Not Found
              </h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                The page with slug{" "}
                <span className="text-[#0B0F29]">"{slug}"</span> could not be
                located. It may have been moved, deleted, or never existed.
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-10 py-4 bg-[#0B0F29] text-white rounded-full font-bold hover:bg-black transition-all hover:scale-105 hover:shadow-[0_20px_40px_rgba(11,15,41,0.2)] group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
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
                    <div className="relative group">
                      {/* Section Controls */}
                      <div className="absolute -left-12 top-0 bottom-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dynamically Render CMS Component */}
                      <div className="border-2 border-transparent hover:border-[#D4AF37]/30 rounded-3xl transition-all">
                        {renderSection(section)}
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Add Section Action */}
              <div className="flex flex-col items-center gap-4 py-10 border-2 border-dashed border-gray-200 rounded-[3rem] bg-gray-50/50">
                <h3 className="font-semibold text-gray-500">
                  Add a new section to your page
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "HeroSection",
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
                      className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-[#D4AF37] hover:text-[#0B0F29] transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
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
        <div className="p-8 bg-red-50 text-red-500 rounded-[2.5rem] border border-red-100 flex flex-col items-center gap-2">
          <span className="font-bold text-lg">
            Unknown Section Type: {section.type}
          </span>
          <p className="text-sm opacity-80 text-center max-w-md">
            The component for this section type has not yet been implemented or
            is missing from the renderer.
          </p>
        </div>
      );
  }
}
