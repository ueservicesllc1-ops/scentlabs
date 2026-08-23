"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { Trash2, ShieldCheck, ArrowRight, Sparkles, Layers, Box, ShoppingBag, Plus, Minus } from "lucide-react";
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Header */}
      <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="text-xs text-amber-400 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5" /> PRODUCTION BATCH REVIEW
          </div>
          <h1 className="text-3xl font-black text-white uppercase">
            Cart ({totalUnits} Total Units)
          </h1>
          <p className="text-xs text-lab-400 mt-1">
            Verify your fractional packages, custom label dimensions, and volume tier savings before checkout.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-lab-500 hover:text-red-400 transition"
          >
            Clear Entire Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 border border-lab-800 rounded-2xl bg-lab-900/30 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-lab-900 border border-lab-800 flex items-center justify-center mx-auto text-lab-500">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white uppercase">Your cart is currently empty</h2>
          <p className="text-xs text-lab-400 leading-relaxed">
            Explore our glass roll-ons, atomizers, custom foil labels, perfume bases and transfer pipettes.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase bg-amber-500 text-lab-950 hover:brightness-110 transition shadow-lg shadow-amber-500/10"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border bg-lab-900/50 space-y-4 transition ${
                  item.isLinkedToParent
                    ? "border-amber-500/40 bg-amber-500/5"
                    : "border-lab-800"
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  {/* Media & Details */}
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-lab-950 border border-lab-800 overflow-hidden flex-shrink-0">
                      <ProductMediaViewer
                        src={item.image}
                        alt={item.productName}
                        category={item.category}
                        sku={item.sku}
                        aspectRatio="square"
                      />
                    </div>

                    <div>
                      <div className="text-[10px] text-lab-500 uppercase">
                        SKU: {item.sku}
                      </div>
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="text-sm font-bold text-white hover:text-amber-400 transition block"
                      >
                        {item.productName}
                      </Link>

                      {item.selectedVariant && (
                        <div className="text-[11px] text-lab-300">
                          Variant: <strong className="text-white">{item.selectedVariant.name}</strong>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-lab-400 mt-1">
                        <span>Pack: <strong>{item.selectedPackage.quantity} units</strong></span>
                        <span>•</span>
                        <span className="text-amber-400 font-bold">{formatUnitPrice(item.unitPrice)}/unit</span>
                      </div>

                      {item.customLabelSpecs && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-400">
                          <Sparkles className="w-3 h-3" />
                          <span>Spec: {item.customLabelSpecs.bottleName} ({item.customLabelSpecs.dimensions} - {item.customLabelSpecs.material})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controller and Line Price */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <div className="text-base font-black text-white">
                      {formatCurrency(item.totalLinePrice)}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-lab-700 rounded-lg bg-lab-950 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.packageCount - 1)}
                          className="px-2.5 py-1 text-lab-400 hover:text-white hover:bg-lab-800 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-white">
                          {item.packageCount} pk ({item.totalUnits}u)
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.packageCount + 1)}
                          className="px-2.5 py-1 text-lab-400 hover:text-white hover:bg-lab-800 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-lab-500 hover:text-red-400 rounded hover:bg-lab-800 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Financial Summary */}
          <div className="lg:col-span-4 p-6 rounded-2xl border border-lab-700 bg-lab-950 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-lab-800 pb-3">
              Order Financial Summary
            </h3>

            {summary.discountTotal > 0 && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Margin-Guarded Volume Discount
                </div>
                <p className="text-[11px] text-emerald-400/80">
                  Applied to items with 3+ packages without breaching the 25% minimum gross margin floor.
                </p>
              </div>
            )}

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-lab-300">
                <span>Subtotal ({totalUnits} total units)</span>
                <span className="text-white font-bold">{formatCurrency(summary.subtotal)}</span>
              </div>
              {summary.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Volume Tier Discount (20% OFF 3+ Pks)</span>
                  <span>-{formatCurrency(summary.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-lab-400 pt-2 border-t border-lab-800/80">
                <span>Decoupled Shipping</span>
                <span className="text-lab-400 italic">Calculated at Checkout</span>
              </div>
            </div>

            <div className="pt-3 border-t border-lab-800 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Estimated Subtotal</span>
              <span className="text-2xl font-black text-amber-400">
                {formatCurrency(summary.totalBeforeShipping)}
              </span>
            </div>

            <div className="space-y-2">
              <Link
                href="/checkout"
                className="w-full py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="w-full py-2.5 rounded-lg text-center text-xs text-lab-400 hover:text-white block transition"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
