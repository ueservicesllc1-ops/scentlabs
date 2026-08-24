"use client";

import React, { useState } from "react";
import { INITIAL_PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { FlaskConical, Check, Plus } from "lucide-react";

export function FragranceTestingCrossSell() {
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<string[]>([]);

  // Blotter Strips (Product #7), 5ml Atomizer, etc.
  const blotterProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_testing_strips") || INITIAL_PRODUCTS[6];
  const sampleAtomizer = INITIAL_PRODUCTS.find((p) => p.slug === "10ml-glass-atomizer-matte-black") || INITIAL_PRODUCTS[0];

  const getProductFirstPkg = (product: any) => {
    return (product.packageOptions && product.packageOptions[0]) || {
      id: `pkg_${product.id}_def`,
      name: "Default Pack",
      quantity: 1,
      price: product.basePrice,
      unitPrice: product.basePrice,
    };
  };

  const handleAddProduct = (product: any) => {
    const pkg = getProductFirstPkg(product);
    addItem(product, pkg, 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 2500);
  };

  const blotterPkg = getProductFirstPkg(blotterProduct);
  const atomizerPkg = getProductFirstPkg(sampleAtomizer);

  return (
    <div className="p-6 border border-outline-variant bg-surface-container-low rounded-sm space-y-4 font-body-md">
      <div className="flex items-center gap-2 text-primary font-label-caps text-label-caps uppercase tracking-wider">
        <FlaskConical className="w-4 h-4 text-primary" /> Evaluation Protocol & Lab Supplies
      </div>

      <p className="font-body-md text-body-md text-secondary leading-relaxed font-light">
        Ensure precise olfactive evaluation. Test top, heart, and base evaporation curves with lint-free blotters and micro-atomizers.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Blotter Strips */}
        <div className="p-4 border border-outline-variant bg-surface rounded-sm flex items-center justify-between gap-3">
          <div>
            <h4 className="font-label-caps text-label-caps text-primary uppercase">{blotterProduct.name}</h4>
            <span className="font-mono text-primary font-semibold text-xs mt-0.5 block">
              {formatCurrency(blotterProduct.basePrice)} ({blotterPkg.quantity}u Pack)
            </span>
          </div>

          <button
            onClick={() => handleAddProduct(blotterProduct)}
            className={`px-3 py-1.5 text-xs font-label-caps uppercase transition rounded-sm flex items-center gap-1 shadow-xs ${
              addedIds.includes(blotterProduct.id)
                ? "bg-emerald-700 text-white"
                : "flat-btn"
            }`}
          >
            {addedIds.includes(blotterProduct.id) ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {addedIds.includes(blotterProduct.id) ? "Added" : "Add"}
          </button>
        </div>

        {/* Sample Atomizer */}
        <div className="p-4 border border-outline-variant bg-surface rounded-sm flex items-center justify-between gap-3">
          <div>
            <h4 className="font-label-caps text-label-caps text-primary uppercase">{sampleAtomizer.name}</h4>
            <span className="font-mono text-primary font-semibold text-xs mt-0.5 block">
              {formatCurrency(sampleAtomizer.basePrice)} ({atomizerPkg.quantity}u Pack)
            </span>
          </div>

          <button
            onClick={() => handleAddProduct(sampleAtomizer)}
            className={`px-3 py-1.5 text-xs font-label-caps uppercase transition rounded-sm flex items-center gap-1 shadow-xs ${
              addedIds.includes(sampleAtomizer.id)
                ? "bg-emerald-700 text-white"
                : "flat-btn"
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
