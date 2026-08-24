"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, UploadCloud, Layers, Check, ShieldCheck, ArrowRight, Box } from "lucide-react";
import { INITIAL_PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

const STANDARD_BOTTLE_SPECS = [
  {
    bottle: "10 ml Glass Roll-On",
    diameter: '0.79" (2.0 cm)',
    height: '3.46" (8.8 cm)',
    labelSize: '1.5" × 2.25" (3.81 × 5.72 cm)',
    yieldPerSheet: 15,
    slug: "10-ml-glass-roll-on-bottle",
    recommended: true,
  },
  {
    bottle: "5 ml Glass Atomizer",
    diameter: '0.67" (1.7 cm)',
    height: '2.80" (7.1 cm)',
    labelSize: '1.25" × 1.75" (3.17 × 4.44 cm)',
    yieldPerSheet: 24,
    slug: "5-ml-glass-atomizer",
  },
  {
    bottle: "250 ml Lab Bottle",
    diameter: '2.36" (6.0 cm)',
    height: '5.50" (14.0 cm)',
    labelSize: '2.5" × 3.5" (6.35 × 8.89 cm)',
    yieldPerSheet: 6,
    slug: "250-ml-glass-bottle",
  },
  {
    bottle: "500 ml Dispenser",
    diameter: '3.00" (7.6 cm)',
    height: '7.00" (17.8 cm)',
    labelSize: '3.0" × 4.5" (7.62 × 11.43 cm)',
    yieldPerSheet: 4,
    slug: "500-ml-glass-bottle",
  },
];

export default function CustomLabelsPage() {
  const { addItem } = useCart();
  const labelProduct = INITIAL_PRODUCTS[4]; // Custom Labels

  // Configurator state foundation
  const [selectedSpec, setSelectedSpec] = useState(STANDARD_BOTTLE_SPECS[0]);
  const [selectedFinish, setSelectedFinish] = useState<"Gold Foil" | "Silver Foil" | "Rose Gold Foil" | "Matte Vinyl">("Gold Foil");
  const [brandName, setBrandName] = useState("AURA NOIR");
  const [fragranceName, setFragranceName] = useState("EAU DE PARFUM");
  const [volumeText, setVolumeText] = useState("10 ML / 0.34 FL OZ");
  const [selectedQuantity, setSelectedQuantity] = useState(100);
  const [added, setAdded] = useState(false);

  const matchingPackage =
    (labelProduct.packageOptions || []).find((p) => p.quantity === selectedQuantity) ||
    (labelProduct.packageOptions || [])[2] ||
    { id: "pkg_default", name: "Default Pack", quantity: selectedQuantity, price: labelProduct.basePrice, unitPrice: labelProduct.basePrice };

  const handleAddToCart = () => {
    addItem(
      labelProduct,
      matchingPackage,
      1,
      {
        isCustomItem: true,
        customLabelSpecs: {
          bottleName: selectedSpec.bottle,
          dimensions: selectedSpec.labelSize,
          material: selectedFinish,
          customText: `${brandName} — ${fragranceName} (${volumeText})`,
        },
      }
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400">
          <Sparkles className="w-4 h-4" /> STRATEGIC CUSTOM LABELS & METALLIC FOIL
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
          Precision-Engineered Fragrance Labels
        </h1>
        <p className="text-sm text-lab-300 font-mono leading-relaxed">
          Crafted from oil/water-resistant synthetic vinyl with hot metallic foil embossing. 
          Pre-calibrated to exact bottle circumferences so your packaging looks master-crafted.
        </p>
      </div>

      {/* Interactive Configurator & Live Preview Foundation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Bottle Match */}
          <div className="p-5 rounded-xl border border-lab-800 bg-lab-900/40 space-y-3">
            <label className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center justify-between">
              <span>1. Target Bottle & Exact Dimensions</span>
              <span className="text-amber-400 text-[11px]">Direct Fit</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STANDARD_BOTTLE_SPECS.map((spec) => {
                const isSelected = selectedSpec.bottle === spec.bottle;
                return (
                  <button
                    key={spec.bottle}
                    type="button"
                    onClick={() => setSelectedSpec(spec)}
                    className={`p-3 rounded-lg border text-left transition ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500"
                        : "border-lab-800 bg-lab-950 hover:border-lab-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white font-mono">{spec.bottle}</span>
                      {spec.recommended && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-lab-950 font-bold font-mono">
                          Bestseller
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-amber-400 font-mono mt-1">
                      Label: {spec.labelSize}
                    </div>
                    <div className="text-[10px] text-lab-500 font-mono">
                      Bottle Dia: {spec.diameter}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Material & Metallic Finish */}
          <div className="p-5 rounded-xl border border-lab-800 bg-lab-900/40 space-y-3">
            <label className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              2. Material & Metallic Foil Finish
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(["Gold Foil", "Silver Foil", "Rose Gold Foil", "Matte Vinyl"] as const).map((finish) => {
                const isSelected = selectedFinish === finish;
                return (
                  <button
                    key={finish}
                    type="button"
                    onClick={() => setSelectedFinish(finish)}
                    className={`p-3 rounded-lg border text-center transition font-mono text-xs ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/15 text-amber-300 font-bold ring-1 ring-amber-500"
                        : "border-lab-800 bg-lab-950 text-lab-300 hover:text-white"
                    }`}
                  >
                    {finish}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Typography & Text Inputs */}
          <div className="p-5 rounded-xl border border-lab-800 bg-lab-900/40 space-y-4">
            <label className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              3. Text & Brand Customization (Live Preview)
            </label>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-lab-400 uppercase font-mono block mb-1">Brand Name</span>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value.toUpperCase())}
                  className="w-full bg-lab-950 border border-lab-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  maxLength={30}
                />
              </div>
              <div>
                <span className="text-[10px] text-lab-400 uppercase font-mono block mb-1">Fragrance Name / Accord</span>
                <input
                  type="text"
                  value={fragranceName}
                  onChange={(e) => setFragranceName(e.target.value.toUpperCase())}
                  className="w-full bg-lab-950 border border-lab-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  maxLength={30}
                />
              </div>
              <div>
                <span className="text-[10px] text-lab-400 uppercase font-mono block mb-1">Concentration / Volume</span>
                <input
                  type="text"
                  value={volumeText}
                  onChange={(e) => setVolumeText(e.target.value.toUpperCase())}
                  className="w-full bg-lab-950 border border-lab-800 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  maxLength={25}
                />
              </div>
            </div>
          </div>

          {/* Quantity & Order */}
          <div className="p-5 rounded-xl border border-lab-800 bg-lab-900/40 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-white uppercase font-mono">
                4. Select Production Quantity
              </label>
              <span className="text-xs text-amber-400 font-mono">
                {matchingPackage.quantity} Labels ({formatCurrency(matchingPackage.unitPrice)}/u)
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(labelProduct.packageOptions || []).map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedQuantity(pkg.quantity)}
                  className={`p-2 rounded border text-center transition font-mono text-xs ${
                    selectedQuantity === pkg.quantity
                      ? "border-amber-500 bg-amber-500 text-lab-950 font-bold"
                      : "border-lab-800 bg-lab-950 text-lab-300 hover:text-white"
                  }`}
                >
                  {pkg.quantity}u
                </button>
              ))}
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                added
                  ? "bg-emerald-500 text-lab-950"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 shadow-amber-500/10"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added {matchingPackage.quantity} Custom Labels to Batch
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Order {matchingPackage.quantity} Custom Labels ({formatCurrency(matchingPackage.price)})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Real-time Label Mockup & Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-lab-700 bg-lab-950 p-8 flex flex-col items-center justify-center min-h-[420px] shadow-2xl relative overflow-hidden">
              {/* Outer grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              {/* Simulated Bottle Graphic with Label */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Bottle Cap */}
                <div className="w-12 h-14 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900 rounded-t-sm border border-zinc-600 shadow-md" />
                
                {/* Bottle Neck */}
                <div className="w-8 h-3 bg-zinc-900 border-x border-zinc-700" />

                {/* Bottle Body */}
                <div className="w-32 h-64 bg-gradient-to-r from-zinc-900/90 via-zinc-800/80 to-zinc-950 rounded-b-md border border-zinc-700 flex items-center justify-center p-2 shadow-2xl relative">
                  {/* Label Surface */}
                  <div className={`w-28 h-44 rounded border flex flex-col justify-between p-3 text-center transition duration-300 shadow-inner ${
                    selectedFinish === "Gold Foil"
                      ? "bg-gradient-to-b from-amber-950/80 via-black to-amber-950/90 border-amber-500 text-amber-300"
                      : selectedFinish === "Silver Foil"
                      ? "bg-gradient-to-b from-zinc-900 via-black to-zinc-900 border-zinc-300 text-zinc-200"
                      : selectedFinish === "Rose Gold Foil"
                      ? "bg-gradient-to-b from-rose-950 via-black to-rose-950 border-rose-400 text-rose-300"
                      : "bg-black border-zinc-600 text-white"
                  }`}>
                    {/* Brand */}
                    <div className="text-[11px] font-bold tracking-[0.25em] font-mono border-b border-current/20 pb-1">
                      {brandName || "SCENTLAB"}
                    </div>

                    {/* Scent Accord */}
                    <div className="my-auto py-2">
                      <div className="text-xs font-serif italic tracking-wider">
                        {fragranceName || "FRAGRANCE"}
                      </div>
                      <div className="text-[8px] font-mono tracking-widest uppercase opacity-70 mt-0.5">
                        Pure Parfum
                      </div>
                    </div>

                    {/* Volume */}
                    <div className="text-[8px] font-mono tracking-widest uppercase border-t border-current/20 pt-1 opacity-80">
                      {volumeText || "10 ML"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center z-10 space-y-1">
                <span className="text-xs font-mono text-amber-400 block font-bold">
                  Scale: {selectedSpec.labelSize} on {selectedSpec.bottle}
                </span>
                <span className="text-[10px] text-lab-500 font-mono">
                  Live Preview rendering on oil-resistant {selectedFinish} substrate.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
