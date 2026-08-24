"use client";

import React, { useState } from "react";
import { Type, ChevronDown, Check } from "lucide-react";

export interface LabelFontOption {
  id: string;
  name: string;
  family: string;
  category: "Serif" | "Sans" | "Script" | "Mono";
  previewText: string;
}

export const LABEL_FONTS: LabelFontOption[] = [
  { id: "font_bodoni", name: "Bodoni Moda", family: "'Bodoni Moda', serif", category: "Serif", previewText: "SANTAL IMPERIAL" },
  { id: "font_cinzel", name: "Cinzel Classical", family: "'Cinzel', serif", category: "Serif", previewText: "SANTAL IMPERIAL" },
  { id: "font_cormorant", name: "Cormorant Garamond", family: "'Cormorant Garamond', serif", category: "Serif", previewText: "SANTAL IMPERIAL" },
  { id: "font_playfair", name: "Playfair Display", family: "'Playfair Display', serif", category: "Serif", previewText: "SANTAL IMPERIAL" },
  { id: "font_marcellus", name: "Marcellus Elegance", family: "'Marcellus', serif", category: "Serif", previewText: "SANTAL IMPERIAL" },
  { id: "font_montserrat", name: "Montserrat Modern", family: "'Montserrat', sans-serif", category: "Sans", previewText: "SANTAL IMPERIAL" },
  { id: "font_inter", name: "Inter Studio", family: "'Inter', sans-serif", category: "Sans", previewText: "SANTAL IMPERIAL" },
  { id: "font_oswald", name: "Oswald Architectural", family: "'Oswald', sans-serif", category: "Sans", previewText: "SANTAL IMPERIAL" },
  { id: "font_pinyon", name: "Pinyon Script", family: "'Pinyon Script', cursive", category: "Script", previewText: "Santal Imperial" },
  { id: "font_mono", name: "Space Monospace", family: "'Space Mono', monospace", category: "Mono", previewText: "SANTAL IMPERIAL" },
];

interface LabelFontSelectorProps {
  selectedFontId: string;
  onSelectFont: (font: LabelFontOption) => void;
}

export function LabelFontSelector({
  selectedFontId,
  onSelectFont,
}: LabelFontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFont =
    LABEL_FONTS.find((f) => f.id === selectedFontId || f.family === selectedFontId) || LABEL_FONTS[0];

  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center text-xs">
        <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-[#2B5F4A]" /> Tipografía / Estilo de Fuente (Desplegable)
        </label>
        <span className="text-[10px] text-gray-400">10 Fuentes de Lujo</span>
      </div>

      {/* Custom Dropdown Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#2B5F4A] transition flex items-center justify-between text-left shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
              {activeFont.category}
            </span>
            <div>
              <span className="text-xs font-bold text-gray-900 block">{activeFont.name}</span>
              <span style={{ fontFamily: activeFont.family }} className="text-xs text-[#2B5F4A] block font-semibold">
                {activeFont.previewText}
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
              {LABEL_FONTS.map((font) => {
                const isSelected = activeFont.id === font.id;

                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => {
                      onSelectFont(font);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 text-left transition flex items-center justify-between hover:bg-[#F6FAF8] ${
                      isSelected ? "bg-[#F6FAF8]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] uppercase font-semibold text-gray-400 w-10">
                        {font.category}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-gray-900 block">{font.name}</span>
                        <span style={{ fontFamily: font.family }} className="text-xs text-[#2B5F4A] block">
                          {font.previewText}
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
