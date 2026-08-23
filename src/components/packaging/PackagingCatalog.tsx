"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PackagingSubcategory } from "@/types/packaging";
import { HeatShrinkProductViewer } from "./HeatShrinkProductViewer";
import { CustomBoxProductViewer } from "./CustomBoxProductViewer";
import { INITIAL_PRODUCTS } from "@/data/products";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { 
  Package, 
  Box, 
  Tag, 
  ShieldCheck, 
  Layers, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  Search,
  ArrowRight 
} from "lucide-react";

const SUBCATEGORIES = [
  "All",
  "Boxes",
  "Tags",
  "Security Stickers",
  "Heat Shrink Wrap Bags",
  "Packaging Accessories",
];

export function PackagingCatalog() {
  const { addItem } = useCart();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedIds, setAddedIds] = useState<string[]>([]);

  // Products from catalog
  const tagProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_tags_cord") || INITIAL_PRODUCTS[2];
  const securityProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_security_stickers") || INITIAL_PRODUCTS[3];

  const handleQuickAdd = (product: any, pkgIndex: number = 0) => {
    const pkg = product.packageOptions[pkgIndex];
    addItem(product, pkg, 1);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-mono">
      {/* Header */}
      <div className="border-b border-lab-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-widest">
          <Package className="w-4 h-4" /> SCENTLAB PACKAGING & PRESENTATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Perfume Packaging & Presentation
        </h1>
        <p className="text-xs text-lab-400 max-w-3xl leading-relaxed">
          Boxes, hang tags with elastic cord, tamper-evident holographic security stickers, and heavy heat shrink bags. Tailored for indie perfume compounding and boutique packaging.
        </p>
      </div>

      {/* Subcategory Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBCATEGORIES.map((sub) => {
          const isSelected = selectedSubcategory === sub;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                isSelected
                  ? "bg-amber-500 text-lab-950 border-amber-400 shadow-md shadow-amber-500/20"
                  : "bg-lab-900/60 text-lab-400 border-lab-800 hover:text-white hover:border-lab-700"
              }`}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* Interactive Products Section */}

      {/* 1. Custom Boxes Section */}
      {(selectedSubcategory === "All" || selectedSubcategory === "Boxes") && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-amber-400 uppercase font-bold tracking-wider">
            <Box className="w-4 h-4" /> Cricut-Cut Custom Boxes
          </div>
          <CustomBoxProductViewer />
        </div>
      )}

      {/* 2. Heat Shrink Bags Section */}
      {(selectedSubcategory === "All" || selectedSubcategory === "Heat Shrink Wrap Bags") && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-indigo-400 uppercase font-bold tracking-wider">
            <Layers className="w-4 h-4" /> Heat Shrink Wrap Bags (7 Standard Sizes)
          </div>
          <HeatShrinkProductViewer />
        </div>
      )}

      {/* 3. Tags & Security Stickers Cards Grid */}
      {(selectedSubcategory === "All" ||
        selectedSubcategory === "Tags" ||
        selectedSubcategory === "Security Stickers" ||
        selectedSubcategory === "Packaging Accessories") && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-amber-400 uppercase font-bold tracking-wider">
            <Tag className="w-4 h-4" /> Hang Tags, Cords & Security Seals
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tags with Cord */}
            {(selectedSubcategory === "All" || selectedSubcategory === "Tags" || selectedSubcategory === "Packaging Accessories") && (
              <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 flex flex-col justify-between shadow-xl">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded bg-lab-900 border border-lab-700 text-amber-400 text-[10px] font-bold uppercase">
                      Tags with Cord
                    </span>
                    <span className="text-[10px] text-lab-500 uppercase">ASIN: B0GHQ95PTP</span>
                  </div>

                  <h3 className="text-lg font-bold text-white uppercase">{tagProduct.name}</h3>
                  <p className="text-xs text-lab-400 leading-relaxed">
                    Heavy unbleached kraft and pure white hang tags equipped with premium elastic cord. Ideal for bottleneck hang loops and box sleeves.
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] text-lab-500 uppercase block">Starting Pack</span>
                    <span className="text-2xl font-black text-amber-400">
                      {formatCurrency(5.00)} <span className="text-xs font-normal text-lab-400">(100 Tags Pack)</span>
                    </span>
                    <span className="text-[10px] text-lab-500 block">
                      {formatUnitPrice(0.05)} / tag
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-lab-900 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(tagProduct, 0)}
                    className={`w-full py-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 shadow ${
                      addedIds.includes(tagProduct.id)
                        ? "bg-emerald-500 text-lab-950"
                        : "bg-amber-500 hover:bg-amber-400 text-lab-950"
                    }`}
                  >
                    {addedIds.includes(tagProduct.id) ? (
                      <>
                        <Check className="w-4 h-4" /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Add 100 Tags Pack ($5.00)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Holographic Security Stickers */}
            {(selectedSubcategory === "All" || selectedSubcategory === "Security Stickers" || selectedSubcategory === "Packaging Accessories") && (
              <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 flex flex-col justify-between shadow-xl">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded bg-lab-900 border border-lab-700 text-indigo-400 text-[10px] font-bold uppercase">
                      Security Seals
                    </span>
                    <span className="text-[10px] text-lab-500 uppercase">ASIN: B0G6KRC5NT</span>
                  </div>

                  <h3 className="text-lg font-bold text-white uppercase">{securityProduct.name}</h3>
                  <p className="text-xs text-lab-400 leading-relaxed">
                    Tamper-evident holographic security sticker seals with void residue release. Essential for authenticating premium perfume boxes and roller caps.
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] text-lab-500 uppercase block">Starting Pack</span>
                    <span className="text-2xl font-black text-amber-400">
                      {formatCurrency(6.00)} <span className="text-xs font-normal text-lab-400">(200 Stickers Pack)</span>
                    </span>
                    <span className="text-[10px] text-lab-500 block">
                      {formatUnitPrice(0.03)} / sticker
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-lab-900 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(securityProduct, 0)}
                    className={`w-full py-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-2 shadow ${
                      addedIds.includes(securityProduct.id)
                        ? "bg-emerald-500 text-lab-950"
                        : "bg-indigo-500 hover:bg-indigo-400 text-white"
                    }`}
                  >
                    {addedIds.includes(securityProduct.id) ? (
                      <>
                        <Check className="w-4 h-4" /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" /> Add 200 Security Stickers ($6.00)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
