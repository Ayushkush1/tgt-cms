"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { Trash2, Edit2, Search, Filter, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { InputField } from "@/app/components/InputField";
import { SelectField } from "@/app/components/SelectField";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import toast from "react-hot-toast";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number | null;
  images: string[];
  isActive: boolean;
  category: {
    name: string;
  } | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const confirmDelete = useConfirmDelete();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/ecommerce/products"),
        fetch("/api/ecommerce/categories"),
      ]);
      const [prodJson, catJson] = await Promise.all([prodRes.json(), catRes.json()]);

      if (prodJson.success) setProducts(prodJson.data);
      if (catJson.success) setCategories(catJson.data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDelete({
      title: "Delete this product?",
      message:
        "This product and its storefront listing will be permanently removed from your catalog.",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/ecommerce/products?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Product deleted");
        fetchData();
      } else {
        toast.error(json.error || "Failed to delete product");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8 pb-20">
      <PageHeader
        title="Products"
        description="Manage your inventory and product listings."
        action={{
          label: "Add Product",
          onClick: () => router.push("/ecommerce/products/new"),
        }}
      />

      {/* Filters & Search */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-4xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row">
        <InputField
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-4 w-4" />}
          containerClassName="flex-1 w-full"
        />
        <SelectField
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          icon={<Filter className="h-4 w-4" />}
          options={[
            { value: "all", label: "All Categories" },
            ...categories.map((cat) => ({ value: cat.name, label: cat.name })),
          ]}
          containerClassName="flex-1 w-full md:w-48"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group animate-in fade-in slide-in-from-bottom-2 flex flex-col overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/5"
          >
            <div className="relative aspect-4/3 overflow-hidden bg-gray-50">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <Layers className="h-12 w-12" />
                </div>
              )}
              <div className="absolute top-4 right-4 rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-[10px] font-bold tracking-widest text-gray-900 uppercase backdrop-blur-md">
                {product.category?.name || "Uncategorized"}
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <h3 className="line-clamp-1 text-lg font-bold text-gray-900">{product.title}</h3>
                <p className="mt-1 text-lg font-bold text-[#D4AF37]">
                  {product.price ? `$${product.price.toFixed(2)}` : "Price not set"}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-6">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${product.isActive ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  <span className="pt-0.5 text-[11px] leading-none font-bold tracking-widest text-gray-400 uppercase">
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/ecommerce/products/new?id=${product.id}`)}
                    className="rounded-xl bg-gray-50 p-2.5 text-gray-400 transition-all hover:bg-[#D4AF37] hover:text-[#0B0F29]"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="rounded-xl bg-gray-50 p-2.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && filteredProducts.length === 0 && (
        <div className="rounded-[3rem] border-2 border-dashed border-gray-100 py-40 text-center">
          <p className="font-medium text-gray-400 italic">
            No products found matching your search.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
        </div>
      )}
    </div>
  );
}
