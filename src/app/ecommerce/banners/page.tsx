"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import {
  Trash2,
  Plus,
  GripVertical,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { ImageUploadField } from "@/app/components/ImageUploadField";
import { InputField } from "@/app/components/InputField";
import toast from "react-hot-toast";

interface Banner {
  id?: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string | File;
  link: string | null;
  order: number;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ecommerce/banners");
      const json = await res.json();
      if (json.success) {
        setBanners(json.data);
      }
    } catch (error) {
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = () => {
    const newBanner: Banner = {
      title: "",
      subtitle: "",
      imageUrl: "",
      link: "",
      order: banners.length,
      isActive: true,
    };
    setBanners([...banners, newBanner]);
  };

  const handleRemoveBanner = async (index: number) => {
    const banner = banners[index];
    if (banner.id) {
      if (!confirm("Are you sure? This will delete the banner immediately."))
        return;
      try {
        const res = await fetch(`/api/ecommerce/banners?id=${banner.id}`, {
          method: "DELETE",
        });
        const json = await res.json();
        if (json.success) {
          toast.success("Banner deleted");
        }
      } catch (error) {
        toast.error("Failed to delete banner");
        return;
      }
    }
    const newBanners = banners.filter((_, i) => i !== index);
    setBanners(newBanners);
  };

  const handleUpdateBanner = (
    index: number,
    field: keyof Banner,
    value: any,
  ) => {
    const newBanners = [...banners];
    newBanners[index] = { ...newBanners[index], [field]: value };
    setBanners(newBanners);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Handle image uploads first
      const updatedBanners = await Promise.all(
        banners.map(async (banner) => {
          if (banner.imageUrl instanceof File) {
            const formData = new FormData();
            formData.append("file", banner.imageUrl);
            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            const uploadJson = await uploadRes.json();
            if (uploadJson.success && uploadJson.files?.[0]) {
              return { ...banner, imageUrl: uploadJson.files[0] };
            } else {
              throw new Error("Failed to upload image");
            }
          }
          return banner;
        }),
      );

      // 2. Save banners with URLs
      const res = await fetch("/api/ecommerce/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: updatedBanners }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Banners saved successfully");
        fetchBanners();
      } else {
        toast.error(json.error || "Failed to save banners");
      }
    } catch (error: any) {
      toast.error(error.message || "Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6  mx-auto pb-20">
      <PageHeader
        title="Banners"
        description="Manage sliding banners and promotional images for your homepage."
        action={{
          label: "Save Changes",
          onClick: handleSave,
        }}
      />

      <div className="flex flex-col gap-4">
        {banners.map((banner, index) => (
          <div
            key={index}
            className="bg-white rounded-4xl p-6 shadow-sm border border-gray-100 flex gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="pt-2 text-gray-300 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-5 h-5" />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <ImageUploadField
                  label="Banner Image"
                  images={banner.imageUrl ? [banner.imageUrl] : []}
                  onImagesChange={(imgs) => {
                    const newImg = imgs[0] || "";
                    handleUpdateBanner(index, "imageUrl", newImg);
                  }}
                  maxImages={1}
                />
              </div>

              <InputField
                label="Title (Optional)"
                value={banner.title || ""}
                onChange={(e) =>
                  handleUpdateBanner(index, "title", e.target.value)
                }
                placeholder="Banner Title"
              />

              <InputField
                label="Subtitle (Optional)"
                value={banner.subtitle || ""}
                onChange={(e) =>
                  handleUpdateBanner(index, "subtitle", e.target.value)
                }
                placeholder="Banner Subtitle"
              />

              <InputField
                label="Redirect Link"
                value={banner.link || ""}
                onChange={(e) =>
                  handleUpdateBanner(index, "link", e.target.value)
                }
                placeholder="/shop/new-arrivals"
              />

              <div className="flex items-center gap-3 pt-6 ml-4">
                <input
                  type="checkbox"
                  checked={banner.isActive}
                  onChange={(e) =>
                    handleUpdateBanner(index, "isActive", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Active
                </label>
              </div>
            </div>

            <button
              onClick={() => handleRemoveBanner(index)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors mt-2"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        <button
          onClick={handleAddBanner}
          className="w-full py-6 border-2 border-dashed border-gray-200 rounded-4xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all uppercase tracking-widest text-xs"
        >
          <Plus className="w-4 h-4" />
          Add New Banner
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
