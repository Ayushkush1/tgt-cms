"use client";

import { useState, useEffect, Suspense } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import {
  ChevronLeft,
  Save,
  Globe,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Type,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageUploadField } from "@/app/components/ImageUploadField";
import { InputField } from "@/app/components/InputField";
import { SelectField } from "@/app/components/SelectField";
import { slugify } from "../../../../lib/utils";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

function ProductEditorInternal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(!!productId);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    slug: "",
    shortDesc: "",
    description: "",
    price: "",
    images: [] as (string | File)[],
    categoryId: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch("/api/ecommerce/categories");
        const catJson = await catRes.json();
        if (catJson.success) setCategories(catJson.data);

        if (productId) {
          const prodRes = await fetch(
            `/api/ecommerce/products?id=${productId}`,
          );
          const prodJson = await prodRes.json();

          const product = Array.isArray(prodJson.data)
            ? prodJson.data.find((p: any) => p.id === productId)
            : prodJson.data;

          if (product) {
            setFormData({
              id: product.id,
              title: product.title,
              slug: product.slug,
              shortDesc: product.shortDesc || "",
              description: product.description || "",
              price: product.price?.toString() || "",
              images: product.images || [],
              categoryId: product.categoryId || "",
              isActive: product.isActive,
            });
          }
        }
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: productId ? prev.slug : slugify(title),
    }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast.error("Title and slug are required");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Handle image uploads
      const uploadedImageUrls = await Promise.all(
        formData.images.map(async (img) => {
          if (img instanceof File) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", img);
            const res = await fetch("/api/upload", {
              method: "POST",
              body: uploadFormData,
            });
            const json = await res.json();
            if (json.success && json.files?.[0]) {
              return json.files[0];
            }
            throw new Error("Failed to upload image");
          }
          return img; // Already a URL
        }),
      );

      // 2. Save product data
      const res = await fetch("/api/ecommerce/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, images: uploadedImageUrls }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(productId ? "Product updated" : "Product created");
        router.push("/ecommerce/products");
      } else {
        toast.error(json.error || "Failed to save product");
      }
    } catch (error: any) {
      toast.error(error.message || "Network error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 mx-auto pb-20 max-w-5xl">
      <div
        className="flex items-center gap-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer w-fit"
        onClick={() => router.back()}
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="font-bold text-xs uppercase tracking-widest">
          Back to Products
        </span>
      </div>

      <PageHeader
        title={productId ? "Edit Product" : "New Product"}
        description="Fill in the details below to publish a new product to your store."
        action={{
          label: isSaving ? "Saving..." : "Save Product",
          onClick: handleSave,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                <Type className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                General Information
              </h3>
            </div>

            <InputField
              label="Product Title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Premium Silk Scarf"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="URL Slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: slugify(e.target.value) })
                }
                placeholder="premium-silk-scarf"
                icon={<Globe className="w-4 h-4" />}
              />
              <InputField
                label="Price (USD)"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                icon={<DollarSign className="w-4 h-4" />}
              />
            </div>

            <InputField
              label="Short Description"
              value={formData.shortDesc}
              onChange={(e) =>
                setFormData({ ...formData, shortDesc: e.target.value })
              }
              placeholder="A brief summary for listings..."
            />

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">
                Detailed Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-6 bg-gray-50 border-none rounded-3xl text-sm focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all min-h-[200px]"
                placeholder="Full product details, materials, care instructions..."
              />
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Product Images
              </h3>
            </div>

            <ImageUploadField
              label="Upload Multiple Images"
              images={formData.images as (string | File)[]}
              onImagesChange={(imgs) =>
                setFormData({ ...formData, images: imgs as (string | File)[] })
              }
              maxImages={10}
            />
            <p className="text-gray-400 text-xs italic ml-4">
              The first image will be used as the featured preview.
            </p>
          </section>
        </div>

        {/* Right Column: Settings & Meta */}
        <div className="space-y-8">
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400">
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Classification
              </h3>
            </div>

            <SelectField
              label="Category"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              options={[
                { value: "", label: "Select Category" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
            />

            <div className="pt-6 border-t border-gray-50">
              <div className="flex items-center justify-between px-4">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                  Published
                </span>
                <button
                  onClick={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.isActive ? "bg-green-500" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 px-4">
                If unpublished, this product will not be visible to customers.
              </p>
            </div>
          </section>

          <section className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              Pro Tip
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              Use high-quality images with transparent backgrounds or consistent
              lighting to make your products stand out and feel more premium.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ProductEditorPage() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <ProductEditorInternal />
    </Suspense>
  );
}
