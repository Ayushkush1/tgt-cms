"use client";

import {
  StaticSectionCard,
  StringListField,
  useStaticSection,
} from "@/app/components/StaticSectionCard";

export function useHomeSection<T extends Record<string, unknown>>(
  sectionKey: string,
  defaultValue: T,
  displayName: string,
) {
  return useStaticSection("/api/home", sectionKey, defaultValue, displayName);
}

export { StaticSectionCard as HomeSectionCard, StringListField };
