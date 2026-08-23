"use client";

import React, { useState } from "react";
import Link from "next/link";
import { INITIAL_PERFUME_BASES } from "@/data/perfume-making";
import { INITIAL_PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { Sparkles, ShoppingBag, Check, Plus, ArrowRight, FlaskConical, Box, Tag } from "lucide-react";

export function CompleteYourPerfumeCrossSell() {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const baseProduct = INITIAL_PERFUME_BASES[0];
  const rollOnProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_rollon_10ml") || INITIAL_PRODUCTS[14];
  const pipetteProduct = INITIAL_PRODUCTS.find((p) => p.slug === "3ml-plastic-pipettes") || INITIAL_PRODUCTS[5];

  const handleAddProduct = (prod: any, pkgIndex: number = 0) => {
    const pkg = prod.packageOptions ? prod.packageOptions[pkgIndex] : {
      id: "pkg_1L",
      quantity: 1,
      price: 21.99,
      unitPrice: 21.99,
    };

    addItem(prod, pkg, 1);
    setAddedIds((prev) => [...prev, prod.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== prod.id));
    }, 2500);
  };

  return (
    <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-lab-950 to-lab-950 space-y-4 font-mono">
      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
        <Sparkles className="w-4 h-4" /> COMPLETE YOUR PERFUME LINE & SUPPLIES
      </div>

      <p className="text-xs text-lab-300 leading-relaxed">
        Formulating an Eau de Parfum or Roll-On? Add perfumer&apos;s base alcohol, matched containers, and graduated pipettes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
        {/* 1. Perfume Base */}
        <div className="p-3.5 rounded-xl border border-lab-800 bg-lab-900/60 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase block">Perfumer&apos;s Alcohol</span>
            <h4 className="font-bold text-white uppercase">{baseProduct.name}</h4>
            <span className="text-amber-400 font-bold">{formatCurrency(21.99)} (1 Liter Bottle)</span>
          </div>

          <button
            type="button"
            onClick={() =>
              handleAddProduct({
                id: baseProduct.id,
                name: "Nature's Oil Perfumer's Alcohol (1L)",
                slug: baseProduct.slug,
                category: "testing",
                basePrice: 21.99,
                media: [{ url: baseProduct.primaryImage, type: "image", isPrimary: true, altText: baseProduct.name }],
                packageOptions: [{ id: "pkg_1L", quantity: 1, price: 21.99, unitPrice: 21.99 }],
              })
            }
            className={`w-full py-2 rounded text-xs font-bold uppercase transition flex items-center justify-center gap-1 ${
              addedIds.includes(baseProduct.id)
                ? "bg-emerald-500 text-lab-950"
                : "bg-indigo-500 hover:bg-indigo-400 text-white"
            }`}
          >
            {addedIds.includes(baseProduct.id) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {addedIds.includes(baseProduct.id) ? "Added" : "Add 1L Base"}
          </button>
        </div>

        {/* 2. 10ml Roll-Ons */}
        <div className="p-3.5 rounded-xl border border-lab-800 bg-lab-900/60 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase block">Flint Glass Roll-Ons</span>
            <h4 className="font-bold text-white uppercase">{rollOnProduct.name}</h4>
            <span className="text-amber-400 font-bold">
              {formatCurrency(rollOnProduct.basePrice)} ({rollOnProduct.packageOptions[0]?.quantity}u Pack)
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleAddProduct(rollOnProduct, 0)}
            className={`w-full py-2 rounded text-xs font-bold uppercase transition flex items-center justify-center gap-1 ${
              addedIds.includes(rollOnProduct.id)
                ? "bg-emerald-500 text-lab-950"
                : "bg-amber-500 hover:bg-amber-400 text-lab-950"
            }`}
          >
            {addedIds.includes(rollOnProduct.id) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {addedIds.includes(rollOnProduct.id) ? "Added" : "Add Bottles"}
          </button>
        </div>

        {/* 3. 3ml Pipettes */}
        <div className="p-3.5 rounded-xl border border-lab-800 bg-lab-900/60 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase block">Transfer Tools</span>
            <h4 className="font-bold text-white uppercase">{pipetteProduct.name}</h4>
            <span className="text-amber-400 font-bold">
              {formatCurrency(pipetteProduct.basePrice)} ({pipetteProduct.packageOptions[0]?.quantity}u Pack)
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleAddProduct(pipetteProduct, 0)}
            className={`w-full py-2 rounded text-xs font-bold uppercase transition flex items-center justify-center gap-1 ${
              addedIds.includes(pipetteProduct.id)
                ? "bg-emerald-500 text-lab-950"
                : "bg-indigo-500 hover:bg-indigo-400 text-white"
            }`}
          >
            {addedIds.includes(pipetteProduct.id) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {addedIds.includes(pipetteProduct.id) ? "Added" : "Add Pipettes"}
          </button>
        </div>
      </div>
    </div>
  );
}
