"use client";

import React from "react";
import { LabelSize } from "@/types/custom-label";
import { STANDARD_LABEL_SIZES } from "@/config/custom-labels";
import { Check } from "lucide-react";

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
          1. Seleccionar Tamaño Die-Cut (Dimensiones)
        </span>
        <span className="text-[10px] text-gray-400 font-mono">9 Tamaños Estándar</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {STANDARD_LABEL_SIZES.map((size) => {
          const isSelected = selectedSize.id === size.id;
          const isRecommended = recommendedSizeId === size.id;

          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onSelectSize(size)}
              className={`p-2 sm:p-2.5 text-left transition relative border flex flex-col justify-between ${
                isSelected
                  ? "border-[#2B5F4A] bg-[#F6FAF8] text-gray-950 shadow-xs ring-1 ring-[#2B5F4A]"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-2 -right-1 text-[7px] font-bold tracking-wider px-1 py-0.2 uppercase bg-[#E8F0EC] text-[#2B5F4A] border border-[#C5DDD3]">
                  Ideal
                </span>
              )}

              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold uppercase tracking-tight text-gray-900">
                  {size.width}&quot; × {size.height}&quot;
                </span>
                {isSelected && <Check className="w-3 h-3 text-[#2B5F4A] shrink-0 ml-1" />}
              </div>
              <span className="text-[9px] text-gray-500 font-mono block mt-0.5">
                {size.widthCm.toFixed(1)} × {size.heightCm.toFixed(1)} cm
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
