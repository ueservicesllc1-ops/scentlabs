"use client";

import React, { useState } from "react";
import Link from "next/link";
import { INITIAL_PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Box, Check, Plus, ArrowRight } from "lucide-react";

export function FragranceBottlingCrossSell() {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<string[]>([]);

  // 10ml Roll-On (Product #15) & 50ml Amber Bottle
  const rollOnProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_rollon_10ml") || INITIAL_PRODUCTS[14] || INITIAL_PRODUCTS[0];

  const handleAddBottle = (product: any) => {
    const pkg = product.packageOptions[0];
    addItem(product, pkg, 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 2500);
  };

  return (
    <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-lab-950 to-lab-950 space-y-4 font-mono">
      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
        <Box className="w-4 h-4" /> BOTTLE YOUR FRAGRANCE & PACKAGING
      </div>

      <p className="text-xs text-lab-300 leading-relaxed">
        Ready to fraction into retail containers? Pair this fragrance with matched laboratory glass roll-ons and spray atomizers.
      </p>

      <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-white uppercase">{rollOnProduct.name}</h4>
          <p className="text-[11px] text-lab-400 mt-0.5">
            Heavy-base flint glass with stainless steel roller ball mechanism.
          </p>
          <div className="text-amber-400 font-bold text-xs mt-1">
            {formatCurrency(rollOnProduct.basePrice)} ({rollOnProduct.packageOptions[0]?.quantity}u Pack)
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleAddBottle(rollOnProduct)}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded text-xs font-bold uppercase transition flex items-center justify-center gap-1 shadow ${
              addedIds.includes(rollOnProduct.id)
                ? "bg-emerald-500 text-lab-950"
                : "bg-amber-500 hover:bg-amber-400 text-lab-950"
            }`}
          >
            {addedIds.includes(rollOnProduct.id) ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {addedIds.includes(rollOnProduct.id) ? "Added" : "Add Bottles"}
          </button>

          <Link
            href="/shop/bottles"
            className="px-3 py-2 rounded bg-lab-900 border border-lab-700 text-lab-300 hover:text-white text-xs font-bold uppercase transition flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
