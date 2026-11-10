"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Award,
  Compass,
  ExternalLink,
  Facebook,
  FileText,
  GripVertical,
  ImageIcon,
  Instagram,
  Linkedin,
  Plus,
  Save,
  Share2,
  Sparkles,
  Trash2,
  Twitter,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/app/components/PageHeader";
import { GrowthCTA } from "@/app/components/GrowthCTA";
import { InputField } from "@/app/components/InputField";
import { TextAreaField } from "@/app/components/TextAreaField";
import {
  isSocialPlatform,
  type SiteFooter,
  type SocialLink,
  type SocialPlatform,
} from "@/lib/siteFooter";

/**
 * Social Media & Footer: the site logo (navbar & footer), social links, contact
 * details, offices, footer badges and wordmark. Saved in the global settings
 * (GlobalConfig.footer & .socialLinks) through the global API: /api/seo/global.
 */

// Home page sections the live website still reads these details from. Each save copies
// the global values into them so the site stays current until it reads the global API.
const LEGACY_FOOTER = "FooterCMS";
const LEGACY_ENQUIRY = "EnquirySection";

type ImageValue = File | string | null;

interface Badge {
  id: string;
  image: ImageValue;
  alt: string;
  link: string;
}

interface FooterData {
  logo: ImageValue;
  logoAlt: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  companyName: string;
  footerDescription: string;
  emailAddress: string;
  phoneNumber: string;
  loc1Country: string;
  loc1Address: string;
  loc2Country: string;
  loc2Address: string;
  badges: Badge[];
  leftText: string;
  centerText: string;
  rightText: string;
  companyInitials: string;
}

interface DropTarget {
  id: string;
  position: "before" | "after";
}

const EMPTY: FooterData = {
  logo: null,
  logoAlt: "",
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  companyName: "",
  footerDescription: "",
  emailAddress: "",
  phoneNumber: "",
  loc1Country: "",
  loc1Address: "",
  loc2Country: "",
  loc2Address: "",
  badges: [],
  leftText: "",
  centerText: "",
  rightText: "",
  companyInitials: "",
};

type TextKey = {
  [K in keyof FooterData]: FooterData[K] extends string ? K : never;
}[keyof FooterData];

const SOCIALS: {
  key: TextKey;
  platform: SocialPlatform;
  label: string;
  icon: React.ElementType;
  placeholder: string;
  accent: string;
}[] = [
  {
    key: "linkedinUrl",
    platform: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://www.linkedin.com/company/…",
    accent: "bg-blue-50 text-blue-600",
  },
  {
    key: "instagramUrl",
    platform: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://www.instagram.com/…",
    accent: "bg-pink-50 text-pink-600",
  },
  {
    key: "facebookUrl",
    platform: "facebook",
    label: "Facebook",
    icon: Facebook,
    placeholder: "https://www.facebook.com/…",
    accent: "bg-indigo-50 text-indigo-600",
  },
  {
    key: "twitterUrl",
    platform: "twitter",
    label: "X (Twitter)",
    icon: Twitter,
    placeholder: "https://x.com/…",
    accent: "bg-gray-100 text-[#0B0F29]",
  },
];

const boxedActionButton =
  "flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/90 bg-white text-gray-500 transition-colors hover:border-[#D4AF37] hover:text-[#0B0F29]";

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const str = (value: unknown) => (typeof value === "string" ? value : "");

