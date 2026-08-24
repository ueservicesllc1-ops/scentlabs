"use client";

import React from "react";
import { LabelMaterial } from "@/types/custom-label";
import { STANDARD_LABEL_MATERIALS } from "@/config/custom-labels";
import { Check } from "lucide-react";

interface LabelMaterialSelectorProps {
  selectedMaterial: LabelMaterial;
  onSelectMaterial: (material: LabelMaterial) => void;
}

export function LabelMaterialSelector({
  selectedMaterial,
  onSelectMaterial,
}: LabelMaterialSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900">2. Select Material & Finish</span>
        <span className="text-[10px] text-gray-500">
          Finish: <strong className="text-gray-900 font-semibold">{selectedMaterial.finishType.replace("_", " ")}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STANDARD_LABEL_MATERIALS.map((mat) => {
          const isSelected = selectedMaterial.id === mat.id;

          return (
            <button
              key={mat.id}
              type="button"
              onClick={() => onSelectMaterial(mat)}
              className={`p-4 border text-left transition flex items-start justify-between ${
                isSelected
                  ? "border-[#2B5F4A] bg-[#F6FAF8] text-gray-950 shadow-sm"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">{mat.name}</span>
                  {mat.finishType.includes("vinyl") && (
                    <span className="text-[9px] px-1.5 py-0.2 uppercase font-semibold bg-[#E8F0EC] text-[#2B5F4A] border border-[#C5DDD3]">
                      Oil-Proof
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                  {mat.description}
                </p>
              </div>

              {isSelected && <Check className="w-4 h-4 text-[#2B5F4A] shrink-0 ml-2 mt-0.5" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
