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
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <Package className="w-3 h-3 text-gray-600" /> Packaging & Production System
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Packaging & Box Fabrication
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Manage Cricut box production, raw 110 lb cardstock sheets, shrink wrap bags, tags, and security seals.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/admin/packaging/boxes"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 text-xs font-semibold shadow-xs transition"
            >
              <Box className="w-3.5 h-3.5 text-gray-500" /> Box Designer
            </Link>

            <Link
              href="/admin/packaging/production"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider text-xs shadow-xs transition"
            >
              <Scissors className="w-3.5 h-3.5" /> Production Queue
            </Link>
          </div>
        </div>

        {/* ━━━━ KPI SUMMARY CARDS ━━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Finished Box Stock</span>
            <div className="text-2xl font-bold text-gray-950">{totalFinishedBoxes} Units</div>
            <span className="text-[11px] text-[#166534] block">Assembled & ready to ship</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Raw Cardstock Inventory</span>
            <div className="text-2xl font-bold text-[#2B5F4A]">{totalRawSheets} Sheets</div>
            <span className="text-[11px] text-gray-500 block">110 lb 8.5x11 Cardstock</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Active Cricut Jobs</span>
            <div className="text-2xl font-bold text-gray-950">{activeJobs.length} In Progress</div>
            <span className="text-[11px] text-gray-500 block">Queued or on cutting mat</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Production Capacity</span>
            <div className="text-2xl font-bold text-gray-950">1,200 Boxes/wk</div>
            <span className="text-[11px] text-gray-500 block">Dual Cricut Maker 3 Output</span>
          </div>
        </div>

        {/* ━━━━ BOXES CATALOG SECTION ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Standard Box Specifications
            </span>
            <Link
              href="/admin/packaging/boxes"
              className="text-xs text-[#2B5F4A] hover:underline font-semibold"
            >
              Configure Boxes →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3 px-4">Box Format</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Dimensions</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Inventory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {boxes.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-gray-950">{b.name}</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-[11px]">{b.sku}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono">
                      {b.width}&quot; × {b.height}&quot; × {b.depth}&quot;
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700 font-semibold">
                      ${(b.unitCost || b.costBreakdown?.unitCost || 0).toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-950 font-bold">
                      ${(b.retailPrice || b.suggestedPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#166534]">
                      {b.inventory} units
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
