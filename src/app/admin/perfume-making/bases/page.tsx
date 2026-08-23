"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { perfumeMakingRepository } from "@/lib/firestore/perfume-making";
import { calculateCostPerLiter, calculateBaseRepackagingCost } from "@/lib/perfume-making/conversions";
import { PerfumeBase, BaseUnit } from "@/types/perfume-making";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  FlaskConical, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Droplet,
  ExternalLink 
} from "lucide-react";

export default function AdminPerfumeBasesPage() {
  const [base, setBase] = useState<PerfumeBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [sourceCost, setSourceCost] = useState(49.99);
  const [sourceQty, setSourceQty] = useState(1);
  const [sourceUnit, setSourceUnit] = useState<BaseUnit>("gallon");
  const [price1L, setPrice1L] = useState(21.99);
  const [bulkVolumeLiters, setBulkVolumeLiters] = useState(7.57);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      const bases = await perfumeMakingRepository.getAllBases();
      if (bases.length > 0) {
        setBase(bases[0]);
        setSourceCost(bases[0].sourceCost);
        setSourceQty(bases[0].sourceQuantity);
        setSourceUnit(bases[0].sourceUnit);
        setBulkVolumeLiters(bases[0].inventoryVolumeLiters);
        const v1L = bases[0].repackagingVariants.find((v) => v.size === 1.0);
        if (v1L) setPrice1L(v1L.retailPrice);
      }
      setLoading(false);
    };
    load();
  }, []);

  const costCalc = calculateCostPerLiter(sourceCost, sourceQty, sourceUnit);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!base) return;

    const v1LCalc = calculateBaseRepackagingCost({
      costPerLiter: costCalc.costPerLiter,
      sellingSizeLiters: 1.0,
      bottleCost: 1.43,
    });

    const updatedVariants = base.repackagingVariants.map((v) => {
      if (v.size === 1.0) {
        return {
          ...v,
          retailPrice: price1L,
          costBreakdown: v1LCalc.breakdown,
          unitCost: v1LCalc.unitCost,
          grossProfit: price1L - v1LCalc.unitCost,
          marginPercent: Math.round(((price1L - v1LCalc.unitCost) / price1L) * 1000) / 10,
        };
      }
      return v;
    });

    const updatedBase: PerfumeBase = {
      ...base,
      sourceCost,
      sourceQuantity: sourceQty,
      sourceUnit,
      costPerLiter: costCalc.costPerLiter,
      inventoryVolumeLiters: bulkVolumeLiters,
      repackagingVariants: updatedVariants,
      updatedAt: new Date().toISOString(),
    };

    await perfumeMakingRepository.saveBase(updatedBase);
    setBase(updatedBase);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (loading || !base) {
    return (
      <AdminGuard>
        <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-lab-400">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mr-3" />
          Loading base formulation data...
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link
              href="/admin/perfume-making"
              className="inline-flex items-center gap-1 text-xs text-lab-400 hover:text-white mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Perfume Making Dashboard
            </Link>
            <h1 className="text-3xl font-black text-white uppercase">
              Perfumer&apos;s Alcohol Base & Repackaging
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Source purchase tracking from Nature&apos;s Oil, Steve Spangler 1L container integration, and retail margin calculations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-xs hover:brightness-110 flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" /> Save Base Pricing
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Perfumer&apos;s alcohol cost parameters and variant pricing saved successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Source Purchase & Bulk Stock */}
          <form onSubmit={handleSave} className="lg:col-span-6 p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-indigo-400" /> Nature&apos;s Oil Source Purchase
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Supplier Name</label>
                <input
                  type="text"
                  disabled
                  value={base.supplierName}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-lab-400 font-bold"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Amazon ASIN</label>
                <input
                  type="text"
                  disabled
                  value={base.supplierProductId}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-lab-400 font-mono"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Source Purchase Qty</label>
                <input
                  type="number"
                  value={sourceQty}
                  onChange={(e) => setSourceQty(parseFloat(e.target.value) || 1)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Source Unit</label>
                <select
                  value={sourceUnit}
                  onChange={(e) => setSourceUnit(e.target.value as BaseUnit)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="gallon">Gallon (3.785 L)</option>
                  <option value="liter">Liters (1.0 L)</option>
                  <option value="oz">Fluid Ounces (oz)</option>
                </select>
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Source Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sourceCost}
                  onChange={(e) => setSourceCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Bulk In-Stock (Liters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bulkVolumeLiters}
                  onChange={(e) => setBulkVolumeLiters(parseFloat(e.target.value) || 0)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="sm:col-span-2 border-t border-lab-800 pt-4">
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">1 Liter Retail Selling Price ($)</label>
                <input
                  type="number"
                  step="0.05"
                  value={price1L}
                  onChange={(e) => setPrice1L(parseFloat(e.target.value) || 0)}
                  className="w-full bg-lab-950 border border-amber-500/60 rounded-lg px-3 py-2 text-amber-400 font-bold text-base"
                />
              </div>
            </div>
          </form>

          {/* Right: Calculated Yield & Steve Spangler Container */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 text-xs font-mono">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4" /> Calculated Cost Decomposition
              </h3>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl border border-lab-800 bg-lab-900/60">
                  <span className="text-[10px] text-lab-500 uppercase block">Raw Cost Per Liter</span>
                  <span className="text-xl font-black text-white">{formatUnitPrice(costCalc.costPerLiter)} / L</span>
                </div>

                <div className="p-3.5 rounded-xl border border-lab-800 bg-lab-900/60">
                  <span className="text-[10px] text-lab-500 uppercase block">Raw Cost Per Milliliter</span>
                  <span className="text-xl font-black text-indigo-400">{formatUnitPrice(costCalc.costPerMl)} / ml</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-lab-700 bg-lab-900/40 space-y-2">
                <span className="text-[10px] text-lab-500 uppercase block">Container Product Link</span>
                <div className="flex justify-between items-center text-white font-bold">
                  <span>Steve Spangler 1 Liter Soda Bottles</span>
                  <span className="text-amber-400">$1.43 / ea</span>
                </div>
                <span className="text-[10px] text-lab-400 block font-mono">ASIN: B072PXV4C2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
