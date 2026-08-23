"use client";

import React, { useState, useEffect } from "react";
import { ProductPackage, VolumePriceTier } from "@/types";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { Check, Sparkles, TrendingDown, Layers } from "lucide-react";

interface VolumePricingTableProps {
  packageOptions: ProductPackage[];
  selectedPackage: ProductPackage;
  onSelectPackage: (pkg: ProductPackage) => void;
  volumePricing?: VolumePriceTier[];
  unit?: string;
  onCustomQuantityChange?: (qty: number, pricePerUnit: number, totalPrice: number) => void;
}

export function VolumePricingTable({
  packageOptions,
  selectedPackage,
  onSelectPackage,
  volumePricing,
  unit = "unit",
  onCustomQuantityChange,
}: VolumePricingTableProps) {
  const [customQty, setCustomQty] = useState<number>(selectedPackage.quantity);
  const highestUnitPrice = Math.max(...packageOptions.map((p) => p.unitPrice));

  // Determine applicable unit price based on volume tiers or packages
  const getActiveTierPrice = (qty: number) => {
    if (volumePricing && volumePricing.length > 0) {
      const sorted = [...volumePricing].sort((a, b) => b.minQuantity - a.minQuantity);
      const match = sorted.find((tier) => qty >= tier.minQuantity);
      return match ? match.unitPrice : highestUnitPrice;
    }
    const matchingPkg = packageOptions.find((p) => p.quantity === qty);
    if (matchingPkg) return matchingPkg.unitPrice;

    // Fallback interpolator
    const sortedPackages = [...packageOptions].sort((a, b) => b.quantity - a.quantity);
    const tierMatch = sortedPackages.find((p) => qty >= p.quantity);
    return tierMatch ? tierMatch.unitPrice : highestUnitPrice;
  };

  const handleCustomQtyChange = (val: number) => {
    const qty = Math.max(1, isNaN(val) ? 1 : val);
    setCustomQty(qty);
    const unitPrice = getActiveTierPrice(qty);
    const totalPrice = qty * unitPrice;

    // Check if it matches an exact package
    const exactPkg = packageOptions.find((p) => p.quantity === qty);
    if (exactPkg) {
      onSelectPackage(exactPkg);
    } else {
      onSelectPackage({
        id: `custom_pkg_${qty}`,
        quantity: qty,
        price: totalPrice,
        unitPrice: unitPrice,
      });
    }

    if (onCustomQuantityChange) {
      onCustomQuantityChange(qty, unitPrice, totalPrice);
    }
  };

  useEffect(() => {
    setCustomQty(selectedPackage.quantity);
  }, [selectedPackage]);

  return (
    <div className="space-y-4 font-mono">
      <div className="flex items-center justify-between border-b border-lab-800 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">
            BUY MORE, SAVE MORE
          </span>
        </div>
        <span className="text-[10px] text-lab-400 uppercase">
          Wholesale Fractional Tiers
        </span>
      </div>

      {/* Package / Volume Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {packageOptions.map((pkg) => {
          const isSelected = selectedPackage.quantity === pkg.quantity;
          const savings =
            highestUnitPrice > pkg.unitPrice
              ? Math.round(((highestUnitPrice - pkg.unitPrice) / highestUnitPrice) * 100)
              : 0;

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => {
                onSelectPackage(pkg);
                setCustomQty(pkg.quantity);
              }}
              className={`p-3 rounded-lg border text-left transition flex flex-col justify-between relative ${
                isSelected
                  ? "border-amber-500 bg-amber-500/15 ring-1 ring-amber-500 shadow-md shadow-amber-500/10"
                  : "border-lab-800 bg-lab-950/60 hover:border-lab-700 hover:bg-lab-900/60"
              }`}
            >
              {savings > 0 && (
                <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  -{savings}%
                </span>
              )}

              <div>
                <div className="text-sm font-bold text-white">
                  {pkg.quantity} {unit}s
                </div>
                <div className="text-xs text-amber-400 font-bold mt-0.5">
                  {formatUnitPrice(pkg.unitPrice)} each
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-lab-800/80 flex items-baseline justify-between text-[11px]">
                <span className="text-lab-500">Pack:</span>
                <span className="font-bold text-lab-200">
                  {formatCurrency(pkg.price)}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Manual Quantity Input */}
      <div className="p-3 rounded-lg border border-lab-800 bg-lab-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <label className="block text-lab-300 font-bold uppercase text-[10px]">
            Custom Quantity Calculator
          </label>
          <p className="text-[10px] text-lab-500">
            Enter any exact count to automatically apply active volume discount tier.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="number"
            min={1}
            value={customQty}
            onChange={(e) => handleCustomQtyChange(parseInt(e.target.value))}
            className="w-24 bg-lab-950 border border-lab-700 rounded px-2.5 py-1.5 text-white font-bold text-center focus:outline-none focus:border-amber-500"
          />
          <span className="text-lab-400 text-xs font-mono">{unit}s</span>
          <div className="text-right pl-2 border-l border-lab-800">
            <span className="text-[10px] text-lab-500 block">Total</span>
            <span className="text-sm font-bold text-amber-400">
              {formatCurrency(selectedPackage.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
