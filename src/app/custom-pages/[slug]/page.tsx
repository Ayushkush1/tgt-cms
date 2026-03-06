"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import toast from "react-hot-toast";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { motion, Reorder } from "framer-motion";

// Import Modular CMS Components
import { WhoWeAreCMS } from "../cms/WhoWeAreCMS";
import { WhatWeDoCMS } from "../cms/WhatWeDoCMS";
import { BlogSectionCMS } from "../cms/BlogSectionCMS";
import { IntegrationsCMS } from "../cms/IntegrationsCMS";
import { HeroSectionCMS } from "../cms/HeroSectionCMS";

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

  if (isLoading)
    return <div className="p-10 text-center">Loading editor...</div>;
  if (!pageData) return <div className="p-10 text-center">Page not found</div>;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
      <PageHeader
        title={`Editing: ${pageData.title}`}
        description={`Manage sections for the /${pageData.slug} page.`}
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
    </div>
  );
}

function renderSection(section: SectionData) {
  switch (section.type) {
    case "HeroSection":
      return (
        <HeroSectionCMS sectionId={section.id} initialData={section.content} />
      );
    case "WhoWeAre":
      return (
        <WhoWeAreCMS sectionId={section.id} initialData={section.content} />
      );
    case "WhatWeDo":
      return (
        <WhatWeDoCMS sectionId={section.id} initialData={section.content} />
      );
    case "BlogSection":
      return (
        <BlogSectionCMS sectionId={section.id} initialData={section.content} />
      );
    case "Integrations":
      return (
        <IntegrationsCMS sectionId={section.id} initialData={section.content} />
      );
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
