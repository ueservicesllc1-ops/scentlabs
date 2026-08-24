"use client";

import React from "react";
import { LabelSize } from "@/types/custom-label";
import { STANDARD_LABEL_SIZES } from "@/config/custom-labels";
import { ChevronDown, Maximize2 } from "lucide-react";

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
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <label htmlFor="label-size-select" className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900 flex items-center gap-1.5 cursor-pointer">
          <Maximize2 className="w-3.5 h-3.5 text-[#2B5F4A]" /> Tamaño Die-Cut / Dimensiones
        </label>
        <span className="text-[10px] text-gray-400 font-mono">9 Tamaños Disponibles</span>
      </div>

      <div className="relative">
        <select
          id="label-size-select"
          value={selectedSize.id}
          onChange={(e) => {
            const found = STANDARD_LABEL_SIZES.find((s) => s.id === e.target.value);
            if (found) onSelectSize(found);
          }}
          className="w-full p-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#2B5F4A] focus:outline-none transition text-xs font-bold text-gray-900 appearance-none cursor-pointer pr-10 shadow-xs"
        >
          {STANDARD_LABEL_SIZES.map((size) => (
            <option key={size.id} value={size.id} className="p-2 text-xs">
              {size.width}&quot; × {size.height}&quot; ({size.name}) — {size.widthCm.toFixed(1)} × {size.heightCm.toFixed(1)} cm {recommendedSizeId === size.id ? "★ Recomendado" : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
