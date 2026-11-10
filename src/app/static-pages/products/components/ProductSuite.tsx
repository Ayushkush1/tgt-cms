"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { StaticSectionCard } from "@/app/components/StaticSectionCard";
import type { ProductItem, ProductPillar, ProductSuiteHeaderData } from "../types";

interface ProductSuiteProps {
  grid: ProductSuiteHeaderData;
  products: ProductItem[];
  onGridChange: (grid: ProductSuiteHeaderData) => void;
  onProductsChange: (products: ProductItem[]) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function ProductSuite({
  grid,
  products,
  onGridChange,
  onProductsChange,
  isSaving,
  onSave,
}: ProductSuiteProps) {
  const confirmDelete = useConfirmDelete();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [expandedPillarKey, setExpandedPillarKey] = useState<string | null>(null);

  const items = Array.isArray(products) ? products : [];

  const setGridField =
    (key: keyof ProductSuiteHeaderData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onGridChange({ ...grid, [key]: e.target.value });

  const addProduct = () => {
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      title: "",
      shortDesc: "",
      link: "",
      imageUrl: "",
      pillars: [{ number: "01", title: "", desc: "" }],
    };
    onProductsChange([newProduct, ...items]);
    setExpandedIdx(0);
  };

  const removeProduct = async (index: number) => {
    const target = items[index];
    const confirmed = await confirmDelete({
      title: target?.title ? `Remove "${target.title}"?` : "Remove this product?",
      message: "This product card and its feature pillars will be removed from the list.",
      warning: "Save the section afterwards to publish this removal to the live website.",
      confirmLabel: "Remove",
    });
    if (!confirmed) return;

    onProductsChange(items.filter((_, i) => i !== index));
    setExpandedIdx((prev) => (prev === index ? null : prev));
  };

  const updateProduct = (
    index: number,
    field: keyof ProductItem,
    value: ProductItem[keyof ProductItem],
  ) => {
    onProductsChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addPillar = (productIndex: number) => {
    const target = items[productIndex];
    const pillars = Array.isArray(target?.pillars) ? target.pillars : [];
    if (pillars.length >= 4) return;
    const nextPillars = [
      ...pillars,
      { number: String(pillars.length + 1).padStart(2, "0"), title: "", desc: "" },
    ];
    updateProduct(productIndex, "pillars", nextPillars);
    setExpandedPillarKey(`${productIndex}-${nextPillars.length - 1}`);
  };

  const removePillar = (productIndex: number, pillarIndex: number) => {
    const target = items[productIndex];
    const nextPillars = (target?.pillars || [])
      .filter((_, i) => i !== pillarIndex)
      .map((p, i) => ({ ...p, number: String(i + 1).padStart(2, "0") }));
    updateProduct(productIndex, "pillars", nextPillars);
    setExpandedPillarKey((prev) => (prev === `${productIndex}-${pillarIndex}` ? null : prev));
  };

  const updatePillar = (
    productIndex: number,
    pillarIndex: number,
    field: keyof ProductPillar,
    value: string,
  ) => {
    const target = items[productIndex];
    const nextPillars = (target?.pillars || []).map((p, i) =>
      i === pillarIndex ? { ...p, [field]: value } : p,
    );
    updateProduct(productIndex, "pillars", nextPillars);
  };

  return (
    <StaticSectionCard
      title="2. The Suite Showcase (ProductsView)"
      description="Section heading, product cards, live demo URLs (or fallback), screenshots, and up to 4 feature pillars each."
      isOpen={isOpen}
      onToggle={() => setIsOpen((v) => !v)}
      isSaving={isSaving}
      onSave={onSave}
    >
      {/* Suite Section Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          Section Header & Labels
        </span>
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
          <InputField
            label="Eyebrow Label"
            value={grid.label || ""}
            onChange={setGridField("label")}
            placeholder="e.g. (The suite)"
          />
          <InputField
            label="Headline Main"
            value={grid.headlineMain || ""}
            onChange={setGridField("headlineMain")}
            placeholder="e.g. Built once,"
          />
          <InputField
            label="Headline Gold Highlight"
            value={grid.headlineHighlight || ""}
            onChange={setGridField("headlineHighlight")}
            placeholder="e.g. fitted to you."
          />
          <InputField
            label="Live Link Label"
            value={grid.liveLabel || ""}
            onChange={setGridField("liveLabel")}
            placeholder="e.g. Open live demo"
          />
          <InputField
            label="Fallback Label (No Link)"
            value={grid.soonLabel || ""}
            onChange={setGridField("soonLabel")}
            placeholder="e.g. Demo on request"
          />
          <TextAreaField
            label="Section Description"
            value={grid.description || ""}
            onChange={setGridField("description")}
            placeholder="e.g. Every product can be branded, extended and integrated..."
            rows={2}
            containerClassName="md:col-span-3"
          />
        </div>
      </div>

      {/* Products List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            Products ({items.length})
          </span>
          <button
            type="button"
            onClick={addProduct}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add product
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center text-sm text-gray-400">
            No products added yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((product, pIndex) => {
              const pillars = Array.isArray(product.pillars) ? product.pillars : [];
              return (
                <CollapsibleCard
                  key={product.id || pIndex}
                  badge={String(pIndex + 1).padStart(2, "0")}
                  title={product.title || `Product ${pIndex + 1}`}
                  subtitle={product.link ? product.link.trim() : "Demo on request"}
                  isOpen={expandedIdx === pIndex}
                  onToggle={() => setExpandedIdx(expandedIdx === pIndex ? null : pIndex)}
                  onRemove={() => removeProduct(pIndex)}
                >
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2">
                      <InputField
                        label="Product Title"
                        value={product.title || ""}
                        onChange={(e) => updateProduct(pIndex, "title", e.target.value)}
                        placeholder="e.g. IP ERP"
                      />
                      <InputField
                        label="Live Demo URL (optional)"
                        value={product.link || ""}
                        onChange={(e) => updateProduct(pIndex, "link", e.target.value)}
                        placeholder="e.g. https://ip-erp.vercel.app/"
                      />
                      <TextAreaField
                        label="Description (Shown in Suite Card & Navbar)"
                        value={product.shortDesc || ""}
                        onChange={(e) => updateProduct(pIndex, "shortDesc", e.target.value)}
                        placeholder="A quick summary of the product and what it solves."
                        containerClassName="md:col-span-2"
                        rows={2}
                      />
                    </div>

                    <ImageUploadField
                      label="Product Presentation Screenshot"
                      images={product.imageUrl ? [product.imageUrl] : []}
                      onImagesChange={(imgs) => updateProduct(pIndex, "imageUrl", imgs[0] || "")}
                      maxImages={1}
                    />

                    {/* Feature Pillars */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                          Feature Pillars ({pillars.length}/4)
                        </span>
                        {pillars.length < 4 && (
                          <button
                            type="button"
                            onClick={() => addPillar(pIndex)}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-[#0B0F29] ring-1 ring-gray-200 hover:bg-gray-100"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add feature
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {pillars.map((pillar, i) => {
                          const key = `${pIndex}-${i}`;
                          return (
                            <CollapsibleCard
                              key={i}
                              badge={pillar.number || String(i + 1).padStart(2, "0")}
                              title={pillar.title || `Feature ${i + 1}`}
                              isOpen={expandedPillarKey === key}
                              onToggle={() =>
                                setExpandedPillarKey(expandedPillarKey === key ? null : key)
                              }
                              onRemove={() => removePillar(pIndex, i)}
                            >
                              <div className="grid grid-cols-1 gap-3">
                                <InputField
                                  label="Feature Title"
                                  value={pillar.title || ""}
                                  onChange={(e) => updatePillar(pIndex, i, "title", e.target.value)}
                                  placeholder="e.g. Automated Billing"
                                />
                                <TextAreaField
                                  label="Feature Description"
                                  value={pillar.desc || ""}
                                  onChange={(e) => updatePillar(pIndex, i, "desc", e.target.value)}
                                  placeholder="Describe this capability..."
                                  rows={2}
                                />
                              </div>
                            </CollapsibleCard>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CollapsibleCard>
              );
            })}
          </div>
        )}
      </div>
    </StaticSectionCard>
  );
}
