"use client";

import React, { useState } from "react";
import { SHRINK_WRAP_VARIANTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Check } from "lucide-react";

export function HeatShrinkProductViewer() {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(SHRINK_WRAP_VARIANTS[0].id);
  const [selectedPkgIndex, setSelectedPkgIndex] = useState<number>(0);
  const [added, setAdded] = useState(false);

  const activeShrink = SHRINK_WRAP_VARIANTS.find((v) => v.id === selectedVariantId) || SHRINK_WRAP_VARIANTS[0];
  const activePkg = (activeShrink.packageOptions && activeShrink.packageOptions[selectedPkgIndex]) || 
    (activeShrink.packageOptions && activeShrink.packageOptions[0]) || {
      id: "pkg_default",
      name: "Default Pack",
      quantity: 50,
      price: 5.0,
      unitPrice: 0.1,
    };

  const handleAddToCart = () => {
    const cartProductProxy: any = {
      id: "prod_shrink_wrap_bags",
      name: `${activeShrink.name} (${activePkg.quantity}u Pack)`,
      slug: "heat-shrink-wrap-bags",
      category: "packaging",
      sku: activeShrink.sku,
      basePrice: activePkg.price,
      media: [{ url: "/images/products/shrink-wrap.jpg", type: "image", isPrimary: true, altText: activeShrink.name }],
      packageOptions: activeShrink.packageOptions || [activePkg],
    };

    addItem(cartProductProxy, activePkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 border border-gray-200 bg-white space-y-6 shadow-sm">
      <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] text-[#2B5F4A] uppercase block">
            Tamper-Evident &bull; 100 Gauge POF Film
          </span>
          <h3 className="text-lg font-semibold text-gray-950 mt-1 uppercase tracking-tight">
            POF Heat Shrink Wrap Bags
          </h3>
        </div>
        <span className="font-mono text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 border border-gray-200">
          SKU: {activeShrink.sku}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Variant Buttons */}
        <div className="space-y-3">
          <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-900 block">
            Select Compatible Bottle Size:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {SHRINK_WRAP_VARIANTS.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              const firstPkg = variant.packageOptions?.[0];
              const dimensions = (variant.attributes as any)?.dimensions || variant.name;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setSelectedPkgIndex(0);
                  }}
                  className={`p-3 text-left transition border flex items-center justify-between ${
                    isSelected
                      ? "bg-[#F6FAF8] text-gray-950 border-[#2B5F4A] shadow-xs"
                      : "bg-white text-gray-800 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider block">{variant.name}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? "text-[#2B5F4A]" : "text-gray-500"}`}>
                      {dimensions} (100G POF)
                    </span>
                  </div>
                  {firstPkg && (
                    <span className={`font-mono text-xs font-semibold ${isSelected ? "text-[#2B5F4A]" : "text-gray-900"}`}>
                      ${firstPkg.price.toFixed(2)} / {firstPkg.quantity}u
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Spec Sheet & Add to Cart */}
        <div className="p-6 bg-gray-50 border border-gray-200 space-y-4">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-500 uppercase block">Pack Pricing</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-semibold text-gray-950">${activePkg.price.toFixed(2)}</span>
              <span className="text-xs font-mono text-gray-500">(${activePkg.unitPrice.toFixed(3)} / bag)</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-gray-200 pt-3 text-gray-600">
            <div className="flex justify-between">
              <span>Film Spec:</span>
              <span className="font-medium text-gray-900">100 Gauge Polyolefin (POF)</span>
            </div>
            <div className="flex justify-between">
              <span>Heat Activation:</span>
              <span className="font-medium text-gray-900">250°F – 320°F Heat Gun</span>
            </div>
            <div className="flex justify-between">
              <span>Closure:</span>
              <span className="font-medium text-gray-900">Pre-sealed bottom, open top</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            style={{
              background: added ? "#2B5F4A" : "#1A1A1A",
              color: "white",
              padding: "12px 24px",
              width: "100%",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
            onMouseEnter={(e) => { if (!added) (e.target as HTMLElement).style.background = "#2B5F4A"; }}
            onMouseLeave={(e) => { if (!added) (e.target as HTMLElement).style.background = "#1A1A1A"; }}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Added to Order
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add {activePkg.quantity} Shrink Bags
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
