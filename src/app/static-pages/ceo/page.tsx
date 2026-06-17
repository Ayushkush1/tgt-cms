"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SaveButton } from "@/components/SaveButton";
import toast from "react-hot-toast";
import { uploadFiles } from "@/app/lib/uploadHelpers";
import {
  CeoMessageCMS,
  CeoMessageData,
} from "./components/CeoMessageCMS";
import {
  CeoPhilosophyCMS,
  CeoPhilosophyData,
} from "./components/CeoPhilosophyCMS";
import {
  CeoTimelineCMS,
  CeoTimelineData,
} from "./components/CeoTimelineCMS";

interface PageData {
  message: CeoMessageData;
  philosophy: CeoPhilosophyData;
  timeline: CeoTimelineData;
}

const defaultData: PageData = {
  message: {
    name: "",
    role: "",
    avatar: [],
    yearsLabel: "",
    yearsText: "",
    title: "",
    titleItalic: "",
    paragraphs: ["", ""],
    ctaText: "",
    ctaLink: "",
  },
  philosophy: {
    upperTag: "",
    title: "",
    titleHighlight: "",
    description: "",
    items: [
      { title: "", description: "", icon: "Lightbulb" },
      { title: "", description: "", icon: "Target" },
      { title: "", description: "", icon: "ShieldCheck" },
    ],
  },
  timeline: {
    upperTag: "",
    title: "",
    titleHighlight: "",
    description: "",
    milestones: [],
  },
};

export default function CeoCMSPage() {
  const [formData, setFormData] = useState<PageData>(defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/ceo");
        const json = await res.json();
        if (json.success && json.data) {
          // Merge with default data to handle partial updates or new schema fields
          setFormData({
            ...defaultData,
            ...json.data,
            message: {
              ...defaultData.message,
              ...json.data.message,
              avatar: json.data.message?.avatar ? [json.data.message.avatar] : [],
              paragraphs: json.data.message?.paragraphs || ["", ""],
            },
            philosophy: {
              ...defaultData.philosophy,
              ...json.data.philosophy,
              items: json.data.philosophy?.items || defaultData.philosophy.items,
            },
            timeline: {
              ...defaultData.timeline,
              ...json.data.timeline,
              milestones: json.data.timeline?.milestones || [],
            },
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load CEO content.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData) return;

    setIsSaving(true);
    const tid = toast.loading("Saving CEO page...");
    try {
      // 1. Upload CEO image avatar
      const uploadedUrls = await uploadFiles(formData.message.avatar);
      const validAvatarUrl = uploadedUrls.find((url) => url !== null) || null;

      // 2. Prepare final payload
      const finalPayload = {
        ...formData,
        message: {
          ...formData.message,
          avatar: validAvatarUrl,
        },
      };

      const res = await fetch("/api/ceo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: finalPayload }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Saved successfully!", { id: tid });
        setFormData({
          ...formData,
          message: {
            ...formData.message,
            avatar: validAvatarUrl ? [validAvatarUrl] : [],
          },
        });
      } else {
        toast.error(json.error || "Failed to save.", { id: tid });
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Network error saving CEO page.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <PageHeader
          title="CEO Message & Philosophy Management"
          description="Manage the CEO greeting statement, core philosophies, and journey milestone timeline."
        />
        <div className="mb-2">
          <SaveButton
            onClick={handleSave}
            disabled={isSaving}
            className="w-auto px-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-medium animate-pulse">
          Loading CEO configuration...
        </div>
      ) : (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
          <CeoMessageCMS
            message={formData.message}
            onMessageChange={(message) => setFormData({ ...formData, message })}
          />
          <CeoPhilosophyCMS
            philosophy={formData.philosophy}
            onPhilosophyChange={(philosophy) => setFormData({ ...formData, philosophy })}
          />
          <CeoTimelineCMS
            timeline={formData.timeline}
            onTimelineChange={(timeline) => setFormData({ ...formData, timeline })}
          />
        </div>
      )}
    </div>
  );
}