/** Form state from the global settings. */
function fromGlobal(footer: Partial<SiteFooter>, socialLinks: unknown): FooterData {
  const socials = Array.isArray(socialLinks) ? (socialLinks as Partial<SocialLink>[]) : [];
  const urlFor = (platform: SocialPlatform) =>
    str(socials.find((link) => link.platform === platform)?.url);
  const offices = Array.isArray(footer.offices) ? footer.offices : [];
  return {
    ...EMPTY,
    logo: str(footer.logo) || null,
    logoAlt: str(footer.logoAlt),
    companyName: str(footer.companyName),
    companyInitials: str(footer.tagline),
    footerDescription: str(footer.description),
    emailAddress: str(footer.email),
    phoneNumber: str(footer.phone),
    loc1Country: str(offices[0]?.country),
    loc1Address: str(offices[0]?.address),
    loc2Country: str(offices[1]?.country),
    loc2Address: str(offices[1]?.address),
    leftText: str(footer.wordmark?.left),
    centerText: str(footer.wordmark?.center),
    rightText: str(footer.wordmark?.right),
    linkedinUrl: urlFor("linkedin"),
    instagramUrl: urlFor("instagram"),
    facebookUrl: urlFor("facebook"),
    twitterUrl: urlFor("twitter"),
    badges: Array.isArray(footer.badges)
      ? footer.badges.map((b) => ({
          id: makeId(),
          image: str(b?.image) || null,
          alt: str(b?.alt),
          link: str(b?.link),
        }))
      : [],
  };
}

/** Form state from the old home page "FooterCMS" section (used until the first save here). */
function fromLegacy(content: Record<string, unknown>): FooterData {
  return {
    ...EMPTY,
    ...Object.fromEntries(
      Object.keys(EMPTY)
        .filter((k) => k !== "badges" && k !== "logo")
        .map((k) => [k, str(content[k])]),
    ),
    logo: str(content.logo) || null,
    badges: [],
  };
}

async function putHomeSection(section: string, content: Record<string, unknown>) {
  const res = await fetch("/api/home", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ section, content }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
}

/** Uploads a picked file (WebP-compressed by /api/upload) and returns its URL; URLs pass through. */
async function toUrl(image: ImageValue): Promise<string> {
  if (!image) return "";
  if (typeof image === "string") return image;
  const body = new FormData();
  body.append("file", image);
  const res = await fetch("/api/upload", { method: "POST", body });
  const json = await res.json();
  if (!json.success || !json.files?.[0]) throw new Error(json.error ?? "Upload failed");
  return json.files[0];
}

