"use client";

import React, { useState } from "react";
import Link from "next/link";
import { INITIAL_PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { FlaskConical, Check, Plus, Sparkles, Layers } from "lucide-react";

export function FragranceTestingCrossSell() {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<string[]>([]);

  // Blotter Strips (Product #7), 5ml Atomizer, etc.
  const blotterProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_testing_strips") || INITIAL_PRODUCTS[6];
  const sampleAtomizer = INITIAL_PRODUCTS.find((p) => p.slug === "10ml-glass-atomizer-matte-black") || INITIAL_PRODUCTS[0];

  const handleAddProduct = (product: any) => {
    const pkg = product.packageOptions[0];
    addItem(product, pkg, 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 2500);
  };

  return (
    <div className="p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-lab-950 to-lab-950 space-y-4 font-mono">
      <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
        <FlaskConical className="w-4 h-4" /> TEST BEFORE YOU BUY & LAB PROTOCOL
      </div>

      <p className="text-xs text-lab-300 leading-relaxed">
        Ensure precise olfactive evaluation. Test top, heart, and base evaporation curves with lint-free blotters and micro-atomizers.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Blotter Strips */}
        <div className="p-3.5 rounded-xl border border-lab-800 bg-lab-900/60 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-white uppercase">{blotterProduct.name}</h4>
            <span className="text-[11px] text-amber-400 font-bold">
              {formatCurrency(blotterProduct.basePrice)} ({blotterProduct.packageOptions[0]?.quantity}u Pack)
            </span>
          </div>

          <button
            onClick={() => handleAddProduct(blotterProduct)}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition flex items-center gap-1 ${
              addedIds.includes(blotterProduct.id)
                ? "bg-emerald-500 text-lab-950"
                : "bg-indigo-500 hover:bg-indigo-400 text-white"
            }`}
          >
            {addedIds.includes(blotterProduct.id) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {addedIds.includes(blotterProduct.id) ? "Added" : "Add"}
          </button>
        </div>

        {/* Sample Atomizer */}
        <div className="p-3.5 rounded-xl border border-lab-800 bg-lab-900/60 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-white uppercase">{sampleAtomizer.name}</h4>
            <span className="text-[11px] text-amber-400 font-bold">
              {formatCurrency(sampleAtomizer.basePrice)} ({sampleAtomizer.packageOptions[0]?.quantity}u Pack)
            </span>
          </div>

          <button
            onClick={() => handleAddProduct(sampleAtomizer)}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition flex items-center gap-1 ${
              addedIds.includes(sampleAtomizer.id)
                ? "bg-emerald-500 text-lab-950"
                : "bg-indigo-500 hover:bg-indigo-400 text-white"
            }`}
          >
            {addedIds.includes(sampleAtomizer.id) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {addedIds.includes(sampleAtomizer.id) ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
