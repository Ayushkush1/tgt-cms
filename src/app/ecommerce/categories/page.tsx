"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { Trash2, Plus, Edit2, X, Check } from "lucide-react";
import { InputField } from "@/app/components/InputField";
import { slugify } from "../../../lib/utils";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ecommerce/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, slug: slugify(name) });
  };

  const handleSave = async (id?: string) => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      const res = await fetch("/api/ecommerce/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(id ? "Category updated" : "Category created");
        setFormData({ name: "", slug: "" });
        setEditingId(null);
        fetchCategories();
      } else {
        toast.error(json.error || "Failed to save category");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone if no products are linked."))
      return;

    try {
      const res = await fetch(`/api/ecommerce/categories?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error(json.error || "Failed to delete category");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, slug: category.slug });
  };

  return (
    <div className="flex flex-col gap-8 mx-auto pb-20">
      <PageHeader
        title="Product Categories"
        description="Organize your products into categories for easier navigation."
      />

      {/* Add New Category */}
      <div className="bg-white rounded-4xl p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">
          Add New Category
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <InputField
            label="Name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Electronics"
          />
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <InputField
                label="Slug (Auto-generated)"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="electronics"
              />
            </div>
            <button
              onClick={() => handleSave()}
              className="px-8 bg-[#0B0F29] text-white font-bold py-4 rounded-full hover:bg-black transition-all hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-4xl p-6 shadow-sm border border-gray-100 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2"
          >
            {editingId === category.id ? (
              <div className="flex-1 grid grid-cols-2 gap-4 mr-6">
                <InputField
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Name"
                />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <InputField
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="Slug"
                    />
                  </div>
                  <button
                    onClick={() => handleSave(category.id)}
                    className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {category.name}
                    </h3>
                    <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-xs font-medium border border-gray-100">
                      /{category.slug}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {category._count?.products || 0} Products associated
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditing(category)}
                    className="p-2.5 text-gray-300 hover:text-[#D4AF37] transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {!isLoading && categories.length === 0 && (
          <div className="text-center py-20 bg-white rounded-4xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-medium">No categories found. Create your first category above.</p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
