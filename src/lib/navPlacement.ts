/**
 * Where a navigation link is shown on the website. Single source of truth for the
 * Create Page popup, the Menu Links editor and the API routes.
 */
export const NAV_PLACEMENTS = [
  { value: "navbar", label: "Navbar" },
  { value: "footer", label: "Footer" },
  { value: "both", label: "Navbar & Footer" },
] as const;

export type NavPlacement = (typeof NAV_PLACEMENTS)[number]["value"];

export const isNavPlacement = (value: unknown): value is NavPlacement =>
  NAV_PLACEMENTS.some((placement) => placement.value === value);

export const navPlacementLabel = (value: string) =>
  NAV_PLACEMENTS.find((placement) => placement.value === value)?.label ?? "";
