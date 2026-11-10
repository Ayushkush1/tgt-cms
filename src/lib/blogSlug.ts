export function toBlogSlug(title: string): string {
  return (title || "").trim().toLowerCase().replace(/\s+/g, "-");
}

export function encodeSlugPath(slug: string): string {
  return slug
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}
