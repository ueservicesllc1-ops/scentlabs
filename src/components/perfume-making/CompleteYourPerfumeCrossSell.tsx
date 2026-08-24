"use client";

import React, { useState } from "react";
import { INITIAL_PERFUME_BASES } from "@/data/perfume-making";
import { INITIAL_PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, Check, Plus } from "lucide-react";

export function CompleteYourPerfumeCrossSell() {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const baseProduct = INITIAL_PERFUME_BASES[0];
  const rollOnProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_rollon_10ml") || INITIAL_PRODUCTS[14] || INITIAL_PRODUCTS[0];
  const pipetteProduct = INITIAL_PRODUCTS.find((p) => p.slug === "3ml-plastic-pipettes") || INITIAL_PRODUCTS[5] || INITIAL_PRODUCTS[0];

  const getProductFirstPkg = (prod: any) => {
    return (prod.packageOptions && prod.packageOptions[0]) || {
      id: `pkg_${prod.id}_def`,
      name: "Default Pack",
      quantity: 1,
      price: prod.basePrice || 10,
      unitPrice: prod.basePrice || 10,
    };
  };

  const handleAddProduct = (prod: any) => {
    const pkg = getProductFirstPkg(prod);
    addItem(prod, pkg, 1);
    setAddedIds((prev) => [...prev, prod.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== prod.id));
    }, 2500);
  };

  const rollOnPkg = getProductFirstPkg(rollOnProduct);
  const pipettePkg = getProductFirstPkg(pipetteProduct);

  return (
    <div className="p-6 border border-outline-variant bg-surface-container-low rounded-sm space-y-4 font-body-md">
      <div className="flex items-center gap-2 text-primary font-label-caps text-label-caps uppercase tracking-wider">
        <Sparkles className="w-4 h-4 text-primary" /> Complete Your Compounding Order
      </div>

      <p className="font-body-md text-body-md text-secondary leading-relaxed font-light">
        Formulating an Eau de Parfum or Roll-On? Add perfumer&apos;s base alcohol, matched containers, and graduated pipettes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
        {/* 1. Perfume Base */}
        <div className="p-4 border border-outline-variant bg-surface rounded-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="font-label-caps text-[10px] text-secondary uppercase block">Perfumer&apos;s Alcohol</span>
            <h4 className="font-label-caps text-label-caps text-primary uppercase mt-0.5">{baseProduct.name}</h4>
            <span className="font-mono text-primary font-semibold text-xs mt-1 block">{formatCurrency(21.99)} (1 Liter)</span>
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
            className={`w-full py-2 text-xs font-label-caps uppercase transition rounded-sm flex items-center justify-center gap-1 shadow-xs ${
              addedIds.includes(baseProduct.id)
                ? "bg-emerald-700 text-white"
                : "flat-btn"
            }`}
          >
            {addedIds.includes(baseProduct.id) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {addedIds.includes(baseProduct.id) ? "Added" : "Add 1L Base"}
          </button>
        </div>

        {/* 2. 10ml Roll-Ons */}
        <div className="p-4 border border-outline-variant bg-surface rounded-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="font-label-caps text-[10px] text-secondary uppercase block">Flint Glass Roll-Ons</span>
            <h4 className="font-label-caps text-label-caps text-primary uppercase mt-0.5">{rollOnProduct.name}</h4>
            <span className="font-mono text-primary font-semibold text-xs mt-1 block">
              {formatCurrency(rollOnProduct.basePrice)} ({rollOnPkg.quantity}u Pack)
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleAddProduct(rollOnProduct)}
            className={`w-full py-2 text-xs font-label-caps uppercase transition rounded-sm flex items-center justify-center gap-1 shadow-xs ${
              addedIds.includes(rollOnProduct.id)
                ? "bg-emerald-700 text-white"
                : "flat-btn"
            }`}
          >
            {addedIds.includes(rollOnProduct.id) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {addedIds.includes(rollOnProduct.id) ? "Added" : "Add Bottles"}
          </button>
        </div>

        {/* 3. 3ml Pipettes */}
        <div className="p-4 border border-outline-variant bg-surface rounded-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="font-label-caps text-[10px] text-secondary uppercase block">Transfer Pipettes</span>
            <h4 className="font-label-caps text-label-caps text-primary uppercase mt-0.5">{pipetteProduct.name}</h4>
            <span className="font-mono text-primary font-semibold text-xs mt-1 block">
              {formatCurrency(pipetteProduct.basePrice)} ({pipettePkg.quantity}u Pack)
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleAddProduct(pipetteProduct)}
            className={`w-full py-2 text-xs font-label-caps uppercase transition rounded-sm flex items-center justify-center gap-1 shadow-xs ${
              addedIds.includes(pipetteProduct.id)
                ? "bg-emerald-700 text-white"
                : "flat-btn"
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
