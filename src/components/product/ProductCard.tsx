"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { Sparkles, ArrowRight, Check, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductMediaViewer } from "@/components/ui/ProductMediaViewer";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const defaultPackage =
    product.packageOptions.find((p) => p.isDefault) || product.packageOptions[0];
  const lowestUnitPrice = Math.min(...product.packageOptions.map((p) => p.unitPrice));
  const startingPrice = Math.min(...product.packageOptions.map((p) => p.price));

  return (
    <div className="group rounded-xl border border-lab-800 bg-lab-900/40 hover:border-amber-500/40 hover:bg-lab-900/80 transition duration-200 flex flex-col overflow-hidden">
      {/* Image / Laboratory Viewer */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-lab-950 block border-b border-lab-800/60"
      >
        <ProductMediaViewer
          src={product.media[0]?.url}
          alt={product.name}
          category={product.category}
          sku={product.sku}
          aspectRatio="square"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-20">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-lab-950/90 text-lab-300 border border-lab-700/80 backdrop-blur-sm">
            {product.category}
          </span>
          {product.subcategory && (
            <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-lab-900/90 text-amber-400 border border-lab-800 backdrop-blur-sm">
              {product.subcategory}
            </span>
          )}
          {product.customLabelConfig?.hasCustomLabel && (
            <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Label Ready
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[10px] font-mono text-lab-500 uppercase tracking-wider">
            SKU: {product.sku}
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="text-sm font-bold font-mono text-white hover:text-amber-400 transition line-clamp-2 mt-0.5"
          >
            {product.name}
          </Link>
          <p className="text-xs text-lab-400 mt-1 line-clamp-2 leading-relaxed font-mono">
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing Summary */}
        <div className="pt-2 border-t border-lab-800/60 font-mono">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-lab-400 uppercase">Starting at </span>
              <span className="text-base font-black text-amber-400">
                {formatCurrency(startingPrice)}
              </span>
            </div>
            {product.packageOptions.length > 1 && (
              <div className="text-right">
                <span className="text-[10px] text-lab-400">From </span>
                <span className="text-xs font-bold text-white">
                  {formatUnitPrice(lowestUnitPrice)}/u
                </span>
              </div>
            )}
          </div>

          {/* Volume Tiers Pills */}
          {product.packageOptions.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.packageOptions.slice(0, 3).map((pkg) => (
                <span
                  key={pkg.id}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-lab-800/80 text-lab-300 border border-lab-700/80"
                >
                  {pkg.quantity}u: {formatCurrency(pkg.price)}
                </span>
              ))}
              {product.packageOptions.length > 3 && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-lab-800/40 text-lab-500">
                  +{product.packageOptions.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-2 font-mono">
          <Link
            href={`/product/${product.slug}`}
            className="flex-1 py-2 rounded text-center text-xs font-bold uppercase bg-lab-800 hover:bg-lab-700 text-white transition flex items-center justify-center gap-1 border border-lab-700"
          >
            View Tiers <ArrowRight className="w-3 h-3" />
          </Link>
          <button
            onClick={() => addItem(product, defaultPackage, 1)}
            className="px-3 py-2 rounded text-xs font-bold uppercase bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-lab-950 transition flex items-center gap-1"
            title={`Add pack (${defaultPackage.quantity} ${product.unit || "units"})`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{defaultPackage.quantity}u</span>
          </button>
        </div>
      </div>
    </div>
  );
}
