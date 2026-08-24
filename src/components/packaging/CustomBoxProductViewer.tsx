"use client";

import React, { useState } from "react";
import { STANDARD_BOX_VARIANTS } from "@/data/packaging";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Check } from "lucide-react";

export function CustomBoxProductViewer() {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(STANDARD_BOX_VARIANTS[0].id);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(50);
  const [added, setAdded] = useState(false);

  const activeBox = STANDARD_BOX_VARIANTS.find((b) => b.id === selectedVariantId) || STANDARD_BOX_VARIANTS[0];

  // Match volume tier unit price
  const matchedTier = activeBox.volumePricing?.slice().reverse().find((t) => selectedQuantity >= t.quantity);
  const unitPrice = matchedTier ? matchedTier.unitPrice : activeBox.retailPrice;
  const totalPrice = Math.round(unitPrice * selectedQuantity * 100) / 100;

  const handleAddToCart = () => {
    const cartProductProxy: any = {
      id: "prod_perfume_boxes",
      name: `${activeBox.name} (${selectedQuantity} Boxes)`,
      slug: "custom-perfume-boxes",
      category: "packaging",
      sku: `${activeBox.sku}-${selectedQuantity}`,
      basePrice: totalPrice,
      media: [{ url: "/images/products/perfume-boxes.jpg", type: "image", isPrimary: true, altText: activeBox.name }],
      packageOptions: [
        {
          id: `pkg_box_${activeBox.id}_${selectedQuantity}`,
          quantity: selectedQuantity,
          price: totalPrice,
          unitPrice,
        },
      ],
      pricingTiers: activeBox.volumePricing || [],
    };

    const selectedPkg = {
      id: `pkg_box_${activeBox.id}_${selectedQuantity}`,
      quantity: selectedQuantity,
      price: totalPrice,
      unitPrice,
    };

    addItem(cartProductProxy, selectedPkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 border border-gray-200 bg-white space-y-6 shadow-sm">
      <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] text-[#2B5F4A] uppercase block">
            Cricut Precision Cut & Scored &bull; 110 lb Cardstock
          </span>
          <h3 className="text-lg font-semibold text-gray-950 mt-1 uppercase tracking-tight">
            Custom Fit Perfume Boxes
          </h3>
        </div>
        <span className="font-mono text-[11px] text-gray-500 bg-gray-50 px-2.5 py-1 border border-gray-200">
          SKU: {activeBox.sku}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Model Selection & Quantity */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-900 block">
              1. Select Bottle Format & Dimensions:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {STANDARD_BOX_VARIANTS.map((box) => {
                const isSelected = selectedVariantId === box.id;
                return (
                  <button
                    key={box.id}
                    type="button"
                    onClick={() => setSelectedVariantId(box.id)}
                    className={`p-3 text-left transition border flex items-center justify-between ${
                      isSelected
                        ? "bg-[#F6FAF8] text-gray-950 border-[#2B5F4A] shadow-xs"
                        : "bg-white text-gray-800 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider block">{box.name}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? "text-[#2B5F4A]" : "text-gray-500"}`}>
                        {box.width}&quot; × {box.height}&quot; × {box.depth}&quot; ({box.materialName})
                      </span>
                    </div>
                    <span className={`font-mono text-xs font-semibold ${isSelected ? "text-[#2B5F4A]" : "text-gray-900"}`}>
                      from ${(box.volumePricing?.[box.volumePricing.length - 1]?.unitPrice || box.retailPrice).toFixed(2)}/u
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-900 block">
              2. Select Quantity Batch:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 250].map((qty) => {
                const isSelected = selectedQuantity === qty;
                const tier = activeBox.volumePricing?.slice().reverse().find((t) => qty >= t.quantity);
                const price = tier ? tier.unitPrice : activeBox.retailPrice;

                return (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setSelectedQuantity(qty)}
                    className={`p-2.5 text-center transition border ${
                      isSelected
                        ? "bg-[#F6FAF8] text-gray-950 border-[#2B5F4A] shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-xs font-semibold block">{qty}</span>
                    <span className={`text-[10px] font-mono block mt-0.5 ${isSelected ? "text-[#2B5F4A]" : "text-gray-400"}`}>
                      ${price.toFixed(2)}/u
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Spec Sheet & Add to Cart */}
        <div className="p-6 bg-gray-50 border border-gray-200 space-y-4">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-500 uppercase block">Selected Batch Price</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-semibold text-gray-950">${totalPrice.toFixed(2)}</span>
              <span className="text-xs font-mono text-gray-500">(${unitPrice.toFixed(2)} per custom box)</span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-gray-200 pt-3 text-gray-600">
            <div className="flex justify-between">
              <span>Cardstock:</span>
              <span className="font-medium text-gray-900">110 lb Smooth Cover</span>
            </div>
            <div className="flex justify-between">
              <span>Assembly:</span>
              <span className="font-medium text-gray-900">Pre-scored, ships flat</span>
            </div>
            <div className="flex justify-between">
              <span>Material:</span>
              <span className="font-medium text-gray-900">{activeBox.materialName}</span>
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
                <ShoppingBag className="w-4 h-4" /> Add {selectedQuantity} Boxes to Order
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
