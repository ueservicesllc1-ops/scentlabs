"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { productService } from "@/lib/firestore/products";
import { fragranceRepository } from "@/lib/firestore/fragrance";
import { Product } from "@/types/product";
import { FragranceOil } from "@/types/fragrance";

interface TrendingCardItem {
  id: string;
  name: string;
  category: string;
  price: string;
  sku: string;
  href: string;
  imageUrl?: string;
  placeholderLabel?: string;
}

const categories = [
  { label: "Fragrance Oils", desc: "1,600+ Grade-A concentrates", href: "/fragrance", badge: "Most Popular" },
  { label: "Glass Bottles", desc: "Roll-ons, atomizers, droppers", href: "/bottles", badge: null },
  { label: "Custom Labels", desc: "Metallic foil, oil-proof vinyl", href: "/custom-labels", badge: null },
  { label: "Packaging", desc: "Boxes, shrink wrap, seals", href: "/packaging", badge: null },
  { label: "Testing Supplies", desc: "Strips, blotters, pipettes", href: "/testing", badge: null },
  { label: "Perfume Making", desc: "Solvents, bases, kits", href: "/perfume-making", badge: null },
];

const stats = [
  { value: "1,600+", label: "Fragrance References" },
  { value: "Grade-A", label: "Uncut Concentrates" },
  { value: "6 Sizes", label: "Per Fragrance" },
  { value: "Same-Day", label: "US Dispatch" },
];

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState<TrendingCardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrendingEssentials() {
      try {
        const [activeProducts, activeFragrances] = await Promise.all([
          productService.getAllProducts(),
          fragranceRepository.getAllFragrances(),
        ]);

        // Filter only active items that have a valid photo image
        const validProducts = (activeProducts || []).filter((p) => {
          if (!p || p.status !== "active" || !p.name || !p.sku) return false;
          const img = p.primaryImageUrl || (p.media && (p.media as any[])[0]?.url) || (p.images && p.images[0]?.url);
          return !!(img && img.trim().length > 0);
        });

        const validFragrancesWithPhoto = (activeFragrances || []).filter((f) => {
          if (!f || (f as any).status === "draft" || !f.name) return false;
          const img = f.primaryImage || (f.images && f.images[0]) || ((f as any).media && (f as any).media[0]?.url);
          return !!(img && img.trim().length > 0);
        });

        const cards: TrendingCardItem[] = [];

        // 1. Featured / Best-Selling Physical Products with Photos
        const prioritizedIds = [
          "prod_rollon_10ml",
          "prod_custom_labels",
          "prod_box_10ml",
          "prod_atomizer_10ml",
          "prod_shrink_4x6",
          "prod_oud_mood",
          "prod_qaed_al_fursan",
        ];

        const sortedProducts = [...validProducts].sort((a, b) => {
          const aIndex = prioritizedIds.indexOf(a.id);
          const bIndex = prioritizedIds.indexOf(b.id);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });

        // Add physical products (up to 3, or 4 if no fragrance with photo)
        const maxProds = validFragrancesWithPhoto.length > 0 ? 3 : 4;
        for (const prod of sortedProducts.slice(0, maxProds)) {
          let priceLabel = `From $${prod.basePrice.toFixed(2)}`;

          if (prod.id === "prod_custom_labels") {
            priceLabel = "From $12.50 (50 Labels)";
          } else if (prod.id === "prod_rollon_10ml") {
            priceLabel = "From $5.00 (10 Units)";
          } else if (prod.id === "prod_box_10ml") {
            priceLabel = "From $11.25 (25 Boxes)";
          } else if (prod.packageOptions && prod.packageOptions.length > 0) {
            const firstPkg = prod.packageOptions[0];
            priceLabel = `From $${firstPkg.price.toFixed(2)}`;
          }

          let href = `/product/${prod.slug}`;
          if (prod.id === "prod_custom_labels") href = "/custom-labels";

          const imageUrl =
            prod.primaryImageUrl ||
            (prod.media && (prod.media as any[])[0]?.url) ||
            (prod.images && prod.images[0]?.url) ||
            "";

          if (imageUrl) {
            cards.push({
              id: prod.id,
              name: prod.name,
              category: (prod.subcategory || prod.category).toUpperCase(),
              price: priceLabel,
              sku: prod.sku,
              href,
              imageUrl,
              placeholderLabel: prod.category,
            });
          }
        }

        // 2. Featured Fragrance Oil (ONLY IF IT HAS A PHOTO)
        if (validFragrancesWithPhoto.length > 0 && cards.length < 4) {
          const topFragrance = validFragrancesWithPhoto[0];
          const activeVariants = (topFragrance.repackagingVariants || []).filter((v) => v.active);
          const firstVariant = activeVariants[0];
          const fragPrice = firstVariant
            ? `From $${firstVariant.retailPrice.toFixed(2)} (${firstVariant.sellingSize} oz)`
            : "From $8.50";

          const fragImg =
            topFragrance.primaryImage ||
            (topFragrance.images && topFragrance.images[0]) ||
            ((topFragrance as any).media && (topFragrance as any).media[0]?.url);

          if (fragImg) {
            cards.push({
              id: topFragrance.id,
              name: topFragrance.name,
              category: (topFragrance.scentFamily || "Fragrance Oil").toUpperCase(),
              price: fragPrice,
              sku: firstVariant?.sku || topFragrance.id,
              href: `/fragrance/${topFragrance.slug}`,
              imageUrl: fragImg,
              placeholderLabel: topFragrance.scentFamily || "Fragrance",
            });
          }
        }

        setTrendingProducts(cards);
      } catch (err) {
        console.error("Failed to load real trending products from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTrendingEssentials();
  }, []);

  return (
    <main className="bg-white text-[var(--sl-ink)] overflow-x-hidden">

      {/* ━━━━ HERO SECTION ━━━━ */}
      {/* ── 1. MOBILE HERO (< md) ── */}
      <section className="md:hidden pt-6 pb-6 px-4 bg-gradient-to-b from-[#F2F6F4] via-white to-white">
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          {/* Prominent SCENTLABS Official Logo */}
          <div className="mb-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png?v=12"
              alt="SCENTLABS SUPPLY"
              className="h-16 w-auto object-contain mx-auto drop-shadow-sm"
            />
          </div>

          <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#2B5F4A] bg-[#E8F0EC] px-3 py-1 rounded-full inline-block mb-2">
            Wholesale Perfume Compounding
          </span>

          <h1 className="text-2xl font-light text-gray-950 font-serif leading-tight mb-2">
            Todo para Formular Perfumes de Lujo
          </h1>

          <p className="text-xs text-gray-600 max-w-xs mx-auto mb-4 leading-relaxed">
            Esencias puras Grado A, frascos clínicos, cajas y etiquetas personalizadas para emprendedores y marcas.
          </p>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-2.5 w-full mb-5">
            <Link
              href="/fragrance"
              className="bg-[#2B5F4A] hover:bg-[#224b3b] text-white text-[11px] font-bold tracking-wider uppercase py-3 px-3 rounded-lg shadow-md transition text-center no-underline flex items-center justify-center"
            >
              Ver Esencias
            </Link>
            <Link
              href="/kits"
              className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 text-[11px] font-bold tracking-wider uppercase py-3 px-3 rounded-lg shadow-xs transition text-center no-underline flex items-center justify-center"
            >
              Kits $49.99
            </Link>
          </div>

          {/* Showcase Visual Card of the Collection */}
          <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 aspect-[16/10] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/banner.png?v=1"
              alt="Colección SCENTLABS"
              className="w-full h-full object-cover object-[98%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[10px] font-medium">
              <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                1,600+ Concentrados Grado A
              </span>
              <Link href="/shop" className="text-white hover:underline flex items-center gap-1 font-bold">
                Ver Catálogo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. DESKTOP & TABLET HERO (>= md) ── */}
      <section className="hidden md:block relative w-full aspect-[21/9] lg:aspect-[2.32/1] min-h-[480px] max-h-[720px] overflow-hidden">
        {/* Full Landscape Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner.png?v=1"
          alt="SCENTLABS Supply Banner"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Bottom subtle gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 to-transparent z-10 pointer-events-none" />

        {/* Floating Call to Action Bar positioned cleanly below the logo */}
        <div className="absolute bottom-8 lg:bottom-12 left-8 lg:left-16 z-20 max-w-md">
          <p className="text-xs lg:text-sm text-gray-900 font-medium mb-3.5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg border border-white/70 inline-block shadow-sm">
            Fragrance oils, bottles, custom labels & packaging for perfume makers.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/fragrance"
              className="px-6 py-3.5 bg-[#2B5F4A] hover:bg-[#224b3b] text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow-lg transition text-center no-underline"
            >
              Shop Fragrances
            </Link>
            <Link
              href="/shop"
              className="px-6 py-3.5 bg-white/95 hover:bg-white text-gray-900 border border-gray-300 text-xs font-bold tracking-widest uppercase rounded-lg shadow-md transition flex items-center gap-2 text-center no-underline"
            >
              All Categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━━ STATS STRIP ━━━━ */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-200">
          {stats.map((s) => (
            <div key={s.label} className="p-4 sm:p-5">
              <p className="text-lg sm:text-xl font-bold text-gray-900 m-0 tracking-tight">{s.value}</p>
              <p className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1 mb-0">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━ CATEGORY TILES ━━━━ */}
      <section className="bg-[#F6F6F4] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#2B5F4A] mb-1.5 sm:mb-2">Shop by Category</p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-950 tracking-tight m-0">
                Everything a Perfumer Needs
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-[10px] font-bold tracking-wider uppercase text-gray-500 hover:text-black no-underline flex items-center gap-1.5"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="flex flex-col justify-between p-4 sm:p-5 bg-white border border-gray-200 rounded-xl hover:border-emerald-600 hover:shadow-md transition-all group no-underline min-h-[140px] sm:min-h-[150px] relative"
              >
                {cat.badge && (
                  <span className="absolute top-2.5 right-2.5 text-[8px] font-bold tracking-wider uppercase px-1.5 py-0.5 bg-[#E8F0EC] text-[#2B5F4A] border border-[#C5DDD3] rounded">
                    {cat.badge}
                  </span>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-800 mb-1 leading-snug">{cat.label}</p>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">{cat.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700 mt-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ TRENDING PRODUCTS (DYNAMIC REAL CATALOG ONLY) ━━━━ */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-6 sm:mb-8 pb-4 border-b border-gray-200">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#2B5F4A] mb-1.5 sm:mb-2">Curated Selection</p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-gray-950 tracking-tight m-0">Trending Essentials</h2>
            </div>
            <Link
              href="/shop"
              className="text-[10px] font-bold tracking-wider uppercase text-gray-500 hover:text-black no-underline flex items-center gap-1.5"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Compact & Balanced Card Grid for Phones & Tablets */}
          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {trendingProducts.map((prod) => (
                <Link
                  key={prod.id}
                  href={prod.href}
                  className="group bg-white border border-gray-200 hover:border-gray-900 rounded-xl p-3 sm:p-4 transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-xs no-underline"
                >
                  <div>
                    {/* Compact Image Box */}
                    <div className="w-full h-36 sm:h-48 bg-[#FAFAFA] rounded-lg flex items-center justify-center p-2.5 sm:p-3 overflow-hidden mb-2.5 sm:mb-3">
                      {prod.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-2">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {prod.placeholderLabel || prod.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      {prod.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-black line-clamp-1 mb-2">
                      {prod.name}
                    </h3>
                  </div>

                  {/* Price and SKU Footer */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold text-gray-950">{prod.price}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono">SKU: {prod.sku}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-xs text-gray-500">
                {loading ? "Loading catalog essentials..." : "No featured products currently active."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ━━━━ CTA BANNER ━━━━ */}
      <section className="bg-[#0E1A14] py-10 sm:py-14 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-10">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#5EAB85] mb-2">Wholesale Scale · US Logistics</p>
            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight m-0 mb-2 font-serif">
              Same-Day Dispatch on Commercial Orders
            </h2>
            <p className="text-xs sm:text-sm text-white/50 font-light m-0 max-w-lg leading-relaxed">
              Volume tier discounting in real-time. Direct Shippo API with discounted freight across North America.
            </p>
          </div>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#2B5F4A] hover:bg-[#224b3b] text-white text-[11px] font-bold tracking-widest uppercase no-underline shrink-0 text-center transition rounded-md"
          >
            Browse Full Catalog
          </Link>
        </div>
      </section>

    </main>
  );
}
