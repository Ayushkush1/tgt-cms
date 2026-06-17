"use client";

import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";

export interface PortfolioShowcaseData {
  upperTag: string;
  headlinePart1: string;
  headlineHighlight: string;
  headlinePart3: string;
  headlinePart4: string;
  mainDescription: string;
}

interface Props {
  showcase: PortfolioShowcaseData;
  onShowcaseChange: (showcase: PortfolioShowcaseData) => void;
}

export function PortfolioShowcaseCMS({ showcase, onShowcaseChange }: Props) {
  return (
    <div className="flex flex-col gap-8">
      {/* Showcase Text Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Projects Showcase Header
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Upper Tag"
            value={showcase.upperTag}
            onChange={(e) =>
              onShowcaseChange({ ...showcase, upperTag: e.target.value })
            }
            placeholder="e.g. Projects"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:col-span-2">
            <InputField
              label="Title (Part 1)"
              value={showcase.headlinePart1}
              onChange={(e) =>
                onShowcaseChange({ ...showcase, headlinePart1: e.target.value })
              }
              placeholder="e.g. Discover"
            />
            <InputField
              label="Title (Highlight)"
              value={showcase.headlineHighlight}
              onChange={(e) =>
                onShowcaseChange({
                  ...showcase,
                  headlineHighlight: e.target.value,
                })
              }
              placeholder="e.g. Industry-Defining"
            />
            <InputField
              label="Title (Part 3)"
              value={showcase.headlinePart3}
              onChange={(e) =>
                onShowcaseChange({ ...showcase, headlinePart3: e.target.value })
              }
              placeholder="e.g. Digital"
            />
            <InputField
              label="Title (Underline)"
              value={showcase.headlinePart4}
              onChange={(e) =>
                onShowcaseChange({ ...showcase, headlinePart4: e.target.value })
              }
              placeholder="e.g. Masterpieces"
            />
          </div>
          <TextAreaField
            label="Main Description"
            value={showcase.mainDescription}
            onChange={(e) =>
              onShowcaseChange({ ...showcase, mainDescription: e.target.value })
            }
            placeholder="Enter showcase main description..."
            containerClassName="md:col-span-2"
          />
        </div>
      </div>
    </div>
  );
}
