"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TestingProduct } from "@/types/testing";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { FlaskConical, ShoppingBag, Check, ArrowRight } from "lucide-react";
import { ProductMediaViewer } from "../ui/ProductMediaViewer";

interface TestingProductCardProps {
  product: TestingProduct;
}

export function TestingProductCard({ product }: TestingProductCardProps) {
  const { addItem } = useCart();
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const activePkg = product.packageOptions[selectedPkgIndex] || product.packageOptions[0];

  const handleAddToCart = () => {
    // Map to CartContext product proxy
    const cartProductProxy: any = {
      id: product.id,
      name: `${product.name} (${activePkg.quantity} ${product.unit}s)`,
      slug: product.slug,
      category: "testing",
      sku: `${product.sku}-${activePkg.quantity}`,
      basePrice: activePkg.price,
      media: [{ url: product.primaryImage, type: "image", isPrimary: true, altText: product.name }],
      packageOptions: product.packageOptions,
      pricingTiers: product.volumePricing || [],
    };

    addItem(cartProductProxy, activePkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-lab-800 bg-lab-950 p-4 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 flex flex-col justify-between font-mono">
      <div className="space-y-3">
        {/* Media */}
        <Link href={`/testing/${product.slug}`} className="block relative aspect-square rounded-xl overflow-hidden bg-lab-900 border border-lab-800/80">
          <ProductMediaViewer
            src={product.primaryImage}
            alt={product.name}
            category="testing"
            sku={product.id}
            aspectRatio="square"
          />

          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded bg-lab-950/80 backdrop-blur-md border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              {product.subcategory}
            </span>
          </div>
        </Link>

        {/* Info */}
        <div className="space-y-1">
          <div className="text-[10px] text-lab-500 uppercase tracking-widest flex items-center justify-between">
            <span>{product.sampleSize || "Testing Supply"}</span>
            <span className="text-emerald-400 font-bold">In Stock</span>
          </div>

          <Link href={`/testing/${product.slug}`} className="block">
            <h3 className="text-sm font-bold text-white uppercase hover:text-indigo-400 transition line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-lab-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Package Quantity Selector Pills */}
        <div className="pt-2 border-t border-lab-900 space-y-1.5">
          <span className="text-[10px] text-lab-500 uppercase block">Select Pack Quantity:</span>
          <div className="grid grid-cols-3 gap-1">
            {product.packageOptions.map((pkg, idx) => {
              const isSelected = selectedPkgIndex === idx;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPkgIndex(idx)}
                  className={`p-1.5 rounded-lg border text-center text-[10px] font-bold transition flex flex-col items-center justify-center ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                      : "border-lab-800 bg-lab-900/60 text-lab-400 hover:text-white"
                  }`}
                >
                  <span>{pkg.quantity} {product.unit}s</span>
                  <span className="text-amber-400 font-mono">{formatCurrency(pkg.price)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Price & Add to Cart */}
      <div className="pt-4 mt-3 border-t border-lab-800/80 flex items-center justify-between gap-2">
        <div>
          <span className="text-[9px] text-lab-500 uppercase block">Pack Price</span>
          <span className="text-base font-black text-amber-400">{formatCurrency(activePkg.price)}</span>
          <span className="text-[9px] text-lab-500 block">
            {formatUnitPrice(activePkg.unitPrice)} / {product.unit}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1 shadow ${
            added
              ? "bg-emerald-500 text-lab-950"
              : "bg-indigo-500 hover:bg-indigo-400 text-white"
          }`}
        >
          {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          {added ? "Added!" : "Add Pack"}
        </button>
      </div>
    </div>
  );
}
