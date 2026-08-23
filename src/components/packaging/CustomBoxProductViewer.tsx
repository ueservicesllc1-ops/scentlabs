"use client";

import React, { useState } from "react";
import Link from "next/link";
import { STANDARD_BOX_VARIANTS } from "@/data/packaging";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { Box, ShoppingBag, Check, Sparkles, Tag, ShieldCheck, ArrowRight } from "lucide-react";

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
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="p-6 rounded-2xl border border-amber-500/30 bg-lab-950 font-mono space-y-6 shadow-2xl">
      <div className="border-b border-lab-800 pb-4 flex justify-between items-start">
        <div>
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
            Cricut Precision Cut & Scored • 110 lb Cardstock
          </span>
          <h2 className="text-xl font-bold text-white uppercase">Custom Perfume Presentation Boxes</h2>
        </div>
        <span className="px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
          Shipped Flat
        </span>
      </div>

      {/* 1. Box Size Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white uppercase block">
          1. Select Box Format
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STANDARD_BOX_VARIANTS.map((box) => {
            const isSelected = selectedVariantId === box.id;
            return (
              <button
                key={box.id}
                type="button"
                onClick={() => setSelectedVariantId(box.id)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10"
                    : "border-lab-800 bg-lab-900/40 text-lab-400 hover:border-lab-700 hover:text-white"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase text-white">{box.name}</span>
                    <span className="text-xs font-bold text-amber-400">{formatUnitPrice(box.retailPrice)}/ea</span>
                  </div>
                  <p className="text-[11px] text-lab-400 mt-1">
                    {box.width} x {box.height} x {box.depth} in ({box.materialName})
                  </p>
                </div>
                <div className="pt-2 text-[10px] text-lab-500">
                  Precision scored tuck top closure • Ready to assemble
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Volume Quantity Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white uppercase block">
          2. Batch Quantity & Volume Pricing
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[25, 50, 100, 250].map((qty) => {
            const tier = activeBox.volumePricing?.slice().reverse().find((t) => qty >= t.quantity);
            const tierUnitPrice = tier ? tier.unitPrice : activeBox.retailPrice;
            const isSelected = selectedQuantity === qty;

            return (
              <button
                key={qty}
                type="button"
                onClick={() => setSelectedQuantity(qty)}
                className={`p-3 rounded-xl border text-center transition ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/10 text-white"
                    : "border-lab-800 bg-lab-900/60 text-lab-400 hover:border-lab-700 hover:text-white"
                }`}
              >
                <span className="text-xs font-bold block uppercase">{qty} Boxes</span>
                <span className="text-xs font-black text-amber-400 mt-0.5 block">
                  {formatUnitPrice(tierUnitPrice)}
                </span>
                <span className="text-[10px] text-lab-500">
                  {formatCurrency(tierUnitPrice * qty)} total
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Add to Cart & Cross-Sell Links */}
      <div className="p-4 rounded-xl border border-lab-700 bg-lab-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] text-lab-500 uppercase block">Calculated Batch Total</span>
          <span className="text-2xl font-black text-amber-400">{formatCurrency(totalPrice)}</span>
          <span className="text-[11px] text-lab-300 block">
            {selectedQuantity}x {activeBox.name} ({formatUnitPrice(unitPrice)}/ea)
          </span>
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
              <ShoppingBag className="w-4 h-4" /> Add Boxes to Cart
            </>
          )}
        </button>
      </div>

      {/* Cross-Sell Recommendation Pill */}
      <div className="pt-2 flex flex-wrap gap-2 text-xs">
        <Link
          href="/custom-labels"
          className="px-3 py-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white flex items-center gap-1.5 transition"
        >
          <Tag className="w-3.5 h-3.5 text-amber-400" /> Match Custom Metallic Foil Label <ArrowRight className="w-3 h-3" />
        </Link>

        <Link
          href="/shop/packaging"
          className="px-3 py-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white flex items-center gap-1.5 transition"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Add Tamper Security Sticker <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
