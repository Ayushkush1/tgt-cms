"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import {
  StaticSectionCard,
  StringListField,
  useStaticSection,
} from "@/app/components/StaticSectionCard";

interface ClockItem {
  city: string;
  country: string;
  timeZone: string;
}

interface GrowthCTAData {
  [key: string]: unknown;
  label: string;
  headlineMain: string;
  headlineHighlight: string;
  description: string;
  primaryButtonLabel: string;
  primaryButtonUrl: string;
  callTitle: string;
  formTitle: string;
  formNote: string;
  interestsLabel: string;
  interests: string[];
  budgetLabel: string;
  budgets: string[];
  submitLabel: string;
  privacyNote: string;
  sendingNote: string;
  sentNote: string;
  fallbackNote: string;
  assurances: string[];
  clocks: ClockItem[];
  localClockLabel: string;
  clocksNote: string;
}

const DEFAULT_DATA: GrowthCTAData = {
  label: "",
  headlineMain: "",
  headlineHighlight: "",
  description: "",
  primaryButtonLabel: "",
  primaryButtonUrl: "",
  callTitle: "",
  formTitle: "",
  formNote: "",
  interestsLabel: "",
  interests: [],
  budgetLabel: "",
  budgets: [],
  submitLabel: "",
  privacyNote: "",
  sendingNote: "",
  sentNote: "",
  fallbackNote: "",
  assurances: [],
  clocks: [],
  localClockLabel: "",
  clocksNote: "",
};

type GrowthCTAProps = {
  title?: string;
};

