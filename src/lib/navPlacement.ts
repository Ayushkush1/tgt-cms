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

/**
 * A link inside a dropdown can also be hidden everywhere ("none"). It shows in a place only
 * when both it and its dropdown are set to show there (website: filter a menu's links with
 * `linkShownIn` too).
 */
export type LinkPlacement = NavPlacement | "none";
export type NavPlace = "navbar" | "footer";

export const isLinkPlacement = (value: unknown): value is LinkPlacement =>
  value === "none" || isNavPlacement(value);

export const linkShownIn = (placement: string | null | undefined, where: NavPlace) =>
  (placement ?? "navbar") === where || placement === "both";

/** Builds a placement from the two "show in" switches. */
export const placementFrom = (navbar: boolean, footer: boolean): LinkPlacement =>
  navbar && footer ? "both" : navbar ? "navbar" : footer ? "footer" : "none";
