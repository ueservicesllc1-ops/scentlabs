"use client";

import React, { useState } from "react";
import { X, Smartphone, Monitor, ShieldCheck, Truck, PackageCheck, Sparkles } from "lucide-react";
import { Product } from "@/types/product";

interface ProductPreviewModalProps {
  product: Partial<Product>;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductPreviewModal({
  product,
  isOpen,
  onClose,
}: ProductPreviewModalProps) {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const images = (product.media as any[]) || product.images || [];
  const primaryImage =
    selectedImage ||
    product.primaryImageUrl ||
    (images.length > 0 ? images[0].url : "/placeholder-perfume.jpg");

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      {/* Top Bar Controls */}
      <div className="w-full max-w-5xl flex items-center justify-between py-3 px-4 bg-lab-900 border border-lab-800 rounded-2xl mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Customer Storefront Preview
          </span>
          <span className="text-xs text-lab-500 font-mono">
            {product.status === "active" ? "● Live on Store" : "○ Draft Mode"}
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-lab-950 p-1 rounded-xl border border-lab-800">
          <button
            type="button"
            onClick={() => setDeviceView("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              deviceView === "desktop"
                ? "bg-amber-500 text-black font-bold"
                : "text-lab-400 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            type="button"
            onClick={() => setDeviceView("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              deviceView === "mobile"
                ? "bg-amber-500 text-black font-bold"
                : "text-lab-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-lab-400 hover:text-white hover:bg-lab-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewport Frame */}
      <div
        className={`bg-lab-950 border border-lab-800 rounded-3xl overflow-y-auto max-h-[85vh] transition-all duration-300 shadow-2xl ${
          deviceView === "mobile" ? "w-[390px] p-4" : "w-full max-w-5xl p-8"
        }`}
      >
        <div className={`grid gap-8 ${deviceView === "mobile" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
          
          {/* Media Column */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-black/60 border border-lab-800 overflow-hidden flex items-center justify-center p-4">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage}
                  alt={product.name || "Product"}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-lab-500 text-xs">
                  No Image Available
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-16 h-16 rounded-xl border shrink-0 bg-black/40 overflow-hidden p-1 transition-all ${
                      primaryImage === img.url
                        ? "border-amber-500 ring-2 ring-amber-500/20"
                        : "border-lab-800 hover:border-lab-700"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="Thumb" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="space-y-5">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {product.categoryName || product.category || "General"}
                </span>
                {product.featured && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white leading-tight">
                {product.name || "Untitled Product"}
              </h1>
              <p className="text-xs text-lab-400 font-mono mt-1">
                SKU: {product.sku || "N/A"}
              </p>
            </div>

            {/* Price section */}
            <div className="p-4 bg-lab-900/60 border border-lab-800 rounded-2xl flex items-baseline gap-3">
              <span className="text-3xl font-black text-amber-400 font-mono">
                ${(product.basePrice || 0).toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > (product.basePrice || 0) && (
                <span className="text-base text-lab-500 line-through font-mono">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-lab-400 ml-auto">
                {product.inventory?.quantityInStock && product.inventory.quantityInStock > 0 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <PackageCheck className="w-3.5 h-3.5" /> In Stock ({product.inventory.quantityInStock} units)
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">Ready to Order</span>
                )}
              </span>
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm text-lab-300 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Dynamic Volume Pricing Table */}
            {product.volumePricing && product.volumePricing.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-lab-400">
                  Volume Tier Pricing
                </span>
                <div className="border border-lab-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-lab-900/80 text-lab-400 text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">Quantity</th>
                        <th className="py-2 px-3">Unit Price</th>
                        <th className="py-2 px-3">Discount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lab-900 font-mono">
                      {product.volumePricing.map((tier, i) => (
                        <tr key={i} className="hover:bg-lab-900/40">
                          <td className="py-2 px-3 text-white">{tier.minQuantity || (tier as any).quantity}+ units</td>
                          <td className="py-2 px-3 text-amber-400 font-bold">${tier.unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-3 text-emerald-400">{tier.discountPercent ? `${tier.discountPercent}% OFF` : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Custom Label product callout */}
            {product.isCustomLabelProduct && (
              <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 rounded-xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white">Custom Label Enabled:</span> Upload your brand artwork & choose metallic foils or matte finishes.
                </div>
              </div>
            )}

            {/* Mock Buy Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-500/20 opacity-90 cursor-not-allowed"
              >
                Add to Cart — ${(product.basePrice || 0).toFixed(2)}
              </button>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-lab-400 pt-2">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-amber-400" /> Fast Insured Shipping
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Laboratory Verified Pure
                </div>
              </div>
            </div>

            {/* Full description */}
            {product.description && (
              <div className="pt-4 border-t border-lab-900">
                <h3 className="text-xs font-bold uppercase tracking-wider text-lab-400 mb-2">Description</h3>
                <div className="text-xs text-lab-300 whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
