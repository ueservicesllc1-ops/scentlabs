"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product, ProductPackage } from "@/types";
import { INITIAL_PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { ProductMediaViewer } from "../ui/ProductMediaViewer";

interface CompleteYourProductProps {
  currentProduct: Product;
  parentCartItemId?: string;
  selectedBottleQuantity?: number;
}

export function CompleteYourProduct({
  currentProduct,
  parentCartItemId,
  selectedBottleQuantity = 50,
}: CompleteYourProductProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [material, setMaterial] = useState<"Gold Foil" | "Silver Foil" | "Matte Vinyl">("Gold Foil");

  const config = currentProduct.customLabelConfig;
  if (!config || !config.hasCustomLabel) return null;

  const labelProduct =
    INITIAL_PRODUCTS.find((p) => p.id === config.targetLabelProductId) ||
    INITIAL_PRODUCTS.find((p) => p.slug === "custom-perfume-labels") ||
    INITIAL_PRODUCTS[4];

  // Auto-select the label package that covers the selected bottle quantity
  const matchingPackage: ProductPackage =
    labelProduct.packageOptions.find((p) => p.quantity >= selectedBottleQuantity) ||
    labelProduct.packageOptions[labelProduct.packageOptions.length - 1];

  const handleAddMatchingLabel = () => {
    addItem(
      labelProduct,
      matchingPackage,
      1,
      {
        linkedParentItemId: parentCartItemId,
        isCustomItem: true,
        customLabelSpecs: {
          bottleName: currentProduct.name,
          dimensions: `${config.recommendedWidthInches}" x ${config.recommendedHeightInches}" (${config.recommendedWidthCm || 3.81} x ${config.recommendedHeightCm || 5.72} cm)`,
          material,
        },
      }
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  const headerTitle = currentProduct.subcategory?.toLowerCase() === "roll-on"
    ? "COMPLETE YOUR ROLL-ON"
    : `COMPLETE YOUR ${currentProduct.name.toUpperCase()}`;

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-lab-900/80 to-lab-950 p-6 shadow-2xl relative overflow-hidden font-mono">
      {/* Background Ambient Glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase mb-4">
        <Sparkles className="w-4 h-4" />
        {headerTitle}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Spec Information */}
        <div className="flex gap-4 items-center md:col-span-2">
          <div className="w-20 h-20 rounded-xl bg-lab-950 border border-amber-500/30 flex-shrink-0 overflow-hidden relative">
            <ProductMediaViewer
              src={labelProduct.media[0]?.url}
              alt="Custom Label Specimen"
              category="custom"
              sku={labelProduct.sku}
              aspectRatio="square"
            />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white uppercase tracking-wide">
              Custom Label for {currentProduct.name}
            </h4>
            <div className="text-amber-400 font-bold text-xs">
              {config.recommendedWidthInches} x {config.recommendedHeightInches}&quot;
              {config.recommendedWidthCm && (
                <span className="text-lab-400 font-normal text-[11px] ml-1.5">
                  ({config.recommendedWidthCm} x {config.recommendedHeightCm} cm)
                </span>
              )}
            </div>
            <p className="text-xs text-lab-300 leading-relaxed pt-0.5">
              {config.calloutText || "Add your logo, brand and fragrance name."}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 md:border-l md:border-lab-800 md:pl-6">
          <div>
            <label className="text-[10px] text-lab-400 uppercase block mb-1">
              Select Finish:
            </label>
            <div className="flex gap-1.5">
              {(["Gold Foil", "Silver Foil", "Matte Vinyl"] as const).map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setMaterial(mat)}
                  className={`text-[10px] px-2 py-1 rounded border transition ${
                    material === mat
                      ? "bg-amber-500 text-lab-950 font-bold border-amber-400"
                      : "bg-lab-900 text-lab-300 border-lab-700 hover:text-white"
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleAddMatchingLabel}
              className={`w-full py-2.5 px-3 rounded text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow ${
                added
                  ? "bg-emerald-500 text-lab-950"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added ({matchingPackage.quantity}u Labels)
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Add {matchingPackage.quantity} Labels ({formatCurrency(matchingPackage.price)})
                </>
              )}
            </button>

            <Link
              href={`/custom-labels/${currentProduct.slug || currentProduct.id}`}
              className="w-full py-2 rounded text-center text-xs font-bold uppercase bg-lab-900 border border-lab-700 text-amber-400 hover:text-amber-300 hover:border-amber-500/50 transition flex items-center justify-center gap-1"
            >
              Customize Your Label <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
