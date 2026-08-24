"use client";

import React from "react";
import { ChevronDown, Type } from "lucide-react";

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
  const activeFont =
    LABEL_FONTS.find((f) => f.id === selectedFontId || f.family === selectedFontId) || LABEL_FONTS[0];

  return (
    <div className="space-y-2 flex flex-col justify-end">
      <div className="flex justify-between items-end text-xs min-h-[32px] pb-0.5">
        <label htmlFor="label-font-select" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-900 flex items-center gap-1.5 cursor-pointer leading-tight">
          <Type className="w-3.5 h-3.5 text-[#2B5F4A] shrink-0" />
          <span>Tipografía / Fuente</span>
        </label>
        <span className="text-[10px] text-gray-400 shrink-0 font-mono">10 Fuentes</span>
      </div>

      <div className="relative">
        <select
          id="label-font-select"
          value={activeFont.id}
          onChange={(e) => {
            const found = LABEL_FONTS.find((f) => f.id === e.target.value);
            if (found) onSelectFont(found);
          }}
          className="w-full h-11 px-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#2B5F4A] focus:outline-none transition text-xs font-bold text-gray-900 appearance-none cursor-pointer pr-8 shadow-xs truncate"
        >
          {LABEL_FONTS.map((font) => (
            <option key={font.id} value={font.id} className="p-2 text-xs">
              {font.name} ({font.category}) — {font.previewText}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
