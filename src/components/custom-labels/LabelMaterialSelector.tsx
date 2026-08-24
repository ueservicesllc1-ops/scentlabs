"use client";

import React, { useState } from "react";
import { LabelMaterial } from "@/types/custom-label";
import { STANDARD_LABEL_MATERIALS } from "@/config/custom-labels";
import { Check, ChevronDown, Sparkles } from "lucide-react";

interface LabelMaterialSelectorProps {
  selectedMaterial: LabelMaterial;
  onSelectMaterial: (material: LabelMaterial) => void;
}

export function LabelMaterialSelector({
  selectedMaterial,
  onSelectMaterial,
}: LabelMaterialSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center text-xs">
        <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#2B5F4A]" /> Substrato / Material & Foil (Desplegable)
        </label>
        <span className="text-[10px] text-gray-400">5 Acabados de Lujo</span>
      </div>

      {/* Custom Dropdown Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#2B5F4A] transition flex items-center justify-between text-left shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
              style={{ backgroundColor: selectedMaterial.hexColorPreview || "#18181B" }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900 block">{selectedMaterial.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  {selectedMaterial.priceMultiplier ? `${selectedMaterial.priceMultiplier}×` : "1.00×"}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 font-light block line-clamp-1">
                {selectedMaterial.description}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Options List */}
        {isOpen && (
          <>
            {/* Backdrop to close on outside click */}
            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />

            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-gray-100 font-sans">
              {STANDARD_LABEL_MATERIALS.map((mat) => {
                const isSelected = selectedMaterial.id === mat.id;

                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => {
                      onSelectMaterial(mat);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 text-left transition flex items-center justify-between hover:bg-[#F6FAF8] ${
                      isSelected ? "bg-[#F6FAF8]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300 shrink-0 shadow-xs"
                        style={{ backgroundColor: mat.hexColorPreview || "#18181B" }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 block">{mat.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 uppercase font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {mat.priceMultiplier ? `${mat.priceMultiplier}×` : "1.00×"}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-light block">
                          {mat.description}
                        </span>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-[#2B5F4A] shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
