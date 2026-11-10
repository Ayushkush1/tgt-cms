"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { Trash2, Plus, Edit2, X, Check } from "lucide-react";
import { InputField } from "@/app/components/InputField";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
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
  const confirmDelete = useConfirmDelete();
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
    } catch {
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
    } catch {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      title: "Delete this category?",
      message: "This category will be permanently removed if no products are linked to it.",
    });
    if (!confirmed) return;

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
    } catch {
      toast.error("Network error");
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, slug: category.slug });
  };

  return (
    <div className="mx-auto flex flex-col gap-8 pb-20">
      <PageHeader
        title="Product Categories"
        description="Organize your products into categories for easier navigation."
      />

      {/* Add New Category */}
      <div className="animate-in fade-in slide-in-from-bottom-2 rounded-4xl border border-gray-100 bg-white p-8 shadow-sm duration-300">
        <h4 className="mb-6 text-sm font-bold tracking-widest text-gray-900 uppercase">
          Add New Category
        </h4>
        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2">
          <InputField
            label="Name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Electronics"
          />
          <div className="flex items-end gap-4">
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
              className="flex items-center gap-2 rounded-full bg-[#0B0F29] px-8 py-4 font-bold text-white transition-all hover:border-[#D4AF37] hover:bg-black hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            >
              <Plus className="h-4 w-4" />
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
            className="animate-in fade-in slide-in-from-bottom-2 flex items-center justify-between rounded-4xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            {editingId === category.id ? (
              <div className="mr-6 grid flex-1 grid-cols-2 gap-4">
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
                    className="rounded-2xl bg-green-50 p-3 text-green-600 transition-colors hover:bg-green-100"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-2xl bg-gray-50 p-3 text-gray-400 transition-colors hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                    <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                      /{category.slug}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-400">
                    {category._count?.products || 0} Products associated
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditing(category)}
                    className="p-2.5 text-gray-300 transition-colors hover:text-[#D4AF37]"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2.5 text-gray-300 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {!isLoading && categories.length === 0 && (
          <div className="rounded-4xl border-2 border-dashed border-gray-100 bg-white py-20 text-center">
            <p className="font-medium text-gray-400">
              No categories found. Create your first category above.
            </p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
        </div>
      )}
    </div>
  );
}
