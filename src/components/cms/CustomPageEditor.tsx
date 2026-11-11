"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import { saveCustomSection, type SectionInstanceProps } from "@/app/components/StaticSectionCard";
import { uploadFiles } from "@/app/lib/uploadHelpers";
import toast from "react-hot-toast";
import {
  Plus,
  GripVertical,
  Trash2,
  FileQuestion,
  ChevronLeft,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Home component forms
import { GrowthHero } from "@/app/static-pages/home/components/GrowthHero";
import { Showreel } from "@/app/static-pages/home/components/Showreel";
import { Manifesto } from "@/app/static-pages/home/components/Manifesto";
import { ServicePillars } from "@/app/static-pages/home/components/ServicePillars";
import { WorkShowcase } from "@/app/static-pages/home/components/WorkShowcase";
import { GrowthProcess } from "@/app/static-pages/home/components/GrowthProcess";
import { Testimonials } from "@/app/static-pages/home/components/Testimonials";
import { Insights } from "@/app/static-pages/home/components/Insights";
import { GrowthCTA } from "@/app/components/GrowthCTA";
import { StickyCTA } from "@/app/static-pages/home/components/StickyCTA";

// About component forms
import { AboutHero } from "@/app/static-pages/about/components/AboutHero";
import { AboutStory } from "@/app/static-pages/about/components/AboutStory";
import { AboutPurpose } from "@/app/static-pages/about/components/AboutPurpose";
import { FounderNote } from "@/app/static-pages/about/components/FounderNote";
import { Journey } from "@/app/static-pages/about/components/Journey";
import { Team } from "@/app/static-pages/about/components/Team";
import { AboutFilm } from "@/app/static-pages/about/components/AboutFilm";

// Services component forms
import { ServiceHero } from "@/app/static-pages/services/components/ServiceHero";
import { ServiceApproach } from "@/app/static-pages/services/components/ServiceApproach";
import { ServiceDeliver } from "@/app/static-pages/services/components/ServiceDeliver";
import { ServiceProof } from "@/app/static-pages/services/components/ServiceProof";
import { ServiceStack } from "@/app/static-pages/services/components/ServiceStack";
import {
  createDefaultServiceData,
  type DeliverItem,
  type ProofCase,
  type ServiceHeroData,
} from "@/app/static-pages/services/types";

// Products component forms
import { ProductHero } from "@/app/static-pages/products/components/ProductHero";
import { ProductSuite } from "@/app/static-pages/products/components/ProductSuite";
import {
  createDefaultProductsData,
  type ProductHeroData,
  type ProductItem,
  type ProductSuiteHeaderData,
} from "@/app/static-pages/products/types";

// Portfolio component forms
import { PortfolioHero } from "@/app/static-pages/portfolio/components/PortfolioHero";
import { PortfolioWorkIndex } from "@/app/static-pages/portfolio/components/PortfolioWorkIndex";
import { PortfolioResults } from "@/app/static-pages/portfolio/components/PortfolioResults";
import { PortfolioCMS } from "@/components/cms/sections/PortfolioCMS";
import {
  createDefaultPortfolioData,
  type PortfolioHeroData,
  type PortfolioResultsData,
  type PortfolioWorkIndexData,
} from "@/app/static-pages/portfolio/types";

// Contact component forms
import { ContactHero } from "@/app/static-pages/contact/components/ContactHero";
import { ContactDirect } from "@/app/static-pages/contact/components/ContactDirect";
import MapSection from "@/app/static-pages/contact/components/MapSection";

// Blog & Media component forms
import { BlogIndex } from "@/app/static-pages/blog/components/BlogIndex";
import { BlogSection } from "@/components/cms/sections/BlogSection";
import { MediaHero } from "@/app/static-pages/media/components/MediaHero";
import { MediaCoverage } from "@/app/static-pages/media/components/MediaCoverage";

// Backwards-compatible legacy section renderers (not shown in Add dropdown)
import { HeroSection } from "@/components/cms/sections/HeroSection";
import { AboutFirmSection } from "@/components/cms/sections/AboutFirmSection";
import { WhoWeAreSection } from "@/components/cms/sections/WhoWeAreSection";
import { WhatWeDoSection } from "@/components/cms/sections/WhatWeDoSection";
import { IntegrationsSection } from "@/components/cms/sections/IntegrationsSection";
import { OurReputationSection } from "@/components/cms/sections/OurReputationSection";
import { OurPartnersSection } from "@/components/cms/sections/OurPartnersSection";

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

interface ComponentOption {
  value: string;
  label: string;
}

interface ComponentGroup {
  group: string;
  items: ComponentOption[];
}

const COMPONENT_GROUPS: ComponentGroup[] = [
  {
    group: "Home Components",
    items: [
      { value: "GrowthHero", label: "Growth Hero (GrowthHero)" },
      { value: "Showreel", label: "Showreel (Showreel)" },
      { value: "Manifesto", label: "Manifesto (Manifesto)" },
      { value: "ServicePillars", label: "Service Pillars (ServicePillars)" },
      { value: "WorkShowcase", label: "Work Showcase (WorkShowcase)" },
      { value: "GrowthProcess", label: "Growth Process (GrowthProcess)" },
      { value: "Testimonials", label: "Testimonials (Testimonials)" },
      { value: "Insights", label: "Insights Header (Insights)" },
      { value: "GrowthCTA", label: "Global Let's Talk CTA (GrowthCTA)" },
      { value: "StickyCTA", label: "Sticky CTA Pill (StickyCTA)" },
    ],
  },
  {
    group: "About Components",
    items: [
      { value: "AboutHero", label: "About Hero (AboutHero)" },
      { value: "AboutStory", label: "About Story (AboutStory)" },
      { value: "AboutPurpose", label: "About Purpose (AboutPurpose)" },
      { value: "FounderNote", label: "Founder Note (FounderNote)" },
      { value: "Journey", label: "Journey & Milestones (Journey)" },
      { value: "Team", label: "Team (Team)" },
      { value: "AboutFilm", label: "About Film (AboutFilm)" },
    ],
  },
  {
    group: "Services Components",
    items: [
      { value: "ServiceHero", label: "Service Hero (ServiceHero)" },
      { value: "ServiceApproach", label: "Service Approach (ServiceApproach)" },
      { value: "ServiceDeliver", label: "Service Deliverables (ServiceDeliver)" },
      { value: "ServiceProof", label: "Service Proof & Cases (ServiceProof)" },
      { value: "ServiceStack", label: "Service Tech Stack & Related (ServiceStack)" },
    ],
  },
  {
    group: "Products Components",
    items: [
      { value: "ProductHero", label: "Product Hero (ProductHero)" },
      { value: "ProductSuite", label: "Product Suite (ProductSuite)" },
    ],
  },
  {
    group: "Portfolio Components",
    items: [
      { value: "PortfolioHero", label: "Portfolio Hero (PortfolioHero)" },
      { value: "PortfolioWorkIndex", label: "Selected Work Header (PortfolioWorkIndex)" },
      { value: "PortfolioResults", label: "Headline Results (PortfolioResults)" },
      { value: "Portfolio", label: "Portfolio Case Studies (Portfolio)" },
    ],
  },
  {
    group: "Contact Components",
    items: [
      { value: "ContactHero", label: "Contact Hero (ContactHero)" },
      { value: "ContactDirect", label: "Direct Lines Copy (ContactDirect)" },
      { value: "MapSection", label: "Offices & Map (MapSection)" },
    ],
  },
  {
    group: "Blog & Media Components",
    items: [
      { value: "BlogIndex", label: "Blog Page Header (BlogIndex)" },
      { value: "BlogSection", label: "Blog Posts Manager (BlogSection)" },
      { value: "MediaHero", label: "Media Hero & Copy (MediaHero)" },
      { value: "MediaCoverage", label: "Press Coverage (MediaCoverage)" },
    ],
  },
];

function ControlledSectionWrapper<T>({
  sectionId,
  saveUrl = "/api/sections",
  displayName,
  initialValue,
  prepareSave,
  children,
}: {
  sectionId: string;
  saveUrl?: string;
  displayName: string;
  initialValue: T;
  prepareSave?: (val: T) => Promise<T> | T;
  children: (props: {
    data: T;
    onChange: (next: T) => void;
    isSaving: boolean;
    onSave: () => void;
  }) => React.ReactNode;
}) {
  const [data, setData] = useState<T>(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading(`Saving ${displayName}…`);
    try {
      const payload = prepareSave ? await prepareSave(data) : data;
      await saveCustomSection(sectionId, payload, saveUrl);
      setData(payload);
      toast.success(`${displayName} saved and published!`, { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save section.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return <>{children({ data, onChange: setData, isSaving, onSave: handleSave })}</>;
}

function CustomServiceStack({ sectionId = "", initialData, saveUrl }: SectionInstanceProps) {
  const savedLogos =
    initialData?.logos && typeof initialData.logos === "object"
      ? (initialData.logos as Record<string, string>)
      : {};
  const [logos, setLogos] = useState<Record<string, string | File>>(savedLogos);

  const stack = Array.isArray(initialData?.stack) ? (initialData.stack as string[]) : [];
  const related = Array.isArray(initialData?.related) ? (initialData.related as string[]) : [];

  return (
    <ControlledSectionWrapper
      sectionId={sectionId}
      saveUrl={saveUrl}
      displayName="Service Stack"
      initialValue={{ stack, related }}
      prepareSave={async (val) => {
        const cleanList = (list: string[]) => (list || []).map((v) => v.trim()).filter(Boolean);
        const entries = Object.entries(logos);
        const uploaded = entries.length > 0 ? await uploadFiles(entries.map(([, v]) => v)) : [];
        const nextLogos: Record<string, string> = {};
        entries.forEach(([k], i) => {
          if (uploaded[i]) nextLogos[k] = uploaded[i] as string;
        });
        setLogos(nextLogos);
        return {
          stack: cleanList(val.stack),
          related: cleanList(val.related),
          logos: nextLogos,
        };
      }}
    >
      {({ data, onChange, isSaving, onSave }) => (
        <ServiceStack
          currentSlug=""
          stack={data.stack}
          related={data.related}
          onStackChange={(next) => onChange({ ...data, stack: next })}
          onRelatedChange={(next) => onChange({ ...data, related: next })}
          techLogoFor={(name) => logos[name.trim().toLowerCase()] ?? null}
          onPickTechLogo={(name, file) =>
            setLogos((prev) => ({ ...prev, [name.trim().toLowerCase()]: file }))
          }
          isSaving={isSaving}
          onSave={onSave}
        />
      )}
    </ControlledSectionWrapper>
  );
}

function CustomProductSuite({ sectionId = "", initialData, saveUrl }: SectionInstanceProps) {
  const defaults = createDefaultProductsData();
  const grid = {
    ...defaults.grid,
    ...((initialData?.grid as Partial<ProductSuiteHeaderData>) || {}),
  };
  const products = Array.isArray(initialData?.products)
    ? (initialData.products as ProductItem[])
    : defaults.products;

  return (
    <ControlledSectionWrapper
      sectionId={sectionId}
      saveUrl={saveUrl}
      displayName="Product Suite"
      initialValue={{ grid, products }}
      prepareSave={async (val) => {
        const uploadedUrls =
          val.products.length > 0
            ? await uploadFiles(val.products.map((p) => p.imageUrl || ""))
            : [];
        return {
          grid: val.grid,
          products: val.products.map((p, i) => ({
            ...p,
            link: (p.link || "").trim(),
            imageUrl: uploadedUrls[i] || "",
          })),
        };
      }}
    >
      {({ data, onChange, isSaving, onSave }) => (
        <ProductSuite
          grid={data.grid}
          products={data.products}
          onGridChange={(next) => onChange({ ...data, grid: next })}
          onProductsChange={(next) => onChange({ ...data, products: next })}
          isSaving={isSaving}
          onSave={onSave}
        />
      )}
    </ControlledSectionWrapper>
  );
}

function renderSection(section: SectionData) {
  const commonProps: SectionInstanceProps = {
    sectionId: section.id,
    initialData: section.content || {},
    saveUrl: "/api/sections",
  };
  const data = commonProps.initialData || {};

  switch (section.type) {
    // Home components
    case "GrowthHero":
      return <GrowthHero {...commonProps} />;
    case "Showreel":
      return <Showreel {...commonProps} />;
    case "Manifesto":
      return <Manifesto {...commonProps} />;
    case "ServicePillars":
      return <ServicePillars {...commonProps} />;
    case "WorkShowcase":
      return <WorkShowcase {...commonProps} />;
    case "GrowthProcess":
      return <GrowthProcess {...commonProps} />;
    case "Testimonials":
      return <Testimonials {...commonProps} />;
    case "Insights":
      return <Insights {...commonProps} />;
    case "GrowthCTA":
      return <GrowthCTA title='Global "Let&apos;s Talk" CTA (GrowthCTA)' {...commonProps} />;
    case "StickyCTA":
      return <StickyCTA {...commonProps} />;

    // About components
    case "AboutHero":
      return <AboutHero {...commonProps} />;
    case "AboutStory":
      return <AboutStory {...commonProps} />;
    case "AboutPurpose":
      return <AboutPurpose {...commonProps} />;
    case "FounderNote":
      return <FounderNote {...commonProps} />;
    case "Journey":
      return <Journey {...commonProps} />;
    case "Team":
      return <Team {...commonProps} />;
    case "AboutFilm":
      return <AboutFilm {...commonProps} />;

    // Services components
    case "ServiceHero": {
      const defaults = createDefaultServiceData().hero;
      return (
        <ControlledSectionWrapper<ServiceHeroData>
          sectionId={section.id}
          displayName="Service Hero"
          initialValue={{ ...defaults, ...(data as Partial<ServiceHeroData>) }}
          prepareSave={async (val) => {
            const [uploaded] = await uploadFiles([val.imageUrl || ""]);
            return { ...val, imageUrl: uploaded || "" };
          }}
        >
          {({ data: val, onChange, isSaving, onSave }) => (
            <ServiceHero data={val} onChange={onChange} isSaving={isSaving} onSave={onSave} />
          )}
        </ControlledSectionWrapper>
      );
    }
    case "ServiceApproach": {
      const defaults = createDefaultServiceData().hero;
      return (
        <ControlledSectionWrapper<ServiceHeroData>
          sectionId={section.id}
          displayName="Service Approach"
          initialValue={{ ...defaults, ...(data as Partial<ServiceHeroData>) }}
        >
          {({ data: val, onChange, isSaving, onSave }) => (
            <ServiceApproach data={val} onChange={onChange} isSaving={isSaving} onSave={onSave} />
          )}
        </ControlledSectionWrapper>
      );
    }
    case "ServiceDeliver": {
      const services = Array.isArray(data.services) ? (data.services as DeliverItem[]) : [];
      return (
        <ControlledSectionWrapper<{ services: DeliverItem[] }>
          sectionId={section.id}
          displayName="Service Deliverables"
          initialValue={{ services }}
          prepareSave={(val) => ({
            services: val.services.map((item, idx) => ({
              ...item,
              number: item.number || String(idx + 1).padStart(2, "0"),
              tags: (item.tags || []).map((t) => t.trim()).filter(Boolean),
            })),
          })}
        >
          {({ data: val, onChange, isSaving, onSave }) => (
            <ServiceDeliver
              services={val.services}
              onChange={(next) => onChange({ services: next })}
              isSaving={isSaving}
              onSave={onSave}
            />
          )}
        </ControlledSectionWrapper>
      );
    }
    case "ServiceProof": {
      const proof = Array.isArray(data.proof) ? (data.proof as ProofCase[]) : [];
      const work = Array.isArray(data.work) ? (data.work as string[]) : [];
      return (
        <ControlledSectionWrapper<{ proof: ProofCase[]; work: string[] }>
          sectionId={section.id}
          displayName="Service Proof"
          initialValue={{ proof, work }}
          prepareSave={(val) => ({
            proof: val.proof.map((item) => ({
              ...item,
              metrics: (item.metrics || []).filter((m) => m.value.trim() || m.label.trim()),
            })),
            work: (val.work || []).map((w) => w.trim()).filter(Boolean),
          })}
        >
          {({ data: val, onChange, isSaving, onSave }) => (
            <ServiceProof
              proof={val.proof}
              work={val.work}
              onProofChange={(next) => onChange({ ...val, proof: next })}
              onWorkChange={(next) => onChange({ ...val, work: next })}
              isSaving={isSaving}
              onSave={onSave}
            />
          )}
        </ControlledSectionWrapper>
      );
    }
    case "ServiceStack":
      return <CustomServiceStack {...commonProps} />;

    // Products components
    case "ProductHero": {
      const defaults = createDefaultProductsData().hero;
      return (
        <ControlledSectionWrapper<ProductHeroData>
          sectionId={section.id}
          displayName="Product Hero"
          initialValue={{ ...defaults, ...(data as Partial<ProductHeroData>) }}
          prepareSave={async (val) => {
            const [uploaded] = await uploadFiles([val.imageUrl || ""]);
            return { ...val, imageUrl: uploaded || "" };
          }}
        >
          {({ data: val, onChange, isSaving, onSave }) => (
            <ProductHero data={val} onChange={onChange} isSaving={isSaving} onSave={onSave} />
          )}
        </ControlledSectionWrapper>
      );
    }
    case "ProductSuite":
      return <CustomProductSuite {...commonProps} />;

    // Portfolio components
    case "PortfolioHero": {
      const defaults = createDefaultPortfolioData().hero;
      return (
        <ControlledSectionWrapper<PortfolioHeroData>
          sectionId={section.id}
          displayName="Portfolio Hero"
          initialValue={{ ...defaults, ...(data as Partial<PortfolioHeroData>) }}
          prepareSave={async (val) => {
            const [uploaded] = await uploadFiles([val.imageUrl || ""]);
            return { ...val, imageUrl: uploaded || "" };
          }}
        >
          {({ data: val, onChange, isSaving, onSave }) => (
            <PortfolioHero data={val} onChange={onChange} isSaving={isSaving} onSave={onSave} />
          )}
        </ControlledSectionWrapper>
      );
    }
    case "PortfolioWorkIndex": {
      const defaults = createDefaultPortfolioData().index;
      return (
        <ControlledSectionWrapper<PortfolioWorkIndexData>
          sectionId={section.id}
          displayName="Selected Work Header"
          initialValue={{ ...defaults, ...(data as Partial<PortfolioWorkIndexData>) }}
        >
          {({ data: val, onChange, isSaving, onSave }) => (
            <PortfolioWorkIndex
              data={val}
              onChange={onChange}
              isSaving={isSaving}
              onSave={onSave}
            />
          )}
        </ControlledSectionWrapper>
      );
    }
    case "PortfolioResults": {
      const defaults = createDefaultPortfolioData().results;
      return (
        <ControlledSectionWrapper<PortfolioResultsData>
          sectionId={section.id}
          displayName="Headline Results"
          initialValue={{
            ...defaults,
            ...(data as Partial<PortfolioResultsData>),
            stats: Array.isArray(data.stats) ? data.stats : [],
          }}
          prepareSave={(val) => ({
            ...val,
            stats: (val.stats || []).filter((s) => s.value.trim() || s.label.trim()),
          })}
        >
          {({ data: val, onChange, isSaving, onSave }) => (
            <PortfolioResults data={val} onChange={onChange} isSaving={isSaving} onSave={onSave} />
          )}
        </ControlledSectionWrapper>
      );
    }
    case "Portfolio":
      return <PortfolioCMS {...commonProps} />;

    // Contact components
    case "ContactHero":
      return <ContactHero {...commonProps} />;
    case "ContactDirect":
      return <ContactDirect {...commonProps} />;
    case "MapSection":
      return <MapSection {...commonProps} />;

    // Blog & Media components
    case "BlogIndex":
      return <BlogIndex {...commonProps} />;
    case "BlogSection":
      return <BlogSection {...commonProps} />;
    case "MediaHero":
      return <MediaHero {...commonProps} />;
    case "MediaCoverage":
      return <MediaCoverage {...commonProps} />;

    // Legacy fallbacks for previously saved custom pages
    case "HeroSection":
      return <HeroSection {...commonProps} />;
    case "AboutFirmSection":
      return <AboutFirmSection {...commonProps} />;
    case "WhoWeAre":
      return <WhoWeAreSection {...commonProps} />;
    case "WhatWeDo":
      return <WhatWeDoSection {...commonProps} />;
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

export function CustomPageEditor() {
  const { slug } = useParams();
  const router = useRouter();
  const confirmDelete = useConfirmDelete();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("");
  const [isAdding, setIsAdding] = useState(false);

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
        router.push("/");
      } else {
        toast.error(json.error || "Failed to delete page");
      }
    } catch {
      toast.error("Failed to delete page");
    }
  };

  const addSection = async () => {
    if (!pageData || !selectedType) return;

    setIsAdding(true);
    const newOrder = pageData.sections.length;
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: pageData.id,
          type: selectedType,
          content: {},
          order: newOrder,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Added ${selectedType} component`);
        setPageData({
          ...pageData,
          sections: [...pageData.sections, json.data],
        });
        setSelectedType("");
      } else {
        toast.error(json.error || "Failed to add component");
      }
    } catch {
      toast.error("Failed to add component");
    } finally {
      setIsAdding(false);
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
                    <div className="group/section relative">
                      <div className="absolute top-0 bottom-0 -left-12 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover/section:opacity-100">
                        <div className="cursor-grab rounded-lg border border-gray-100 bg-white p-2 shadow-sm active:cursor-grabbing">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteSection(section.id)}
                          aria-label="Delete section"
                          className="rounded-lg border border-gray-100 bg-white p-2 text-red-500 shadow-sm transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="rounded-3xl transition-all">{renderSection(section)}</div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Add Component Form Dropdown */}
              <div className="flex flex-col items-center gap-4 rounded-[3rem] border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-10">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700">Add a component form to your page</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Choose any website component form below — new sections start empty with no
                    pre-filled data.
                  </p>
                </div>

                <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <select
                      aria-label="Select component form"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full cursor-pointer appearance-none rounded-2xl border border-gray-200 bg-white px-5 py-3.5 pr-10 text-sm font-medium text-[#0B0F29] shadow-sm transition-all outline-none focus:border-[#0B0F29] focus:ring-2 focus:ring-[#0B0F29]/15"
                    >
                      <option value="">Select a component form...</option>
                      {COMPONENT_GROUPS.map((grp) => (
                        <optgroup key={grp.group} label={grp.group}>
                          {grp.items.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedType || isAdding}
                    onClick={addSection}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0B0F29] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Add Component
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
