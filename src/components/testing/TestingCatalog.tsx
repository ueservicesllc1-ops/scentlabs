"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TestingProduct, SampleKitBundleFoundation } from "@/types/testing";
import { testingRepository } from "@/lib/firestore/testing";
import { TestingProductCard } from "./TestingProductCard";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { 
  FlaskConical, 
  Search, 
  Sparkles, 
  Package, 
  Layers, 
  ShoppingBag, 
  Check, 
  ArrowRight,
  X 
} from "lucide-react";

const SUBCATEGORIES = [
  "All",
  "Blotter Strips",
  "Sample Bottles",
  "Atomizers",
  "Testing Kits",
];

export function TestingCatalog() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<TestingProduct[]>([]);
  const [kits, setKits] = useState<SampleKitBundleFoundation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedKitId, setAddedKitId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const prods = await testingRepository.getAllTestingProducts();
      setProducts(prods);
      const kt = await testingRepository.getTestingKits();
      setKits(kt);
      setLoading(false);
    };
    load();
  }, []);

  const handleAddKit = (kit: SampleKitBundleFoundation) => {
    const kitProxy: any = {
      id: kit.id,
      name: kit.name,
      slug: kit.slug,
      category: "testing",
      sku: "TEST-KIT-STARTER",
      basePrice: kit.bundlePrice || 8.50,
      media: [{ url: "/images/products/testing-kit.jpg", type: "image", isPrimary: true, altText: kit.name }],
      packageOptions: [
        { id: `pkg_${kit.id}`, quantity: 1, price: kit.bundlePrice || 8.50, unitPrice: kit.bundlePrice || 8.50 },
      ],
      pricingTiers: [],
    };

    const pkg = { id: `pkg_${kit.id}`, quantity: 1, price: kit.bundlePrice || 8.50, unitPrice: kit.bundlePrice || 8.50 };
    addItem(kitProxy, pkg, 1);
    setAddedKitId(kit.id);
    setTimeout(() => setAddedKitId(null), 2000);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sampleSize && p.sampleSize.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSub = selectedSubcategory === "All" || p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
    return matchesSearch && matchesSub;
  });

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      
      {/* ── Page Header ── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="sl-catalog-header">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <span className="sl-catalog-eyebrow">Olfactory Evaluation · Lab Supplies</span>
              <h1 className="sl-catalog-title">Testing & Sample Supplies</h1>
              <p className="sl-catalog-subtitle">
                Lint-free blotter strips, amber sample vials, atomizers, and discovery starter kits.
              </p>
            </div>

            {/* Search */}
            <div style={{ position: "relative", width: "100%", maxWidth: 280 }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#8A8A8A" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search testing supplies…"
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

      {/* ── Sticky Filter Bar ── */}
      <div className="sl-filter-bar" style={{ top: 48 }}>
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 40, paddingRight: 40, gap: 0 }}>
          {SUBCATEGORIES.map((sub) => (
            <button
              key={sub}
              type="button"
              className={`sl-filter-pill ${selectedSubcategory === sub ? "active" : ""}`}
              onClick={() => setSelectedSubcategory(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8 space-y-8">
        
        {/* Testing Kit Starter Feature Banner */}
        {kits.length > 0 && (selectedSubcategory === "All" || selectedSubcategory === "Testing Kits") && (
          <div className="p-6 border border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E8F0EC] text-[#2B5F4A] border border-[#C5DDD3]">
                Featured Starter Bundle
              </span>
              <h3 className="text-lg font-semibold text-gray-950">
                {kits[0].name}
              </h3>
              <p className="text-xs text-gray-600 max-w-xl font-light">
                {kits[0].description}
              </p>
            </div>

            <div className="flex items-center gap-6 shrink-0">
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Bundle Price</span>
                <span className="text-2xl font-semibold text-gray-950">
                  ${(kits[0].bundlePrice || 8.50).toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleAddKit(kits[0])}
                style={{
                  background: addedKitId === kits[0].id ? "#2B5F4A" : "#1A1A1A",
                  color: "white",
                  padding: "10px 24px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseEnter={(e) => { if (addedKitId !== kits[0].id) (e.target as HTMLElement).style.background = "#2B5F4A"; }}
                onMouseLeave={(e) => { if (addedKitId !== kits[0].id) (e.target as HTMLElement).style.background = "#1A1A1A"; }}
              >
                {addedKitId === kits[0].id ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" /> Add Kit
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div style={{ paddingTop: 80, paddingBottom: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 18, height: 18, border: "2px solid var(--sl-green)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sl-gray-mid)" }}>Loading supplies…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FlaskConical className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-base font-semibold text-gray-950">No Testing Supplies Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto font-light">
              No supplies matched your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredProducts.map((p) => (
              <TestingProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
