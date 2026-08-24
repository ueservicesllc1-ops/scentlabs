"use client";

import React, { useState } from "react";
import { LABEL_TEXT_COLORS, LabelTextColorOption } from "@/config/custom-labels";
import { Check, ChevronDown, Palette } from "lucide-react";

interface LabelTextColorSelectorProps {
  selectedTextColor: LabelTextColorOption;
  onSelectTextColor: (color: LabelTextColorOption) => void;
}

export function LabelTextColorSelector({
  selectedTextColor,
  onSelectTextColor,
}: LabelTextColorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center text-xs">
        <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-[#2B5F4A]" /> Color de Texto / Foil Stamp (Desplegable)
        </label>
        <span className="text-[10px] text-gray-400 font-mono">4 Colores Disponibles</span>
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
              className="w-4 h-4 rounded-full border border-gray-300 shrink-0 shadow-xs"
              style={{ backgroundColor: selectedTextColor.hex }}
            />
            <div>
              <span className="text-xs font-bold text-gray-900 block">{selectedTextColor.name}</span>
              <span className="text-[10px] text-gray-500 font-mono block uppercase">
                Tinta / Stamp: {selectedTextColor.type} {selectedTextColor.multiplier > 1.0 ? `(${selectedTextColor.multiplier}×)` : ""}
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
              {LABEL_TEXT_COLORS.map((color) => {
                const isSelected = selectedTextColor.id === color.id;

                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      onSelectTextColor(color);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 text-left transition flex items-center justify-between hover:bg-[#F6FAF8] ${
                      isSelected ? "bg-[#F6FAF8]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border border-gray-300 shrink-0 shadow-xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">{color.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono block uppercase">
                          Acabado: {color.type} {color.multiplier > 1.0 ? `(Tarifa Foil ${color.multiplier}×)` : "(Estándar)"}
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
