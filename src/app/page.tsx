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

        const validProducts = (activeProducts || []).filter(
          (p) => p && p.status === "active" && p.name && p.sku
        );
        const validFragrances = (activeFragrances || []).filter(
          (f) => f && f.status === "active" && f.name
        );

        const cards: TrendingCardItem[] = [];

        // 1. Featured / Best-Selling Physical Products
        // Preferred order: Roll-On Bottle, Custom Labels, Roll-On Box
        const prioritizedIds = [
          "prod_rollon_10ml",
          "prod_custom_labels",
          "prod_box_10ml",
          "prod_atomizer_10ml",
          "prod_shrink_4x6",
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

        // Add top 3 physical products
        for (const prod of sortedProducts.slice(0, 3)) {
          let priceLabel = `From $${prod.basePrice.toFixed(2)}`;

          if (prod.id === "prod_custom_labels") {
            priceLabel = "From $12.50 (50 Labels)";
          } else if (prod.id === "prod_rollon_10ml") {
            priceLabel = "From $5.00 (10 Units)";
          } else if (prod.id === "prod_box_10ml") {
            priceLabel = "From $11.25 (25 Boxes)";
          } else if (prod.packageOptions && prod.packageOptions.length > 0) {
            const firstPkg = prod.packageOptions[0];
            priceLabel = `From $${firstPkg.price.toFixed(2)} (${firstPkg.quantity}u)`;
          }

          let href = `/product/${prod.slug}`;
          if (prod.id === "prod_custom_labels") href = "/custom-labels";

          const imageUrl =
            prod.media && prod.media[0]?.url
              ? prod.media[0].url
              : prod.primaryImageUrl || "";

          cards.push({
            id: prod.id,
            name: prod.name,
            category: (prod.subcategory || prod.category).toUpperCase(),
            price: priceLabel,
            sku: prod.sku,
            href,
            imageUrl: imageUrl || undefined,
            placeholderLabel: prod.category,
          });
        }

        // 2. Featured Fragrance Oil (e.g. Santal 33 Type)
        if (validFragrances.length > 0) {
          const topFragrance = validFragrances[0];
          const activeVariants = (topFragrance.repackagingVariants || []).filter((v) => v.active);
          const firstVariant = activeVariants[0];
          const fragPrice = firstVariant
            ? `From $${firstVariant.retailPrice.toFixed(2)} (${firstVariant.sellingSize} oz)`
            : "From $8.50";

          cards.push({
            id: topFragrance.id,
            name: topFragrance.name,
            category: (topFragrance.scentFamily || "Fragrance Oil").toUpperCase(),
            price: fragPrice,
            sku: firstVariant?.sku || topFragrance.id,
            href: `/fragrance/${topFragrance.slug}`,
            imageUrl: topFragrance.primaryImage || topFragrance.images?.[0] || undefined,
            placeholderLabel: topFragrance.scentFamily || "Fragrance",
          });
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
    <main style={{ background: "white", color: "var(--sl-ink)" }}>

      {/* ━━━━ HERO ━━━━ */}
      <section style={{ position: "relative", minHeight: "88vh", background: "transparent", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
        {/* Background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url('/banner.png?v=1')`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 1,
        }} />
        {/* Bottom gradient to white */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, background: "linear-gradient(to top, white, transparent)", zIndex: 10 }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 20, maxWidth: 1280, margin: "0 auto", padding: "180px 40px 48px", width: "100%" }}>
          <div style={{ maxWidth: 640 }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 16 }}>
              Wholesale Perfume Supplies · EST. 2024
            </p>
            <h1 style={{
              fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 300, color: "#FFFFFF", lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: 20, fontFamily: "var(--font-cormorant), Georgia, serif",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.5)",
            }}>
              Everything You Need<br />
              <em style={{
                fontStyle: "normal", color: "#8FD5B0",
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.5)",
              }}>to Craft Perfumes.</em>
            </h1>
            <p style={{
              fontSize: 14, color: "#FFFFFF", fontWeight: 400, lineHeight: 1.7, maxWidth: 440, marginBottom: 36,
              textShadow: "0 1px 6px rgba(0, 0, 0, 0.55)",
            }}>
              Fragrance oils, bottles, custom labels and packaging for perfume makers, indie brands and formulators.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              <Link href="/fragrance" style={{
                padding: "13px 32px", background: "#2B5F4A", color: "white",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                textDecoration: "none", transition: "background 0.15s",
                display: "inline-block",
                boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
              }}>
                Shop Fragrances
              </Link>
              <Link href="/shop" style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
                textShadow: "0 1px 4px rgba(0, 0, 0, 0.4)",
              }}>
                All Categories <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━ STATS STRIP ━━━━ */}
      <div style={{ borderBottom: "1px solid var(--sl-gray-light)", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ padding: "20px 24px", borderRight: "1px solid var(--sl-gray-light)" }}>
              <p style={{ fontSize: 20, fontWeight: 600, color: "var(--sl-ink)", margin: 0, letterSpacing: "-0.01em" }}>{s.value}</p>
              <p style={{ fontSize: 9, fontWeight: 600, color: "var(--sl-gray-mid)", textTransform: "uppercase", letterSpacing: "0.2em", margin: "4px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ━━━━ CATEGORY TILES ━━━━ */}
      <section style={{ background: "#F6F6F4", padding: "56px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#2B5F4A", marginBottom: 8 }}>Shop by Category</p>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 300, color: "var(--sl-ink)", letterSpacing: "-0.01em", margin: 0 }}>
                Everything a Perfumer Needs
              </h2>
            </div>
            <Link href="/shop" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--sl-gray-mid)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              View All <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="flex flex-col justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-emerald-600 hover:shadow-md transition-all group no-underline min-h-[150px] relative"
              >
                {cat.badge && (
                  <span className="absolute top-3 right-3 text-[8px] font-bold tracking-wider uppercase px-2 py-0.5 bg-[#E8F0EC] text-[#2B5F4A] border border-[#C5DDD3] rounded">
                    {cat.badge}
                  </span>
                )}
                <div>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-800 mb-1.5 leading-snug">{cat.label}</p>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">{cat.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700 mt-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ TRENDING PRODUCTS (DYNAMIC REAL CATALOG ONLY) ━━━━ */}
      <section style={{ padding: "56px 0", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, paddingBottom: 20, borderBottom: "1px solid var(--sl-gray-light)" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#2B5F4A", marginBottom: 8 }}>Curated Selection</p>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 300, color: "var(--sl-ink)", letterSpacing: "-0.01em", margin: 0 }}>Trending Essentials</h2>
            </div>
            <Link href="/shop" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--sl-gray-mid)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              View All <ArrowRight style={{ width: 13, height: 13 }} />
            </Link>
          </div>

          {/* Compact & Balanced Card Grid */}
          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {trendingProducts.map((prod) => (
                <Link
                  key={prod.id}
                  href={prod.href}
                  className="group bg-white border border-gray-200 hover:border-gray-900 rounded-xl p-3 sm:p-4 transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-xs"
                >
                  <div>
                    {/* Compact Image Box */}
                    <div className="w-full h-44 sm:h-52 bg-[#FAFAFA] rounded-lg flex items-center justify-center p-3 overflow-hidden mb-3">
                      {prod.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {prod.placeholderLabel || prod.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      {prod.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-black line-clamp-1 mb-2">
                      {prod.name}
                    </h3>
                  </div>

                  {/* Price and SKU Footer */}
                  <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold text-gray-950">{prod.price}</span>
                    <span className="text-[10px] text-gray-400 font-mono">SKU: {prod.sku}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: "48px 0", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--sl-gray-mid)" }}>
                {loading ? "Loading catalog essentials..." : "No featured products currently active."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ━━━━ CTA BANNER ━━━━ */}
      <section style={{ background: "#0E1A14", padding: "56px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: "#5EAB85", marginBottom: 12 }}>Wholesale Scale · US Logistics</p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 300, color: "white", letterSpacing: "-0.01em", margin: "0 0 10px", fontFamily: "var(--font-cormorant), Georgia, serif" }}>
              Same-Day Dispatch on Commercial Orders
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 300, margin: 0, maxWidth: 500 }}>
              Volume tier discounting in real-time. Direct Shippo API with discounted freight across North America.
            </p>
          </div>
          <Link href="/shop" style={{
            padding: "14px 40px", background: "#2B5F4A", color: "white", textDecoration: "none",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", whiteSpace: "nowrap",
            flexShrink: 0, display: "inline-block",
          }}>
            Browse Full Catalog
          </Link>
        </div>
      </section>

    </main>
  );
}
