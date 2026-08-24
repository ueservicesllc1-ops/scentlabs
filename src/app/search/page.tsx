"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types/product";
import { productService } from "@/lib/firestore/products";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Search, Package, X } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const all = await productService.getAllProducts();
      setProducts(all);
      setLoading(false);
    };
    load();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => {
        if (p.status !== "active") return false;

        const matchesQuery =
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.sku.toLowerCase().includes(q) ||
          (p.category && (p.category as string).toLowerCase().includes(q)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q));

        const matchesCat =
          selectedCategory === "all" ||
          (p.category && (p.category as string).toLowerCase().includes(selectedCategory.toLowerCase())) ||
          (p.categoryId && p.categoryId.toLowerCase().includes(selectedCategory.toLowerCase()));

        return matchesQuery && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return (a.basePrice || 0) - (b.basePrice || 0);
        if (sortBy === "price-desc") return (b.basePrice || 0) - (a.basePrice || 0);
        return 0;
      });
  }, [products, query, selectedCategory, sortBy]);

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      
      {/* ── Search Header ── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="sl-catalog-header">
          <span className="sl-catalog-eyebrow">Universal Catalog Search</span>
          <h1 className="sl-catalog-title">Search Supplies</h1>
          <p className="sl-catalog-subtitle">
            Find fragrance oils, perfumer&apos;s alcohol, roll-ons, atomizers, transfer pipettes, and custom labels.
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8 space-y-6">
        
        {/* Search Input & Category Filters */}
        <div className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, SKU, or supply type (e.g. santal, 10ml, pipettes)..."
              className="w-full bg-white border border-gray-200 pl-10 pr-10 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A]"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "All" },
              { id: "fragrance", label: "Fragrance Oils" },
              { id: "bottles", label: "Bottles" },
              { id: "perfume-making", label: "Perfume Making" },
              { id: "packaging", label: "Packaging" },
              { id: "testing", label: "Testing" },
              { id: "custom-labels", label: "Custom Labels" },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition border ${
                    isSelected
                      ? "bg-[#2B5F4A] text-white border-[#2B5F4A]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Bar */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-4">
          <span>
            Showing <strong>{results.length}</strong> items {query ? `for "${query}"` : ""}
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs px-2.5 py-1 bg-white border border-gray-200 text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div style={{ paddingTop: 60, paddingBottom: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 18, height: 18, border: "2px solid var(--sl-green)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sl-gray-mid)" }}>Searching catalog…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Package className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-base font-semibold text-gray-950">No Matches Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto font-light">
              We couldn&apos;t find any formulation supplies matching &quot;{query}&quot;.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--sl-gray-light)" }}>
            {results.map((product) => (
              <div key={product.id} style={{ background: "white" }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-xs text-gray-400">
          Loading search...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
