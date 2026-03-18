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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        CTA Banner Content
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            onChange={(e) =>
              onChange({ ...data, titleHighlight: e.target.value })
            }
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

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-4">
          <p className="text-sm font-bold text-gray-700">Primary Button</p>
          <InputField
            label="Label"
            value={data.primaryButtonText}
            onChange={(e) =>
              onChange({ ...data, primaryButtonText: e.target.value })
            }
            placeholder="e.g. Book Free Consultation"
          />
          <InputField
            label="Link"
            value={data.primaryButtonLink}
            onChange={(e) =>
              onChange({ ...data, primaryButtonLink: e.target.value })
            }
            placeholder="e.g. https://..."
          />
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-4">
          <p className="text-sm font-bold text-gray-700">Secondary Button</p>
          <InputField
            label="Label"
            value={data.secondaryButtonText}
            onChange={(e) =>
              onChange({ ...data, secondaryButtonText: e.target.value })
            }
            placeholder="e.g. View All Services"
          />
          <InputField
            label="Link"
            value={data.secondaryButtonLink}
            onChange={(e) =>
              onChange({ ...data, secondaryButtonLink: e.target.value })
            }
            placeholder="e.g. /services"
          />
        </div>
      </div>
    </div>
  );
}
