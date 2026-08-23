"use client";

import React, { useState } from "react";
import Link from "next/link";
import { INITIAL_FRAGRANCES } from "@/data/fragrances";
import { INITIAL_PERFUME_BASES } from "@/data/perfume-making";
import { INITIAL_PRODUCTS } from "@/data/products";
import { STANDARD_BOX_VARIANTS } from "@/data/packaging";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Sparkles, 
  Droplet, 
  FlaskConical, 
  Box, 
  Tag, 
  Scissors, 
  ShieldCheck, 
  Check, 
  ShoppingBag, 
  ArrowRight,
  Plus 
} from "lucide-react";

export function PerfumeMakingWorkflow() {
  const { addItem } = useCart();

  // STEP 1: Fragrance
  const [selectedFragrance, setSelectedFragrance] = useState(INITIAL_FRAGRANCES[0]);
  const [fragranceSize, setFragranceSize] = useState<number>(1); // 1 oz

  // STEP 2: Perfume Base
  const [selectedBaseVariant, setSelectedBaseVariant] = useState(INITIAL_PERFUME_BASES[0].repackagingVariants[0]);

  // STEP 3: Bottle Format
  const [selectedBottle, setSelectedBottle] = useState(INITIAL_PRODUCTS.find((p) => p.id === "prod_rollon_10ml") || INITIAL_PRODUCTS[14]);

  // STEP 4: Tools (Pipettes)
  const [selectedPipette, setSelectedPipette] = useState(INITIAL_PRODUCTS.find((p) => p.slug === "3ml-plastic-pipettes") || INITIAL_PRODUCTS[5]);

  // STEP 5: Custom Label
  const [labelFoil, setLabelFoil] = useState("gold");
  const [customBrandName, setCustomBrandName] = useState("STUDIO ACCORD");

  // STEP 6: Packaging Box
  const [selectedBox, setSelectedBox] = useState(STANDARD_BOX_VARIANTS[0]);

  const [added, setAdded] = useState(false);

  // Live Bundle Total
  const fragrancePrice = selectedFragrance.repackagingVariants.find((v) => v.sellingSize === fragranceSize)?.retailPrice || 8.50;
  const basePrice = selectedBaseVariant.retailPrice; // $21.99
  const bottlePackPrice = selectedBottle.packageOptions[0]?.price || 12.00;
  const pipettePackPrice = selectedPipette.packageOptions[0]?.price || 1.80;
  const labelPrice = 6.00; // 10-pack Custom Labels
  const boxPrice = selectedBox.retailPrice * 10; // 10 boxes ($4.50)

  const bundleSubtotal = Math.round((fragrancePrice + basePrice + bottlePackPrice + pipettePackPrice + labelPrice + boxPrice) * 100) / 100;
  const bundleDiscount = Math.round(bundleSubtotal * 0.15 * 100) / 100; // 15% studio bundle discount
  const finalBundlePrice = Math.round((bundleSubtotal - bundleDiscount) * 100) / 100;

  const handleAddBundleToCart = () => {
    // Add Fragrance
    const fragProxy: any = {
      id: selectedFragrance.id,
      name: `${selectedFragrance.name} (${fragranceSize} oz)`,
      slug: selectedFragrance.slug,
      category: "fragrance",
      sku: `FRAG-${selectedFragrance.slug}-${fragranceSize}OZ`,
      basePrice: fragrancePrice,
      media: [{ url: selectedFragrance.primaryImage, type: "image", isPrimary: true, altText: selectedFragrance.name }],
      packageOptions: [{ id: "pkg_frag", quantity: 1, price: fragrancePrice, unitPrice: fragrancePrice }],
    };
    addItem(fragProxy, { id: "pkg_frag", quantity: 1, price: fragrancePrice, unitPrice: fragrancePrice }, 1);

    // Add Base
    const baseProxy: any = {
      id: INITIAL_PERFUME_BASES[0].id,
      name: `${INITIAL_PERFUME_BASES[0].name} (${selectedBaseVariant.name})`,
      slug: INITIAL_PERFUME_BASES[0].slug,
      category: "testing",
      sku: selectedBaseVariant.sku,
      basePrice: basePrice,
      media: [{ url: INITIAL_PERFUME_BASES[0].primaryImage, type: "image", isPrimary: true, altText: INITIAL_PERFUME_BASES[0].name }],
      packageOptions: [{ id: "pkg_base", quantity: 1, price: basePrice, unitPrice: basePrice }],
    };
    addItem(baseProxy, { id: "pkg_base", quantity: 1, price: basePrice, unitPrice: basePrice }, 1);

    // Add Bottle Pack
    addItem(selectedBottle, selectedBottle.packageOptions[0], 1);

    // Add Pipette Pack
    addItem(selectedPipette, selectedPipette.packageOptions[0], 1);

    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-lab-950 via-lab-900 to-lab-950 font-mono space-y-10 shadow-2xl">
      {/* Header */}
      <div className="border-b border-lab-800 pb-6 text-center space-y-2 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> 6-STEP STUDIO COMPOUNDING & BOTTLING WORKFLOW
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Build Your Complete Perfume Line
        </h2>
        <p className="text-xs text-lab-400 leading-relaxed">
          Select your uncut fragrance accord, 200-proof perfumer&apos;s base, bottles, transfer tools, personalized metallic foil labels, and presentation boxes.
        </p>
      </div>

      {/* 6-Step Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
        {/* STEP 1: Fragrance Oil */}
        <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950/80 space-y-3">
          <div className="flex justify-between items-center text-amber-400 font-bold uppercase text-[11px]">
            <span>STEP 1: Fragrance Accord</span>
            <Droplet className="w-3.5 h-3.5" />
          </div>

          <select
            value={selectedFragrance.id}
            onChange={(e) => {
              const found = INITIAL_FRAGRANCES.find((f) => f.id === e.target.value);
              if (found) setSelectedFragrance(found);
            }}
            className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white font-bold"
          >
            {INITIAL_FRAGRANCES.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          <div className="flex gap-2">
            {[1, 2, 4].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFragranceSize(size)}
                className={`flex-1 py-1.5 rounded-lg border text-center font-bold text-[11px] ${
                  fragranceSize === size
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-lab-800 bg-lab-900 text-lab-400"
                }`}
              >
                {size} oz
              </button>
            ))}
          </div>

          <div className="text-right font-bold text-amber-400">
            {formatCurrency(fragrancePrice)}
          </div>
        </div>

        {/* STEP 2: Perfume Base */}
        <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950/80 space-y-3">
          <div className="flex justify-between items-center text-indigo-400 font-bold uppercase text-[11px]">
            <span>STEP 2: Perfumer&apos;s Base</span>
            <FlaskConical className="w-3.5 h-3.5" />
          </div>

          <select
            value={selectedBaseVariant.id}
            onChange={(e) => {
              const found = INITIAL_PERFUME_BASES[0].repackagingVariants.find((v) => v.id === e.target.value);
              if (found) setSelectedBaseVariant(found);
            }}
            className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white font-bold"
          >
            {INITIAL_PERFUME_BASES[0].repackagingVariants.map((v) => (
              <option key={v.id} value={v.id}>{v.name} ({formatCurrency(v.retailPrice)})</option>
            ))}
          </select>

          <p className="text-[10px] text-lab-400">
            200-Proof crystal clear denatured perfumer&apos;s alcohol.
          </p>

          <div className="text-right font-bold text-amber-400">
            {formatCurrency(basePrice)}
          </div>
        </div>

        {/* STEP 3: Bottles */}
        <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950/80 space-y-3">
          <div className="flex justify-between items-center text-amber-400 font-bold uppercase text-[11px]">
            <span>STEP 3: Glass Bottle Format</span>
            <Box className="w-3.5 h-3.5" />
          </div>

          <div className="p-3 rounded-xl border border-lab-800 bg-lab-900 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase block">{selectedBottle.name}</span>
              <span className="text-[10px] text-lab-400">Pack of {selectedBottle.packageOptions[0]?.quantity} Bottles</span>
            </div>
            <span className="text-xs font-bold text-amber-400">{formatCurrency(bottlePackPrice)}</span>
          </div>

          <p className="text-[10px] text-lab-400">
            Heavy-base flint glass with stainless steel roller ball.
          </p>
        </div>

        {/* STEP 4: Tools (Pipettes) */}
        <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950/80 space-y-3">
          <div className="flex justify-between items-center text-indigo-400 font-bold uppercase text-[11px]">
            <span>STEP 4: Transfer Tools</span>
            <FlaskConical className="w-3.5 h-3.5" />
          </div>

          <div className="p-3 rounded-xl border border-lab-800 bg-lab-900 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase block">{selectedPipette.name}</span>
              <span className="text-[10px] text-lab-400">Pack of {selectedPipette.packageOptions[0]?.quantity} Pipettes</span>
            </div>
            <span className="text-xs font-bold text-amber-400">{formatCurrency(pipettePackPrice)}</span>
          </div>

          <p className="text-[10px] text-lab-400">
            Graduated polyethylene pipettes for clean oil transfer.
          </p>
        </div>

        {/* STEP 5: Custom Metallic Foil Label */}
        <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950/80 space-y-3">
          <div className="flex justify-between items-center text-amber-400 font-bold uppercase text-[11px]">
            <span>STEP 5: Custom Foil Label</span>
            <Tag className="w-3.5 h-3.5" />
          </div>

          <div>
            <label className="text-[10px] text-lab-500 block uppercase">Brand / Studio Name</label>
            <input
              type="text"
              value={customBrandName}
              onChange={(e) => setCustomBrandName(e.target.value)}
              className="w-full bg-lab-900 border border-lab-800 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs"
            />
          </div>

          <div className="flex gap-2">
            {["gold", "silver", "rose_gold"].map((foil) => (
              <button
                key={foil}
                type="button"
                onClick={() => setLabelFoil(foil)}
                className={`flex-1 py-1 rounded border text-[10px] font-bold capitalize ${
                  labelFoil === foil
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-lab-800 bg-lab-900 text-lab-400"
                }`}
              >
                {foil.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="text-right font-bold text-amber-400">
            {formatCurrency(labelPrice)} (10x Labels)
          </div>
        </div>

        {/* STEP 6: Cricut Presentation Box */}
        <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950/80 space-y-3">
          <div className="flex justify-between items-center text-indigo-400 font-bold uppercase text-[11px]">
            <span>STEP 6: Presentation Box</span>
            <Scissors className="w-3.5 h-3.5" />
          </div>

          <div className="p-3 rounded-xl border border-lab-800 bg-lab-900 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white uppercase block">{selectedBox.name}</span>
              <span className="text-[10px] text-lab-400">10x Pre-cut & Scored Boxes</span>
            </div>
            <span className="text-xs font-bold text-amber-400">{formatCurrency(boxPrice)}</span>
          </div>

          <p className="text-[10px] text-lab-400">
            Precision die-cut 110 lb white cardstock. Shipped flat.
          </p>
        </div>
      </div>

      {/* Summary & Single Add to Cart Action */}
      <div className="p-6 rounded-2xl border border-amber-500/40 bg-lab-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-lab-500 uppercase">Individual Item Total:</span>
            <span className="text-sm line-through text-lab-500 font-mono">{formatCurrency(bundleSubtotal)}</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
              Save {formatCurrency(bundleDiscount)} (15% Studio Bundle)
            </span>
          </div>
          <div className="text-3xl font-black text-amber-400 mt-1">
            {formatCurrency(finalBundlePrice)}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddBundleToCart}
          className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-black uppercase text-xs tracking-wider hover:brightness-110 transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
        >
          {added ? (
            <>
              <Check className="w-4 h-4 text-emerald-950" /> Bundle Added to Cart!
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" /> Add Complete Perfume Studio Bundle ({formatCurrency(finalBundlePrice)})
            </>
          )}
        </button>
      </div>
    </div>
  );
}
