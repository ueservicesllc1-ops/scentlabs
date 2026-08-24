"use client";

import React from "react";
import { LabelSize } from "@/types/custom-label";
import { STANDARD_LABEL_SIZES } from "@/config/custom-labels";
import { Check, Sparkles } from "lucide-react";

interface LabelSizeSelectorProps {
  selectedSize: LabelSize;
  onSelectSize: (size: LabelSize) => void;
  recommendedSizeId?: string;
}

export function LabelSizeSelector({
  selectedSize,
  onSelectSize,
  recommendedSizeId,
}: LabelSizeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900">
          1. Select Die-Cut Size
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {STANDARD_LABEL_SIZES.map((size) => {
          const isSelected = selectedSize.id === size.id;
          const isRecommended = recommendedSizeId === size.id;

          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onSelectSize(size)}
              className={`p-3 text-left transition relative border flex items-center justify-between ${
                isSelected
                  ? "border-[#2B5F4A] bg-[#F6FAF8] text-gray-950 shadow-xs"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-2 -right-1 text-[8px] font-semibold tracking-wider px-1.5 py-0.2 uppercase flex items-center gap-0.5 bg-[#E8F0EC] text-[#2B5F4A] border border-[#C5DDD3]">
                  <Sparkles className="w-2.5 h-2.5" /> Best Fit
                </span>
              )}

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider block">
                  {size.width}&quot; × {size.height}&quot;
                </span>
                <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                  {size.widthCm.toFixed(1)} × {size.heightCm.toFixed(1)} cm
                </span>
              </div>

              {isSelected && <Check className="w-4 h-4 text-[#2B5F4A] shrink-0 ml-2" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
