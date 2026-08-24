"use client";

import React from "react";
import { Check, Type } from "lucide-react";

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
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-[#2B5F4A]" /> Seleccionar Tipografía (10 Estilos Exclusivos)
        </span>
        <span className="text-[10px] text-gray-400">Actualiza la tipografía en el visor</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {LABEL_FONTS.map((font) => {
          const isSelected = selectedFontId === font.id || selectedFontId === font.family;

          return (
            <button
              key={font.id}
              type="button"
              onClick={() => onSelectFont(font)}
              className={`p-3 text-left transition relative border flex flex-col justify-between ${
                isSelected
                  ? "border-[#2B5F4A] bg-[#F6FAF8] text-gray-950 shadow-xs"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
              }`}
            >
              <div className="flex justify-between items-center w-full mb-1">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  {font.category}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#2B5F4A]" />}
              </div>

              <div
                style={{ fontFamily: font.family }}
                className="text-xs font-bold truncate my-1 text-gray-900"
              >
                {font.name}
              </div>

              <div
                style={{ fontFamily: font.family }}
                className="text-[11px] text-gray-600 truncate font-medium"
              >
                {font.previewText}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
