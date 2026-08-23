"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { 
  Search, 
  SlidersHorizontal, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  X 
} from "lucide-react";

interface CategoryPageProps {
  title: string;
  categoryName: string;
  description: string;
  subcategories: string[];
  products: Product[];
  loading?: boolean;
}

export function CategoryPage({
  title,
  categoryName,
  description,
  subcategories,
  products,
  loading = false,
}: CategoryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc">("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSub =
          selectedSubcategory === "All" ||
          (p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase()) ||
          (p.category && (p.category as string).toLowerCase().includes(selectedSubcategory.toLowerCase()));

        return matchesSearch && matchesSub;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return (a.basePrice || 0) - (b.basePrice || 0);
        if (sortBy === "price-desc") return (b.basePrice || 0) - (a.basePrice || 0);
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        return 0;
      });
  }, [products, searchQuery, selectedSubcategory, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedSubcategory("All");
    setSortBy("featured");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-sans text-stone-900">
      
      {/* Category Header */}
      <div className="border-b border-[#eae6df] pb-6 space-y-2">
        <span className="text-[10px] text-amber-800 font-bold uppercase tracking-widest block">
          SCENTLAB CATALOG &bull; {categoryName.toUpperCase()}
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-950 tracking-tight">
          {title}
        </h2>
        <p className="text-xs text-stone-600 max-w-3xl leading-relaxed font-light">
          {description}
        </p>
      </div>

      {/* Control Bar: Subcategories, Search, Sort */}
      <div className="space-y-4">
        {/* Subcategory Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {["All", ...subcategories].map((sub) => {
            const isSelected = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  setSelectedSubcategory(sub);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition uppercase whitespace-nowrap border ${
                  isSelected
                    ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                    : "bg-white text-stone-600 border-[#e5dfd5] hover:border-amber-700 hover:text-stone-900"
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#eae6df] shadow-sm">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search products in this category..."
              className="w-full text-xs pl-10 pr-8 py-2 bg-[#f8f7f4] border border-[#e5e0d8] rounded-full text-stone-800 placeholder:text-stone-400 focus:bg-white focus:border-amber-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Results Count & Sort Dropdown */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 text-xs">
            <span className="text-stone-500 font-medium">
              Showing <strong>{filteredProducts.length}</strong> items
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400 uppercase font-bold hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-3 py-1.5 bg-[#f8f7f4] border border-[#e5e0d8] rounded-full text-stone-800 focus:border-amber-600 focus:outline-none font-medium"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(searchQuery || selectedSubcategory !== "All" || sortBy !== "featured") && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-stone-400 font-semibold uppercase text-[10px]">Active Filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#e5dfd5] text-stone-700 rounded-full">
              Query: &quot;{searchQuery}&quot;
              <button type="button" onClick={() => setSearchQuery("")} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSubcategory !== "All" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#e5dfd5] text-stone-700 rounded-full">
              Category: {selectedSubcategory}
              <button type="button" onClick={() => setSelectedSubcategory("All")} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-[11px] text-amber-800 font-bold uppercase hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-stone-400">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading formulation catalog...
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white border border-[#eae6df] rounded-3xl p-8 shadow-sm">
          <Package className="w-10 h-10 text-stone-400 mx-auto stroke-[1.5]" />
          <h3 className="font-serif text-2xl font-normal text-stone-900">No Products Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto font-light">
            We couldn&apos;t find any formulation supplies matching your current filter selections.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-5 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-800 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#eae6df]">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-xl bg-white border border-[#e5dfd5] text-stone-600 hover:text-stone-900 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold text-stone-700 px-4 font-mono">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 rounded-xl bg-white border border-[#e5dfd5] text-stone-600 hover:text-stone-900 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
