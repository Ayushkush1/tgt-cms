"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProductHeroCMS, ProductHeroData } from "./components/ProductHeroCMS";
import { ProductListCMS, ProductItem } from "./components/ProductListCMS";
import { SaveButton } from "@/components/SaveButton";
import toast from "react-hot-toast";

interface PageData {
  hero: ProductHeroData;
  products: ProductItem[];
}

const defaultData: PageData = {
  hero: {
    label: "",
    headingLine: "",
    paragraphs: ["", ""],
    ctaText: "",
    ctaHref: "",
    statSince: "",
    statProjects: "",
  },
  products: [],
};

export default function ProductsPage() {
  const [formData, setFormData] = useState<PageData>(defaultData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.success && json.data) {
          setFormData(json.data);
        } else {
          setFormData(defaultData);
        }
      } catch (err) {
        toast.error("Failed to load product content.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    const errs: string[] = [];
    if (!formData.hero.headingLine.trim())
      errs.push("Primary Hero Heading Line is required");

    formData.products.forEach((prod, i) => {
      if (!prod.title.trim()) errs.push(`Product ${i + 1} Title is required`);
      if (!prod.link.trim())
        errs.push(`Product "${prod.title || i + 1}" Link is required`);
    });

    if (errs.length > 0) {
      errs.forEach((e) => toast.error(e));
      return;
    }

    setIsSaving(true);
    const tid = toast.loading("Saving products...");
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: formData }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Saved successfully!", { id: tid });
      } else {
        toast.error("Failed to save.", { id: tid });
      }
    } catch (err) {
      toast.error("Network error.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-end">
        <PageHeader
          title="Products Content Management"
          description="Manage the top-level hero wrapper and define dynamically scaled products for the dropdown & features."
        />
        <div className="mb-2">
          <SaveButton
            onClick={handleSave}
            disabled={isSaving}
            className="w-auto px-10 "
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400 font-medium animate-pulse">
          Loading product configurations...
        </div>
      ) : (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
          <ProductHeroCMS
            data={formData.hero}
            onChange={(hero) => setFormData({ ...formData, hero })}
          />
          <ProductListCMS
            products={formData.products}
            onChange={(products) => setFormData({ ...formData, products })}
          />
        </div>
      )}
    </div>
  );
}
