"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SaveButton } from "@/components/SaveButton";
import toast from "react-hot-toast";
import { uploadFiles } from "@/app/lib/uploadHelpers";
import {
  PortfolioHeroCMS,
  PortfolioHeroData,
} from "./components/PortfolioHeroCMS";
import {
  PortfolioCollageCMS,
  PortfolioCollageData,
} from "./components/PortfolioCollageCMS";
import {
  PortfolioCTACMS,
  PortfolioCTAData,
} from "./components/PortfolioCTACMS";

interface PageData {
  hero: PortfolioHeroData;
  collage: PortfolioCollageData;
  cta: PortfolioCTAData;
}

const defaultData: PageData = {
  hero: {
    eyebrow: "",
    titlePrefix: " ",
    titleHighlight: "",
    titleSuffix: "",
    description: "",
    ctaText: "",
    ctaHref: "",
    viewProjectsText: "",
    viewProjectsHref: "",
  },
  collage: {
    mainImage: [],
    mainImageTag: "",
    mainImageTitle: "",
    secondaryImage: [],
    secondaryImageTitle: "",
    tertiaryImage: [],
    tertiaryImageTitle: "",
    liveStatusText: "",
    liveStatusSubtext: "",
    ratingValue: "",
    ratingText: "",
    ratingSubtext: "",
  },
  cta: {
    eyebrow: "",
    titlepart3: "",
    titleMain: " ",
    titleHighlight: "",
    description: "",
    primaryButtonText: "",
    primaryButtonLink: "",
    secondaryButtonText: "",
    secondaryButtonLink: "",
  },
};

export default function PortfolioCMSPage() {
  const [formData, setFormData] = useState<PageData>(defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/portfolio");
        const json = await res.json();
        if (json.success && json.data) {
          // Merge with default data to handle partial updates or new schema fields
          setFormData({
            ...defaultData,
            ...json.data,
            hero: { ...defaultData.hero, ...json.data.hero },
            collage: { ...defaultData.collage, ...json.data.collage },
            cta: { ...defaultData.cta, ...json.data.cta },
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load portfolio content.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData) return;

    setIsSaving(true);
    const tid = toast.loading("Saving portfolio...");
    try {
      // 1. Upload images in parallel
      const [mainUrls, secUrls, tertUrls] = await Promise.all([
        uploadFiles(formData.collage.mainImage),
        uploadFiles(formData.collage.secondaryImage),
        uploadFiles(formData.collage.tertiaryImage),
      ]);

      // 2. Prepare final payload with uploaded URLs
      const finalPayload: PageData = {
        ...formData,
        collage: {
          ...formData.collage,
          mainImage: mainUrls,
          secondaryImage: secUrls,
          tertiaryImage: tertUrls,
        },
      };

      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: finalPayload }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Saved successfully!", { id: tid });
        setFormData(finalPayload);
      } else {
        toast.error(json.error || "Failed to save.", { id: tid });
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Network error saving portfolio.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <PageHeader
          title="Portfolio Content Management"
          description="Manage the hero text and the decorative image collage for the Portfolio section."
        />
        <div className="mb-2">
          <SaveButton
            onClick={handleSave}
            disabled={isSaving}
            className="w-auto px-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-medium animate-pulse">
          Loading portfolio configuration...
        </div>
      ) : (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
          <PortfolioHeroCMS
            hero={formData.hero}
            onHeroChange={(hero) => setFormData({ ...formData, hero })}
          />
          <PortfolioCollageCMS
            data={formData.collage}
            onChange={(collage) => setFormData({ ...formData, collage })}
          />
          <PortfolioCTACMS
            data={formData.cta}
            onChange={(cta) => setFormData({ ...formData, cta })}
          />
        </div>
      )}
    </div>
  );
}
