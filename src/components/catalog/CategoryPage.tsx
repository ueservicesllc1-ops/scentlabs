"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
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
          (p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());

        return matchesSearch && matchesSub;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.basePrice - b.basePrice;
        if (sortBy === "price-desc") return b.basePrice - a.basePrice;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Category Hero */}
      <div className="border-b border-lab-800 pb-6 space-y-2">
        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
          SCENTLAB CATALOG / {categoryName.toUpperCase()}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-lab-400 max-w-3xl leading-relaxed">
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
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                  isSelected
                    ? "bg-amber-500 text-lab-950 border-amber-400 shadow-md shadow-amber-500/20"
                    : "bg-lab-900/60 text-lab-400 border-lab-800 hover:text-white hover:border-lab-700"
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-lab-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search in ${categoryName}...`}
              className="w-full bg-lab-950 border border-lab-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-lab-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-lab-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-lab-950 border border-lab-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid or Loading/Empty States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-lab-900/40 border border-lab-800 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center border border-lab-800 rounded-2xl bg-lab-950/40 space-y-4 max-w-md mx-auto">
          <Package className="w-10 h-10 text-lab-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No Products Match Your Filters</h3>
          <p className="text-xs text-lab-400">
            Try adjusting your search terms or clearing your selected filters.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-lg bg-lab-800 hover:bg-amber-500 hover:text-lab-950 text-white font-bold text-xs uppercase transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center border-t border-lab-800 pt-6 text-xs text-lab-400">
              <span>Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} items</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-lg border border-lab-800 bg-lab-950 disabled:opacity-30 hover:border-lab-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-white px-2">Page {currentPage} of {totalPages}</span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-lg border border-lab-800 bg-lab-950 disabled:opacity-30 hover:border-lab-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
