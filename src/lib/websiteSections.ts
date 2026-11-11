/**
 * The sections each CMS page holds that have an editor, 1-to-1 with the website section names.
 * Page responses (the admin /api/home, /api/about, … and the website's /api/site/pages/[slug])
 * contain only these, next to that page's SEO: { success, data: { [type]: content }, seo }.
 *
 * Not listed, so never sent (still stored): old home sections with no editor (HeroSection,
 * WhoWeAre, WhatWeDo, Integrations, OurPartners) and FooterCMS / EnquirySection, which the
 * global footer replaces (GlobalConfig.footer, edited on Social Media & Footer).
 */
export const PAGE_SECTIONS: Record<string, readonly string[] | "all"> = {
  home: [
    "GrowthHero",
    "TrustedBySection",
    "Showreel",
    "Manifesto",
    "ServicePillars",
    "WorkShowcase",
    "GrowthProcess",
    "Testimonials",
    "OurReputation",
    "Insights",
    "GrowthCTA",
    "StickyCTA",
    "BlogSection",
  ],
  about: [
    "AboutHero",
    "AboutStory",
    "AboutPurpose",
    "FounderNote",
    "Journey",
    "Team",
    "AboutFilm",
    "VideoSection",
    "OurTeam",
    "Portfolio", // case studies, edited on Static pages → Portfolio
  ],
  contactUs: ["ContactHero", "ContactDirect", "MapSection"],
  blog: ["BlogIndex"],
  media: ["MediaIndex", "MediaItems"],
  products: ["main"],
  portfolio: ["main"],
  services: "all", // one section per service, keyed by its slug
};

/** Pages the website reads through /api/site/pages/[slug]. */
export const isWebsitePage = (slug: string) => Object.hasOwn(PAGE_SECTIONS, slug);

/** Cache tags shared with the website. Must match CmsTag in TGT-LandingPage/src/lib/cmsServer.ts */
export const WebsiteTag = {
  site: "site", // /api/site/global: settings, footer, social links, site images, navigation, banners
  page: (slug: string) => `page:${slug}`, // /api/site/pages/<slug> (blog posts: page:blog)
};
