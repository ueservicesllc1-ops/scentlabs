"use client";

import React, { useState } from "react";
import { LabelSize } from "@/types/custom-label";
import { STANDARD_LABEL_SIZES } from "@/config/custom-labels";
import { Check, ChevronDown, Maximize2 } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center text-xs">
        <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900 flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-[#2B5F4A]" /> Tamaño Die-Cut / Dimensiones (Desplegable)
        </label>
        <span className="text-[10px] text-gray-400 font-mono">9 Tamaños Disponibles</span>
      </div>

      {/* Dropdown Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#2B5F4A] transition flex items-center justify-between text-left shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded font-mono">
              {selectedSize.width}&quot; × {selectedSize.height}&quot;
            </span>
            <div>
              <span className="text-xs font-bold text-gray-900 block">{selectedSize.name}</span>
              <span className="text-[10px] text-gray-500 font-mono block">
                {selectedSize.widthCm.toFixed(1)} × {selectedSize.heightCm.toFixed(1)} cm
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
              {STANDARD_LABEL_SIZES.map((size) => {
                const isSelected = selectedSize.id === size.id;
                const isRecommended = recommendedSizeId === size.id;

                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => {
                      onSelectSize(size);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 text-left transition flex items-center justify-between hover:bg-[#F6FAF8] ${
                      isSelected ? "bg-[#F6FAF8]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 border border-gray-200 px-2 py-1 rounded font-mono w-24 text-center">
                        {size.width}&quot; × {size.height}&quot;
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 block">{size.name}</span>
                          {isRecommended && (
                            <span className="text-[8px] font-bold tracking-wider px-1.5 py-0.2 uppercase bg-[#E8F0EC] text-[#2B5F4A] border border-[#C5DDD3]">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono block">
                          {size.widthCm.toFixed(1)} × {size.heightCm.toFixed(1)} cm • {size.area} sq in
                        </span>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-[#2B5F4A]" />}
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
