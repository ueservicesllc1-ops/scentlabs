"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types/product";
import { productService } from "@/lib/firestore/products";
import { PerfumeCard } from "./PerfumeCard";
import { Search, X, Sparkles, SlidersHorizontal, Package, RefreshCw, Compass } from "lucide-react";

function PerfumesCatalogContent() {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get("brand") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryOriginFilter, setCategoryOriginFilter] = useState<"all" | "arabe" | "disenador" | "nicho">("all");
  const [brandFilter, setBrandFilter] = useState(brandParam);
  const [genderFilter, setGenderFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "name">("featured");

  useEffect(() => {
    if (brandParam && brandParam !== "all") {
      setBrandFilter(brandParam);
    }
  }, [brandParam]);

  const loadPerfumes = async () => {
    setLoading(true);
    try {
      const all = await productService.getAllProducts();
      // Filter for finished perfumes
      const perfumes = all.filter(
        (p) =>
          p.productType === "finished_perfume" ||
          p.category === "perfumes" ||
          p.category === "finished_perfumes" ||
          p.categoryName?.toLowerCase() === "perfumes" ||
          p.tags?.includes("perfume")
      );
      setProducts(perfumes);
    } catch (e) {
      console.error("Error loading perfumes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerfumes();
  }, []);

  // Distinct brands list with counts
  const brandStats = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const b = p.brand || p.attributes?.brand;
      if (b) {
        map.set(b, (map.get(b) || 0) + 1);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const q = search.toLowerCase().trim();
        const brand = (p.brand || p.attributes?.brand || "").toLowerCase();
        const name = p.name.toLowerCase();
        const fullName = `${brand} ${name}`;
        const inspiredBy = (p.inspiredBy || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const upc = (p.upc || p.barcode || "").toLowerCase();

        // 1. Search Query Match
        let matchSearch = true;
        if (q) {
          const tokens = q.split(/[\s-_]+/).filter((t) => t.length > 0);
          matchSearch = tokens.every(
            (t) =>
              name.includes(t) ||
              brand.includes(t) ||
              fullName.includes(t) ||
              inspiredBy.includes(t) ||
              sku.includes(t) ||
              upc.includes(t)
          );
        }

        // 2. Category Origin Filter
        const subcat = (p.subcategory || "").toLowerCase();
        const bType = p.brandType;
        let matchOrigin = true;
        if (categoryOriginFilter === "arabe") {
          matchOrigin = subcat.includes("árabe") || subcat.includes("arabe") || subcat.includes("middle eastern") || bType === "arabic";
        } else if (categoryOriginFilter === "disenador") {
          matchOrigin = subcat.includes("diseñador") || subcat.includes("disenador");
        } else if (categoryOriginFilter === "nicho") {
          matchOrigin = subcat.includes("nicho");
        }

        // 3. Brand Filter
        const matchBrand =
          brandFilter === "all" ||
          brand === brandFilter.toLowerCase();

        // 4. Gender Filter
        const gender = (p.attributes?.gender || "").toLowerCase();
        const matchGender =
          genderFilter === "all" ||
          gender === genderFilter.toLowerCase();

        // 5. Stock Filter
        const stock = p.inventory?.quantityInStock || 0;
        const matchStock = stockFilter === "all" || stock > 0;

        return matchSearch && matchOrigin && matchBrand && matchGender && matchStock;
      })
      .sort((a, b) => {
        const priceA = a.basePrice || a.price || 0;
        const priceB = b.basePrice || b.price || 0;
        if (sortBy === "price_asc") return priceA - priceB;
        if (sortBy === "price_desc") return priceB - priceA;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, search, categoryOriginFilter, brandFilter, genderFilter, stockFilter, sortBy]);

  return (
    <div className="bg-white min-h-screen font-sans pb-24">
      
      {/* ── Top Hero / Catalog Header ── */}
      <div className="border-b border-gray-100 bg-[#FAFAF8] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2B5F4A]/10 text-[#2B5F4A]">
                <Sparkles className="w-3 h-3" /> Catálogo de Alta Perfumería & Colección Maestra
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
                Perfumes & Fragancias Terminadas
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Catálogo maestro mayorista: perfumes terminados de las 53 casas más reconocidas (Árabes, Diseñador y Nicho) con perfiles olfativos completos.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">
                Mostrando <strong className="text-gray-900 font-bold">{filteredProducts.length}</strong> de {products.length} perfumes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Origin Categories Tabs ── */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-4 sm:gap-8 text-xs font-bold py-3.5 no-scrollbar">
            <button
              type="button"
              onClick={() => { setCategoryOriginFilter("all"); setBrandFilter("all"); }}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 pb-1 border-b-2 ${
                categoryOriginFilter === "all"
                  ? "border-[#2B5F4A] text-[#2B5F4A]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Todos los Perfumes ({products.length})
            </button>
            <button
              type="button"
              onClick={() => { setCategoryOriginFilter("arabe"); setBrandFilter("all"); }}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 pb-1 border-b-2 ${
                categoryOriginFilter === "arabe"
                  ? "border-[#2B5F4A] text-[#2B5F4A]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              🕌 Perfumería Árabe (Lattafa, Alhambra, Emper, Armaf...)
            </button>
            <button
              type="button"
              onClick={() => { setCategoryOriginFilter("disenador"); setBrandFilter("all"); }}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 pb-1 border-b-2 ${
                categoryOriginFilter === "disenador"
                  ? "border-[#2B5F4A] text-[#2B5F4A]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              ✨ Diseñador (Dior, Chanel, Tom Ford, YSL...)
            </button>
            <button
              type="button"
              onClick={() => { setCategoryOriginFilter("nicho"); setBrandFilter("all"); }}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 pb-1 border-b-2 ${
                categoryOriginFilter === "nicho"
                  ? "border-[#2B5F4A] text-[#2B5F4A]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              💎 Alta Perfumería / Nicho (Creed, Le Labo, Xerjoff, MFK...)
            </button>
          </div>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="sticky top-[57px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, casa o dupe (ej. Stallion 53, Oud Mood, Santal 33)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-gray-200 bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B5F4A] focus:border-transparent transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Select Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Brand Filter */}
              {brandStats.length > 0 && (
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
                >
                  <option value="all">Todas las Marcas ({brandStats.length})</option>
                  {brandStats.map(([b, count]) => (
                    <option key={b} value={b}>{b} ({count})</option>
                  ))}
                </select>
              )}

              {/* Gender Filter */}
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
              >
                <option value="all">Todos los Géneros</option>
                <option value="Unisex">Unisex</option>
                <option value="Men">Men / Caballeros</option>
                <option value="Women">Women / Damas</option>
              </select>

              {/* Stock Filter Toggle */}
              <button
                type="button"
                onClick={() => setStockFilter(stockFilter === "all" ? "in_stock" : "all")}
                className={`text-xs px-3 py-2 rounded-lg border font-medium transition ${
                  stockFilter === "in_stock"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {stockFilter === "in_stock" ? "✓ Solo en Stock" : "Todos (inc. Agotados)"}
              </button>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
              >
                <option value="featured">Destacados</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="name">Nombre: A - Z</option>
              </select>

            </div>

          </div>
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-500">
            <div className="w-8 h-8 rounded-full border-3 border-[#2B5F4A] border-t-transparent animate-spin" />
            <span className="text-xs font-semibold uppercase tracking-wider">Cargando colección de perfumes...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-gray-200 bg-gray-50 rounded-2xl p-8 max-w-lg mx-auto">
            <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No se encontraron perfumes</h3>
            <p className="text-xs text-gray-500 mt-1">
              {search || brandFilter !== "all" || genderFilter !== "all"
                ? "Prueba cambiando los filtros o el término de búsqueda."
                : "Aún no hay perfumes terminados creados en el catálogo."}
            </p>
            {(search || brandFilter !== "all" || genderFilter !== "all" || stockFilter !== "all" || categoryOriginFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryOriginFilter("all");
                  setBrandFilter("all");
                  setGenderFilter("all");
                  setStockFilter("all");
                }}
                className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((perfume) => (
              <PerfumeCard key={perfume.id} product={perfume} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export function PerfumesCatalog() {
  return (
    <Suspense fallback={
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-500">
        <div className="w-8 h-8 rounded-full border-3 border-[#2B5F4A] border-t-transparent animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider">Cargando catálogo...</span>
      </div>
    }>
      <PerfumesCatalogContent />
    </Suspense>
  );
}