export function GrowthCTA({
  title = '5. Global "Let\'s Talk" CTA & Brief Modal (GrowthCTA)',
}: GrowthCTAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { formData, setFormData, isSaving, save } = useStaticSection(
    "/api/home",
    "GrowthCTA",
    DEFAULT_DATA,
    "Growth CTA",
  );

  const clocks = Array.isArray(formData.clocks) ? formData.clocks : [];

  const setText =
    (key: keyof GrowthCTAData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const cleanList = (list: string[]) => (list || []).map((v) => v.trim()).filter(Boolean);

  return (
    <StaticSectionCard
      title={title}
      description="Let's Talk CTA section, office timezone clocks, and project brief modal copy (shared globally across the site)."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={() =>
        save({
          ...formData,
          interests: cleanList(formData.interests),
          budgets: cleanList(formData.budgets),
          assurances: cleanList(formData.assurances),
        })
      }
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <InputField
          label="Eyebrow Label"
          value={formData.label || ""}
          onChange={setText("label")}
          placeholder="e.g. (Let's talk)"
        />
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Headline Main"
            value={formData.headlineMain || ""}
            onChange={setText("headlineMain")}
            placeholder="e.g. Let's grow"
          />
          <InputField
            label="Gold Italic Highlight"
            value={formData.headlineHighlight || ""}
            onChange={setText("headlineHighlight")}
            placeholder="e.g. together."
          />
        </div>
        <TextAreaField
          label="Description"
          value={formData.description || ""}
          onChange={setText("description")}
          rows={2}
          containerClassName="md:col-span-2"
          placeholder="e.g. Tell us what you're building and we'll reply with a clear plan..."
        />
        <InputField
          label="Primary Button Label"
          value={formData.primaryButtonLabel || ""}
          onChange={setText("primaryButtonLabel")}
          placeholder="e.g. Start your project"
        />
        <InputField
          label="Primary Booking URL"
          value={formData.primaryButtonUrl || ""}
          onChange={setText("primaryButtonUrl")}
          placeholder="https://calendar.app.google/..."
        />
      </div>

      <StringListField
        label="Assurances Checkmarks"
        items={formData.assurances || []}
        onChange={(assurances) => setFormData((prev) => ({ ...prev, assurances }))}
        placeholder="e.g. Reply within 24 hours"
        addLabel="Add assurance"
        columns={3}
      />

      {/* Clocks */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Global Office Clocks ({clocks.length})
          </span>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                clocks: [...clocks, { city: "", country: "", timeZone: "" }],
              }))
            }
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200"
          >
            <Plus className="h-3.5 w-3.5" /> Add clock
          </button>
        </div>
        {clocks.map((clock, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 items-end gap-2 md:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <InputField
              label="City"
              value={clock.city || ""}
              onChange={(e) => {
                const next = [...clocks];
                next[idx] = { ...next[idx], city: e.target.value };
                setFormData((prev) => ({ ...prev, clocks: next }));
              }}
              placeholder="e.g. Noida"
            />
            <InputField
              label="Country"
              value={clock.country || ""}
              onChange={(e) => {
                const next = [...clocks];
                next[idx] = { ...next[idx], country: e.target.value };
                setFormData((prev) => ({ ...prev, clocks: next }));
              }}
              placeholder="e.g. India"
            />
            <InputField
              label="IANA Time Zone"
              value={clock.timeZone || ""}
              onChange={(e) => {
                const next = [...clocks];
                next[idx] = { ...next[idx], timeZone: e.target.value };
                setFormData((prev) => ({ ...prev, clocks: next }));
              }}
              placeholder="e.g. Asia/Kolkata"
            />
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, clocks: clocks.filter((_, i) => i !== idx) }))
              }
              className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InputField
            label="Visitor Local Clock Label"
            value={formData.localClockLabel || ""}
            onChange={setText("localClockLabel")}
            placeholder="e.g. Your time"
          />
          <InputField
            label="Clocks Note"
            value={formData.clocksNote || ""}
            onChange={setText("clocksNote")}
            placeholder="e.g. Wherever you are, we overlap with your workday."
          />
        </div>
      </div>

      {/* Brief Modal Copy */}
      <div className="flex flex-col gap-4 rounded-2xl border border-amber-200/60 bg-amber-50/30 p-4">
        <span className="text-[11px] font-bold tracking-widest text-[#9A781E] uppercase">
          Project Brief Modal Copy
        </span>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <InputField
            label="Form Title"
            value={formData.formTitle || ""}
            onChange={setText("formTitle")}
            placeholder="e.g. Tell us about your project"
          />
          <InputField
            label="Call Title"
            value={formData.callTitle || ""}
            onChange={setText("callTitle")}
            placeholder="e.g. Prefer to talk?"
          />
          <InputField
            label="Form Subtitle"
            value={formData.formNote || ""}
            onChange={setText("formNote")}
            placeholder="e.g. We reply within 24 hours..."
            containerClassName="md:col-span-2"
          />
          <InputField
            label="Interests Label"
            value={formData.interestsLabel || ""}
            onChange={setText("interestsLabel")}
            placeholder="e.g. I'm interested in"
          />
          <InputField
            label="Budget Label"
            value={formData.budgetLabel || ""}
            onChange={setText("budgetLabel")}
            placeholder="e.g. Project budget"
          />
          <InputField
            label="Submit Button Label"
            value={formData.submitLabel || ""}
            onChange={setText("submitLabel")}
            placeholder="e.g. Send my brief"
          />
          <InputField
            label="Privacy Note"
            value={formData.privacyNote || ""}
            onChange={setText("privacyNote")}
            placeholder="e.g. No spam. We never share your details."
          />
          <InputField
            label="Sending Status Note"
            value={formData.sendingNote || ""}
            onChange={setText("sendingNote")}
            placeholder="e.g. Sending your brief..."
          />
          <InputField
            label="Sent Confirmation Note"
            value={formData.sentNote || ""}
            onChange={setText("sentNote")}
            placeholder="e.g. Thanks, your brief is in..."
          />
          <InputField
            label="Email Fallback Note"
            value={formData.fallbackNote || ""}
            onChange={setText("fallbackNote")}
            placeholder="e.g. Couldn't reach the server — send directly via your email app at"
            containerClassName="md:col-span-2"
          />
        </div>

        <StringListField
          label="Default Interest Options"
          items={formData.interests || []}
          onChange={(interests) => setFormData((prev) => ({ ...prev, interests }))}
          placeholder="e.g. Branding"
          addLabel="Add interest"
          columns={3}
        />

        <StringListField
          label="Default Budget Options"
          items={formData.budgets || []}
          onChange={(budgets) => setFormData((prev) => ({ ...prev, budgets }))}
          placeholder="e.g. $5k to $10k"
          addLabel="Add budget"
          columns={3}
        />
      </div>
    </StaticSectionCard>
  );
}
