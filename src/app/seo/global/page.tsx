"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { SaveButton } from "@/components/SaveButton";
import { ImageUploadField } from "@/components/ImageUploadField";
import { uploadFiles } from "@/app/lib/uploadHelpers";
import toast from "react-hot-toast";
import { Globe, Shield, Activity } from "lucide-react";

interface GlobalConfig {
  siteTitle: string;
  siteDescription: string;
  favicon: (File | string | null)[];
  googleAnalyticsId: string;
  gtmId: string;
  searchConsoleId: string;
  customHeaderScripts: string;
  customFooterScripts: string;
}

const defaultData: GlobalConfig = {
  siteTitle: "",
  siteDescription: "",
  favicon: [],
  googleAnalyticsId: "",
  gtmId: "",
  searchConsoleId: "",
  customHeaderScripts: "",
  customFooterScripts: "",
};

export default function GlobalSEOPage() {
  const [formData, setFormData] = useState<GlobalConfig>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/seo/global");
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data;
          setFormData({
            ...defaultData,
            ...data,
            favicon: data.favicon ? [data.favicon] : [],
            socialLinks: Array.isArray(data.socialLinks)
              ? data.socialLinks
              : [],
          });
        }
      } catch (error) {
        console.error("Error fetching global SEO:", error);
        toast.error("Failed to load SEO settings.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const tid = toast.loading("Saving global SEO settings...");

    try {
      // 1. Upload favicon if it's a file
      const faviconUrls = await uploadFiles(formData.favicon);
      const faviconUrl = faviconUrls[0] || null;

      // 2. Prepare payload
      const payload = {
        ...formData,
        favicon: faviconUrl,
      };

      const res = await fetch("/api/seo/global", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: payload }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Global SEO settings saved!", { id: tid });
      } else {
        const errMsg =
          typeof json.error === "string"
            ? json.error
            : json.error?.message || "Save failed.";
        console.error("Global SEO save error details:", json.error);
        toast.error(errMsg, { id: tid });
      }
    } catch (error) {
      console.error("Error saving global SEO:", error);
      toast.error("Network error.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-pulse text-gray-400 font-medium">
          Loading SEO settings...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <PageHeader
          title="Global SEO & Tracking"
          description="Manage website-wide meta tags, tracking codes, favicon, and social profiles."
        />
        <div className="mb-2">
          <SaveButton
            onClick={handleSave}
            disabled={isSaving}
            className="w-auto px-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Site Info */}
        <div className="flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#0B0F29]">
              General Identity
            </h2>
          </div>

          <InputField
            label="Default Site Title"
            value={formData.siteTitle}
            onChange={(e) =>
              setFormData({ ...formData, siteTitle: e.target.value })
            }
            placeholder="e.g. My Awesome Agency"
            tooltip="The main title of your website. Appears in browser tabs and search results."
          />
          <TextAreaField
            label="Default Site Description"
            value={formData.siteDescription}
            onChange={(e) =>
              setFormData({ ...formData, siteDescription: e.target.value })
            }
            placeholder="A short summary of what your site is about."
            rows={3}
            tooltip="A summary of your website (approx. 150-160 characters). Used by search engines for the result snippet."
          />
          <div className="mt-2">
            <ImageUploadField
              label="Favicon (.ico or .png)"
              images={formData.favicon}
              onImagesChange={(imgs) =>
                setFormData({ ...formData, favicon: imgs })
              }
              maxImages={1}
              tooltip="The small icon shown in browser tabs. Use a .ico file or a 32x32px .png for best results."
            />
          </div>
        </div>

        {/* Tracking & Canonical */}
        <div className="flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#0B0F29]">
              Tracking & Analytics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Google Analytics ID"
              value={formData.googleAnalyticsId}
              onChange={(e) =>
                setFormData({ ...formData, googleAnalyticsId: e.target.value })
              }
              placeholder="e.g. G-XXXXXXX"
              tooltip="Measurement ID (G-XXXXXXX). 
Go to Google Analytics → Admin → Data Streams → select your website → copy the ID starting with G-."
            />
            <InputField
              label="GTM Container ID"
              value={formData.gtmId}
              onChange={(e) =>
                setFormData({ ...formData, gtmId: e.target.value })
              }
              placeholder="e.g. GTM-XXXXXXX"
              tooltip="Container ID (GTM-XXXXXXX). 
Open Google Tag Manager → select workspace → copy the ID at the top starting with GTM-."
            />
          </div>
          <InputField
            label="Search Console Verification ID"
            value={formData.searchConsoleId}
            onChange={(e) =>
              setFormData({ ...formData, searchConsoleId: e.target.value })
            }
            placeholder="Enter the google-site-verification code"
            tooltip={`Copy the verification code from the HTML tag in Google Search Console.
Example tag:
<meta name="google-site-verification" content="XXXXXXXX" />
Paste only XXXXXXXX`}
          />
        </div>

        {/* Custom Scripts */}
        <div className="flex flex-col gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#0B0F29]">
              Custom Code Injection
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextAreaField
              label="Custom Header Scripts (<head>)"
              value={formData.customHeaderScripts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customHeaderScripts: e.target.value,
                })
              }
              placeholder="Paste your scripts to be injected into the head..."
              rows={8}
              className="font-mono text-xs"
            />
            <TextAreaField
              label="Custom Footer Scripts (before </body>)"
              value={formData.customFooterScripts}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customFooterScripts: e.target.value,
                })
              }
              placeholder="Paste your scripts to be injected before the closing body tag..."
              rows={8}
              className="font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
