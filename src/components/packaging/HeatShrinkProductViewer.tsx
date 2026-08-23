"use client";

import React, { useState } from "react";
import { SHRINK_WRAP_VARIANTS } from "@/data/packaging";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { Layers, ShoppingBag, Check, ShieldCheck, Sparkles } from "lucide-react";

export function HeatShrinkProductViewer() {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("6x8");
  const [selectedQty, setSelectedQty] = useState<50 | 100>(50);
  const [added, setAdded] = useState(false);

  const activeVariant = SHRINK_WRAP_VARIANTS.find((v) => v.sizeName.startsWith(selectedSize)) || SHRINK_WRAP_VARIANTS[2];

  const currentPrice = selectedQty === 50 ? activeVariant.price50 : activeVariant.price100;
  const currentUnitPrice = currentPrice / selectedQty;

  const handleAddToCart = () => {
    const cartProductProxy: any = {
      id: "prod_shrink_wrap_bags",
      name: `Heat Shrink Wrap Bags (${activeVariant.sizeName} - ${selectedQty}u Pack)`,
      slug: "heat-shrink-wrap-bags",
      category: "packaging",
      sku: `${activeVariant.sku}-${selectedQty}`,
      basePrice: currentPrice,
      media: [{ url: "/images/products/shrink-wrap-bags.jpg", type: "image", isPrimary: true, altText: "Heat Shrink Wrap Bags" }],
      packageOptions: [
        {
          id: `pkg_shrink_${activeVariant.id}_${selectedQty}`,
          quantity: selectedQty,
          price: currentPrice,
          unitPrice: currentUnitPrice,
        },
      ],
      pricingTiers: [],
    };

    const selectedPkg = {
      id: `pkg_shrink_${activeVariant.id}_${selectedQty}`,
      quantity: selectedQty,
      price: currentPrice,
      unitPrice: currentUnitPrice,
    };

    addItem(cartProductProxy, selectedPkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 font-mono space-y-6 shadow-2xl">
      <div className="border-b border-lab-800 pb-4 flex justify-between items-start">
        <div>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">
            Professional Thermal Packaging
          </span>
          <h2 className="text-xl font-bold text-white uppercase">Heat Shrink Wrap Bags</h2>
        </div>
        <span className="px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase">
          7 Sizes
        </span>
      </div>

      {/* 1. Size Selector Matrix */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white uppercase block">
          1. Select Bag Size (Inches)
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {["4x6", "6x6", "6x8", "8x12", "10x14", "12x18", "14x20"].map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`py-2.5 px-2 rounded-xl text-center border text-xs font-bold transition flex flex-col items-center justify-center ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/10 text-amber-400 shadow-md shadow-amber-500/10"
                    : "border-lab-800 bg-lab-900/60 text-lab-400 hover:text-white hover:border-lab-700"
                }`}
              >
                <span>{size}</span>
                <span className="text-[9px] text-lab-500 font-normal">in</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Quantity Selector (50 vs 100) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white uppercase block">
          2. Select Pack Quantity
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedQty(50)}
            className={`p-4 rounded-xl border text-left transition flex justify-between items-center ${
              selectedQty === 50
                ? "border-amber-500 bg-amber-500/10 text-white"
                : "border-lab-800 bg-lab-900/40 text-lab-400 hover:border-lab-700 hover:text-white"
            }`}
          >
            <div>
              <span className="text-xs font-bold block uppercase">50 Bags Pack</span>
              <span className="text-[11px] text-lab-400">{formatUnitPrice(activeVariant.price50 / 50)} / unit</span>
            </div>
            <span className="text-sm font-black text-amber-400">{formatCurrency(activeVariant.price50)}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedQty(100)}
            className={`p-4 rounded-xl border text-left transition flex justify-between items-center ${
              selectedQty === 100
                ? "border-amber-500 bg-amber-500/10 text-white"
                : "border-lab-800 bg-lab-900/40 text-lab-400 hover:border-lab-700 hover:text-white"
            }`}
          >
            <div>
              <span className="text-xs font-bold block uppercase">100 Bags Pack</span>
              <span className="text-[11px] text-emerald-400 font-bold">
                {formatUnitPrice(activeVariant.price100 / 100)} / unit (Best Value)
              </span>
            </div>
            <span className="text-sm font-black text-amber-400">{formatCurrency(activeVariant.price100)}</span>
          </button>
        </div>
      </div>

      {/* 3. Pricing Summary & Add to Cart */}
      <div className="p-4 rounded-xl border border-lab-700 bg-lab-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] text-lab-500 uppercase block">Selected Configuration</span>
          <span className="text-xs text-white font-bold block">
            {activeVariant.sizeName} • {selectedQty} Units
          </span>
          <span className="text-2xl font-black text-amber-400">{formatCurrency(currentPrice)}</span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
        >
          {added ? (
            <>
              <Check className="w-4 h-4 text-emerald-950" /> Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Add Pack to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
