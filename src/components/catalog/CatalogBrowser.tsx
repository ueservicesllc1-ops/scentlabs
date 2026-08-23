"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Tag, Sparkles, X } from "lucide-react";

interface CatalogBrowserProps {
  initialProducts: Product[];
  fixedCategory?: string;
  title?: string;
  subtitle?: string;
}

export type SortOption = "featured" | "newest" | "price_asc" | "price_desc";

export function CatalogBrowser({
  initialProducts,
  fixedCategory,
  title = "Fragrance Production Catalog",
  subtitle = "Fractional bottles, compounding solvents, precision tools, and custom labels for artisan perfumers.",
}: CatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(fixedCategory || "all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  // Available subcategories based on selected category
  const currentCategoryConfig = INITIAL_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === selectedCategory.toLowerCase()
  );
  const availableSubcategories = currentCategoryConfig?.subcategories || [];

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== "all" && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Subcategory filter
      if (selectedSubcategory !== "all" && product.subcategory !== selectedSubcategory) {
        return false;
      }

      // In stock filter
      if (onlyInStock && product.inventory.availableQuantity <= 0) {
        return false;
      }

      // Price filter (starting price)
      const startingPrice = Math.min(...product.packageOptions.map((p) => p.price));
      if (startingPrice > maxPrice) {
        return false;
      }

      // Search query (name, category, subcategory, tags, SKU, ASIN)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        const matchesSubcat = product.subcategory?.toLowerCase().includes(query) || false;
        const matchesTags = product.tags.some((t) => t.toLowerCase().includes(query));
        const matchesAsin = product.asin?.toLowerCase().includes(query) || false;

        if (!matchesName && !matchesSku && !matchesCat && !matchesSubcat && !matchesTags && !matchesAsin) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "featured") {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const minA = Math.min(...a.packageOptions.map((p) => p.price));
      const minB = Math.min(...b.packageOptions.map((p) => p.price));
      if (sortBy === "price_asc") {
        return minA - minB;
      }
      if (sortBy === "price_desc") {
        return minB - minA;
      }
      return 0;
    });
  }, [initialProducts, selectedCategory, selectedSubcategory, maxPrice, sortBy, onlyInStock, searchQuery]);

  const resetFilters = () => {
    if (!fixedCategory) setSelectedCategory("all");
    setSelectedSubcategory("all");
    setMaxPrice(100);
    setSearchQuery("");
    setOnlyInStock(false);
    setSortBy("featured");
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header */}
      <div className="border-b border-lab-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest mb-1 font-bold">
            <Sparkles className="w-3.5 h-3.5" /> SPECIMEN CATALOG & SUPPLIES
          </div>
          <h1 className="text-3xl font-black text-white uppercase">{title}</h1>
          <p className="text-xs text-lab-400 max-w-2xl mt-1 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="text-xs text-lab-400 bg-lab-900/60 border border-lab-800 px-3 py-1.5 rounded-lg">
          Showing <strong className="text-white">{filteredProducts.length}</strong> of {initialProducts.length} Products
        </div>
      </div>

      {/* Search Bar & Primary Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-lab-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, SKU, ASIN, tag, or material..."
            className="w-full bg-lab-950 border border-lab-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-lab-500 focus:outline-none focus:border-amber-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-lab-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="md:col-span-3">
          <div className="relative">
            <ArrowUpDown className="w-3.5 h-3.5 text-lab-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-lab-950 border border-lab-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-amber-500"
            >
              <option value="featured">Sort: Featured First</option>
              <option value="newest">Sort: Newest Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* In-Stock Toggle */}
        <div className="md:col-span-3 flex items-center justify-start md:justify-end">
          <label className="flex items-center gap-2 text-xs text-lab-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded border-lab-700 bg-lab-900 text-amber-500 focus:ring-0"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Category Pills (if not on fixed category page) */}
      {!fixedCategory && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedSubcategory("all");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex-shrink-0 border ${
              selectedCategory === "all"
                ? "bg-amber-500 text-lab-950 border-amber-400"
                : "bg-lab-900/80 text-lab-300 border-lab-800 hover:border-lab-700 hover:text-white"
            }`}
          >
            All Categories ({initialProducts.length})
          </button>
          {INITIAL_CATEGORIES.map((cat) => {
            const count = initialProducts.filter((p) => p.category.toLowerCase() === cat.slug.toLowerCase()).length;
            const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setSelectedSubcategory("all");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex-shrink-0 border ${
                  isSelected
                    ? "bg-amber-500 text-lab-950 border-amber-400"
                    : "bg-lab-900/80 text-lab-300 border-lab-800 hover:border-lab-700 hover:text-white"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Subcategory Pills */}
      {availableSubcategories.length > 0 && (
        <div className="p-3 rounded-xl border border-lab-800 bg-lab-950/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-lab-500 uppercase font-bold flex-shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Subcategory:
          </span>
          <button
            onClick={() => setSelectedSubcategory("all")}
            className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition flex-shrink-0 ${
              selectedSubcategory === "all"
                ? "bg-lab-700 text-white"
                : "text-lab-400 hover:text-white"
            }`}
          >
            All Subcategories
          </button>
          {availableSubcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition flex-shrink-0 ${
                selectedSubcategory === sub
                  ? "bg-amber-500 text-lab-950"
                  : "bg-lab-900 text-lab-300 hover:text-white border border-lab-800"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 px-4 text-center rounded-xl border border-lab-800 bg-lab-950/40 space-y-3 max-w-md mx-auto">
          <h3 className="text-sm font-bold text-white uppercase">No Matching Products</h3>
          <p className="text-xs text-lab-400 leading-relaxed">
            No items matched your current filter criteria. Try clearing search keywords or subcategory filters.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-4 py-2 text-xs font-bold uppercase bg-lab-800 text-white hover:bg-lab-700 rounded transition border border-lab-700"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
