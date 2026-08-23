"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { fragranceRepository } from "@/lib/firestore/fragrance";
import { FragranceOil } from "@/types/fragrance";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Droplet, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  AlertTriangle, 
  Package, 
  ArrowRight, 
  Edit3, 
  UploadCloud, 
  SlidersHorizontal,
  RefreshCw 
} from "lucide-react";

export default function AdminFragranceDashboardPage() {
  const [fragrances, setFragrances] = useState<FragranceOil[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState("all");

  const fetchFragrances = async () => {
    setLoading(true);
    const all = await fragranceRepository.getAllFragrances();
    setFragrances(all);
    setLoading(false);
  };

  useEffect(() => {
    fetchFragrances();
  }, []);

  const totalBulkOz = fragrances.reduce((acc, f) => acc + (f.inventoryVolumeOz || 0), 0);
  const totalRepackagedUnits = fragrances.reduce(
    (acc, f) => acc + f.repackagingVariants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0),
    0
  );
  const lowStockCount = fragrances.filter((f) => f.inventoryVolumeOz < 32).length;

  const filtered = fragrances.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.scentFamily.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.supplierProductId && f.supplierProductId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFamily = familyFilter === "all" || f.scentFamily.toLowerCase() === familyFilter.toLowerCase();
    return matchesSearch && matchesFamily;
  });

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">
              <Droplet className="w-3.5 h-3.5" /> BULK REPACKAGING & OIL FORMULATION
            </div>
            <h1 className="text-3xl font-black text-white uppercase">
              Fragrance Oils Management
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Track source purchases (Africa Imports), bulk inventory, fractioning conversions, and retail margins.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/imports"
              className="px-4 py-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5 text-indigo-400" /> Import CSV
            </Link>

            <Link
              href="/admin/fragrance/new"
              className="px-4 py-2 rounded-lg bg-amber-500 text-lab-950 hover:brightness-110 text-xs font-bold uppercase flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> New Fragrance Oil
            </Link>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Total Formulations</span>
            <span className="text-2xl font-black text-white">{fragrances.length} Oils</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Bulk Inventory</span>
            <span className="text-2xl font-black text-amber-400">{Math.round(totalBulkOz)} fl oz</span>
            <span className="text-[10px] text-lab-400 block">~{Math.round((totalBulkOz / 128) * 10) / 10} gallons</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Repackaged Stock</span>
            <span className="text-2xl font-black text-indigo-400">{totalRepackagedUnits} Units</span>
            <span className="text-[10px] text-lab-400 block">Bottled & ready to ship</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Low Bulk Stock (&lt;32 oz)</span>
            <span className="text-2xl font-black text-rose-400">{lowStockCount} Oils</span>
            <span className="text-[10px] text-lab-400 block">Requires reorder</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-lab-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by fragrance name, accord, or supplier SKU..."
              className="w-full bg-lab-950 border border-lab-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Scent Families</option>
              <option value="woody">Woody</option>
              <option value="amber">Amber</option>
              <option value="tobacco">Tobacco</option>
              <option value="fresh">Fresh</option>
              <option value="floral">Floral</option>
              <option value="citrus">Citrus</option>
            </select>
          </div>
        </div>

        {/* Fragrance Table */}
        <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Fragrance Oil</th>
                <th className="p-3">Scent Family</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Source Purchase</th>
                <th className="p-3">Cost / Oz</th>
                <th className="p-3">Bulk Stock</th>
                <th className="p-3">Variants</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-lab-500">
                    No fragrance oils found.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-lab-800/30 transition">
                    <td className="p-3">
                      <div className="font-bold text-white uppercase">{f.name}</div>
                      <div className="text-[10px] text-lab-500 font-mono">{f.slug}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-lab-950 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase">
                        {f.scentFamily}
                      </span>
                    </td>
                    <td className="p-3 text-lab-300">
                      <div>{f.supplierName || "Africa Imports"}</div>
                      <div className="text-[10px] text-lab-500">{f.supplierProductId || "N/A"}</div>
                    </td>
                    <td className="p-3 text-lab-300">
                      <div>{f.sourceSize} {f.sourceUnit}</div>
                      <div className="text-[10px] text-lab-500">{formatCurrency(f.sourceCost)} total</div>
                    </td>
                    <td className="p-3 font-bold text-amber-400">
                      {formatUnitPrice(f.costPerOz)}/oz
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${f.inventoryVolumeOz < 32 ? "text-rose-400" : "text-emerald-400"}`}>
                        {f.inventoryVolumeOz} oz
                      </span>
                    </td>
                    <td className="p-3 text-lab-300">
                      {f.repackagingVariants.length} sizes ({f.repackagingVariants.map((v) => `${v.sellingSize}oz`).join(", ")})
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/fragrance/${f.id}`}
                        className="px-3 py-1.5 rounded bg-lab-800 hover:bg-lab-700 text-white transition text-[11px] inline-flex items-center gap-1 border border-lab-700"
                      >
                        <Edit3 className="w-3 h-3" /> Edit / Fraction
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
