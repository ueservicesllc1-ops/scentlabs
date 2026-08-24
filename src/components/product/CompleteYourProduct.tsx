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

  const packageOptions = labelProduct.packageOptions || [
    { id: "pkg_50", name: "50 Labels", quantity: 50, price: 34.99, unitPrice: 0.70 },
  ];

  // Auto-select the label package that covers the selected bottle quantity
  const matchingPackage: ProductPackage =
    packageOptions.find((p) => p.quantity >= selectedBottleQuantity) ||
    packageOptions[packageOptions.length - 1];

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
    ? "Complete Your Roll-On Line"
    : `Complete Your ${currentProduct.name} Packaging`;

  const primaryImg = (labelProduct.media && labelProduct.media[0]?.url) || labelProduct.primaryImageUrl || "/images/products/custom-labels.jpg";

  return (
    <div className="rounded-sm border border-outline-variant bg-surface-container-low p-6 relative overflow-hidden font-body-md">
      <div className="flex items-center gap-2 text-primary font-label-caps text-label-caps uppercase tracking-wider mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        {headerTitle}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Spec Information */}
        <div className="flex gap-4 items-center md:col-span-2">
          <div className="w-20 h-20 rounded-sm bg-surface border border-outline-variant flex-shrink-0 overflow-hidden relative">
            <ProductMediaViewer
              src={primaryImg}
              alt="Custom Label Specimen"
              category="custom"
              sku={labelProduct.sku}
              aspectRatio="square"
            />
          </div>

          <div className="space-y-1">
            <h4 className="font-label-caps text-label-caps text-primary uppercase">
              Custom Label for {currentProduct.name}
            </h4>
            <div className="font-mono text-primary font-semibold text-xs">
              {config.recommendedWidthInches} x {config.recommendedHeightInches}&quot;
              {config.recommendedWidthCm && (
                <span className="text-secondary font-normal text-[11px] ml-1.5">
                  ({config.recommendedWidthCm} x {config.recommendedHeightCm} cm)
                </span>
              )}
            </div>
            <p className="font-caption text-caption text-secondary leading-relaxed pt-0.5 font-light">
              {config.calloutText || "Add your logo, brand and fragrance name."}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 md:border-l md:border-outline-variant md:pl-6">
          <div>
            <label className="font-label-caps text-[10px] text-secondary uppercase block mb-1">
              Select Finish:
            </label>
            <div className="flex gap-1.5">
              {(["Gold Foil", "Silver Foil", "Matte Vinyl"] as const).map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => setMaterial(mat)}
                  className={`text-[10px] px-2 py-1 rounded-sm border font-label-caps uppercase transition ${
                    material === mat
                      ? "bg-primary text-on-primary border-primary shadow-xs"
                      : "bg-surface text-primary border-outline-variant hover:border-primary"
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleAddMatchingLabel}
              className={`w-full py-2.5 px-3 rounded-sm text-xs font-label-caps uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-xs ${
                added
                  ? "bg-emerald-700 text-white"
                  : "flat-btn"
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
              className="w-full py-2 text-center text-xs font-label-caps uppercase bg-surface border border-outline-variant text-primary hover:border-primary transition rounded-sm flex items-center justify-center gap-1"
            >
              Customize Your Label <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
