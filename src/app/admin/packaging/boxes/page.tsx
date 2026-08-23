"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { packagingRepository } from "@/lib/firestore/packaging";
import { calculateSheetsRequired } from "@/lib/packaging/sheet-calculator";
import { calculateBoxCost } from "@/lib/packaging/box-cost";
import { BoxSizeVariant, PackagingMaterial } from "@/types/packaging";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Box, 
  ArrowLeft, 
  Save, 
  Plus, 
  Scissors, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  SlidersHorizontal,
  Layers 
} from "lucide-react";

export default function AdminBoxDesignerPage() {
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [boxes, setBoxes] = useState<BoxSizeVariant[]>([]);
  const [selectedBoxId, setSelectedBoxId] = useState<string>("new");

  // Box Formulation Form
  const [name, setName] = useState("Custom Fragrance Box");
  const [sku, setSku] = useState("BOX-CUSTOM-01");
  const [width, setWidth] = useState(1.0);
  const [height, setHeight] = useState(3.8);
  const [depth, setDepth] = useState(1.0);
  const [retailPrice, setRetailPrice] = useState(0.45);
  const [materialId, setMaterialId] = useState("mat_cardstock_110lb_white");
  const [assemblyType, setAssemblyType] = useState<"flat" | "pre_cut" | "assembled">("flat");
  const [inventory, setInventory] = useState(100);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      const mats = await packagingRepository.getRawMaterials();
      setMaterials(mats);
      const bxs = await packagingRepository.getBoxVariants();
      setBoxes(bxs);
      if (bxs.length > 0) {
        loadBoxIntoForm(bxs[0]);
      }
    };
    load();
  }, []);

  const loadBoxIntoForm = (box: BoxSizeVariant) => {
    setSelectedBoxId(box.id);
    setName(box.name);
    setSku(box.sku);
    setWidth(box.width);
    setHeight(box.height);
    setDepth(box.depth);
    setRetailPrice(box.retailPrice);
    setMaterialId(box.materialId);
    setAssemblyType(box.assemblyType);
    setInventory(box.inventory);
  };

  const handleNewBox = () => {
    setSelectedBoxId("new");
    setName("New Perfume Presentation Box");
    setSku(`BOX-NEW-${Date.now().toString().slice(-4)}`);
    setWidth(1.2);
    setHeight(4.0);
    setDepth(1.2);
    setRetailPrice(0.50);
    setInventory(50);
  };

  // Live Sheet Calculations
  const sheetCalc = calculateSheetsRequired({
    sheetWidth: 8.5,
    sheetHeight: 11.0,
    boxWidth: width,
    boxHeight: height,
    boxDepth: depth,
  });

  const costCalc = calculateBoxCost({
    sheetsRequiredPerBox: sheetCalc.sheetsRequiredPerBox,
    costPerSheet: 0.0999,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const boxToSave: BoxSizeVariant = {
      id: selectedBoxId === "new" ? `box_${Date.now()}` : selectedBoxId,
      productId: "prod_perfume_boxes",
      name,
      width,
      height,
      depth,
      unit: "in",
      sku,
      sheetsRequiredPerBox: sheetCalc.sheetsRequiredPerBox,
      materialId,
      materialName: materials.find((m) => m.id === materialId)?.name || "110 lb Smooth White Cardstock",
      assemblyType,
      costBreakdown: costCalc,
      unitCost: costCalc.totalCost,
      retailPrice,
      suggestedPrice: costCalc.suggestedPrice,
      inventory,
      active: true,
      volumePricing: [
        { quantity: 25, price: Math.round(retailPrice * 25 * 100) / 100, unitPrice: retailPrice },
        { quantity: 50, price: Math.round(retailPrice * 0.9 * 50 * 100) / 100, unitPrice: Math.round(retailPrice * 0.9 * 100) / 100 },
        { quantity: 100, price: Math.round(retailPrice * 0.8 * 100 * 100) / 100, unitPrice: Math.round(retailPrice * 0.8 * 100) / 100 },
      ],
    };

    await packagingRepository.saveBoxVariant(boxToSave);
    const updated = await packagingRepository.getBoxVariants();
    setBoxes(updated);
    setSelectedBoxId(boxToSave.id);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link
              href="/admin/packaging"
              className="inline-flex items-center gap-1 text-xs text-lab-400 hover:text-white mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Packaging Dashboard
            </Link>
            <h1 className="text-3xl font-black text-white uppercase">
              Cricut Box Designer & Sheet Calculator
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Configure 3D box dimensions, compute flat unfolded net footprint, and calculate raw cardstock sheet consumption.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNewBox}
              className="px-4 py-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Box Format
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-xs hover:brightness-110 flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" /> Save Box Format
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Box configuration and sheet yield formulas saved successfully.</span>
          </div>
        )}

        {/* Existing Box Formats Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {boxes.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => loadBoxIntoForm(b)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
                selectedBoxId === b.id
                  ? "bg-amber-500 text-lab-950 border-amber-400"
                  : "bg-lab-900/60 text-lab-400 border-lab-800 hover:text-white"
              }`}
            >
              {b.name} ({b.width}x{b.height}x{b.depth} in)
            </button>
          ))}
        </div>

        {/* 2-Column Editor Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Dimension & Formulation Form */}
          <form onSubmit={handleSave} className="lg:col-span-6 p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" /> Box Geometry & Materials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Box Format Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">SKU Identifier</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Cardstock Substrate</label>
                <select
                  value={materialId}
                  onChange={(e) => setMaterialId(e.target.value)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({formatUnitPrice(m.unitCost)}/sheet)</option>
                  ))}
                </select>
              </div>

              {/* 3D Dimensions */}
              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Width (in)</label>
                <input
                  type="number"
                  step="0.05"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 0.5)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Height (in)</label>
                <input
                  type="number"
                  step="0.05"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 1)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Depth (in)</label>
                <input
                  type="number"
                  step="0.05"
                  value={depth}
                  onChange={(e) => setDepth(parseFloat(e.target.value) || 0.5)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Retail Price ($/ea)</label>
                <input
                  type="number"
                  step="0.05"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0.1)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Assembly Type</label>
                <select
                  value={assemblyType}
                  onChange={(e) => setAssemblyType(e.target.value as any)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="flat">Shipped Flat (Customer assembles)</option>
                  <option value="pre_cut">Pre-cut & Pre-scored</option>
                  <option value="assembled">Fully Assembled Box</option>
                </select>
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Finished Ready Stock</label>
                <input
                  type="number"
                  value={inventory}
                  onChange={(e) => setInventory(parseInt(e.target.value) || 0)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </form>

          {/* Right: Realtime Sheet & Manufacturing Cost Yield */}
          <div className="lg:col-span-6 space-y-6">
            {/* Sheet Calculator Metrics */}
            <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 text-xs font-mono">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Scissors className="w-4 h-4" /> 8.5x11&quot; Cricut Mat Sheet Yield
              </h3>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl border border-lab-800 bg-lab-900/60">
                  <span className="text-[10px] text-lab-500 uppercase block">Flat Unfolded Net</span>
                  <span className="text-base font-black text-white">
                    {sheetCalc.flatNetWidth}&quot; x {sheetCalc.flatNetHeight}&quot;
                  </span>
                  <span className="text-[10px] text-lab-400 block">Includes tabs & scoring</span>
                </div>

                <div className="p-3.5 rounded-xl border border-lab-800 bg-lab-900/60">
                  <span className="text-[10px] text-lab-500 uppercase block">Boxes Per Sheet</span>
                  <span className="text-xl font-black text-emerald-400">
                    {sheetCalc.optimalBoxesPerSheet} Box / Sheet
                  </span>
                  <span className="text-[10px] text-lab-400 block capitalize">{sheetCalc.optimalOrientation} layout</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-lab-700 bg-lab-900/40 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-lab-500 uppercase block">Sheets Consumed Per Box</span>
                  <span className="text-lg font-black text-amber-400">
                    {sheetCalc.sheetsRequiredPerBox} sheet
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-lab-500 uppercase block">Estimated Area Waste</span>
                  <span className="text-sm font-bold text-lab-300">{sheetCalc.estimatedWastePercent}%</span>
                </div>
              </div>
            </div>

            {/* Manufacturing Cost Breakdown */}
            <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 text-xs font-mono">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Unit Manufacturing Cost Breakdown
              </h3>

              <div className="space-y-2 divide-y divide-lab-900 text-lab-300">
                <div className="flex justify-between pt-1">
                  <span>Cardstock Sheet Substrate ({sheetCalc.sheetsRequiredPerBox} sheet):</span>
                  <span className="font-bold text-white">{formatCurrency(costCalc.sheetCost)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Cricut Cutting & Folding Labor:</span>
                  <span className="font-bold text-white">{formatCurrency(costCalc.productionLaborCost)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Sleeve & Packaging Material:</span>
                  <span className="font-bold text-white">{formatCurrency(costCalc.packagingCost)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Foil Stamp & Ink:</span>
                  <span className="font-bold text-white">{formatCurrency(costCalc.inkCost)}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold border-t border-lab-700">
                  <span className="text-white uppercase">Total Unit Cost:</span>
                  <span className="text-amber-400">{formatUnitPrice(costCalc.totalCost)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-amber-400 uppercase block font-bold">Suggested Retail Price (50% Margin)</span>
                  <span className="text-xl font-black text-amber-400">{formatUnitPrice(costCalc.suggestedPrice)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-lab-400 uppercase block">Configured Price</span>
                  <span className="text-xl font-black text-white">{formatUnitPrice(retailPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
