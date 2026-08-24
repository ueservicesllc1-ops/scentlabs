"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { Search, ChevronLeft, ChevronRight, X, SlidersHorizontal } from "lucide-react";

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name-asc">("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 16;

  const allAvailableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category as string);
      if (p.categoryName) set.add(p.categoryName);
      if (p.subcategory) set.add(p.subcategory);
    });
    return Array.from(set).filter(Boolean);
  }, [products]);

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };

  const normalizeCategory = (str?: string) =>
    (str || "")
      .toLowerCase()
      .replace(/[_\s-]+/g, "")
      .replace(/oils?|supplies|making|products?/g, "");

  const isCategoryMatch = (p: Product, targetCat: string) => {
    const targetNorm = normalizeCategory(targetCat);
    if (!targetNorm) return false;
    const catNorm = normalizeCategory(p.category as string);
    const catNameNorm = normalizeCategory(p.categoryName);
    const subcatNorm = normalizeCategory(p.subcategory);
    
    return (
      (!!catNorm && (catNorm.includes(targetNorm) || targetNorm.includes(catNorm))) ||
      (!!catNameNorm && (catNameNorm.includes(targetNorm) || targetNorm.includes(catNameNorm))) ||
      (!!subcatNorm && (subcatNorm.includes(targetNorm) || targetNorm.includes(subcatNorm)))
    ) || false;
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          !searchQuery.trim() ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.some((c) => isCategoryMatch(p, c));

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return (a.basePrice || 0) - (b.basePrice || 0);
        if (sortBy === "price-desc") return (b.basePrice || 0) - (a.basePrice || 0);
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [products, searchQuery, selectedCategories, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-10">
      
      {/* Shop Layout: 12-Column Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Sidebar Filters */}
        <aside className="md:col-span-3 hidden md:flex flex-col gap-6 border-r border-gray-200 pr-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-900">Categories</span>
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Categories List */}
          <div className="flex flex-col gap-2">
            {(subcategories.length > 0 ? subcategories : allAvailableCategories).map((cat) => {
              const count = products.filter((p) => isCategoryMatch(p, cat)).length;
              const isChecked = selectedCategories.includes(cat);

              return (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer py-1 text-xs text-gray-700 hover:text-gray-950 transition">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat)}
                    className="h-3.5 w-3.5 text-[#2B5F4A] rounded-none border-gray-300 focus:ring-[#2B5F4A] cursor-pointer"
                  />
                  <span className="capitalize flex-1 font-light">
                    {cat}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">({count})</span>
                </label>
              );
            })}
          </div>

          {/* Reset Filters */}
          {selectedCategories.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className="text-[10px] font-semibold uppercase tracking-wider text-[#2B5F4A] underline text-left pt-2"
            >
              Reset Filters
            </button>
          )}
        </aside>

        {/* Right Product Grid Area */}
        <div className="md:col-span-9 flex flex-col gap-6">
          
          {/* Top Sort & Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
            <span className="text-xs text-gray-500 font-medium">
              Showing <strong>{paginatedProducts.length}</strong> of {filteredProducts.length} items
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Search Box */}
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter catalog..."
                  className="w-full text-xs pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[#2B5F4A]"
                />
              </div>

              {/* Sort Select */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 px-3 text-xs border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-[#2B5F4A] cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* 4-Column Product Grid */}
          {loading ? (
            <div className="py-24 text-center text-xs text-gray-400">
              <div className="w-6 h-6 border-2 border-[#2B5F4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading supplies...
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3 bg-gray-50 border border-gray-200 p-8">
              <h3 className="text-base font-semibold text-gray-950">No Products Found</h3>
              <p className="text-xs text-gray-500 font-light">
                No items match your filter criteria. Try resetting your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {paginatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider border border-gray-300 hover:border-gray-900 disabled:opacity-30 transition"
              >
                Previous
              </button>
              <span className="text-[10px] font-mono px-3 text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider border border-gray-300 hover:border-gray-900 disabled:opacity-30 transition"
              >
                Next
              </button>
            </div>
          )}

        </div>

      </section>
    </div>
  );
}
