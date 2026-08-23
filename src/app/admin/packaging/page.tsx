"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { packagingRepository } from "@/lib/firestore/packaging";
import { productionRepository } from "@/lib/firestore/production";
import { PackagingMaterial, BoxSizeVariant, ProductionJob } from "@/types/packaging";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Package, 
  Box, 
  Layers, 
  Scissors, 
  Plus, 
  Tag, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  RotateCcw 
} from "lucide-react";

export default function AdminPackagingDashboardPage() {
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [boxes, setBoxes] = useState<BoxSizeVariant[]>([]);
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const mats = await packagingRepository.getRawMaterials();
      setMaterials(mats);
      const bx = await packagingRepository.getBoxVariants();
      setBoxes(bx);
      const jb = await productionRepository.getProductionJobs();
      setJobs(jb);
      setLoading(false);
    };

    load();
  }, []);

  const totalRawSheets = materials.reduce((acc, m) => acc + m.quantity, 0);
  const totalFinishedBoxes = boxes.reduce((acc, b) => acc + b.inventory, 0);
  const activeJobs = jobs.filter((j) => j.status === "queued" || j.status === "cutting" || j.status === "assembly");

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">
              <Package className="w-3.5 h-3.5" /> PACKAGING & PRODUCTION SYSTEM
            </div>
            <h1 className="text-3xl font-black text-white uppercase">
              Packaging & Box Fabrication
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Manage Cricut box production, raw 110 lb cardstock sheets, shrink wrap bags, tags, and security seals.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/packaging/boxes"
              className="px-4 py-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <Box className="w-3.5 h-3.5 text-amber-400" /> Box Designer
            </Link>

            <Link
              href="/admin/packaging/production"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase hover:brightness-110 text-xs flex items-center gap-1.5 shadow"
            >
              <Scissors className="w-3.5 h-3.5" /> Production Queue
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Finished Box Stock</span>
            <span className="text-2xl font-black text-white">{totalFinishedBoxes} Units</span>
            <span className="text-[10px] text-emerald-400 block">Assembled & ready to ship</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Raw Cardstock Inventory</span>
            <span className="text-2xl font-black text-amber-400">{totalRawSheets} Sheets</span>
            <span className="text-[10px] text-lab-400 block">110 lb 8.5x11 Cardstock</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Active Cricut Jobs</span>
            <span className="text-2xl font-black text-indigo-400">{activeJobs.length} In Progress</span>
            <span className="text-[10px] text-lab-400 block">Queued or on cutting mat</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Standard Packaging Lines</span>
            <span className="text-2xl font-black text-white">4 Subcategories</span>
            <span className="text-[10px] text-lab-400 block">Boxes, Tags, Seals, Shrink</span>
          </div>
        </div>

        {/* 2-Column Grid: Finished Box Variants & Raw Materials */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Finished Box Formats */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Box className="w-4 h-4 text-amber-400" /> Cricut Box Formats & Retail Pricing
              </h3>
              <Link
                href="/admin/packaging/boxes"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                Configure <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Box Format</th>
                    <th className="p-3">Dimensions</th>
                    <th className="p-3">Sheet Yield</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-800/60">
                  {boxes.map((b) => (
                    <tr key={b.id}>
                      <td className="p-3 font-bold text-white uppercase">
                        <div>{b.name}</div>
                        <div className="text-[10px] text-lab-500 font-mono">{b.sku}</div>
                      </td>
                      <td className="p-3 text-lab-300">
                        {b.width} x {b.height} x {b.depth} in
                      </td>
                      <td className="p-3 text-lab-400 font-mono">
                        {b.sheetsRequiredPerBox} sheet / box
                      </td>
                      <td className="p-3 font-bold text-amber-400">
                        {formatUnitPrice(b.unitCost)}
                      </td>
                      <td className="p-3 font-bold text-white">
                        {formatUnitPrice(b.retailPrice)}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-indigo-400">{b.inventory} units</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Raw Cardstock Substrates */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" /> Raw Substrate Inventory
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Substrate</th>
                    <th className="p-3">Cost / Sheet</th>
                    <th className="p-3">In Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-800/60">
                  {materials.map((m) => (
                    <tr key={m.id}>
                      <td className="p-3">
                        <div className="font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-lab-500 uppercase">{m.supplier}</div>
                      </td>
                      <td className="p-3 font-bold text-amber-400">
                        {formatUnitPrice(m.unitCost)}
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${m.quantity < m.lowStockThreshold ? "text-rose-400" : "text-emerald-400"}`}>
                          {m.quantity} sheets
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
