// Decides whether a navigation link points to a page on the TGT website.
// Links that leave the website (e.g. product demos on other domains) get no SEO entry.

/** The website's base URL (NEXT_PUBLIC_WEBSITE_URL); empty when it is not set. */
export const WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL || "";

const ownHosts = (() => {
  const hosts = new Set<string>(["thegoldtechnologies.com"]);
  try {
    hosts.add(new URL(WEBSITE_URL).hostname.replace(/^www\./, ""));
  } catch {
    // ignore an invalid NEXT_PUBLIC_WEBSITE_URL
  }
  return hosts;
})();

/**
 * Returns the website path for a link ("/about", "/service/branding"),
 * or null when the link goes outside the website (other domains, mailto:, tel:, "#").
 * Absolute links to this website's own domain are turned into their path.
 */
export function toInternalPath(url: string | null | undefined): string | null {
  const value = (url ?? "").trim();
  if (!value || value.startsWith("#")) return null;

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value.split(/[?#]/)[0] || "/";
  }

  try {
    const parsed = new URL(value.startsWith("//") ? `https:${value}` : value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!ownHosts.has(parsed.hostname.replace(/^www\./, ""))) return null;
    return parsed.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return null;
  }
}
