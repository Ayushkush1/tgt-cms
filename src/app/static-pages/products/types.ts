export interface ProductHeroData {
  label: string;
  headingLine: string;
  headingHighlight: string;
  description: string;
  imageUrl: string | File;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
}

export interface ProductSuiteHeaderData {
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  description: string;
  liveLabel: string;
  soonLabel: string;
}

export interface ProductPillar {
  number: string;
  title: string;
  desc: string;
}

export interface ProductItem {
  id: string;
  title: string;
  shortDesc: string;
  link: string;
  imageUrl: string | File;
  pillars: ProductPillar[];
}

export interface ProductsPageData {
  [key: string]: unknown;
  hero: ProductHeroData;
  grid: ProductSuiteHeaderData;
  products: ProductItem[];
}

export function createDefaultProductsData(): ProductsPageData {
  return {
    hero: {
      label: "",
      headingLine: "",
      headingHighlight: "",
      description: "",
      imageUrl: "",
      primaryLabel: "",
      primaryUrl: "",
      secondaryLabel: "",
      secondaryUrl: "",
    },
    grid: {
      label: "",
      headlineMain: "",
      headlineHighlight: "",
      description: "",
      liveLabel: "",
      soonLabel: "",
    },
    products: [],
  };
}

export function normalizeProductsData(
  raw: Record<string, unknown> | null | undefined,
): ProductsPageData {
  const defaults = createDefaultProductsData();
  if (!raw || typeof raw !== "object") return defaults;

  const rawHero = (raw.hero as Record<string, unknown> | undefined) || {};
  const rawParagraphs = Array.isArray(rawHero.paragraphs) ? rawHero.paragraphs : [];
  const rawGrid = (raw.grid as Record<string, unknown> | undefined) || {};
  const rawProducts = Array.isArray(raw.products) ? raw.products : [];

  const products: ProductItem[] = rawProducts.map((item, idx) => {
    const p = (item as Record<string, unknown>) || {};
    const rawPillars = Array.isArray(p.pillars) ? p.pillars : [];
    return {
      id: typeof p.id === "string" && p.id ? p.id : `product-${idx + 1}`,
      title: typeof p.title === "string" ? p.title : "",
      shortDesc: typeof p.shortDesc === "string" ? p.shortDesc : "",
      link: typeof p.link === "string" ? p.link : "",
      imageUrl: typeof p.imageUrl === "string" ? p.imageUrl : "",
      pillars: rawPillars.map((pil, pIdx) => {
        const entry = (pil as Record<string, unknown>) || {};
        return {
          number:
            typeof entry.number === "string" && entry.number
              ? entry.number
              : String(pIdx + 1).padStart(2, "0"),
          title: typeof entry.title === "string" ? entry.title : "",
          desc: typeof entry.desc === "string" ? entry.desc : "",
        };
      }),
    };
  });

  return {
    ...raw,
    hero: {
      label: typeof rawHero.label === "string" ? rawHero.label : "",
      headingLine: typeof rawHero.headingLine === "string" ? rawHero.headingLine : "",
      headingHighlight:
        typeof rawHero.headingHighlight === "string" ? rawHero.headingHighlight : "",
      description:
        typeof rawHero.description === "string"
          ? rawHero.description
          : typeof rawParagraphs[0] === "string"
            ? rawParagraphs[0]
            : "",
      imageUrl: typeof rawHero.imageUrl === "string" ? rawHero.imageUrl : "",
      primaryLabel:
        typeof rawHero.primaryLabel === "string"
          ? rawHero.primaryLabel
          : typeof rawHero.ctaText === "string"
            ? rawHero.ctaText
            : "",
      primaryUrl:
        typeof rawHero.primaryUrl === "string"
          ? rawHero.primaryUrl
          : typeof rawHero.ctaHref === "string"
            ? rawHero.ctaHref
            : "",
      secondaryLabel: typeof rawHero.secondaryLabel === "string" ? rawHero.secondaryLabel : "",
      secondaryUrl: typeof rawHero.secondaryUrl === "string" ? rawHero.secondaryUrl : "",
    },
    grid: {
      label: typeof rawGrid.label === "string" ? rawGrid.label : "",
      headlineMain: typeof rawGrid.headlineMain === "string" ? rawGrid.headlineMain : "",
      headlineHighlight:
        typeof rawGrid.headlineHighlight === "string" ? rawGrid.headlineHighlight : "",
      description: typeof rawGrid.description === "string" ? rawGrid.description : "",
      liveLabel: typeof rawGrid.liveLabel === "string" ? rawGrid.liveLabel : "",
      soonLabel: typeof rawGrid.soonLabel === "string" ? rawGrid.soonLabel : "",
    },
    products,
  };
}
