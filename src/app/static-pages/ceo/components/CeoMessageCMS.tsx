"use client";

import { InputField } from "@/app/components/InputField";
import { TextAreaField } from "@/app/components/TextAreaField";
import { ImageUploadField } from "@/app/components/ImageUploadField";

export interface CeoMessageData {
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">CEO Message Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="md:col-span-2 border border-gray-100 rounded-3xl p-6 bg-white/50">
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
