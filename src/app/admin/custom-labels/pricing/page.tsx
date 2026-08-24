"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { 
  STANDARD_LABEL_SIZES, 
  STANDARD_LABEL_MATERIALS, 
  STANDARD_LABEL_QUANTITIES,
  BASE_SHEET_CONFIG 
} from "@/config/custom-labels";
import { calculateLabelCost, calculateLabelPricing } from "@/lib/custom-labels/pricing";
import { calculateLabelSheetYield } from "@/lib/custom-labels/sheet-calculator";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Calculator, 
  Layers, 
  ShieldCheck, 
  DollarSign, 
  Percent, 
  ArrowLeft, 
  Save,
  Sparkles 
} from "lucide-react";

export default function AdminLabelPricingPage() {
  const [selectedSizeId, setSelectedSizeId] = useState(STANDARD_LABEL_SIZES[5]?.id || "size_1_5x2_5"); // 1.5 x 2.5 in
  const [selectedMaterialId, setSelectedMaterialId] = useState(STANDARD_LABEL_MATERIALS[0].id); // Gold Foil
  const [quantity, setQuantity] = useState<number>(50);

  // Cost Configuration parameters
  const [wasteFactor, setWasteFactor] = useState(0.10); // 10%
  const [laborRate, setLaborRate] = useState(0.15); // $0.15 per sheet
  const [packagingCost, setPackagingCost] = useState(1.50); // $1.50 per order
  const [targetMargin, setTargetMargin] = useState(0.45); // 45%

  const selectedSize = STANDARD_LABEL_SIZES.find((s) => s.id === selectedSizeId) || STANDARD_LABEL_SIZES[5];
  const selectedMaterial = STANDARD_LABEL_MATERIALS.find((m) => m.id === selectedMaterialId) || STANDARD_LABEL_MATERIALS[0];

  const breakdown = calculateLabelCost(
    selectedSize.width,
    selectedSize.height,
    quantity,
    selectedMaterial,
    {
      wasteFactor,
      laborRatePerSheet: laborRate,
      packagingCost,
      targetGrossMargin: targetMargin,
    }
  );

  const yieldInfo = calculateLabelSheetYield(selectedSize.width, selectedSize.height, quantity);

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">
              <Calculator className="w-3.5 h-3.5" /> MANUFACTURING COST & PRICING ENGINE
            </div>
            <h1 className="text-3xl font-black text-white uppercase">
              Custom Labels Pricing Admin
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Configure sheet yield formulas, material scrap waste, labor rates, and gross profit margins.
            </p>
          </div>

          <Link
            href="/admin/custom-labels"
            className="px-4 py-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Labels Queue
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Manufacturing Calculator Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Parameters Selection */}
            <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                1. Label Dimensions & Finish Substrate
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-lab-400 block mb-1 text-[10px] uppercase">Die-Cut Size</label>
                  <select
                    value={selectedSizeId}
                    onChange={(e) => setSelectedSizeId(e.target.value)}
                    className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                  >
                    {STANDARD_LABEL_SIZES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.area} sq in)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 text-[10px] uppercase">Substrate / Foil Finish</label>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => setSelectedMaterialId(e.target.value)}
                    className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                  >
                    {STANDARD_LABEL_MATERIALS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (${m.materialCostPerSqIn}/sq in)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-lab-400 block mb-1 text-[10px] uppercase">Batch Quantity</label>
                  <div className="grid grid-cols-5 gap-2">
                    {STANDARD_LABEL_QUANTITIES.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuantity(q)}
                        className={`py-2 rounded-lg border text-xs font-bold transition ${
                          quantity === q
                            ? "border-amber-500 bg-amber-500 text-lab-950"
                            : "border-lab-800 bg-lab-950 text-lab-400 hover:text-white"
                        }`}
                      >
                        {q}u
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Manufacturing & Yield Parameters */}
            <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                2. Manufacturing Overhead & Yield Modifiers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-lab-400 block mb-1 text-[10px] uppercase">Waste & Scrap Factor (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="0.50"
                    value={wasteFactor}
                    onChange={(e) => setWasteFactor(parseFloat(e.target.value) || 0)}
                    className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                  />
                  <span className="text-[10px] text-lab-500 mt-0.5 block">Standard 10% allowance (0.10)</span>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 text-[10px] uppercase">Labor Rate Per Sheet ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={laborRate}
                    onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                  />
                  <span className="text-[10px] text-lab-500 mt-0.5 block">Weeding & inspection ($0.15/sheet)</span>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 text-[10px] uppercase">Packaging & Mailer Cost ($)</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                    className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                  />
                  <span className="text-[10px] text-lab-500 mt-0.5 block">Rigid board & glassine sleeve</span>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 text-[10px] uppercase">Target Gross Margin (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.25"
                    max="0.90"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0.45)}
                    className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                  />
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">Target margin floor (45%)</span>
                </div>
              </div>
            </div>

            {/* Active Pricing Tiers Schedule */}
            <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-lab-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Pricing Schedule ({selectedSize.name} • {selectedMaterial.name})
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase">LIVE</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-lab-950 text-lab-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Total Price</th>
                    <th className="p-2">Price Per Unit</th>
                    <th className="p-2">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-800/60 font-mono">
                  {STANDARD_LABEL_QUANTITIES.map((q) => {
                    const pr = calculateLabelPricing(selectedSize.width, selectedSize.height, q, selectedMaterial.id);
                    return (
                      <tr key={q}>
                        <td className="p-2 font-bold text-white">{q} Labels</td>
                        <td className="p-2 text-amber-400 font-bold">${pr.totalPrice.toFixed(2)}</td>
                        <td className="p-2 text-lab-300">${pr.unitPrice.toFixed(2)} / label</td>
                        <td className="p-2"><span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">YES</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Cost Breakdown & Gross Margin Matrix (Admin Only) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Sheet Yield Spec */}
            <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-lab-800 pb-2">
                Sheet Yield Breakdown (8.5&quot; × 11&quot; Base)
              </h3>
              <div className="flex justify-between text-lab-300">
                <span>Portrait Yield:</span>
                <span className="text-white font-bold">{yieldInfo.labelsPerSheetPortrait} labels/sheet</span>
              </div>
              <div className="flex justify-between text-lab-300">
                <span>Landscape Yield:</span>
                <span className="text-white font-bold">{yieldInfo.labelsPerSheetLandscape} labels/sheet</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-lab-800">
                <span>Optimal Orientation:</span>
                <span className="uppercase">{yieldInfo.optimalOrientation} ({yieldInfo.optimalLabelsPerSheet} per sheet)</span>
              </div>
              <div className="flex justify-between text-lab-300">
                <span>Estimated Sheets Needed:</span>
                <span className="text-white font-bold">{yieldInfo.estimatedSheetsRequired} sheets</span>
              </div>
            </div>

            {/* Financial & Margin Matrix */}
            <div className="p-6 rounded-2xl border border-lab-700 bg-lab-950 space-y-4 shadow-2xl text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-lab-800 pb-2 flex items-center justify-between">
                <span>Manufacturing Financials</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase">CONFIDENTIAL (ADMIN)</span>
              </h3>

              <div className="space-y-2 text-lab-300">
                <div className="flex justify-between">
                  <span>Raw Substrate + Waste:</span>
                  <span className="text-white font-bold">{formatCurrency(breakdown.materialCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hot Stamping & Printing:</span>
                  <span className="text-white font-bold">{formatCurrency(breakdown.productionCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor & Handling:</span>
                  <span className="text-white font-bold">{formatCurrency(breakdown.laborCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Packaging & Sleeving:</span>
                  <span className="text-white font-bold">{formatCurrency(breakdown.packagingCost)}</span>
                </div>
                <div className="flex justify-between text-lab-200 font-bold pt-2 border-t border-lab-800">
                  <span>Total Manufacturing Cost:</span>
                  <span className="text-white">{formatCurrency(breakdown.totalCost)}</span>
                </div>
                <div className="flex justify-between text-lab-400 text-[11px]">
                  <span>Unit Manufacturing Cost:</span>
                  <span>{formatUnitPrice(breakdown.unitCost)} / label</span>
                </div>
              </div>

              {/* Selling Price & Margin Display */}
              <div className="border-t border-lab-800 pt-3 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-white uppercase">Client Selling Price:</span>
                  <span className="text-2xl font-black text-amber-400">
                    {formatCurrency(breakdown.sellingPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-lab-400">
                  <span>Client Unit Price:</span>
                  <span className="text-white font-bold">{formatUnitPrice(breakdown.unitPrice)} / label</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex justify-between items-center text-emerald-300 font-bold mt-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Gross Profit Margin:</span>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-black text-sm">+{breakdown.grossMarginPercent}%</div>
                    <div className="text-[10px] text-emerald-500 font-normal">+{formatCurrency(breakdown.grossMarginDollar)} net margin</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
