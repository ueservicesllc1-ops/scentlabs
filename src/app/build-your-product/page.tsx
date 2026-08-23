"use client";

import React, { useState } from "react";
import Link from "next/link";
import { INITIAL_PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  PackageCheck, 
  Box, 
  ShieldCheck, 
  FlaskConical, 
  Tag, 
  ShoppingBag 
} from "lucide-react";

export default function BuildYourProductPage() {
  const { addItem } = useCart();

  // Wizard Steps
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUnits, setSelectedUnits] = useState(50); // 50 units standard batch
  const [bottle, setBottle] = useState(INITIAL_PRODUCTS[14]); // 10 ml roll-on
  const [fragrance, setFragrance] = useState(INITIAL_PRODUCTS[6]); // Perfume base
  const [labelFinish, setLabelFinish] = useState("Gold Foil");
  const [includeBox, setIncludeBox] = useState(true);
  const [includeSecuritySticker, setIncludeSecuritySticker] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);
  const [added, setAdded] = useState(false);

  // Referenced items
  const boxProduct = INITIAL_PRODUCTS[5]; // Perfume boxes
  const securityProduct = INITIAL_PRODUCTS[3]; // Security stickers
  const tagsProduct = INITIAL_PRODUCTS[2]; // Tags with cord
  const labelProduct = INITIAL_PRODUCTS[4]; // Custom labels

  // Calculate estimated total package for the bundle
  const bottlePack = bottle.packageOptions.find((p) => p.quantity >= selectedUnits) || bottle.packageOptions[2];
  const labelPack = labelProduct.packageOptions.find((p) => p.quantity >= selectedUnits) || labelProduct.packageOptions[1];
  const boxPack = boxProduct.packageOptions.find((p) => p.quantity >= selectedUnits) || boxProduct.packageOptions[1];
  const secPack = securityProduct.packageOptions.find((p) => p.quantity >= selectedUnits) || securityProduct.packageOptions[0];
  const tagsPack = tagsProduct.packageOptions.find((p) => p.quantity >= selectedUnits) || tagsProduct.packageOptions[0];

  let estimatedBundleCost = bottlePack.price + labelPack.price;
  if (includeBox) estimatedBundleCost += boxPack.price;
  if (includeSecuritySticker) estimatedBundleCost += secPack.price;
  if (includeTags) estimatedBundleCost += tagsPack.price;

  const handleAddEntireBundle = () => {
    // 1. Add Bottle
    const bottleLineId = addItem(bottle, bottlePack, 1);
    
    // 2. Add Label matched to bottle
    addItem(labelProduct, labelPack, 1, {
      linkedParentItemId: bottleLineId,
      isCustomItem: true,
      customLabelSpecs: {
        bottleName: bottle.name,
        dimensions: '1.5" × 2.25"',
        material: labelFinish,
      },
    });

    // 3. Add Optional Boxes
    if (includeBox) {
      addItem(boxProduct, boxPack, 1, { linkedParentItemId: bottleLineId });
    }

    // 4. Add Security Stickers
    if (includeSecuritySticker) {
      addItem(securityProduct, secPack, 1, { linkedParentItemId: bottleLineId });
    }

    // 5. Add Hang Tags
    if (includeTags) {
      addItem(tagsProduct, tagsPack, 1, { linkedParentItemId: bottleLineId });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-lab-800 pb-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-400">
          <PackageCheck className="w-4 h-4" /> BATCH ARCHITECTURE WIZARD
        </div>
        <h1 className="text-3xl font-black text-white font-mono">
          Build Your Complete Roll-On Line
        </h1>
        <p className="text-sm text-lab-400 font-mono">
          Assemble bottle, matching fragrance oil, precision custom labels, retail boxes, tamper seals and tags in one unified step.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { step: 1, title: "1. Bottle" },
          { step: 2, title: "2. Fragrance" },
          { step: 3, title: "3. Custom Label" },
          { step: 4, title: "4. Rigid Box" },
          { step: 5, title: "5. Security Seal" },
          { step: 6, title: "6. Hang Tags" },
        ].map((s) => (
          <button
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`py-2 px-1 text-center border-b-2 font-mono text-xs transition truncate ${
              currentStep === s.step
                ? "border-amber-500 text-amber-400 font-bold"
                : currentStep > s.step
                ? "border-emerald-500 text-emerald-400"
                : "border-lab-800 text-lab-500 hover:text-lab-300"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Active Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 p-6 rounded-xl border border-lab-800 bg-lab-900/40 space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-mono">Step 1: Choose Your Bottle Enclosure</h3>
              <div className="p-4 rounded-lg border border-amber-500/50 bg-amber-500/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white font-mono text-sm">{bottle.name}</h4>
                  <p className="text-xs text-lab-300 mt-0.5">Heavy-wall flint glass with stainless steel ball roller.</p>
                  <span className="text-[11px] font-mono text-amber-400 mt-1 block">
                    Dia: 0.79" (2.0 cm) | Height: 3.46" (8.8 cm)
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-lab-400 block">Selected Batch</span>
                  <span className="text-sm font-bold text-white">{selectedUnits} Units ({formatCurrency(bottlePack.price)})</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-mono">Step 2: Choose Fragrance Oil or Compounding Base</h3>
              <div className="p-4 rounded-lg border border-lab-700 bg-lab-950 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white font-mono text-sm">{fragrance.name}</h4>
                  <p className="text-xs text-lab-400 mt-0.5">{fragrance.shortDescription}</p>
                </div>
                <span className="text-sm font-mono text-amber-400 font-bold">{formatCurrency(fragrance.basePrice)}</span>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-mono">Step 3: Direct Bottle Match Custom Label</h3>
              <p className="text-xs text-lab-300">
                Precision dimensioned for 10 ml Roll-On: <strong>1.5" × 2.25" (3.81 × 5.72 cm)</strong>
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(["Gold Foil", "Silver Foil", "Rose Gold Foil"] as const).map((finish) => (
                  <button
                    key={finish}
                    onClick={() => setLabelFinish(finish)}
                    className={`p-3 rounded border text-center font-mono text-xs transition ${
                      labelFinish === finish ? "border-amber-500 bg-amber-500/20 text-amber-300 font-bold" : "border-lab-800 bg-lab-950 text-lab-400"
                    }`}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-mono">Step 4: 110 lb Rigid Cardstock Packaging Box</h3>
              <label className="flex items-center gap-3 p-4 rounded-lg border border-lab-700 bg-lab-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBox}
                  onChange={(e) => setIncludeBox(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <div>
                  <span className="text-sm font-bold text-white font-mono block">Include 110 lb Die-Cut Boxes ({boxPack.quantity}u)</span>
                  <span className="text-xs text-lab-400 font-mono">Precision sized for 10 ml roll-on bottles (+{formatCurrency(boxPack.price)})</span>
                </div>
              </label>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-mono">Step 5: Tamper-Evident Security Seal</h3>
              <label className="flex items-center gap-3 p-4 rounded-lg border border-lab-700 bg-lab-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSecuritySticker}
                  onChange={(e) => setIncludeSecuritySticker(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <div>
                  <span className="text-sm font-bold text-white font-mono block">Include Holographic Security Seals ({secPack.quantity}u)</span>
                  <span className="text-xs text-lab-400 font-mono">Void-pattern security seal for box top / bottle cap (+{formatCurrency(secPack.price)})</span>
                </div>
              </label>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white font-mono">Step 6: Fragrance Hang Tags with Cord</h3>
              <label className="flex items-center gap-3 p-4 rounded-lg border border-lab-700 bg-lab-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTags}
                  onChange={(e) => setIncludeTags(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <div>
                  <span className="text-sm font-bold text-white font-mono block">Include Kraft Hang Tags ({tagsPack.quantity}u)</span>
                  <span className="text-xs text-lab-400 font-mono">Pre-tied elastic cords for neck presentation (+{formatCurrency(tagsPack.price)})</span>
                </div>
              </label>
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="flex justify-between pt-4 border-t border-lab-800">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className="px-4 py-2 rounded text-xs font-mono bg-lab-800 text-white disabled:opacity-30 flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Previous Step
            </button>

            {currentStep < 6 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 rounded text-xs font-mono font-bold bg-amber-500 text-lab-950 flex items-center gap-1"
              >
                Next Step <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleAddEntireBundle}
                className={`px-6 py-2.5 rounded text-xs font-mono font-bold uppercase transition flex items-center gap-2 ${
                  added ? "bg-emerald-500 text-lab-950" : "bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950"
                }`}
              >
                {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                Add Complete Roll-On Production Bundle
              </button>
            )}
          </div>
        </div>

        {/* Right: Bundle Summary Card */}
        <div className="lg:col-span-4 p-5 rounded-xl border border-lab-700 bg-lab-950 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider border-b border-lab-800 pb-2">
            Batch Production Estimate
          </h4>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-lab-300">
              <span>{bottle.name} ({bottlePack.quantity}u)</span>
              <span>{formatCurrency(bottlePack.price)}</span>
            </div>
            <div className="flex justify-between text-lab-300">
              <span>Custom {labelFinish} Labels ({labelPack.quantity}u)</span>
              <span>{formatCurrency(labelPack.price)}</span>
            </div>
            {includeBox && (
              <div className="flex justify-between text-lab-300">
                <span>110 lb Boxes ({boxPack.quantity}u)</span>
                <span>{formatCurrency(boxPack.price)}</span>
              </div>
            )}
            {includeSecuritySticker && (
              <div className="flex justify-between text-lab-300">
                <span>Security Seals ({secPack.quantity}u)</span>
                <span>{formatCurrency(secPack.price)}</span>
              </div>
            )}
            {includeTags && (
              <div className="flex justify-between text-lab-300">
                <span>Hang Tags ({tagsPack.quantity}u)</span>
                <span>{formatCurrency(tagsPack.price)}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-lab-800 flex justify-between items-baseline font-mono">
            <span className="text-xs text-lab-400">Total Bundle Cost:</span>
            <span className="text-xl font-bold text-amber-400">{formatCurrency(estimatedBundleCost)}</span>
          </div>

          <button
            onClick={handleAddEntireBundle}
            className={`w-full py-3 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition flex items-center justify-center gap-2 ${
              added ? "bg-emerald-500 text-lab-950" : "bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110"
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Added All Items to Cart
              </>
            ) : (
              <>
                <PackageCheck className="w-4 h-4" /> Add All Components to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