function SectionCard({
  icon: Icon,
  iconBg,
  title,
  description,
  action,
  children,
}: {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(11,15,41,0.03)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
        <div className="flex items-start gap-3.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-[#0B0F29]">{title}</h2>
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          </div>
        </div>
        {action}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

function LogoUploadSubCard({
  badgeIcon: BadgeIcon,
  badgeLabel,
  badgeColor,
  title,
  helperText,
  value,
  onChange,
}: {
  badgeIcon: React.ElementType;
  badgeLabel: string;
  badgeColor: string;
  title: string;
  helperText: string;
  value: ImageValue;
  onChange: (next: ImageValue) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  const fileObjectUrl = useMemo(
    () => (value && typeof value !== "string" ? URL.createObjectURL(value) : null),
    [value],
  );

  useEffect(() => {
    if (!fileObjectUrl) return;
    return () => URL.revokeObjectURL(fileObjectUrl);
  }, [fileObjectUrl]);

  const previewUrl = typeof value === "string" ? value : fileObjectUrl;

  const applyDirectUrl = () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setUrlMode(false);
    setUrlDraft("");
  };

  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-[#FAFAFC] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className={`flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase ${badgeColor}`}
          >
            <BadgeIcon className="h-3.5 w-3.5" />
            {badgeLabel}
          </p>
          <h3 className="mt-1 text-sm font-bold text-[#0B0F29]">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => {
            setUrlDraft(typeof value === "string" ? value : "");
            setUrlMode((prev) => !prev);
          }}
          className="shrink-0 text-right text-[11px] font-semibold text-[#0B0F29] transition-colors hover:text-[#B8932A]"
        >
          {urlMode ? "Cancel URL" : "Paste Direct URL"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
          e.target.value = "";
        }}
      />

      {urlMode ? (
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2.5">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://… or /images/logo.png"
            className="min-w-0 flex-1 bg-transparent px-2 py-1 font-mono text-xs text-[#0B0F29] outline-none placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={applyDirectUrl}
            className="rounded-lg bg-[#0B0F29] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-black"
          >
            Apply
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/80 bg-white p-3.5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-1.5">
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={title}
                    className="max-h-full max-w-full object-contain"
                  />
                </>
              ) : (
                <ImageIcon className="h-5 w-5 text-gray-300" />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span
                className={`text-xs font-semibold ${
                  previewUrl ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {value
                  ? typeof value === "string"
                    ? "Uploaded"
                    : value.name
                  : "No image selected"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#0B0F29] transition-colors hover:border-[#D4AF37]"
                >
                  <Upload className="h-3 w-3" />
                  {value ? "Change Image" : "Upload Image"}
                </button>
                {value && (
                  <button
                    type="button"
                    title="Remove image"
                    aria-label="Remove image"
                    onClick={() => onChange(null)}
                    className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-gray-400">{helperText}</p>
    </div>
  );
}

export default function SocialMediaFooterPage() {
  const [data, setData] = useState<FooterData>(EMPTY);
  // The old home page sections, kept in sync on save (their other fields are left as they are)
  const [legacy, setLegacy] = useState<Record<string, Record<string, unknown>>>({});
  // True when nothing is in the global settings yet and the form was filled from the old footer
  const [importedFromLegacy, setImportedFromLegacy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedBadgeId, setDraggedBadgeId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/seo/global").then((r) => r.json()),
      // ?slim=1 leaves out the blog bodies (MBs of images) we don't need here
      fetch("/api/pages/home?slim=1").then((r) => r.json()),
    ])
      .then(([global, home]) => {
        const sections: { type: string; content: Record<string, unknown> }[] =
          home.data?.sections ?? [];
        const sectionContent = (type: string) =>
          sections.find((section) => section.type === type)?.content ?? {};
        setLegacy({
          [LEGACY_FOOTER]: sectionContent(LEGACY_FOOTER),
          [LEGACY_ENQUIRY]: sectionContent(LEGACY_ENQUIRY),
        });

        const footer = global.data?.footer;
        if (footer && typeof footer === "object") {
          setData(fromGlobal(footer, global.data?.socialLinks));
        } else {
          setData(fromLegacy(sectionContent(LEGACY_FOOTER)));
          setImportedFromLegacy(true);
        }
      })
      .catch(() => toast.error("Could not load the footer details"))
      .finally(() => setIsLoading(false));
  }, []);

  const setField =
    (key: TextKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((prev) => ({ ...prev, [key]: e.target.value }));

  const updateBadge = (id: string, patch: Partial<Badge>) =>
    setData((prev) => ({
      ...prev,
      badges: prev.badges.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));

  const reorderBadges = (fromId: string, toId: string, position: "before" | "after") => {
    if (fromId === toId) return;
    setData((prev) => {
      const fromIndex = prev.badges.findIndex((b) => b.id === fromId);
      const toIndex = prev.badges.findIndex((b) => b.id === toId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const reordered = [...prev.badges];
      const [moved] = reordered.splice(fromIndex, 1);
      const targetIndex = reordered.findIndex((b) => b.id === toId);
      reordered.splice(position === "after" ? targetIndex + 1 : targetIndex, 0, moved);
      return { ...prev, badges: reordered };
    });
  };

  const save = async () => {
    if (!data.companyName.trim()) return toast.error("Company name is required");
    if (!data.emailAddress.trim()) return toast.error("Email address is required");
    if (data.badges.some((b) => !b.image))
      return toast.error("Each footer logo needs an image, or remove it");

    setIsSaving(true);
    const toastId = toast.loading("Saving…");
    try {
      const [logo, ...badgeImages] = await Promise.all([
        toUrl(data.logo),
        ...data.badges.map((b) => toUrl(b.image)),
      ]);
      const badges = data.badges.map((b, i) => ({
        image: badgeImages[i],
        alt: b.alt.trim(),
        link: b.link.trim(),
      }));
      const trim = (key: TextKey) => data[key].trim();

      const footer: SiteFooter = {
        logo,
        logoAlt: trim("logoAlt"),
        companyName: trim("companyName"),
        tagline: trim("companyInitials"),
        description: trim("footerDescription"),
        email: trim("emailAddress"),
        phone: trim("phoneNumber"),
        offices: ([1, 2] as const)
          .map((n) => ({ country: trim(`loc${n}Country`), address: trim(`loc${n}Address`) }))
          .filter((office) => office.country || office.address),
        badges,
        wordmark: { left: trim("leftText"), center: trim("centerText"), right: trim("rightText") },
      };
      const socialLinks: SocialLink[] = SOCIALS.map(({ key, platform }) => ({
        platform,
        url: trim(key),
      })).filter((link) => link.url && isSocialPlatform(link.platform));

      // 1. The global settings: the single source for these details
      const res = await fetch("/api/seo/global", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: { footer, socialLinks } }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // 2. Copy into the old home sections the live website still reads
      const legacyFooter = {
        ...legacy[LEGACY_FOOTER],
        ...Object.fromEntries(
          (Object.keys(EMPTY) as (keyof FooterData)[])
            .filter((k) => k !== "badges" && k !== "logo")
            .map((k) => [k, trim(k as TextKey)]),
        ),
        logo,
        badges,
      };
      const legacyEnquiry = {
        ...legacy[LEGACY_ENQUIRY],
        email: footer.email,
        phone: footer.phone,
        address: (footer.offices[0]?.address ?? "").replace(/\s*\n\s*/g, " "),
      };
      await Promise.all([
        putHomeSection(LEGACY_FOOTER, legacyFooter),
        Object.keys(legacy[LEGACY_ENQUIRY] ?? {}).length > 0
          ? putHomeSection(LEGACY_ENQUIRY, legacyEnquiry)
          : Promise.resolve(),
      ]);

      setLegacy({ [LEGACY_FOOTER]: legacyFooter, [LEGACY_ENQUIRY]: legacyEnquiry });
      setImportedFromLegacy(false);
      setData((prev) => ({
        ...prev,
        logo: logo || null,
        badges: prev.badges.map((b, i) => ({
          ...b,
          image: badges[i]?.image || null,
          alt: badges[i]?.alt ?? "",
          link: badges[i]?.link ?? "",
        })),
      }));
      toast.success("Saved", { id: toastId });
    } catch {
      toast.error("Could not save. Please try again.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const activeSocialCount = SOCIALS.filter(({ key }) => data[key].trim().length > 0).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#D4AF37]" />
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Social Media & Footer"
        description="Configure your website branding, footer details, social links, partner badges, and global Let's Talk CTA."
      />

      <div className="flex flex-col gap-6">
        {importedFromLegacy && (
          <p className="rounded-2xl border border-amber-200/70 bg-[#FFFDF4] px-5 py-4 text-sm text-[#8a6d1f]">
            These details were copied from the old Home page footer section. Click{" "}
            <b>Save Changes</b> to store them in the global settings, where the whole website reads
            them from.
          </p>
        )}

        {/* 1. Website Branding & Logos */}
        <SectionCard
          icon={ImageIcon}
          iconBg="bg-teal-50 text-teal-700"
          title="1. Website Branding & Logos"
          description="Configure the logo and brand accessibility details used in the navbar and footer."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <LogoUploadSubCard
              badgeIcon={Compass}
              badgeLabel="Navbar & Footer Logo"
              badgeColor="text-[#B8932A]"
              title="Primary Brand Logo"
              helperText="Displayed in the website navigation bar and footer."
              value={data.logo}
              onChange={(logo) => setData((prev) => ({ ...prev, logo }))}
            />

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-[#FAFAFC] p-5">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-[#B8932A]" />
                  Brand Identity
                </p>
                <h3 className="mt-1 text-sm font-bold text-[#0B0F29]">
                  Logo Alt Text &amp; Tagline
                </h3>
              </div>
              <div className="grid gap-3">
                <InputField
                  label="Logo Description (Alt Text)"
                  value={data.logoAlt}
                  onChange={setField("logoAlt")}
                  placeholder="e.g. The Gold Technologies logo"
                  className="bg-white"
                />
                <InputField
                  label="Short Line Under Name"
                  value={data.companyInitials}
                  onChange={setField("companyInitials")}
                  placeholder="e.g. Operating Worldwide"
                  className="bg-white"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 2. Footer Details & Contact Information */}
        <SectionCard
          icon={FileText}
          iconBg="bg-orange-50 text-orange-600"
          title="2. Footer Details & Contact Information"
          description="Address, phone numbers, email, and brand description appearing in the website footer."
        >
          <div className="flex flex-col gap-5">
            <TextAreaField
              label="Footer Brand Description"
              value={data.footerDescription}
              onChange={setField("footerDescription")}
              rows={2}
              placeholder="e.g. We build digital products that drive real growth."
            />

            <div className="grid gap-4 md:grid-cols-3">
              <InputField
                label="Company Name"
                value={data.companyName}
                onChange={setField("companyName")}
                placeholder="e.g. The Gold Technologies"
                required
              />
              <InputField
                label="Official Contact Number"
                value={data.phoneNumber}
                onChange={setField("phoneNumber")}
                placeholder="e.g. +91 98765 43210"
              />
              <InputField
                label="Official Contact Email"
                type="email"
                value={data.emailAddress}
                onChange={setField("emailAddress")}
                placeholder="e.g. info@thegoldtechnologies.com"
                required
              />
            </div>

            {/* Warm highlight block: Office locations */}
            <div className="rounded-2xl border border-amber-200/70 bg-[#FFFDF4] p-5">
              <div className="mb-4">
                <p className="text-xs font-bold tracking-wider text-[#9A781E] uppercase">
                  Office Locations (Up to Two Offices)
                </p>
                <p className="mt-0.5 text-xs text-[#9A781E]/80">
                  Configure the regional office addresses displayed in the footer columns.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {([1, 2] as const).map((n) => (
                  <div
                    key={n}
                    className="flex flex-col gap-3 rounded-xl border border-amber-100 bg-white/80 p-4"
                  >
                    <p className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                      Office {n}
                    </p>
                    <InputField
                      label="Country / Region"
                      value={data[`loc${n}Country`]}
                      onChange={setField(`loc${n}Country`)}
                      placeholder={n === 1 ? "e.g. India" : "e.g. UAE"}
                    />
                    <TextAreaField
                      label="Full Address"
                      value={data[`loc${n}Address`]}
                      onChange={setField(`loc${n}Address`)}
                      rows={2}
                      placeholder="Street, city, state"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Warm highlight block: Big footer wordmark */}
            <div className="rounded-2xl border border-amber-200/70 bg-[#FFFDF4] p-5">
              <div className="mb-4">
                <p className="text-xs font-bold tracking-wider text-[#9A781E] uppercase">
                  Big Footer Wordmark
                </p>
                <p className="mt-0.5 text-xs text-[#9A781E]/80">
                  The large company name across the bottom of the footer, split into three parts.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <InputField
                  label="Left (Small)"
                  value={data.leftText}
                  onChange={setField("leftText")}
                  placeholder="e.g. THE"
                  className="bg-white"
                />
                <InputField
                  label="Middle (Large)"
                  value={data.centerText}
                  onChange={setField("centerText")}
                  placeholder="e.g. GOLD TECH"
                  className="bg-white"
                />
                <InputField
                  label="Right (Small)"
                  value={data.rightText}
                  onChange={setField("rightText")}
                  placeholder="e.g. NOLOGIES"
                  className="bg-white"
                />
              </div>
              {(data.leftText || data.centerText || data.rightText) && (
                <div className="mt-4 flex flex-wrap items-baseline justify-center gap-2 rounded-xl bg-[#0B0F29] px-6 py-4 text-white">
                  {data.leftText && (
                    <span className="text-xs font-semibold tracking-widest text-gray-300 uppercase">
                      {data.leftText}
                    </span>
                  )}
                  {data.centerText && (
                    <span className="text-2xl font-black tracking-tight text-[#D4AF37] uppercase">
                      {data.centerText}
                    </span>
                  )}
                  {data.rightText && (
                    <span className="text-xs font-semibold tracking-widest text-gray-300 uppercase">
                      {data.rightText}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* 3. Social Media Links */}
        <SectionCard
          icon={Share2}
          iconBg="bg-indigo-50 text-indigo-600"
          title="3. Social Media Links"
          description="Icons shown in the footer. Leave a link empty to hide that icon."
          action={
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 tabular-nums">
              {activeSocialCount} / {SOCIALS.length} active
            </span>
          }
        >
          <div className="-m-6 divide-y divide-gray-100">
            {SOCIALS.map(({ key, label, icon: Icon, placeholder, accent }, index) => {
              const value = data[key];
              const active = value.trim().length > 0;

              return (
                <div
                  key={key}
                  className="grid grid-cols-[28px_1fr_auto] items-center gap-3 px-6 py-4 transition-colors hover:bg-[#FAFAFC] md:grid-cols-[28px_170px_110px_1fr_auto] md:gap-4"
                >
                  <span className="text-sm font-medium text-gray-400 tabular-nums">
                    {index + 1}
                  </span>

                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold text-[#0B0F29]">{label}</span>
                  </div>

                  <div className="hidden justify-center md:flex">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                        active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {active ? "Active" : "Hidden"}
                    </span>
                  </div>

                  <div className="col-span-3 md:col-span-1">
                    <input
                      type="url"
                      value={value}
                      onChange={setField(key)}
                      placeholder={placeholder}
                      aria-label={`${label} URL`}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 font-mono text-xs text-[#0B0F29] transition-all outline-none placeholder:text-gray-400 focus:border-[#D4AF37] focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {active && (
                      <a
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        title={`Open ${label}`}
                        aria-label={`Open ${label}`}
                        className={boxedActionButton}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      title={`Clear ${label}`}
                      aria-label={`Clear ${label}`}
                      disabled={!active}
                      onClick={() => setData((prev) => ({ ...prev, [key]: "" }))}
                      className={`${boxedActionButton} disabled:pointer-events-none disabled:opacity-30`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 4. Footer Logos & Badges */}
        <SectionCard
          icon={Award}
          iconBg="bg-amber-50 text-[#B8932A]"
          title="4. Footer Logos & Badges"
          description="Certificates, partner or award logos shown at the bottom of the footer. Drag rows to reorder."
          action={
            <button
              type="button"
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  badges: [...prev.badges, { id: makeId(), image: null, alt: "", link: "" }],
                }))
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-[#0B0F29] transition-colors hover:border-[#D4AF37]"
            >
              <Plus className="h-3.5 w-3.5" /> Add footer logo
            </button>
          }
        >
          {data.badges.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-[#FAFAFC] px-6 py-10 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 ring-1 ring-gray-100">
                <Award className="h-5 w-5" />
              </span>
              <p className="text-sm font-semibold text-[#0B0F29]">No footer logos yet</p>
              <p className="text-xs text-gray-400">
                Add partner, certificate, or award logos to display in the footer.
              </p>
            </div>
          ) : (
            <div className="-m-6 divide-y divide-gray-100">
              {data.badges.map((badge, index) => {
                const isDragging = draggedBadgeId === badge.id;
                const canDrag = data.badges.length > 1;

                return (
                  <div key={badge.id}>
                    {dropTarget?.id === badge.id && dropTarget.position === "before" && (
                      <div className="pointer-events-none h-0.5 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
                    )}
                    <div
                      draggable={canDrag}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", badge.id);
                        setDraggedBadgeId(badge.id);
                      }}
                      onDragOver={(e) => {
                        if (!draggedBadgeId || draggedBadgeId === badge.id) return;
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const position: "before" | "after" =
                          e.clientY < rect.top + rect.height / 2 ? "before" : "after";
                        setDropTarget((prev) =>
                          prev?.id === badge.id && prev.position === position
                            ? prev
                            : { id: badge.id, position },
                        );
                      }}
                      onDrop={(e) => {
                        if (!draggedBadgeId) return;
                        e.preventDefault();
                        const position =
                          dropTarget?.id === badge.id ? dropTarget.position : "before";
                        const fromId = draggedBadgeId;
                        setDraggedBadgeId(null);
                        setDropTarget(null);
                        reorderBadges(fromId, badge.id, position);
                      }}
                      onDragEnd={() => {
                        setDraggedBadgeId(null);
                        setDropTarget(null);
                      }}
                      className={`group flex flex-col gap-4 px-6 py-5 transition-colors md:flex-row md:items-start ${
                        isDragging ? "bg-amber-50/40 opacity-50" : "hover:bg-[#FAFAFC]"
                      }`}
                    >
                      <div className="flex items-center gap-2 pt-1">
                        <span
                          title={canDrag ? "Drag to reorder" : undefined}
                          className={`text-gray-300 transition-colors ${
                            canDrag
                              ? "cursor-grab opacity-0 group-hover:opacity-100 hover:text-gray-500 active:cursor-grabbing"
                              : "opacity-0"
                          }`}
                        >
                          <GripVertical className="h-4 w-4" />
                        </span>
                        <span className="w-5 text-sm font-medium text-gray-500 tabular-nums">
                          {index + 1}
                        </span>
                      </div>

                      <div className="md:w-80">
                        <LogoUploadSubCard
                          badgeIcon={Award}
                          badgeLabel={`Badge ${index + 1}`}
                          badgeColor="text-[#B8932A]"
                          title={`Footer Logo ${index + 1}`}
                          helperText="Displayed at the bottom of the website footer."
                          value={badge.image}
                          onChange={(image) => updateBadge(badge.id, { image })}
                        />
                      </div>

                      <div className="grid flex-1 gap-3">
                        <InputField
                          label="Name (for screen readers)"
                          value={badge.alt}
                          onChange={(e) => updateBadge(badge.id, { alt: e.target.value })}
                          placeholder="e.g. Women Owned business"
                        />
                        <InputField
                          label="Opens link (optional)"
                          type="url"
                          value={badge.link}
                          onChange={(e) => updateBadge(badge.id, { link: e.target.value })}
                          placeholder="https://…"
                        />
                      </div>

                      <button
                        type="button"
                        title="Remove"
                        aria-label={`Remove logo ${index + 1}`}
                        onClick={() =>
                          setData((prev) => ({
                            ...prev,
                            badges: prev.badges.filter((b) => b.id !== badge.id),
                          }))
                        }
                        className={`${boxedActionButton} self-end text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 md:mt-2 md:self-start`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {dropTarget?.id === badge.id && dropTarget.position === "after" && (
                      <div className="pointer-events-none h-0.5 bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Sticky full-width Save Changes bar */}
        <div className="sticky bottom-4 z-30">
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B0F29] py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(11,15,41,0.22)] transition-all hover:bg-black hover:shadow-[0_10px_28px_rgba(212,175,55,0.3)] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div id="growth-cta" className="scroll-mt-6">
        <GrowthCTA />
      </div>
    </section>
  );
}
