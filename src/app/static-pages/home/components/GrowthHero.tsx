"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { uploadFiles } from "@/lib/uploadHelpers";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { saveCustomSection } from "@/app/components/StaticSectionCard";
import { HomeSectionCard, StringListField, type SectionInstanceProps } from "./HomeSectionCard";
import {
  ClientLogosField,
  clientLogoRows,
  type ClientLogo,
  type ClientLogoRow,
} from "./ClientLogosField";

interface GrowthHeroData {
  headlineTop: string;
  headlineWords: string[];
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  description: string;
  primaryButtonLabel: string;
  primaryButtonUrl: string;
  secondaryButtonLabel: string;
  secondaryButtonUrl: string;
  rating: string;
  ratingLabel: string;
  proofLine: string;
  responseLine: string;
  ticker: string[];
}

const DEFAULT_DATA: GrowthHeroData = {
  headlineTop: "",
  headlineWords: ["", ""],
  headlinePrefix: "",
  headlineHighlight: "",
  headlineSuffix: "",
  description: "",
  primaryButtonLabel: "",
  primaryButtonUrl: "",
  secondaryButtonLabel: "",
  secondaryButtonUrl: "",
  rating: "",
  ratingLabel: "",
  proofLine: "",
  responseLine: "",
  ticker: [],
};

