"use client";

import React from "react";
import { LABEL_TEXT_COLORS, LabelTextColorOption } from "@/config/custom-labels";
import { ChevronDown, Palette } from "lucide-react";

interface LabelTextColorSelectorProps {
  selectedTextColor: LabelTextColorOption;
  onSelectTextColor: (color: LabelTextColorOption) => void;
}

export function LabelTextColorSelector({
  selectedTextColor,
  onSelectTextColor,
}: LabelTextColorSelectorProps) {
  return (
    <div className="space-y-2 flex flex-col justify-end">
      <div className="flex justify-between items-end text-xs min-h-[32px] pb-0.5">
        <label htmlFor="label-textcolor-select" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-900 flex items-center gap-1.5 cursor-pointer leading-tight">
          <Palette className="w-3.5 h-3.5 text-[#2B5F4A] shrink-0" />
          <span>Color Texto / Foil</span>
        </label>
        <span className="text-[10px] text-gray-400 shrink-0 font-mono">4 Colores</span>
      </div>

      <div className="relative">
        <select
          id="label-textcolor-select"
          value={selectedTextColor.id}
          onChange={(e) => {
            const found = LABEL_TEXT_COLORS.find((c) => c.id === e.target.value);
            if (found) onSelectTextColor(found);
          }}
          className="w-full h-11 px-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#2B5F4A] focus:outline-none transition text-xs font-bold text-gray-900 appearance-none cursor-pointer pr-8 shadow-xs truncate"
        >
          {LABEL_TEXT_COLORS.map((color) => (
            <option key={color.id} value={color.id} className="p-2 text-xs">
              {color.name} ({color.multiplier > 1.0 ? `Foil ${color.multiplier}×` : "Tinta Estándar"})
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
