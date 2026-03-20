"use client";

import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";


export interface PortfolioHeroData {
  eyebrow: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  viewProjectsText: string;
  viewProjectsHref: string;
}

export interface PortfolioStat {
  value: number;
  label: string;
  suffix: string;
}

interface Props {
  hero: PortfolioHeroData;
  onHeroChange: (hero: PortfolioHeroData) => void;
}

export function PortfolioHeroCMS({ hero, onHeroChange }: Props) {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero Text Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Hero Text & Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Eyebrow Text"
            value={hero.eyebrow}
            onChange={(e) => onHeroChange({ ...hero, eyebrow: e.target.value })}
            placeholder="e.g. Our Work"
          />
          <div className="grid grid-cols-3 gap-4 md:col-span-2">
            <InputField
              label="Title (Prefix)"
              value={hero.titlePrefix}
              onChange={(e) =>
                onHeroChange({ ...hero, titlePrefix: e.target.value })
              }
              placeholder="e.g. Work that "
            />
            <InputField
              label="Title (Highlight)"
              value={hero.titleHighlight}
              onChange={(e) =>
                onHeroChange({ ...hero, titleHighlight: e.target.value })
              }
              placeholder="e.g. speaks"
            />
            <InputField
              label="Title (Suffix)"
              value={hero.titleSuffix}
              onChange={(e) =>
                onHeroChange({ ...hero, titleSuffix: e.target.value })
              }
              placeholder="e.g. for itself"
            />
          </div>
          <TextAreaField
            label="Hero Description"
            value={hero.description}
            onChange={(e) =>
              onHeroChange({ ...hero, description: e.target.value })
            }
            placeholder="Enter hero description..."
            containerClassName="md:col-span-2"
          />
          <InputField
            label="CTA Button Text"
            value={hero.ctaText}
            onChange={(e) => onHeroChange({ ...hero, ctaText: e.target.value })}
            placeholder="e.g. Start a project"
          />
          <InputField
            label="CTA Button Link"
            value={hero.ctaHref}
            onChange={(e) => onHeroChange({ ...hero, ctaHref: e.target.value })}
            placeholder="e.g. /contactUs"
          />
          <InputField
            label="Secondary Button Text"
            value={hero.viewProjectsText}
            onChange={(e) =>
              onHeroChange({ ...hero, viewProjectsText: e.target.value })
            }
            placeholder="e.g. View projects"
          />
          <InputField
            label="Secondary Button Link"
            value={hero.viewProjectsHref}
            onChange={(e) =>
              onHeroChange({ ...hero, viewProjectsHref: e.target.value })
            }
            placeholder="e.g. /projects"
          />
        </div>
      </div>
    </div>
  );
}
