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
    <div className="space-y-3 font-mono">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-white uppercase">1. Select Die-Cut Size</span>
        <span className="text-[11px] text-lab-400">
          Current Area: <strong className="text-amber-400">{selectedSize.area} sq in</strong>
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
              className={`p-3 rounded-xl border text-left transition relative flex flex-col justify-between ${
                isSelected
                  ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10"
                  : "border-lab-800 bg-lab-950 text-lab-400 hover:border-lab-700 hover:text-white"
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-2 -right-1 bg-amber-500 text-lab-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Best Fit
                </span>
              )}

              <div>
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{size.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <div className="text-[10px] text-lab-500 mt-0.5">
                  {size.widthCm} × {size.heightCm} cm
                </div>
              </div>

              <div className="text-[10px] font-mono text-lab-400 mt-2 pt-1.5 border-t border-lab-800/80 flex justify-between">
                <span>{size.area} sq in</span>
                <span className="text-lab-500 text-[9px]">Die-Cut</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
