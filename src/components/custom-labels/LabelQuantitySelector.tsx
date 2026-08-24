"use client";

import React from "react";
import { LabelSize, LabelMaterial } from "@/types/custom-label";
import { calculateLabelPricing } from "@/lib/custom-labels/pricing";
import { STANDARD_LABEL_QUANTITIES } from "@/config/custom-labels";
import { Check } from "lucide-react";

interface LabelQuantitySelectorProps {
  selectedQuantity: number;
  onSelectQuantity: (quantity: number) => void;
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
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900">
          3. Select Production Batch
        </span>
        <span className="text-[10px] text-emerald-800 font-medium">
          Volume Discount Applied
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {STANDARD_LABEL_QUANTITIES.map((qty) => {
          const pricing = calculateLabelPricing(size.width, size.height, qty, material.id);
          const isSelected = selectedQuantity === qty;

          return (
            <button
              key={qty}
              type="button"
              onClick={() => onSelectQuantity(qty)}
              className={`p-3 text-left transition flex flex-col justify-between border ${
                isSelected
                  ? "border-[#2B5F4A] bg-[#F6FAF8] text-gray-950 shadow-xs"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider">{qty} Labels</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#2B5F4A]" />}
              </div>

              <div className={`mt-2 pt-2 border-t flex flex-col font-mono text-[11px] ${
                isSelected ? "border-[#2B5F4A]/20" : "border-gray-100"
              }`}>
                <span className={`font-semibold ${isSelected ? "text-[#2B5F4A]" : "text-gray-900"}`}>
                  ${pricing.totalPrice.toFixed(2)}
                </span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? "text-[#2B5F4A]/80" : "text-gray-400"}`}>
                  ${pricing.unitPrice.toFixed(2)} / label
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
