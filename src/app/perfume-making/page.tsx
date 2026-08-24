import React from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { INITIAL_PRODUCTS } from "@/data/products";

export default function PerfumeMakingPage() {
  const formulationProducts = INITIAL_PRODUCTS.filter(
    (p) => p.category === "perfume-making" || p.category === "tools"
  );

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      
      {/* Page Header */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-12">
        <div className="sl-catalog-header">
          <span className="sl-catalog-eyebrow">Direct Perfume Compounding</span>
          <h1 className="sl-catalog-title">Perfume Making & Formulation</h1>
          <p className="sl-catalog-subtitle">
            200-proof perfumer&apos;s base alcohol (SDA 40-B), transfer pipettes, and compounding tools for independent fragrance artisans.
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 pb-20">
        {/* Formulation Raw Materials and Compounding Tools Grid */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-3">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900">
              Formulation Supplies & Compounding Tools
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "var(--sl-gray-light)" }}>
            {formulationProducts.map((p) => (
              <div key={p.id} style={{ background: "white" }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
