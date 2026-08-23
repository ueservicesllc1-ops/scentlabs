"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types/product";
import { productRepository } from "@/lib/firestore/products";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Search, SlidersHorizontal, ArrowUpDown, Package, X, Sparkles } from "lucide-react";

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
      const all = await productRepository.getAll();
      setProducts(all);
      setLoading(false);
    };
    load();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => {
        // Customer Privacy: Only active public catalog items
        if (p.status !== "active") return false;

        const matchesQuery =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q));

        const matchesCat =
          selectedCategory === "all" ||
          p.category.toLowerCase() === selectedCategory.toLowerCase();

        return matchesQuery && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.basePrice - b.basePrice;
        if (sortBy === "price-desc") return b.basePrice - a.basePrice;
        return 0;
      });
  }, [products, query, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Search Header */}
      <div className="border-b border-lab-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
          <Search className="w-4 h-4" /> UNIVERSAL CATALOG SEARCH
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          Search Products & Formulation Supplies
        </h1>
        <p className="text-xs text-lab-400">
          Instant search across pure fragrance oils, perfumer&apos;s base alcohol, roll-on vials, pipettes, and custom packaging.
        </p>
      </div>

      {/* Search Input & Category Filters */}
      <div className="space-y-4">
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-lab-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, SKU, fragrance notes, or supply type (e.g. santal, 10ml, pipettes)..."
            className="w-full bg-lab-950 border border-lab-800 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-lab-600 focus:outline-none focus:border-amber-500 shadow-inner"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-lab-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "all", label: "All Categories" },
            { id: "fragrance", label: "Fragrance Oils" },
            { id: "bottles", label: "Bottles & Roll-Ons" },
            { id: "packaging", label: "Packaging & Boxes" },
            { id: "testing", label: "Testing Supplies" },
            { id: "custom-labels", label: "Custom Labels" },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? "bg-amber-500 text-lab-950 border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-lab-900/60 text-lab-400 border-lab-800 hover:text-white hover:border-lab-700"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Results Counter & Sort */}
        <div className="flex justify-between items-center text-xs text-lab-400 pt-2">
          <span>
            Found <strong className="text-white">{results.length}</strong> matching supplies
          </span>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-lab-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-lab-950 border border-lab-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-lab-900/40 border border-lab-800 animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="p-16 text-center border border-lab-800 rounded-2xl bg-lab-950/40 space-y-4 max-w-md mx-auto">
          <Package className="w-10 h-10 text-lab-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No Matching Products Found</h3>
          <p className="text-xs text-lab-400">
            We couldn&apos;t find any supplies matching &quot;{query}&quot;. Try checking for spelling or searching broader terms like &quot;amber&quot;, &quot;bottles&quot;, or &quot;pipettes&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedCategory("all");
            }}
            className="px-4 py-2 rounded-lg bg-lab-800 hover:bg-amber-500 hover:text-lab-950 text-white font-bold text-xs uppercase transition"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-lab-400">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mr-3" />
          Initializing universal search...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
