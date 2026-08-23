"use client";

import React from "react";
import Link from "next/link";
import { X, Trash2, ArrowRight, ShieldCheck, Tag, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeItem,
    updateQuantity,
    summary,
    totalUnits,
  } = useCart();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-lab-950 border-l border-lab-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-lab-800 flex items-center justify-between bg-lab-900/60">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                ORDER BATCH
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  {totalUnits} Units Total
                </span>
              </h2>
              <p className="text-xs text-lab-400 mt-0.5">Fractional quantities & custom items</p>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-md text-lab-400 hover:text-white hover:bg-lab-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-12 h-12 rounded-full bg-lab-900 border border-lab-800 flex items-center justify-center mx-auto text-lab-500">
                  <Tag className="w-6 h-6" />
                </div>
                <p className="text-sm text-lab-300 font-medium">Your batch is currently empty.</p>
                <p className="text-xs text-lab-500 max-w-xs mx-auto">
                  Add bottles, fractional pipettes, fragrance oils or custom labels to start.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-lab-800 text-white rounded hover:bg-lab-700 transition"
                >
                  Browse Supplies
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border bg-lab-900/50 space-y-3 transition ${
                    item.isLinkedToParent
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-lab-800"
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded bg-lab-800 border border-lab-700 flex-shrink-0 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/product/${item.productSlug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="text-xs font-semibold text-white hover:text-amber-400 line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-lab-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Package details */}
                      <div className="text-[11px] text-lab-400 mt-1 font-mono flex items-center gap-2">
                        <span className="px-1.5 py-0.2 bg-lab-800 text-lab-300 rounded">
                          Pack of {item.selectedPackage.quantity} ({formatCurrency(item.unitPrice)}/u)
                        </span>
                      </div>

                      {/* Custom label linkage badge */}
                      {item.isLinkedToParent && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                          <Sparkles className="w-3 h-3" />
                          <span>Matched to bottle in cart</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-lab-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-lab-400 text-[11px] font-mono">Packs:</span>
                      <div className="flex items-center border border-lab-700 rounded bg-lab-950">
                        <button
                          onClick={() => updateQuantity(item.id, item.packageCount - 1)}
                          className="px-2 py-0.5 text-lab-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-white font-mono text-xs">
                          {item.packageCount}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.packageCount + 1)}
                          className="px-2 py-0.5 text-lab-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-lab-500 text-[11px] font-mono">
                        ({item.totalUnits} units)
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-white font-mono">
                        {formatCurrency(item.totalLinePrice)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Financial Breakdown */}
          {items.length > 0 && (
            <div className="p-6 border-t border-lab-800 bg-lab-900/80 space-y-4">
              {/* Discount notifications & Margin guard alert */}
              {summary.discountTotal > 0 && (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">20% Volume Pack Discount Applied</span>
                    <p className="text-[11px] text-emerald-400/80">
                      Savings of {formatCurrency(summary.discountTotal)} verified by Margin Guard.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-lab-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{formatCurrency(summary.subtotal)}</span>
                </div>
                {summary.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Pack Discounts</span>
                    <span className="font-mono">-{formatCurrency(summary.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lab-400">
                  <span>Shipping</span>
                  <span className="text-lab-400 text-[11px] italic">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-lab-800">
                  <span>Total</span>
                  <span className="font-mono text-amber-400">
                    {formatCurrency(summary.totalBeforeShipping)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full py-2.5 rounded text-center text-xs font-bold uppercase tracking-wider bg-lab-800 text-white hover:bg-lab-700 transition block border border-lab-700"
                >
                  View Full Batch & Details
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="w-full py-3 rounded text-center text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
