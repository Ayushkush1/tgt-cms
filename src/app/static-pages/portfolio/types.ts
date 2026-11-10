export interface PortfolioHeroData {
  label: string;
  headlineTop: string;
  headlineHighlight: string;
  description: string;
  imageUrl: string | File;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
}

export interface PortfolioWorkIndexData {
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  allLabel: string;
  viewLabel: string;
}

export interface PortfolioResultStat {
  value: string;
  label: string;
}

export interface PortfolioResultsData {
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  stats: PortfolioResultStat[];
}

export interface PortfolioPageData {
  [key: string]: unknown;
  hero: PortfolioHeroData;
  index: PortfolioWorkIndexData;
  results: PortfolioResultsData;
}

export function createDefaultPortfolioData(): PortfolioPageData {
  return {
    hero: {
      label: "",
      headlineTop: "",
      headlineHighlight: "",
      description: "",
      imageUrl: "",
      primaryLabel: "",
      primaryUrl: "",
      secondaryLabel: "",
      secondaryUrl: "",
    },
    index: {
      label: "",
      headlineMain: "",
      headlineHighlight: "",
      allLabel: "",
      viewLabel: "",
    },
    results: {
      label: "",
      headlineMain: "",
      headlineHighlight: "",
      stats: [],
    },
  };
}

export function normalizePortfolioData(
  raw: Record<string, unknown> | null | undefined,
): PortfolioPageData {
  const defaults = createDefaultPortfolioData();
  if (!raw || typeof raw !== "object") return defaults;

  const rawHero = (raw.hero as Record<string, unknown> | undefined) || {};
  const rawIndex = (raw.index as Record<string, unknown> | undefined) || {};
  const rawResults = (raw.results as Record<string, unknown> | undefined) || {};
  const rawStats = Array.isArray(rawResults.stats) ? rawResults.stats : [];

  return {
    ...raw,
    hero: {
      label:
        typeof rawHero.label === "string"
          ? rawHero.label
          : typeof rawHero.eyebrow === "string"
            ? rawHero.eyebrow
            : "",
      headlineTop: typeof rawHero.headlineTop === "string" ? rawHero.headlineTop : "",
      headlineHighlight:
        typeof rawHero.headlineHighlight === "string" ? rawHero.headlineHighlight : "",
      description: typeof rawHero.description === "string" ? rawHero.description : "",
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
      secondaryLabel:
        typeof rawHero.secondaryLabel === "string"
          ? rawHero.secondaryLabel
          : typeof rawHero.viewProjectsText === "string"
            ? rawHero.viewProjectsText
            : "",
      secondaryUrl:
        typeof rawHero.secondaryUrl === "string"
          ? rawHero.secondaryUrl
          : typeof rawHero.viewProjectsHref === "string"
            ? rawHero.viewProjectsHref
            : "",
    },
    index: {
      label: typeof rawIndex.label === "string" ? rawIndex.label : "",
      headlineMain: typeof rawIndex.headlineMain === "string" ? rawIndex.headlineMain : "",
      headlineHighlight:
        typeof rawIndex.headlineHighlight === "string" ? rawIndex.headlineHighlight : "",
      allLabel: typeof rawIndex.allLabel === "string" ? rawIndex.allLabel : "",
      viewLabel: typeof rawIndex.viewLabel === "string" ? rawIndex.viewLabel : "",
    },
    results: {
      label: typeof rawResults.label === "string" ? rawResults.label : "",
      headlineMain: typeof rawResults.headlineMain === "string" ? rawResults.headlineMain : "",
      headlineHighlight:
        typeof rawResults.headlineHighlight === "string" ? rawResults.headlineHighlight : "",
      stats: rawStats.map((s) => {
        const item = (s as Record<string, unknown>) || {};
        return {
          value: typeof item.value === "string" ? item.value : "",
          label: typeof item.label === "string" ? item.label : "",
        };
      }),
    },
  };
}
