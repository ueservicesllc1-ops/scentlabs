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
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <Sparkles className="w-3 h-3 text-gray-600" /> Perfume Making & Studio Compounding
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Perfume Making Management
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Manage perfumer&apos;s base alcohol, Steve Spangler containers, fractioning presentations (1L, 500ml, 250ml), and compounding studio kits.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link
              href="/admin/perfume-making/bases"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold shadow-xs transition"
            >
              <FlaskConical className="w-3.5 h-3.5 text-gray-500" /> Base Formulations
            </Link>

            <Link
              href="/admin/perfume-making/kits"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Studio Kits Builder
            </Link>
          </div>
        </div>

        {/* ━━━━ KPI CARDS ━━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Bulk Base Alcohol</span>
            <div className="text-2xl font-bold text-[#2B5F4A]">{Math.round(totalBaseLiters * 10) / 10} Liters</div>
            <span className="text-[11px] text-gray-500 block">Nature&apos;s Oil 200-Proof</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">1L Steve Spangler Bottles</span>
            <div className="text-2xl font-bold text-gray-950">45 Units</div>
            <span className="text-[11px] text-gray-500 block">Dispensing containers in stock</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Studio Compounding Kits</span>
            <div className="text-2xl font-bold text-gray-950">{kits.length} Bundles</div>
            <span className="text-[11px] text-[#166534] block">Active studio bundles</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Base Retail Pricing</span>
            <div className="text-2xl font-bold text-gray-950">$21.99 / Liter</div>
            <span className="text-[11px] text-gray-500 block">58.4% gross profit margin</span>
          </div>
        </div>

        {/* ━━━━ BASES TABLE ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Compounding Base Presentations
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3 px-4">Base Formulation</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Volume</th>
                  <th className="py-3 px-4 text-right">Cost / L</th>
                  <th className="py-3 px-4 text-right">Presentations</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bases.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-950">{b.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{b.slug}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{b.supplierName || "Nature's Oil"}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold">{b.inventoryVolumeLiters} L</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-600">${b.costPerLiter?.toFixed(2) || "13.21"}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-950">
                      {b.repackagingVariants?.length || 0} sizes
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/perfume-making/bases/${b.id}`}
                        className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs transition"
                      >
                        <Edit3 className="w-3 h-3 text-gray-500" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminGuard>
  );
}
