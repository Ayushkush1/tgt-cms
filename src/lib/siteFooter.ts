/**
 * Site-wide footer & contact details, stored in GlobalConfig and served by the global
 * API (GET /api/seo/global → data.footer, data.socialLinks). Edited on
 * Navigation & Links → Social Media & Footer.
 */

/** The social icons the website footer knows how to draw. Single source of truth. */
export const SOCIAL_PLATFORMS = ["linkedin", "instagram", "facebook", "twitter"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** GlobalConfig.socialLinks: only platforms with a URL are stored. */
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface FooterOffice {
  country: string;
  address: string;
}

export interface FooterBadge {
  image: string;
  alt: string;
  link: string;
}

/** GlobalConfig.footer */
export interface SiteFooter {
  logo: string; // navbar & footer logo
  logoAlt: string;
  companyName: string;
  tagline: string; // short line under the company name, e.g. "Operating Worldwide"
  description: string;
  email: string;
  phone: string;
  offices: FooterOffice[]; // up to two
  badges: FooterBadge[]; // logos at the bottom of the footer
  wordmark: { left: string; center: string; right: string };
}

/**
 * A technology's logo, shown next to service stacks and CMS tags that match one of its names.
 * Shared by all services; edited in the Services editor's Tech Stack card.
 * (Client logos live on the home "TrustedBySection", edited in Growth Hero.)
 */
export interface TechLogo {
  name: string; // e.g. "react"
  image: string;
  matches: string[]; // lowercase names it stands for, e.g. ["react js", "react native"]
}

/**
 * GlobalConfig.siteImages: site-wide images (Cloudinary URLs). The photos are edited on
 * Social Media & Footer, the tech logos in the Services editor; each saves only its own keys.
 * Page hero photos are set on each page's hero section.
 */
export interface SiteImages {
  homeBackground: string; // faint full-page background behind the home page
  techLogos: TechLogo[];
}

export const isSocialPlatform = (value: unknown): value is SocialPlatform =>
  SOCIAL_PLATFORMS.some((platform) => platform === value);
