"use client";

import React from "react";
import { LabelMaterial, LabelSize } from "@/types/custom-label";
import { STANDARD_LABEL_QUANTITIES } from "@/config/custom-labels";
import { calculateLabelPricing } from "@/lib/custom-labels/pricing";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface LabelQuantitySelectorProps {
  selectedQuantity: number;
  onSelectQuantity: (qty: number) => void;
  size: LabelSize;
  material: LabelMaterial;
}

export function LabelQuantitySelector({
  selectedQuantity,
  onSelectQuantity,
  size,
  material,
}: LabelQuantitySelectorProps) {
  return (
    <div className="space-y-3 font-mono">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-white uppercase">3. Choose Production Volume</span>
        <span className="text-[11px] text-emerald-400 font-bold">Buy More, Save More</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {STANDARD_LABEL_QUANTITIES.map((qty) => {
          const pricing = calculateLabelPricing(size.width, size.height, qty, material.id);
          const isSelected = selectedQuantity === qty;

          return (
            <button
              key={qty}
              type="button"
              onClick={() => onSelectQuantity(qty)}
              className={`p-2.5 rounded-xl border text-center transition relative flex flex-col justify-between ${
                isSelected
                  ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10"
                  : "border-lab-800 bg-lab-950 text-lab-400 hover:border-lab-700 hover:text-white"
              }`}
            >
              {pricing.volumeTierSavingsPercent > 0 && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1 rounded-full mb-1">
                  -{pricing.volumeTierSavingsPercent}%
                </span>
              )}

              <div className="text-xs font-black text-white">{qty} units</div>
              <div className="text-[10px] text-amber-400 font-bold mt-1">
                {formatCurrency(pricing.totalPrice)}
              </div>
              <div className="text-[9px] text-lab-500">
                {formatUnitPrice(pricing.unitPrice)}/ea
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
