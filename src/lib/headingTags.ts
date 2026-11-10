/**
 * The page's main heading tag (H1–H6) is an SEO setting: chosen per page in
 * SEO → Page Settings and stored as Page.headingOptions (service pages: section
 * content.seo.headingOptions).
 *
 * Value: a plain string, "h1" … "h6", or "" when not chosen (the website then uses its
 * default). Served as `seo.headingOptions` by /api/pages, /api/pages/[slug] and /api/seo/pages.
 */

export const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
export type HeadingTag = (typeof HEADING_TAGS)[number];

export const HEADING_TAG_LABELS: Record<HeadingTag, string> = {
  h1: "H1 (Recommended standard title tag)",
  h2: "H2 (Secondary section tag)",
  h3: "H3 (Subsection tag)",
  h4: "H4 (Minor subsection tag)",
  h5: "H5 (Deep nested tag)",
  h6: "H6 (Smallest heading tag)",
};

export const isHeadingTag = (value: unknown): value is HeadingTag =>
  HEADING_TAGS.some((tag) => tag === value);

/** Any stored value as a heading tag string; older object values become "". */
export const toHeadingTag = (value: unknown): HeadingTag | "" => (isHeadingTag(value) ? value : "");

/**
 * The tag the page's main section editor used to store (content.headingTag, or inside its
 * hero / message part), used to pre-fill the SEO setting until it is saved there.
 */
export function legacyHeadingTag(content: unknown): HeadingTag | "" {
  const c = (content ?? {}) as Record<string, unknown>;
  const candidates = [
    c.headingTag,
    (c.hero as { headingTag?: unknown } | undefined)?.headingTag,
    (c.message as { headingTag?: unknown } | undefined)?.headingTag,
  ];
  return candidates.find(isHeadingTag) ?? "";
}
