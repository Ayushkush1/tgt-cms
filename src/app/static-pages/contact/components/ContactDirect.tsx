"use client";

import React, { useState } from "react";
import { InputField } from "@/components/InputField";
import { StaticSectionCard, useStaticSection } from "@/app/components/StaticSectionCard";

interface ContactDirectData {
  [key: string]: unknown;
  label: string;
  emailLabel: string;
  phoneLabel: string;
  socialLabel: string;
  replyNote: string;
}

const DEFAULT_DATA: ContactDirectData = {
  label: "",
  emailLabel: "",
  phoneLabel: "",
  socialLabel: "",
  replyNote: "",
};

export function ContactDirect() {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useStaticSection(
    "/api/contact",
    "ContactDirect",
    DEFAULT_DATA,
    "Direct Lines Copy",
  );

  const setField = (key: keyof ContactDirectData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <StaticSectionCard
      title="2. Direct Lines Copy (ContactDirect)"
      description="Labels and response-time note shown beside the brief form on /contactUs."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() => save()}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Section Eyebrow Label"
          value={formData.label || ""}
          onChange={setField("label")}
          placeholder="e.g. (Direct lines)"
        />
        <InputField
          label="Reply Note"
          value={formData.replyNote || ""}
          onChange={setField("replyNote")}
          placeholder="e.g. Average first reply: under 4 working hours."
        />
        <InputField
          label="Email Heading"
          value={formData.emailLabel || ""}
          onChange={setField("emailLabel")}
          placeholder="e.g. Email"
        />
        <InputField
          label="Phone Heading"
          value={formData.phoneLabel || ""}
          onChange={setField("phoneLabel")}
          placeholder="e.g. Call or WhatsApp"
        />
        <InputField
          label="Social Heading"
          value={formData.socialLabel || ""}
          onChange={setField("socialLabel")}
          placeholder="e.g. Follow"
        />
      </div>
    </StaticSectionCard>
  );
}
