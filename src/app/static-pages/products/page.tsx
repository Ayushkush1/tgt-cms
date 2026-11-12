"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/PageHeader";
import { GlobalSectionRef } from "@/app/components/GlobalSectionRef";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { uploadFiles } from "@/app/lib/uploadHelpers";
import { ProductHero } from "./components/ProductHero";
import { ProductSuite } from "./components/ProductSuite";
import { createDefaultProductsData, normalizeProductsData, type ProductsPageData } from "./types";

export default function ProductsPage() {
  const [formData, setFormData] = useState<ProductsPageData>(createDefaultProductsData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    fetchWithCache("/api/products")
      .then((json) => {
        if (!active) return;
        if (json?.success && json.data) {
          setFormData(normalizeProductsData(json.data));
        } else {
          setFormData(createDefaultProductsData());
        }
      })
      .catch(() => {
        if (active) toast.error("Failed to load product content.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const tid = toast.loading("Saving products...");
    try {
      const imagesToUpload = [
        formData.hero.imageUrl || "",
        ...formData.products.map((p) => p.imageUrl),
      ];
      const [heroImageUrl, ...uploadedUrls] = await uploadFiles(imagesToUpload);

      const updatedProducts = formData.products.map((p, i) => ({
        ...p,
        link: (p.link || "").trim(),
        imageUrl: uploadedUrls[i] || "",
      }));

      const payload: ProductsPageData = {
        ...formData,
        hero: {
          ...formData.hero,
          imageUrl: heroImageUrl || "",
        },
        products: updatedProducts,
      };

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: payload }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Failed to save.");
      }
      clearCache("/api/products");
      setFormData(payload);
      toast.success("Products saved and published! The Products menu was updated too.", {
        id: tid,
      });
      (json.notes as string[] | undefined)?.forEach((note) =>
        toast.error(note, { duration: 6000 }),
      );
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err instanceof Error ? err.message : "Network error.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-6 pb-16">
      <PageHeader
        title="Products Page Content"
        description="Manage all sections displayed on the live website Products page, in exact website order."
      />

      {isLoading ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center text-sm font-medium text-gray-400 shadow-sm">
          Loading product configurations...
        </div>
      ) : (
        <>
          <ProductHero
            data={formData.hero}
            onChange={(hero) => setFormData((prev) => ({ ...prev, hero }))}
            isSaving={isSaving}
            onSave={handleSave}
          />
          <ProductSuite
            grid={formData.grid}
            products={formData.products}
            onGridChange={(grid) => setFormData((prev) => ({ ...prev, grid }))}
            onProductsChange={(products) => setFormData((prev) => ({ ...prev, products }))}
            isSaving={isSaving}
            onSave={handleSave}
          />
          <GlobalSectionRef
            title="Growth CTA & Brief Modal"
            description="Let's Talk CTA section, office timezone clocks, and project brief modal copy (shared globally across the site)."
          />
        </>
      )}
    </section>
  );
}
