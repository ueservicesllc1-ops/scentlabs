"use client";

import React from "react";
import { LabelMaterial } from "@/types/custom-label";
import { STANDARD_LABEL_MATERIALS } from "@/config/custom-labels";
import { Check, Sparkles } from "lucide-react";

interface LabelMaterialSelectorProps {
  selectedMaterial: LabelMaterial;
  onSelectMaterial: (material: LabelMaterial) => void;
}

export function LabelMaterialSelector({
  selectedMaterial,
  onSelectMaterial,
}: LabelMaterialSelectorProps) {
  return (
    <div className="space-y-3 font-mono">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-white uppercase">2. Select Substrate & Foil Finish</span>
        <span className="text-[11px] text-amber-400">Oil & Solvent Proof</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {STANDARD_LABEL_MATERIALS.map((material) => {
          const isSelected = selectedMaterial.id === material.id;

          return (
            <button
              key={material.id}
              type="button"
              onClick={() => onSelectMaterial(material)}
              className={`p-3.5 rounded-xl border text-left transition relative flex items-start gap-3 ${
                isSelected
                  ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10"
                  : "border-lab-800 bg-lab-950 text-lab-400 hover:border-lab-700 hover:text-white"
              }`}
            >
              {/* Color / Finish Swatch */}
              <div
                style={{ backgroundColor: material.hexColorPreview || "#E5A93C" }}
                className="w-5 h-5 rounded-full border border-lab-600 flex-shrink-0 mt-0.5 shadow-sm flex items-center justify-center text-[10px]"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{material.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                </div>
                <p className="text-[10px] text-lab-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {material.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
