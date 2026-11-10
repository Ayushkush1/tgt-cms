"use client";

import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";

export interface PortfolioCTAData {
  eyebrow: string;
  titlepart3: string;
  titleMain: string;
  titleHighlight: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

interface Props {
  data: PortfolioCTAData;
  onChange: (data: PortfolioCTAData) => void;
}

export function PortfolioCTACMS({ data, onChange }: Props) {
  return (
    <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800">
        CTA Banner Content
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <InputField
          label="Eyebrow Text"
          value={data.eyebrow}
          onChange={(e) => onChange({ ...data, eyebrow: e.target.value })}
          placeholder="e.g. Ready to build?"
          containerClassName="col-span-2"
        />
        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <InputField
            label="Title (Main)"
            value={data.titleMain}
            onChange={(e) => onChange({ ...data, titleMain: e.target.value })}
            placeholder="e.g. Let's create something "
          />
          <InputField
            label="Title (Highlight)"
            value={data.titleHighlight}
            onChange={(e) => onChange({ ...data, titleHighlight: e.target.value })}
            placeholder="e.g. extraordinary"
          />
          <InputField
            label="Title part3"
            value={data.titlepart3}
            onChange={(e) => onChange({ ...data, titlepart3: e.target.value })}
            placeholder="e.g. Let's create something extraordinary"
            containerClassName="col-span-2"
          />
        </div>
        <TextAreaField
          label="Description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Enter banner description..."
          containerClassName="md:col-span-2"
          rows={3}
        />

        <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-700">Primary Button</p>
          <InputField
            label="Label"
            value={data.primaryButtonText}
            onChange={(e) => onChange({ ...data, primaryButtonText: e.target.value })}
            placeholder="e.g. Book Free Consultation"
            className="bg-white"
          />
          <InputField
            label="Link"
            value={data.primaryButtonLink}
            onChange={(e) => onChange({ ...data, primaryButtonLink: e.target.value })}
            placeholder="e.g. https://..."
            className="bg-white"
          />
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-700">Secondary Button</p>
          <InputField
            label="Label"
            value={data.secondaryButtonText}
            onChange={(e) => onChange({ ...data, secondaryButtonText: e.target.value })}
            placeholder="e.g. View All Services"
            className="bg-white"
          />
          <InputField
            label="Link"
            value={data.secondaryButtonLink}
            onChange={(e) => onChange({ ...data, secondaryButtonLink: e.target.value })}
            placeholder="e.g. /services"
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
}
