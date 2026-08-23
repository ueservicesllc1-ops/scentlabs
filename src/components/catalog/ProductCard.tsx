"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { ShoppingBag, Check, ArrowRight, Sparkles } from "lucide-react";
import { ProductMediaViewer } from "../ui/ProductMediaViewer";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const activePkg = product.packageOptions[selectedPkgIndex] || product.packageOptions[0];
  const requiresCustomization = 
    (product.category as string) === "custom-labels" || 
    (product.category as string) === "custom" || 
    (product.category as string) === "labels" || 
    product.id.startsWith("prod_custom_labels");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (requiresCustomization) return;

    addItem(product, activePkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const primaryImage = product.media.find((m) => m.isPrimary)?.url || product.media[0]?.url || "/images/products/placeholder.jpg";

  // Product link URL resolution
  let productUrl = `/product/${product.slug}`;
  if (product.category === "fragrance") productUrl = `/fragrance/${product.slug}`;
  else if (product.category === "testing") productUrl = `/testing/${product.slug}`;
  else if (product.category === "custom-labels") productUrl = `/custom-labels/${product.id}`;

  return (
    <div className="group rounded-2xl border border-lab-800 bg-lab-950 p-4 transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between font-mono">
      <div className="space-y-3">
        {/* Media */}
        <Link href={productUrl} className="block relative aspect-square rounded-xl overflow-hidden bg-lab-900 border border-lab-800/80">
          <ProductMediaViewer
            src={primaryImage}
            alt={product.name}
            category={product.category}
            sku={product.sku}
            aspectRatio="square"
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className="px-2 py-0.5 rounded bg-lab-950/80 backdrop-blur-md border border-lab-700 text-lab-300 text-[9px] font-bold uppercase tracking-wider">
              {product.subcategory || product.category}
            </span>
          </div>
        </Link>

        {/* Info */}
        <div className="space-y-1">
          <div className="text-[10px] text-lab-500 uppercase tracking-widest flex items-center justify-between">
            <span>{product.sku}</span>
            <span className="text-emerald-400 font-bold">In Stock</span>
          </div>

          <Link href={productUrl} className="block">
            <h3 className="text-sm font-bold text-white uppercase hover:text-amber-400 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-lab-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Package Selector Pills (if multiple) */}
        {product.packageOptions.length > 1 && !requiresCustomization && (
          <div className="pt-2 border-t border-lab-900 space-y-1">
            <span className="text-[9px] text-lab-500 uppercase block">Pack Size:</span>
            <div className="grid grid-cols-3 gap-1">
              {product.packageOptions.slice(0, 3).map((pkg, idx) => {
                const isSelected = selectedPkgIndex === idx;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkgIndex(idx)}
                    className={`p-1 rounded text-center text-[10px] font-bold transition border ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 text-amber-300"
                        : "border-lab-800 bg-lab-900 text-lab-400 hover:text-white"
                    }`}
                  >
                    <span>{pkg.quantity}u</span>
                    <span className="block text-[9px] text-lab-500">{formatCurrency(pkg.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Price & Action */}
      <div className="pt-4 mt-3 border-t border-lab-800/80 flex items-center justify-between gap-2">
        <div>
          <span className="text-[9px] text-lab-500 uppercase block">Starting at</span>
          <span className="text-base font-black text-amber-400">
            {formatCurrency(activePkg?.price || product.basePrice)}
          </span>
          {activePkg?.unitPrice && (
            <span className="text-[9px] text-lab-500 block">
              {formatUnitPrice(activePkg.unitPrice)} / unit
            </span>
          )}
        </div>

        {requiresCustomization ? (
          <Link
            href={productUrl}
            className="px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-lab-950 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" /> Customize
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1 shadow ${
              added
                ? "bg-emerald-500 text-lab-950"
                : "bg-lab-800 hover:bg-amber-500 hover:text-lab-950 text-white"
            }`}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            {added ? "Added" : "Quick Add"}
          </button>
        )}
      </div>
    </div>
  );
}
