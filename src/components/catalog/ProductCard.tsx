"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Check, Sparkles, ArrowRight, Package } from "lucide-react";
import { ProductMediaViewer } from "../ui/ProductMediaViewer";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const activePkg = product.packageOptions?.[selectedPkgIndex] || product.packageOptions?.[0] || {
    id: "pkg_default",
    name: "Standard Pack",
    quantity: 1,
    price: product.basePrice,
    unitPrice: product.basePrice,
  };

  const requiresCustomization = 
    Boolean(product.isCustomLabelProduct) || 
    Boolean(product.customizable) ||
    (product.category as string) === "custom-labels" || 
    (product.category as string) === "custom";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (requiresCustomization) return;

    addItem(product, activePkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const primaryImage =
    product.primaryImageUrl ||
    (product.media && (product.media as any[])[0]?.url) ||
    (product.images && product.images[0]?.url) ||
    "/images/products/placeholder.jpg";

  // URL resolution
  let productUrl = `/product/${product.slug}`;
  if (product.category === "fragrance") productUrl = `/fragrance/${product.slug}`;
  else if (product.category === "testing") productUrl = `/testing/${product.slug}`;
  else if (product.category === "custom-labels") productUrl = `/custom-labels/${product.id}`;

  const hasVolumeDiscount = product.volumePricing && product.volumePricing.length > 0;
  const lowestVolumePrice = hasVolumeDiscount
    ? Math.min(...product.volumePricing!.map((t) => t.unitPrice))
    : null;

  return (
    <div className="luxury-card rounded-2xl p-4.5 flex flex-col justify-between group transition-all duration-300">
      <div className="space-y-3.5">
        
        {/* Product Visual Container */}
        <Link
          href={productUrl}
          className="block relative aspect-square rounded-xl overflow-hidden bg-[#f7f5f0] border border-[#ebe7df]"
        >
          <ProductMediaViewer
            src={primaryImage}
            alt={product.name}
            category={product.category}
            sku={product.sku}
            aspectRatio="square"
          />

          {/* Badges overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {product.featured && (
              <span className="px-2 py-0.5 rounded-full bg-stone-900 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                ★ Featured
              </span>
            )}
            {product.isCustomLabelProduct && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Custom Label
              </span>
            )}
            {hasVolumeDiscount && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                Volume Tiers
              </span>
            )}
          </div>
        </Link>

        {/* Product Information */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-stone-500 uppercase tracking-wider">
            <span className="font-semibold">{product.categoryName || product.category || "Supplies"}</span>
            <span className="font-mono text-stone-400">SKU: {product.sku}</span>
          </div>

          <Link href={productUrl} className="block group-hover:text-amber-800 transition">
            <h3 className="text-sm font-bold text-stone-900 leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
        </div>

        {/* Pricing Area */}
        <div className="pt-2 border-t border-[#f0ece5] flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-stone-900 font-serif">
              ${(product.basePrice || 0).toFixed(2)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > (product.basePrice || 0) && (
              <span className="text-xs text-stone-400 line-through font-serif">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
            {lowestVolumePrice && lowestVolumePrice < (product.basePrice || 0) && (
              <span className="text-[10px] text-amber-700 font-semibold">
                (as low as ${lowestVolumePrice.toFixed(2)})
              </span>
            )}
          </div>

          <span className="text-[10px] text-emerald-700 font-bold">
            {product.inventory?.status === "out_of_stock" ? "Out of Stock" : "In Stock"}
          </span>
        </div>

      </div>

      {/* Action Button */}
      <div className="pt-3.5 mt-2">
        {requiresCustomization ? (
          <Link
            href={productUrl}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Customize Artwork &bull; Order
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-[#f5f3ee] hover:bg-amber-600 hover:text-white text-stone-800 border border-[#e5e0d8] hover:border-amber-600"
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Order
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
