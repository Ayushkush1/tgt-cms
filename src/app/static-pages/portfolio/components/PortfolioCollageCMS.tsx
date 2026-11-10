"use client";

import { InputField } from "@/components/InputField";
import { ImageUploadField } from "@/components/ImageUploadField";

export interface PortfolioCollageData {
  mainImage: (File | string | null)[];
  mainImageTag: string;
  mainImageTitle: string;
  secondaryImage: (File | string | null)[];
  secondaryImageTitle: string;
  tertiaryImage: (File | string | null)[];
  tertiaryImageTitle: string;
  liveStatusText: string;
  liveStatusSubtext: string;
  ratingValue: string;
  ratingText: string;
  ratingSubtext: string;
}

interface Props {
  data: PortfolioCollageData;
  onChange: (data: PortfolioCollageData) => void;
}

export function PortfolioCollageCMS({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Images Section */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-800">Image Collage</h3>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Main Image */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
              Main Featured Image
            </p>
            <ImageUploadField
              label="Featured Image"
              images={data.mainImage}
              onImagesChange={(imgs) => onChange({ ...data, mainImage: imgs })}
              maxImages={1}
            />
            <InputField
              label="Image Tag"
              value={data.mainImageTag}
              onChange={(e) => onChange({ ...data, mainImageTag: e.target.value })}
              placeholder="e.g. System Architecture"
            />
            <InputField
              label="Image Title"
              value={data.mainImageTitle}
              onChange={(e) => onChange({ ...data, mainImageTitle: e.target.value })}
              placeholder="e.g. FinTech Evolution"
            />
          </div>

          {/* Secondary Image */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
              Secondary Image
            </p>
            <ImageUploadField
              label="Secondary Image"
              images={data.secondaryImage}
              onImagesChange={(imgs) => onChange({ ...data, secondaryImage: imgs })}
              maxImages={1}
            />
            <InputField
              label="Image Title"
              value={data.secondaryImageTitle}
              onChange={(e) => onChange({ ...data, secondaryImageTitle: e.target.value })}
              placeholder="e.g. Luxe Commerce"
            />
          </div>

          {/* Tertiary Image */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
              Tertiary Image
            </p>
            <ImageUploadField
              label="Tertiary Image"
              images={data.tertiaryImage}
              onImagesChange={(imgs) => onChange({ ...data, tertiaryImage: imgs })}
              maxImages={1}
            />
            <InputField
              label="Image Title"
              value={data.tertiaryImageTitle}
              onChange={(e) => onChange({ ...data, tertiaryImageTitle: e.target.value })}
              placeholder="e.g. Health OS"
            />
          </div>
        </div>
      </div>

      {/* Badges & Tech Section */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-800">Floating Badges & Tech Stack</h3>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Live Status */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Live Status Badge
            </p>
            <div className="grid grid-cols-1 gap-4">
              <InputField
                label="Badge Text"
                value={data.liveStatusText}
                onChange={(e) => onChange({ ...data, liveStatusText: e.target.value })}
                placeholder="e.g. Live Project"
                className="bg-white"
              />
              <InputField
                label="Badge Subtext"
                value={data.liveStatusSubtext}
                onChange={(e) => onChange({ ...data, liveStatusSubtext: e.target.value })}
                placeholder="e.g. Deployment ready"
                className="bg-white"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-700">
              ⭐ Rating Badge
            </p>
            <div className="grid grid-cols-1 gap-4">
              <InputField
                label="Icon/Value"
                value={data.ratingValue}
                onChange={(e) => onChange({ ...data, ratingValue: e.target.value })}
                className="bg-white"
                placeholder="e.g. 5.0"
              />
              <InputField
                label="Badge Title"
                value={data.ratingText}
                onChange={(e) => onChange({ ...data, ratingText: e.target.value })}
                placeholder="e.g. 5.0 Rating"
                className="bg-white"
              />
              <InputField
                label="Badge Subtext"
                value={data.ratingSubtext}
                onChange={(e) => onChange({ ...data, ratingSubtext: e.target.value })}
                placeholder="e.g. 50+ happy clients"
                className="bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
