"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import {
  Trash2,
  Plus,
  Edit2,
  Search,
  Filter,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { InputField } from "@/app/components/InputField";
import { SelectField } from "@/app/components/SelectField";
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
      const [prodJson, catJson] = await Promise.all([
        prodRes.json(),
        catRes.json(),
      ]);

      if (prodJson.success) setProducts(prodJson.data);
      if (catJson.success) setCategories(catJson.data);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

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
    } catch (error) {
      toast.error("Network error");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8  pb-20">
      <PageHeader
        title="Products"
        description="Manage your inventory and product listings."
        action={{
          label: "Add Product",
          onClick: () => router.push("/ecommerce/products/new"),
        }}
      />

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-4xl p-6 shadow-sm border border-gray-100">
        <InputField
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          containerClassName="flex-1 w-full"
        />
        <SelectField
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          icon={<Filter className="w-4 h-4" />}
          options={[
            { value: "all", label: "All Categories" },
            ...categories.map((cat) => ({ value: cat.name, label: cat.name })),
          ]}
          containerClassName="flex-1 w-full md:w-48"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="relative aspect-4/3 bg-gray-50 overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Layers className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-900 uppercase tracking-widest border border-white/20">
                {product.category?.name || "Uncategorized"}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-[#D4AF37] font-bold text-lg mt-1">
                  {product.price
                    ? `$${product.price.toFixed(2)}`
                    : "Price not set"}
                </p>
              </div>

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${product.isActive ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none pt-0.5">
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      router.push(`/ecommerce/products/new?id=${product.id}`)
                    }
                    className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#D4AF37] hover:text-[#0B0F29] transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && filteredProducts.length === 0 && (
        <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-[3rem]">
          <p className="text-gray-400 font-medium italic">
            No products found matching your search.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-40">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
