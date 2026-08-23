"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { perfumeMakingRepository } from "@/lib/firestore/perfume-making";
import { KitProduct, KitItem } from "@/types/perfume-making";
import { formatCurrency } from "@/lib/utils";
import { 
  Sparkles, 
  ArrowLeft, 
  Plus, 
  Save, 
  CheckCircle2, 
  Trash2, 
  Layers, 
  Box 
} from "lucide-react";

export default function AdminPerfumeKitsPage() {
  const [kits, setKits] = useState<KitProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKit, setSelectedKit] = useState<KitProduct | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadKits = async () => {
    const all = await perfumeMakingRepository.getAllKits();
    setKits(all);
    if (all.length > 0 && !selectedKit) setSelectedKit(all[0]);
    setLoading(false);
  };

  useEffect(() => {
    loadKits();
  }, []);

  const handleUpdateKitPrice = (price: number) => {
    if (!selectedKit) return;
    const savings = Math.max(0, Math.round((selectedKit.individualTotal - price) * 100) / 100);
    const discountPercent = Math.round((savings / selectedKit.individualTotal) * 1000) / 10;
    setSelectedKit({
      ...selectedKit,
      kitPrice: price,
      savings,
      discountPercent,
    });
  };

  const handleSaveKit = async () => {
    if (!selectedKit) return;
    await perfumeMakingRepository.saveKit(selectedKit);
    await loadKits();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (loading || !selectedKit) {
    return (
      <AdminGuard>
        <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-lab-400">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mr-3" />
          Loading studio kits...
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
              Studio Compounding Kits Builder
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Configure multi-component perfume bundles, adjust savings discounts, and monitor constituent component inventory.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveKit}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-xs hover:brightness-110 flex items-center gap-1.5 shadow"
          >
            <Save className="w-4 h-4" /> Save Kit Configuration
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Studio kit parameters and discount rates saved successfully.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Kit Items & Components */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" /> Kit Constituent Components
            </h3>

            <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-950">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-800/60">
                  {selectedKit.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-bold text-white uppercase">{item.productName}</td>
                      <td className="p-3 font-mono text-indigo-400">{item.quantity} {item.unit}s</td>
                      <td className="p-3 text-lab-400">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-right font-bold text-amber-400">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Kit Pricing & Bundle Discount */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 text-xs font-mono">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Bundle Pricing & Discount Calculation
            </h3>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-lab-400">
                <span>Sum of Individual Components:</span>
                <span className="text-white font-bold">{formatCurrency(selectedKit.individualTotal)}</span>
              </div>

              <div>
                <label className="text-[10px] text-lab-500 uppercase block mb-1">Configured Kit Selling Price ($)</label>
                <input
                  type="number"
                  step="0.05"
                  value={selectedKit.kitPrice}
                  onChange={(e) => handleUpdateKitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-lab-900 border border-amber-500/60 rounded-xl px-3 py-2.5 text-xl font-black text-amber-400"
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">Customer Bundle Incentive</span>
                <div className="text-base font-bold text-white">
                  {selectedKit.discountPercent}% Discount ({formatCurrency(selectedKit.savings)} Savings)
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] text-lab-500 uppercase block mb-1">Kit Inventory (Pre-Assembled)</label>
                <input
                  type="number"
                  value={selectedKit.inventoryQuantity}
                  onChange={(e) =>
                    setSelectedKit({ ...selectedKit, inventoryQuantity: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-lab-900 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
