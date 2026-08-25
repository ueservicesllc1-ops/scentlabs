"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { Search, X } from "lucide-react";

interface CatalogBrowserProps {
  initialProducts: Product[];
  fixedCategory?: string;
  title?: string;
  subtitle?: string;
}

export type SortOption = "featured" | "newest" | "price_asc" | "price_desc";

import { useEffect } from "react";
import { productService } from "@/lib/firestore/products";

export function CatalogBrowser({
  initialProducts,
  fixedCategory,
  title = "Fragrance Formulation Catalog",
  subtitle = "Glass bottles, compounding solvents, precision tools, and custom labels for artisan perfumers.",
}: CatalogBrowserProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(fixedCategory || "all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  useEffect(() => {
    productService.getAdminProducts().then((all) => {
      if (all && all.length > 0) {
        // Merge with initial products
        const map = new Map<string, Product>();
        initialProducts.forEach((p) => map.set(p.id, p));
        all.forEach((p) => map.set(p.id, { ...map.get(p.id), ...p }));
        setProducts(Array.from(map.values()));
      }
    }).catch(() => {});
  }, [initialProducts]);

  // Available subcategories based on selected category
  const currentCategoryConfig = INITIAL_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === selectedCategory.toLowerCase()
  );
  const availableSubcategories = currentCategoryConfig?.subcategories || [];

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Exclude hidden / draft / archived products
      if (product.status && product.status !== "active") {
        return false;
      }
      // Category filter
      if (selectedCategory !== "all" && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Subcategory filter — clean exact match (case-insensitive)
      if (selectedSubcategory !== "all") {
        const subClean = selectedSubcategory.toLowerCase().trim();
        const prodSub = (product.subcategory || "").toLowerCase().trim();
        if (prodSub !== subClean) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        const matchesSubcat = product.subcategory?.toLowerCase().includes(query) || false;
        const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(query)) || false;

        if (!matchesName && !matchesSku && !matchesCat && !matchesSubcat && !matchesTags) {
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
      const minA = a.basePrice || (a.packageOptions?.length ? Math.min(...a.packageOptions.map((p) => p.price)) : 0);
      const minB = b.basePrice || (b.packageOptions?.length ? Math.min(...b.packageOptions.map((p) => p.price)) : 0);
      if (sortBy === "price_asc") {
        return minA - minB;
      }
      if (sortBy === "price_desc") {
        return minB - minA;
      }
      return 0;
    });
  }, [initialProducts, selectedCategory, selectedSubcategory, sortBy, searchQuery]);

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      
      {/* ── Page Header ── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="sl-catalog-header">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <span className="sl-catalog-eyebrow">Precision Formulation Enclosures</span>
              <h1 className="sl-catalog-title">{title}</h1>
              <p className="sl-catalog-subtitle">{subtitle}</p>
            </div>

            {/* Search */}
            <div style={{ position: "relative", width: "100%", maxWidth: 280 }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#8A8A8A" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bottles, atomizers..."
                style={{
                  width: "100%",
                  fontSize: 12,
                  paddingLeft: 36,
                  paddingRight: searchQuery ? 32 : 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  border: "1px solid var(--sl-gray-light)",
                  background: "white",
                  color: "var(--sl-ink)",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--sl-green)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--sl-gray-light)")}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#8A8A8A", background: "none", border: "none", cursor: "pointer" }}>
                  <X style={{ width: 13, height: 13 }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Subcategories Filter Bar ── */}
      {availableSubcategories.length > 0 && (
        <div className="sl-filter-bar" style={{ top: 48 }}>
          <div style={{ display: "flex", alignItems: "center", paddingLeft: 40, paddingRight: 40, gap: 0, flex: 1 }}>
            {["all", ...availableSubcategories].map((sub) => (
              <button
                key={sub}
                type="button"
                className={`sl-filter-pill ${selectedSubcategory === sub ? "active" : ""}`}
                onClick={() => setSelectedSubcategory(sub)}
              >
                {sub === "all" ? "TODOS" : sub.toUpperCase()}
              </button>
            ))}

            <div style={{ flex: 1 }} />

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                border: "none",
                background: "transparent",
                color: "var(--sl-gray-mid)",
                cursor: "pointer",
                padding: "14px 8px",
                outline: "none"
              }}
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* ── Products Grid ── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <h3 className="text-base font-semibold text-gray-950">No Products Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto font-light">
              We couldn&apos;t find any items matching your current search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
