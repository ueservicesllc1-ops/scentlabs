"use client";

import React from "react";
import { LabelMaterial } from "@/types/custom-label";
import { STANDARD_LABEL_MATERIALS } from "@/config/custom-labels";
import { ChevronDown, Sparkles } from "lucide-react";

interface LabelMaterialSelectorProps {
  selectedMaterial: LabelMaterial;
  onSelectMaterial: (material: LabelMaterial) => void;
}

export function LabelMaterialSelector({
  selectedMaterial,
  onSelectMaterial,
}: LabelMaterialSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <label htmlFor="label-material-select" className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900 flex items-center gap-1.5 cursor-pointer">
          <Sparkles className="w-3.5 h-3.5 text-[#2B5F4A]" /> Substrato / Material & Finish
        </label>
        <span className="text-[10px] text-gray-400">4 Acabados Base</span>
      </div>

      <div className="relative">
        <select
          id="label-material-select"
          value={selectedMaterial.id}
          onChange={(e) => {
            const found = STANDARD_LABEL_MATERIALS.find((m) => m.id === e.target.value);
            if (found) onSelectMaterial(found);
          }}
          className="w-full p-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#2B5F4A] focus:outline-none transition text-xs font-bold text-gray-900 appearance-none cursor-pointer pr-10 shadow-xs"
        >
          {STANDARD_LABEL_MATERIALS.map((mat) => (
            <option key={mat.id} value={mat.id} className="p-2 text-xs">
              {mat.name} ({mat.priceMultiplier ? `${mat.priceMultiplier}×` : "1.00×"}) — {mat.description}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
