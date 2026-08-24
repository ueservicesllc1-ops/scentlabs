"use client";

import React, { useState } from "react";
import { Check, ChevronDown, Square } from "lucide-react";

export type LabelBorderStyle = "none" | "full_edge" | "inset_margin";

export interface LabelBorderOption {
  id: LabelBorderStyle;
  name: string;
  description: string;
}

export const LABEL_BORDER_OPTIONS: LabelBorderOption[] = [
  {
    id: "none",
    name: "Sin Marco (Clean Cut)",
    description: "Diseño limpio sin líneas de marco alrededor de la etiqueta.",
  },
  {
    id: "full_edge",
    name: "Marco en el Borde Exterior",
    description: "Línea de marco ajustada al borde exterior de la etiqueta.",
  },
  {
    id: "inset_margin",
    name: "Marco Inset con Margen Interior",
    description: "Línea de marco elegante dejando un espacio / margen desde el borde.",
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
  const [isOpen, setIsOpen] = useState(false);

  const activeOption =
    LABEL_BORDER_OPTIONS.find((b) => b.id === selectedBorderStyle) || LABEL_BORDER_OPTIONS[0];

  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-center text-xs">
        <label className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900 flex items-center gap-1.5">
          <Square className="w-3.5 h-3.5 text-[#2B5F4A]" /> Marco del Diseño (Desplegable)
        </label>
        <span className="text-[10px] text-gray-400 font-mono">3 Estilos de Marco</span>
      </div>

      {/* Custom Dropdown Trigger Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 bg-gray-50 hover:bg-white border border-gray-200 focus:border-[#2B5F4A] transition flex items-center justify-between text-left shadow-xs"
        >
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
              {activeOption.id === "none" ? "Limpio" : activeOption.id === "full_edge" ? "Borde" : "Inset"}
            </span>
            <div>
              <span className="text-xs font-bold text-gray-900 block">{activeOption.name}</span>
              <span className="text-[10px] text-gray-500 font-light block">
                {activeOption.description}
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
              {LABEL_BORDER_OPTIONS.map((opt) => {
                const isSelected = selectedBorderStyle === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSelectBorderStyle(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 text-left transition flex items-center justify-between hover:bg-[#F6FAF8] ${
                      isSelected ? "bg-[#F6FAF8]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] uppercase font-bold text-gray-400 w-12">
                        {opt.id === "none" ? "SIN" : opt.id === "full_edge" ? "BORDE" : "INSET"}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">{opt.name}</span>
                        <span className="text-[10px] text-gray-500 font-light block">
                          {opt.description}
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
