"use client";

import {
  StaticSectionCard,
  StringListField,
  useStaticSection,
  type SectionInstanceProps,
} from "@/app/components/StaticSectionCard";

export function useHomeSection<T extends Record<string, unknown>>(
  sectionKey: string,
  defaultValue: T,
  displayName: string,
  sectionOptions?: SectionInstanceProps,
) {
  return useStaticSection("/api/home", sectionKey, defaultValue, displayName, sectionOptions);
}

export { StaticSectionCard as HomeSectionCard, StringListField, type SectionInstanceProps };
