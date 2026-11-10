export type PillarId = "brand" | "build" | "grow" | "scale";

export interface ApproachPillar {
  number: string;
  title: string;
  desc: string;
}

export interface ServiceHeroData {
  name: string;
  pillar: PillarId | "";
  headingLine1: string;
  headingLine2: string;
  paragraphs: string[];
  pillars: ApproachPillar[];
}

export interface DeliverItem {
  number: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  outcome: string;
}

export interface ProofMetric {
  value: string;
  label: string;
}

export interface ProofCase {
  title: string;
  text: string;
  metrics: ProofMetric[];
}

export interface ServicePageData {
  hero: ServiceHeroData;
  services: DeliverItem[];
  proof: ProofCase[];
  work: string[];
  stack: string[];
  related: string[];
  seo?: Record<string, unknown> | null;
}

export const PILLAR_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Select growth pillar..." },
  { value: "brand", label: "01 · Brand" },
  { value: "build", label: "02 · Build" },
  { value: "grow", label: "03 · Grow" },
  { value: "scale", label: "04 · Scale" },
];

export const LIVE_SERVICE_OPTIONS = [
  { id: "branding", label: "01 Brand · Branding & Identity" },
  { id: "ui-ux-designing", label: "01 Brand · UI/UX Design" },
  { id: "website-design-development", label: "02 Build · Website Design & Development" },
  { id: "mobile-app-development", label: "02 Build · Mobile App Development" },
  { id: "custom-software-development", label: "02 Build · Custom Software Development" },
  { id: "business-software-solutions", label: "02 Build · Business Software Solutions" },
  { id: "search-content-marketing", label: "03 Grow · Search & Content Marketing" },
  { id: "social-performance-marketing", label: "03 Grow · Social & Performance Marketing" },
  { id: "ai-ml-solutions", label: "04 Scale · AI & ML Solutions" },
  { id: "business-intelligence-solutions", label: "04 Scale · Business Intelligence" },
  { id: "staff-augmentation", label: "04 Scale · Staff Augmentation" },
];

export const SERVICE_OPTIONS = [
  ...LIVE_SERVICE_OPTIONS,
  {
    id: "digital-marketing",
    label: "Legacy Source · Digital Marketing (Shared Marketing Capabilities)",
  },
];

export function createDefaultServiceData(): ServicePageData {
  return {
    hero: {
      name: "",
      pillar: "",
      headingLine1: "",
      headingLine2: "",
      paragraphs: ["", ""],
      pillars: [],
    },
    services: [],
    proof: [],
    work: [],
    stack: [],
    related: [],
  };
}

export function normalizeServiceData(
  raw: Record<string, unknown> | null | undefined,
): ServicePageData {
  const defaults = createDefaultServiceData();
  if (!raw || typeof raw !== "object") return defaults;

  const rawHero = (raw.hero as Record<string, unknown> | undefined) || {};
  const rawParagraphs = Array.isArray(rawHero.paragraphs) ? rawHero.paragraphs : [];
  const rawPillars = Array.isArray(rawHero.pillars) ? rawHero.pillars : [];

  const pillars: ApproachPillar[] = rawPillars.map((p, idx) => {
    const item = (p as Record<string, unknown>) || {};
    return {
      number:
        typeof item.number === "string" && item.number
          ? item.number
          : String(idx + 1).padStart(2, "0"),
      title: typeof item.title === "string" ? item.title : "",
      desc: typeof item.desc === "string" ? item.desc : "",
    };
  });

  const rawServices = Array.isArray(raw.services) ? raw.services : [];
  const services: DeliverItem[] = rawServices.map((s, idx) => {
    const item = (s as Record<string, unknown>) || {};
    return {
      number:
        typeof item.number === "string" && item.number
          ? item.number
          : String(idx + 1).padStart(2, "0"),
      title: typeof item.title === "string" ? item.title : "",
      category: typeof item.category === "string" ? item.category : "",
      description: typeof item.description === "string" ? item.description : "",
      tags: Array.isArray(item.tags) ? item.tags.map((t) => String(t ?? "")) : [],
      outcome: typeof item.outcome === "string" ? item.outcome : "",
    };
  });

  const rawProof = Array.isArray(raw.proof) ? raw.proof : [];
  const proof: ProofCase[] = rawProof.map((c) => {
    const item = (c as Record<string, unknown>) || {};
    const rawMetrics = Array.isArray(item.metrics) ? item.metrics : [];
    return {
      title: typeof item.title === "string" ? item.title : "",
      text: typeof item.text === "string" ? item.text : "",
      metrics: rawMetrics.map((m) => {
        const metric = (m as Record<string, unknown>) || {};
        return {
          value: typeof metric.value === "string" ? metric.value : "",
          label: typeof metric.label === "string" ? metric.label : "",
        };
      }),
    };
  });

  return {
    ...raw,
    hero: {
      ...rawHero,
      name: typeof rawHero.name === "string" ? rawHero.name : "",
      pillar:
        rawHero.pillar === "brand" ||
        rawHero.pillar === "build" ||
        rawHero.pillar === "grow" ||
        rawHero.pillar === "scale"
          ? rawHero.pillar
          : "",
      headingLine1: typeof rawHero.headingLine1 === "string" ? rawHero.headingLine1 : "",
      headingLine2: typeof rawHero.headingLine2 === "string" ? rawHero.headingLine2 : "",
      paragraphs: [
        typeof rawParagraphs[0] === "string" ? rawParagraphs[0] : "",
        typeof rawParagraphs[1] === "string" ? rawParagraphs[1] : "",
      ],
      pillars,
    },
    services,
    proof,
    work: Array.isArray(raw.work) ? raw.work.map((w) => String(w ?? "")) : [],
    stack: Array.isArray(raw.stack) ? raw.stack.map((s) => String(s ?? "")) : [],
    related: Array.isArray(raw.related) ? raw.related.map((r) => String(r ?? "")) : [],
    seo: (raw.seo as Record<string, unknown> | null | undefined) ?? null,
  };
}
