"use client";

import { InputField } from "@/app/components/InputField";
import { TextAreaField } from "@/app/components/TextAreaField";
import { ImageUploadField } from "@/app/components/ImageUploadField";
import { SelectField } from "@/app/components/SelectField";

export interface CeoMessageData {
  headingTag?: string;
  name: string;
  role: string;
  avatar: (File | string | null)[];
  yearsLabel: string;
  yearsText: string;
  title: string;
  titleItalic: string;
  paragraphs: string[];
  ctaText: string;
  ctaLink: string;
}

interface Props {
  message: CeoMessageData;
  onMessageChange: (message: CeoMessageData) => void;
}

export function CeoMessageCMS({ message, onMessageChange }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-800">CEO Message Settings</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputField
            label="CEO Name"
            value={message.name}
            onChange={(e) => onMessageChange({ ...message, name: e.target.value })}
            placeholder="e.g. Meghna"
          />
          <InputField
            label="CEO Role"
            value={message.role}
            onChange={(e) => onMessageChange({ ...message, role: e.target.value })}
            placeholder="e.g. Chief Executive Officer"
          />
          <InputField
            label="Title Part 1"
            value={message.title}
            onChange={(e) => onMessageChange({ ...message, title: e.target.value })}
            placeholder="e.g. Building the Future of"
          />
          <InputField
            label="Title Part 2 (Italic)"
            value={message.titleItalic}
            onChange={(e) => onMessageChange({ ...message, titleItalic: e.target.value })}
            placeholder="e.g. Digital Excellence."
          />
          <InputField
            label="Years Label"
            value={message.yearsLabel}
            onChange={(e) => onMessageChange({ ...message, yearsLabel: e.target.value })}
            placeholder="e.g. 15+"
          />
          <InputField
            label="Years Subtext"
            value={message.yearsText}
            onChange={(e) => onMessageChange({ ...message, yearsText: e.target.value })}
            placeholder="e.g. Years of\nExcellence"
          />
          <InputField
            label="CTA Text"
            value={message.ctaText}
            onChange={(e) => onMessageChange({ ...message, ctaText: e.target.value })}
            placeholder="e.g. Contact Us"
          />
          <InputField
            label="CTA Link"
            value={message.ctaLink}
            onChange={(e) => onMessageChange({ ...message, ctaLink: e.target.value })}
            placeholder="e.g. /contact"
          />
          <SelectField
            label="Heading HTML Tag"
            value={message.headingTag || "h1"}
            onChange={(e) => onMessageChange({ ...message, headingTag: e.target.value })}
            options={[
              { value: "h1", label: "H1" },
              { value: "h2", label: "H2" },
              { value: "h3", label: "H3" },
              { value: "h4", label: "H4" },
              { value: "h5", label: "H5" },
              { value: "h6", label: "H6" },
            ]}
            containerClassName="col-span-1 md:col-span-2"
          />
          <div className="rounded-3xl border border-gray-100 bg-white/50 p-6 md:col-span-2">
            <ImageUploadField
              label="CEO Image"
              images={message.avatar}
              onImagesChange={(imgs) => onMessageChange({ ...message, avatar: imgs })}
              maxImages={1}
            />
          </div>
          <TextAreaField
            label="Message Paragraph 1"
            value={message.paragraphs[0] || ""}
            onChange={(e) => {
              const paras = [...message.paragraphs];
              paras[0] = e.target.value;
              onMessageChange({ ...message, paragraphs: paras });
            }}
            placeholder="Enter first paragraph of message..."
            containerClassName="md:col-span-2"
            rows={4}
          />
          <TextAreaField
            label="Message Paragraph 2"
            value={message.paragraphs[1] || ""}
            onChange={(e) => {
              const paras = [...message.paragraphs];
              paras[1] = e.target.value;
              onMessageChange({ ...message, paragraphs: paras });
            }}
            placeholder="Enter second paragraph of message..."
            containerClassName="md:col-span-2"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
