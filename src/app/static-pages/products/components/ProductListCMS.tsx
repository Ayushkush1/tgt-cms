"use client";
import React, { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical } from "lucide-react";

export interface Pillar {
  number: string;
  title: string;
  desc: string;
}

export interface ProductItem {
  id: string;
  title: string;
  shortDesc: string;
  link: string;
  imageUrl: string | File;
  pillars: Pillar[];
}

export function ProductListCMS({
  products,
  onChange,
}: {
  products: ProductItem[];
  onChange: (products: ProductItem[]) => void;
}) {
  const confirmDelete = useConfirmDelete();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const addProduct = () => {
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      title: "",
      shortDesc: "",
      link: "",
      imageUrl: "",
      pillars: [{ number: "01", title: "", desc: "" }],
    };
    onChange([newProduct, ...products]);
    setExpandedIndex(0);
  };

  const removeProduct = async (index: number) => {
    const target = products[index];
    const confirmed = await confirmDelete({
      title: target?.title ? `Remove “${target.title}”?` : "Remove this product?",
      message: "This product card and its feature pillars will be removed from the list.",
      warning: "Save the Products page afterwards to publish this removal to the live website.",
      confirmLabel: "Remove",
    });
    if (confirmed) {
      const newList = products.filter((_, i) => i !== index);
      onChange(newList);
      if (expandedIndex === index) setExpandedIndex(null);
    }
  };

  const updateProduct = (
    index: number,
    field: keyof ProductItem,
    value: ProductItem[keyof ProductItem],
  ) => {
    const list = [...products];
    list[index] = { ...list[index], [field]: value };
    onChange(list);
  };

  const addPillar = (productIndex: number) => {
    const list = [...products];
    const pillars = [...list[productIndex].pillars];
    if (pillars.length < 4) {
      pillars.push({ number: `0${pillars.length + 1}`, title: "", desc: "" });
      list[productIndex].pillars = pillars;
      onChange(list);
    }
  };

  const removePillar = (productIndex: number, pillarIndex: number) => {
    const list = [...products];
    const newPillars = list[productIndex].pillars.filter((_, i) => i !== pillarIndex);
    // Re-assign numbers
    const updatedNumbers = newPillars.map((p, i) => ({
      ...p,
      number: `0${i + 1}`,
    }));
    list[productIndex].pillars = updatedNumbers;
    onChange(list);
  };

  const updatePillar = (
    productIndex: number,
    pillarIndex: number,
    field: keyof Pillar,
    value: string,
  ) => {
    const list = [...products];
    const newPillars = [...list[productIndex].pillars];
    newPillars[pillarIndex] = { ...newPillars[pillarIndex], [field]: value };
    list[productIndex].pillars = newPillars;
    onChange(list);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <SectionHeader
        title="Products List"
        description="Add and manage multiple products dynamically. These will appear on the Products page and Navbar dropdown."
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        action={{
          label: "Add Product",
          onClick: addProduct,
        }}
      />

      {isOpen && (
        <div className="animate-in fade-in flex flex-col gap-4 pt-4">
          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
              <p className="font-medium text-gray-500">No products added yet.</p>
              <button
                onClick={addProduct}
                className="mt-3 text-sm font-bold text-[#D4AF37] hover:underline"
              >
                + Add your first product
              </button>
            </div>
          ) : (
            products.map((product, pIndex) => {
              const isExpanded = expandedIndex === pIndex;

              return (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                    onClick={() => setExpandedIndex(isExpanded ? null : pIndex)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="cursor-grab text-gray-400 active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-gray-800">
                        {product.title || `Product ${pIndex + 1}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProduct(pIndex);
                        }}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-red-500"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="animate-in slide-in-from-top-2 flex flex-col gap-8 border-t border-gray-100 p-6 duration-300">
                      {/* Product Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="Product Title"
                          value={product.title}
                          onChange={(e) => updateProduct(pIndex, "title", e.target.value)}
                          placeholder="e.g. IP ERP"
                          required
                        />
                        <InputField
                          label="Link / URL"
                          value={product.link}
                          onChange={(e) => updateProduct(pIndex, "link", e.target.value)}
                          placeholder="e.g. /products/ip-erp"
                          required
                        />
                        <TextAreaField
                          label="Short Description (For Navbar)"
                          value={product.shortDesc}
                          onChange={(e) => updateProduct(pIndex, "shortDesc", e.target.value)}
                          placeholder="A quick 1-2 sentence description for the dropdown menu."
                          containerClassName="col-span-2"
                          rows={2}
                          required
                        />
                      </div>

                      <ImageUploadField
                        label="Product Presentation Image"
                        images={product.imageUrl ? [product.imageUrl] : []}
                        onImagesChange={(imgs) => updateProduct(pIndex, "imageUrl", imgs[0] || "")}
                        maxImages={1}
                      />

                      {/* Product Pillars */}
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-gray-800">Product Pillars / Features</h4>
                            <p className="mt-0.5 text-xs text-gray-500">
                              Add up to 4 key features that define this product.
                            </p>
                          </div>
                          {product.pillars.length < 4 && (
                            <button
                              onClick={() => addPillar(pIndex)}
                              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition-all hover:border-[#D4AF37] hover:text-[#D4AF37]"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add Feature
                            </button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {product.pillars.map((pillar, i) => (
                            <div
                              key={i}
                              className="group relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                            >
                              <button
                                onClick={() => removePillar(pIndex, i)}
                                className="absolute top-2 right-2 text-gray-300 transition-colors hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <div className="mb-2 font-mono text-[10px] font-bold text-[#D4AF37] uppercase">
                                Feature {pillar.number}
                              </div>
                              <InputField
                                label="Title"
                                value={pillar.title}
                                onChange={(e) => updatePillar(pIndex, i, "title", e.target.value)}
                                placeholder="e.g. Automated Billing"
                                containerClassName="mb-3"
                              />
                              <TextAreaField
                                label="Description"
                                value={pillar.desc}
                                onChange={(e) => updatePillar(pIndex, i, "desc", e.target.value)}
                                placeholder="Describe this product feature..."
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
