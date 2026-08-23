"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { perfumeMakingRepository } from "@/lib/firestore/perfume-making";
import { PerfumeBase, KitProduct } from "@/types/perfume-making";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Sparkles, 
  FlaskConical, 
  Box, 
  Tag, 
  Droplet, 
  Layers, 
  Plus, 
  SlidersHorizontal,
  ArrowRight,
  Edit3 
} from "lucide-react";

export default function AdminPerfumeMakingDashboardPage() {
  const [bases, setBases] = useState<PerfumeBase[]>([]);
  const [kits, setKits] = useState<KitProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const bs = await perfumeMakingRepository.getAllBases();
      setBases(bs);
      const kt = await perfumeMakingRepository.getAllKits();
      setKits(kt);
      setLoading(false);
    };
    load();
  }, []);

  const totalBaseLiters = bases.reduce((acc, b) => acc + b.inventoryVolumeLiters, 0);

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> PERFUME MAKING & STUDIO COMPOUNDING
            </div>
            <h1 className="text-3xl font-black text-white uppercase">
              Perfume Making Management
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Manage perfumer&apos;s base alcohol, Steve Spangler containers, fractioning presentations (1L, 500ml, 250ml), and compounding studio kits.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/perfume-making/bases"
              className="px-4 py-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5 text-indigo-400" /> Base Formulations
            </Link>

            <Link
              href="/admin/perfume-making/kits"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-xs hover:brightness-110 flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Studio Kits Builder
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Bulk Base Alcohol</span>
            <span className="text-2xl font-black text-amber-400">{Math.round(totalBaseLiters * 10) / 10} Liters</span>
            <span className="text-[10px] text-lab-400 block">Nature&apos;s Oil 200-Proof</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">1L Steve Spangler Bottles</span>
            <span className="text-2xl font-black text-indigo-400">45 Units</span>
            <span className="text-[10px] text-lab-400 block">Dispensing containers in stock</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Studio Compounding Kits</span>
            <span className="text-2xl font-black text-white">{kits.length} Bundles</span>
            <span className="text-[10px] text-emerald-400 block">Active studio bundles</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Base Retail Pricing</span>
            <span className="text-2xl font-black text-white">$21.99 / Liter</span>
            <span className="text-[10px] text-lab-400 block">58.4% gross profit margin</span>
          </div>
        </div>

        {/* Perfume Bases & Kits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Perfumer's Base Variants */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-indigo-400" /> Perfumer&apos;s Base Presentations & Costs
            </h3>

            <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Presentation</th>
                    <th className="p-3">Container</th>
                    <th className="p-3">Unit Cost</th>
                    <th className="p-3">Selling Price</th>
                    <th className="p-3">Margin</th>
                    <th className="p-3">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-800/60">
                  {bases[0]?.repackagingVariants.map((v) => (
                    <tr key={v.id}>
                      <td className="p-3 font-bold text-white uppercase">{v.name}</td>
                      <td className="p-3 text-lab-400">
                        {v.size >= 1 ? "Steve Spangler 1L Soda Bottle ($1.43)" : "Glass Dispensing Bottle"}
                      </td>
                      <td className="p-3 font-bold text-amber-400">{formatUnitPrice(v.unitCost)}</td>
                      <td className="p-3 font-bold text-white">{formatUnitPrice(v.retailPrice)}</td>
                      <td className="p-3 text-emerald-400 font-bold">{v.marginPercent}%</td>
                      <td className="p-3 text-indigo-400 font-bold">{v.inventoryQuantity} u</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Active Studio Kits */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Studio Bundles & Kits
            </h3>

            <div className="space-y-3">
              {kits.map((kit) => (
                <div key={kit.id} className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white uppercase">{kit.name}</h4>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        {kit.discountPercent}% Bundle Savings (${kit.savings.toFixed(2)})
                      </span>
                    </div>
                    <span className="text-base font-black text-amber-400">{formatCurrency(kit.kitPrice)}</span>
                  </div>

                  <div className="space-y-1 text-lab-400 text-[11px] border-t border-lab-900 pt-2">
                    {kit.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>• {it.quantity}x {it.productName}</span>
                        <span className="font-mono text-lab-500">{formatCurrency(it.unitPrice * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-lab-900 flex justify-between items-center text-[10px] text-lab-500">
                    <span>Individual Sum: {formatCurrency(kit.individualTotal)}</span>
                    <span className="font-bold text-indigo-400">{kit.inventoryQuantity} Kits Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
