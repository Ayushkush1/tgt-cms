"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/PageHeader";
import { GlobalSectionRef } from "@/app/components/GlobalSectionRef";
import { PortfolioCMS } from "@/components/cms/sections/PortfolioCMS";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { uploadFiles } from "@/app/lib/uploadHelpers";
import { PortfolioHero } from "./components/PortfolioHero";
import { PortfolioWorkIndex } from "./components/PortfolioWorkIndex";
import { PortfolioResults } from "./components/PortfolioResults";
import {
  createDefaultPortfolioData,
  normalizePortfolioData,
  type PortfolioPageData,
} from "./types";

export default function PortfolioCMSPage() {
  const [formData, setFormData] = useState<PortfolioPageData>(createDefaultPortfolioData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetchWithCache("/api/portfolio")
      .then((json) => {
        if (!active) return;
        if (json?.success && json.data) {
          setFormData(normalizePortfolioData(json.data));
        } else {
          setFormData(createDefaultPortfolioData());
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        if (active) toast.error("Failed to load portfolio content.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const tid = toast.loading("Saving portfolio...");
    try {
      const heroImages = await uploadFiles([formData.hero.imageUrl || ""]);
      const payload: PortfolioPageData = {
        ...formData,
        hero: {
          ...formData.hero,
          imageUrl: heroImages[0] || "",
        },
        results: {
          ...formData.results,
          stats: (formData.results.stats || []).filter((s) => s.value.trim() || s.label.trim()),
        },
      };

      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: payload }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Failed to save.");
      }
      clearCache("/api/portfolio");
      setFormData(payload);
      toast.success("Portfolio content saved and published!", { id: tid });
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err instanceof Error ? err.message : "Network error saving portfolio.", {
        id: tid,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-6 pb-16">
      <PageHeader
        title="Portfolio Page Content"
        description="Manage all sections displayed on the live website Portfolio page, in exact website order."
      />

      {isLoading ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm font-medium text-gray-400 shadow-sm">
          Loading portfolio configuration...
        </div>
      ) : (
        <>
          <PortfolioHero
            data={formData.hero}
            onChange={(hero) => setFormData((prev) => ({ ...prev, hero }))}
            isSaving={isSaving}
            onSave={handleSave}
          />
          <PortfolioWorkIndex
            data={formData.index}
            onChange={(index) => setFormData((prev) => ({ ...prev, index }))}
            isSaving={isSaving}
            onSave={handleSave}
          />
          <PortfolioCMS
            title="3. Case Studies Showcase (Portfolio)"
            description="Client case studies powering Work Index, Home Work Showcase carousel, and individual case study detail pages."
          />
          <PortfolioResults
            data={formData.results}
            onChange={(results) => setFormData((prev) => ({ ...prev, results }))}
            isSaving={isSaving}
            onSave={handleSave}
          />
          <GlobalSectionRef
            title="5. Client Testimonials (Testimonials)"
            description="Client reviews and reputation showcase displayed below Results (shared with Home page)."
            href="/static-pages/home"
            buttonLabel="Manage in Home Page"
          />
          <GlobalSectionRef
            title="6. Growth CTA & Brief Modal (GrowthCTA)"
            description="Let's Talk CTA section, office timezone clocks, and project brief modal copy (shared globally across the site)."
          />
        </>
      )}
    </section>
  );
}
