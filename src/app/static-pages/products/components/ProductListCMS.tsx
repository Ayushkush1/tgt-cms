"use client";
import React, { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from "lucide-react";

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
    onChange([...products, newProduct]);
    setExpandedIndex(products.length);
  };

  const removeProduct = (index: number) => {
    if (confirm("Are you sure you want to remove this product?")) {
      const newList = products.filter((_, i) => i !== index);
      onChange(newList);
      if (expandedIndex === index) setExpandedIndex(null);
    }
  };

  const updateProduct = (
    index: number,
    field: keyof ProductItem,
    value: any,
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
    const newPillars = list[productIndex].pillars.filter(
      (_, i) => i !== pillarIndex,
    );
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
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
        <div className="flex flex-col gap-4 pt-4 animate-in fade-in">
          {products.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">
                No products added yet.
              </p>
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
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all"
                >
                  <div
                    className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setExpandedIndex(isExpanded ? null : pIndex)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5" />
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
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-6 border-t border-gray-100 flex flex-col gap-8 animate-in slide-in-from-top-2 duration-300">
                      {/* Product Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="Product Title"
                          value={product.title}
                          onChange={(e) =>
                            updateProduct(pIndex, "title", e.target.value)
                          }
                          placeholder="e.g. IP ERP"
                          required
                        />
                        <InputField
                          label="Link / URL"
                          value={product.link}
                          onChange={(e) =>
                            updateProduct(pIndex, "link", e.target.value)
                          }
                          placeholder="e.g. /products/ip-erp"
                          required
                        />
                        <TextAreaField
                          label="Short Description (For Navbar)"
                          value={product.shortDesc}
                          onChange={(e) =>
                            updateProduct(pIndex, "shortDesc", e.target.value)
                          }
                          placeholder="A quick 1-2 sentence description for the dropdown menu."
                          containerClassName="col-span-2"
                          rows={2}
                          required
                        />
                      </div>

                      <ImageUploadField
                        label="Product Presentation Image"
                        images={product.imageUrl ? [product.imageUrl] : []}
                        onImagesChange={(imgs) =>
                          updateProduct(pIndex, "imageUrl", imgs[0] || "")
                        }
                        maxImages={1}
                      />

                      {/* Product Pillars */}
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="font-bold text-gray-800">
                              Product Pillars / Features
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Add up to 4 key features that define this product.
                            </p>
                          </div>
                          {product.pillars.length < 4 && (
                            <button
                              onClick={() => addPillar(pIndex)}
                              className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#D4AF37] text-gray-700 hover:text-[#D4AF37] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Feature
                            </button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {product.pillars.map((pillar, i) => (
                            <div
                              key={i}
                              className="p-4 bg-white rounded-xl border border-gray-200 relative group shadow-sm"
                            >
                              <button
                                onClick={() => removePillar(pIndex, i)}
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="text-[10px] uppercase font-bold text-[#D4AF37] mb-2 font-mono">
                                Feature {pillar.number}
                              </div>
                              <InputField
                                label="Title"
                                value={pillar.title}
                                onChange={(e) =>
                                  updatePillar(
                                    pIndex,
                                    i,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                containerClassName="mb-3"
                              />
                              <TextAreaField
                                label="Description"
                                value={pillar.desc}
                                onChange={(e) =>
                                  updatePillar(
                                    pIndex,
                                    i,
                                    "desc",
                                    e.target.value,
                                  )
                                }
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
