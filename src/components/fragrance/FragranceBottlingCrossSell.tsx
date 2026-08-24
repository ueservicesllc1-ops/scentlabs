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
  const firstPkg = (rollOnProduct.packageOptions && rollOnProduct.packageOptions[0]) || {
    id: "pkg_default",
    name: "Default Pack",
    quantity: 1,
    price: rollOnProduct.basePrice,
    unitPrice: rollOnProduct.basePrice,
  };

  const handleAddBottle = (product: any) => {
    const pkg = (product.packageOptions && product.packageOptions[0]) || firstPkg;
    addItem(product, pkg, 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 2500);
  };

  return (
    <div className="p-6 border border-outline-variant bg-surface-container-low rounded-sm space-y-4 font-body-md">
      <div className="flex items-center gap-2 text-primary font-label-caps text-label-caps uppercase tracking-wider">
        <Box className="w-4 h-4 text-primary" /> Bottle Your Fragrance & Packaging
      </div>

      <p className="font-body-md text-body-md text-secondary leading-relaxed font-light">
        Ready to fraction into retail containers? Pair this fragrance with matched laboratory glass roll-ons and spray atomizers.
      </p>

      <div className="p-4 border border-outline-variant bg-surface rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-label-caps text-label-caps text-primary uppercase">{rollOnProduct.name}</h4>
          <p className="font-caption text-caption text-secondary mt-0.5 font-light">
            Heavy-base flint glass with stainless steel roller ball mechanism.
          </p>
          <div className="font-mono text-primary font-semibold text-xs mt-1">
            {formatCurrency(rollOnProduct.basePrice)} ({firstPkg.quantity}u Pack)
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleAddBottle(rollOnProduct)}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-label-caps uppercase transition rounded-sm flex items-center justify-center gap-1.5 shadow-xs ${
              addedIds.includes(rollOnProduct.id)
                ? "bg-emerald-700 text-white"
                : "flat-btn"
            }`}
          >
            {addedIds.includes(rollOnProduct.id) ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {addedIds.includes(rollOnProduct.id) ? "Added" : "Add Bottles"}
          </button>

          <Link
            href="/shop/bottles"
            className="px-3 py-2 border border-outline-variant bg-surface text-primary hover:border-primary text-xs font-label-caps uppercase transition rounded-sm flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
