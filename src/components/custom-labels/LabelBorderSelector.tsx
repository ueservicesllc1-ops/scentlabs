"use client";

import React from "react";
import { ChevronDown, Square } from "lucide-react";

export type LabelBorderStyle = "none" | "outer_edge" | "inner_edge" | "inset_margin";

export interface LabelBorderOption {
  id: LabelBorderStyle;
  name: string;
  description: string;
}

export const LABEL_BORDER_OPTIONS: LabelBorderOption[] = [
  {
    id: "none",
    name: "Sin Marco (Clean Cut)",
    description: "Diseño limpio sin líneas de marco.",
  },
  {
    id: "outer_edge",
    name: "Marco en el Borde Exterior Exacto",
    description: "Totalmente al límite exterior de corte (sin espacio).",
  },
  {
    id: "inner_edge",
    name: "Marco Interior",
    description: "Ajustado con un ligero espacio / margen interior.",
  },
  {
    id: "inset_margin",
    name: "Marco Inset Margen Amplio",
    description: "Marco flotante dejando un espacio interior más amplio.",
  },
];

interface LabelBorderSelectorProps {
  selectedBorderStyle: LabelBorderStyle;
  onSelectBorderStyle: (style: LabelBorderStyle) => void;
}

export function LabelBorderSelector({
  selectedBorderStyle,
  onSelectBorderStyle,
}: LabelBorderSelectorProps) {
  return (
    <div className="space-y-2 flex flex-col justify-end">
      <div className="flex justify-between items-end text-xs min-h-[32px] pb-0.5">
        <label htmlFor="label-border-select" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-900 flex items-center gap-1.5 cursor-pointer leading-tight">
          <Square className="w-3.5 h-3.5 text-[#2B5F4A] shrink-0" />
          <span>Marco del Diseño</span>
        </label>
        <span className="text-[10px] text-gray-400 shrink-0 font-mono">4 Estilos</span>
      </div>

      <div className="relative">
        <select
          id="label-border-select"
          value={selectedBorderStyle}
          onChange={(e) => onSelectBorderStyle(e.target.value as LabelBorderStyle)}
          className="w-full h-11 px-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#2B5F4A] focus:outline-none transition text-xs font-bold text-gray-900 appearance-none cursor-pointer pr-8 shadow-xs truncate"
        >
          {LABEL_BORDER_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id} className="p-2 text-xs">
              {opt.name} — {opt.description}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