export function GrowthHero(sectionProps?: SectionInstanceProps) {
  const sectionId = sectionProps?.sectionId;
  const initialData = sectionProps?.initialData;
  const sectionSaveUrl = sectionProps?.saveUrl;

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<GrowthHeroData>(DEFAULT_DATA);
  const [trustedByMeta, setTrustedByMeta] = useState<Record<string, unknown>>({});
  const [logos, setLogos] = useState<ClientLogoRow[]>([]);

  useEffect(() => {
    if (sectionId) {
      const data = initialData || {};
      setFormData({ ...DEFAULT_DATA, ...(data as Partial<GrowthHeroData>) });
      const trustedSource = Array.isArray(data.logos) || Array.isArray(data.images) ? data : null;
      setLogos(trustedSource ? clientLogoRows(trustedSource) : []);
      return;
    }

    let active = true;
    fetchWithCache("/api/home")
      .then((json) => {
        if (!active || !json?.success) return;
        const hero = json.data?.GrowthHero;
        if (hero && typeof hero === "object") {
          setFormData({ ...DEFAULT_DATA, ...hero });
        }
        const trusted = json.data?.TrustedBySection;
        if (trusted && typeof trusted === "object") {
          setTrustedByMeta(trusted as Record<string, unknown>);
          setLogos(clientLogoRows(trusted as Record<string, unknown>));
        }
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, [sectionId, initialData]);

  const setText =
    (key: keyof GrowthHeroData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const words = Array.isArray(formData.headlineWords) ? formData.headlineWords : ["", ""];
  const setWord = (index: 0 | 1, value: string) =>
    setFormData((prev) => {
      const next = [words[0] || "", words[1] || ""];
      next[index] = value;
      return { ...prev, headlineWords: next };
    });

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Saving Growth Hero…");
    try {
      const kept = logos.filter((l) => l.image);
      const uploaded = await uploadFiles(kept.map((l) => l.image));
      const savedLogos: ClientLogo[] = kept
        .map((l, i) => ({
          name: (l.name || "").trim(),
          image: uploaded[i] || "",
          width: l.width || 0,
          height: l.height || 0,
          dark: l.dark,
          showInHero: l.showInHero,
        }))
        .filter((l) => l.image);
      // `images`: the hero pill's logos, as the website reads them
      const heroImages = savedLogos.filter((l) => l.showInHero).map((l) => l.image);

      const heroPayload = {
        ...formData,
        headlineWords: [words[0] || "", words[1] || ""],
        ticker: (formData.ticker || []).map((t) => t.trim()).filter(Boolean),
      };

      if (sectionId) {
        await saveCustomSection(
          sectionId,
          { ...heroPayload, logos: savedLogos, images: heroImages },
          sectionSaveUrl,
        );
      } else {
        const [heroRes, trustedRes] = await Promise.all([
          fetch("/api/home", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section: "GrowthHero", content: heroPayload }),
          }),
          fetch("/api/home", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              section: "TrustedBySection",
              content: { ...trustedByMeta, logos: savedLogos, images: heroImages },
            }),
          }),
        ]);

        const [heroJson, trustedJson] = await Promise.all([heroRes.json(), trustedRes.json()]);
        if (!heroRes.ok || !heroJson.success || !trustedRes.ok || !trustedJson.success) {
          throw new Error(heroJson?.error || trustedJson?.error || "Save failed");
        }
        clearCache("/api/home");
      }

      setLogos(kept.map((l, i) => ({ ...l, image: uploaded[i] || null })));
      toast.success("Growth Hero saved and published!", { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HomeSectionCard
      title="Growth Hero"
      description="Main landing hero headline, client logos (hero pill & service pages), CTAs, proof rating card, and service ticker."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={handleSave}
    >
      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
        <div className="grid grid-cols-1 items-end gap-4 md:col-span-2 md:grid-cols-3">
          <InputField
            label="Headline Line 1"
            value={formData.headlineTop || ""}
            onChange={setText("headlineTop")}
            placeholder="e.g. One team to"
          />
          <InputField
            label="Line 2 Word 1"
            tooltip="Shown before the client logos pill."
            value={words[0] || ""}
            onChange={(e) => setWord(0, e.target.value)}
            placeholder="e.g. brand,"
          />
          <InputField
            label="Line 2 Word 2"
            tooltip="Shown before the product screens pill."
            value={words[1] || ""}
            onChange={(e) => setWord(1, e.target.value)}
            placeholder="e.g. build"
          />
        </div>
        <div className="grid grid-cols-1 items-end gap-4 md:col-span-2 md:grid-cols-3">
          <InputField
            label="Line 3 Prefix"
            value={formData.headlinePrefix || ""}
            onChange={setText("headlinePrefix")}
            placeholder="e.g. &"
          />
          <InputField
            label="Line 3 Gold Highlight"
            value={formData.headlineHighlight || ""}
            onChange={setText("headlineHighlight")}
            placeholder="e.g. grow"
          />
          <InputField
            label="Line 3 Suffix"
            value={formData.headlineSuffix || ""}
            onChange={setText("headlineSuffix")}
            placeholder="e.g. your business."
          />
        </div>

        <TextAreaField
          label="Hero Description"
          value={formData.description || ""}
          onChange={setText("description")}
          rows={3}
          containerClassName="md:col-span-2"
          placeholder="Strategy, design, technology and marketing under one roof..."
        />

        <InputField
          label="Primary Button Label"
          value={formData.primaryButtonLabel || ""}
          onChange={setText("primaryButtonLabel")}
          placeholder="e.g. Book a free strategy call"
        />
        <InputField
          label="Primary Button URL"
          value={formData.primaryButtonUrl || ""}
          onChange={setText("primaryButtonUrl")}
          placeholder="https://calendar.app.google/..."
        />
        <InputField
          label="Secondary Button Label"
          value={formData.secondaryButtonLabel || ""}
          onChange={setText("secondaryButtonLabel")}
          placeholder="e.g. See our work"
        />
        <InputField
          label="Secondary Button URL"
          value={formData.secondaryButtonUrl || ""}
          onChange={setText("secondaryButtonUrl")}
          placeholder="e.g. #work"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 md:grid-cols-4">
        <InputField
          label="Rating Score"
          value={formData.rating || ""}
          onChange={setText("rating")}
          placeholder="e.g. 5.0"
        />
        <InputField
          label="Rating Label"
          value={formData.ratingLabel || ""}
          onChange={setText("ratingLabel")}
          placeholder="e.g. Average client rating"
        />
        <InputField
          label="Proof Line"
          value={formData.proofLine || ""}
          onChange={setText("proofLine")}
          placeholder="e.g. 50+ businesses grown worldwide"
        />
        <InputField
          label="Response Time Line"
          value={formData.responseLine || ""}
          onChange={setText("responseLine")}
          placeholder="e.g. Reply within 24 hours"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
        <ClientLogosField rows={logos} onChange={setLogos} />
      </div>

      <StringListField
        label="Service Marquee Ticker"
        items={formData.ticker || []}
        onChange={(ticker) => setFormData((prev) => ({ ...prev, ticker }))}
        placeholder="e.g. Branding"
        addLabel="Add ticker item"
        columns={3}
      />
    </HomeSectionCard>
  );
}
