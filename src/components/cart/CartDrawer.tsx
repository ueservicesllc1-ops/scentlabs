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
    <div className="fixed inset-0 z-50 overflow-hidden font-body-md text-on-surface">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#111111]/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-outline-variant flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
            <div>
              <h2 className="font-label-caps text-label-caps text-primary uppercase flex items-center gap-2">
                Order Selection
                <span className="text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded-sm">
                  {totalUnits} Units
                </span>
              </h2>
              <p className="text-xs text-secondary mt-0.5">Wholesale compounding batch</p>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-sm text-secondary hover:text-primary hover:bg-surface-container transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center mx-auto text-secondary">
                  <Tag className="w-5 h-5" />
                </div>
                <p className="font-body-md text-body-md text-primary font-medium">Your bag is empty.</p>
                <p className="font-caption text-caption text-secondary max-w-xs mx-auto">
                  Add custom formulation bottles, packaging materials, or custom labels.
                </p>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="outline-btn px-6 py-2.5 text-xs font-semibold uppercase"
                >
                  Browse Supplies
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-sm border border-outline-variant bg-surface-container-lowest flex flex-col gap-3"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-20 bg-surface-container border border-outline-variant flex-shrink-0 overflow-hidden relative rounded-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <Link
                          href={`/product/${item.productSlug}`}
                          onClick={() => setIsCartDrawerOpen(false)}
                          className="font-body-md text-body-md text-primary font-medium hover:underline underline-offset-4 line-clamp-2"
                        >
                          {item.productName}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-secondary hover:text-error transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Package details */}
                      <div className="text-[11px] text-secondary mt-1 flex flex-wrap gap-2">
                        <span className="px-1.5 py-0.5 bg-surface-container border border-outline-variant/60 rounded-sm">
                          Pack of {item.selectedPackage.quantity} (${item.unitPrice.toFixed(2)}/u)
                        </span>
                      </div>

                      {item.isLinkedToParent && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-primary font-medium">
                          <Sparkles className="w-3 h-3" />
                          <span>Linked to bottle</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-secondary text-[11px]">Qty:</span>
                      <div className="flex items-center border border-outline-variant rounded-sm bg-surface">
                        <button
                          onClick={() => updateQuantity(item.id, item.packageCount - 1)}
                          className="px-2 py-0.5 text-primary hover:bg-surface-container transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-primary font-medium">
                          {item.packageCount}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.packageCount + 1)}
                          className="px-2 py-0.5 text-primary hover:bg-surface-container transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-secondary text-[11px]">
                        ({item.totalUnits} units)
                      </span>
                    </div>

                    <div>
                      <span className="font-body-md text-body-md text-primary font-medium">
                        {formatCurrency(item.totalLinePrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Financial Breakdown */}
          {items.length > 0 && (
            <div className="p-6 border-t border-outline-variant bg-surface-container-low space-y-4">
              {summary.discountTotal > 0 && (
                <div className="p-2.5 rounded-sm bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Volume Tier Savings Applied</span>
                    <p className="text-[11px] text-emerald-700/80">
                      Savings of {formatCurrency(summary.discountTotal)} computed.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal</span>
                  <span className="text-primary font-medium">{formatCurrency(summary.subtotal)}</span>
                </div>
                {summary.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Wholesale Discounts</span>
                    <span>-{formatCurrency(summary.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-secondary">
                  <span>US Freight</span>
                  <span className="italic">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-outline-variant">
                  <span>Total Due</span>
                  <span>{formatCurrency(summary.totalBeforeShipping)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/cart"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="outline-btn w-full py-2.5 text-center text-xs uppercase"
                >
                  View Full Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="flat-btn w-full py-3 text-center text-xs uppercase flex items-center justify-center gap-2"
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
