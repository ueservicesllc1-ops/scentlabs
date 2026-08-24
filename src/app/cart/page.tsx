"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Lock, 
  ArrowLeft
} from "lucide-react";
import { ProductMediaViewer } from "@/components/ui/ProductMediaViewer";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalUnits,
    summary,
  } = useCart();

  const volumeSavings = summary.discountTotal || 0;

  return (
    <div className="min-h-[80vh] bg-surface text-on-surface font-body-md py-section-gap">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-stack-lg">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-outline-variant pb-stack-sm gap-2">
          <div>
            <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] block mb-1">
              Your Selection
            </span>
            <h1 className="font-display-hero text-headline-lg-mobile md:text-headline-lg text-primary uppercase">
              Shopping Bag
              <span className="font-body-md text-body-md text-secondary font-light ml-3 normal-case">
                ({items.length} {items.length === 1 ? "item" : "items"} &bull; {totalUnits} units)
              </span>
            </h1>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="font-label-caps text-label-caps text-secondary hover:text-error transition-colors uppercase flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low border border-outline-variant rounded p-8 max-w-xl mx-auto space-y-stack-md">
            <div className="w-16 h-16 rounded bg-surface-container flex items-center justify-center mx-auto text-primary">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="font-headline-md text-headline-md text-primary">Your bag is empty</h2>
              <p className="font-body-md text-body-md text-secondary font-light">
                Explore our catalog of raw fragrance oils, clinical-grade packaging, and custom labels.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/shop"
                className="flat-btn px-8 py-3.5 font-label-caps text-label-caps uppercase inline-flex items-center gap-2"
              >
                Browse Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            
            {/* Cart Items List (Stitch 8 Columns) */}
            <div className="lg:col-span-8 space-y-stack-md">
              {items.map((item) => {
                return (
                  <article
                    key={item.id}
                    className="flex gap-stack-md bg-surface-container-lowest border border-outline-variant p-5 rounded-sm"
                  >
                    {/* Item Image (Stitch w-24 h-32) */}
                    <div className="w-24 h-32 bg-surface-container shrink-0 rounded overflow-hidden relative">
                      <ProductMediaViewer
                        src={item.image || "/images/products/placeholder.jpg"}
                        alt={item.productName}
                        category={item.category || "supplies"}
                        sku={item.sku}
                        aspectRatio="square"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-col flex-1 justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-body-md text-body-md text-primary font-medium leading-tight">
                            {item.productName}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-secondary hover:text-error transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.75]" />
                          </button>
                        </div>

                        <p className="font-caption text-caption text-secondary">
                          SKU: {item.sku} &bull; Pack: {item.selectedPackage.name || `${item.selectedPackage.quantity || 1} units`}
                        </p>

                        {item.customLabelSpecs && (
                          <div className="mt-2 text-[11px] text-secondary font-mono bg-surface-container-low p-2 rounded-sm border border-outline-variant/60">
                            Custom Foil: {item.customLabelSpecs.material} ({item.customLabelSpecs.dimensions})
                            {item.customLabelSpecs.customText && ` - ${item.customLabelSpecs.customText}`}
                          </div>
                        )}
                      </div>

                      {/* Controls & Line Price */}
                      <div className="flex items-center justify-between mt-4 pt-2 border-t border-outline-variant/40">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-outline-variant rounded-sm h-8 bg-surface">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.packageCount - 1))}
                            className="px-2.5 h-full flex items-center justify-center text-primary hover:bg-surface-container transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-label-caps text-label-caps w-8 text-center text-primary">
                            {item.packageCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.packageCount + 1)}
                            className="px-2.5 h-full flex items-center justify-center text-primary hover:bg-surface-container transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="font-body-md text-body-md text-primary font-medium">
                          ${item.totalLinePrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="font-label-caps text-label-caps text-secondary hover:text-primary transition inline-flex items-center gap-1.5 uppercase"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
                </Link>
              </div>
            </div>

            {/* Sticky Order Summary Sidebar (Stitch 4 Columns) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-stack-md">
              <div className="p-stack-lg bg-surface-container-lowest border border-outline-variant rounded-sm space-y-stack-md">
                
                <h3 className="font-label-caps text-label-caps text-primary uppercase border-b border-outline-variant pb-stack-sm">
                  Order Summary
                </h3>

                <div className="space-y-3 font-body-md text-body-md">
                  <div className="flex justify-between items-center text-secondary">
                    <span>Subtotal</span>
                    <span className="text-primary font-medium">${summary.subtotal.toFixed(2)}</span>
                  </div>

                  {volumeSavings > 0 && (
                    <div className="flex justify-between items-center text-emerald-700">
                      <span>Volume Wholesale Tier Discount</span>
                      <span>-${volumeSavings.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-secondary">
                    <span>Estimated US Freight</span>
                    <span className="text-primary font-light">Calculated at Checkout</span>
                  </div>

                  <hr className="border-t border-outline-variant" />

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="font-body-md text-body-md text-primary font-bold">Total Due</span>
                    <span className="font-headline-md text-headline-md text-primary font-bold">
                      ${summary.totalBeforeShipping.toFixed(2)}
                    </span>
                  </div>
                </div>

                <p className="font-caption text-caption text-secondary text-center pt-2">
                  Live Shippo shipping rates & taxes calculated in next step.
                </p>

                <Link
                  href="/checkout"
                  className="flat-btn w-full py-4 font-label-caps text-label-caps uppercase flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" /> Proceed to Checkout
                </Link>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
