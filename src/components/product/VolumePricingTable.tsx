"use client";

import React, { useState } from "react";
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

  const getActiveTierPrice = (qty: number) => {
    if (volumePricing && volumePricing.length > 0) {
      const sorted = [...volumePricing].sort((a, b) => b.minQuantity - a.minQuantity);
      const match = sorted.find((tier) => qty >= tier.minQuantity);
      return match ? match.unitPrice : highestUnitPrice;
    }
    const matchingPkg = packageOptions.find((p) => p.quantity === qty);
    if (matchingPkg) return matchingPkg.unitPrice;

    const sortedPackages = [...packageOptions].sort((a, b) => b.quantity - a.quantity);
    const tierMatch = sortedPackages.find((p) => qty >= p.quantity);
    return tierMatch ? tierMatch.unitPrice : highestUnitPrice;
  };

  const handleCustomQtyChange = (val: number) => {
    const qty = Math.max(1, isNaN(val) ? 1 : val);
    setCustomQty(qty);
    const unitPrice = getActiveTierPrice(qty);
    const totalPrice = qty * unitPrice;

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

  return (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-stone-900 tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-700" /> Fractional Pack Options & Volume Tiers
        </span>
        <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Wholesale Scale Enabled
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {packageOptions.map((pkg) => {
          const isSelected = selectedPackage.id === pkg.id;
          const savingsPercentage =
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
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between relative ${
                isSelected
                  ? "border-stone-900 bg-stone-900 text-white shadow-md"
                  : "border-[#e5dfd5] bg-white text-stone-800 hover:border-amber-700"
              }`}
            >
              {savingsPercentage > 0 && (
                <span className={`absolute -top-2 -right-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm ${
                  isSelected ? "bg-amber-400 text-black" : "bg-emerald-600 text-white"
                }`}>
                  Save {savingsPercentage}%
                </span>
              )}

              <div>
                <span className="font-serif text-lg font-bold block">
                  {pkg.name || `${pkg.quantity} ${unit}s`}
                </span>
                <span className={`text-[10px] font-mono ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                  ${pkg.unitPrice.toFixed(3)} / unit
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-inherit flex items-baseline justify-between">
                <span className={`font-serif text-xl font-bold ${isSelected ? "text-amber-300" : "text-stone-950"}`}>
                  ${pkg.price.toFixed(2)}
                </span>
                {isSelected && <Check className="w-4 h-4 text-amber-300" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
