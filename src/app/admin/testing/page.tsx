"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { testingRepository } from "@/lib/firestore/testing";
import { TestingProduct, SampleKitBundleFoundation } from "@/types/testing";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Tag, 
  SlidersHorizontal, 
  Layers, 
  AlertTriangle, 
  ExternalLink, 
  ArrowRight,
  Package,
  Edit3 
} from "lucide-react";

export default function AdminTestingDashboardPage() {
  const [products, setProducts] = useState<TestingProduct[]>([]);
  const [kits, setKits] = useState<SampleKitBundleFoundation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const prods = await testingRepository.getAllTestingProducts();
      setProducts(prods);
      const kt = await testingRepository.getTestingKits();
      setKits(kt);
      setLoading(false);
    };
    load();
  }, []);

  const totalBlotters = products.find((p) => p.testingType === "blotter_strip")?.inventory.quantityInStock || 0;
  const totalSampleBottles = products.find((p) => p.testingType === "sample_bottle")?.inventory.quantityInStock || 0;
  const totalAtomizers = products
    .filter((p) => p.testingType === "atomizer")
    .reduce((acc, p) => acc + p.inventory.quantityInStock, 0);

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest font-bold mb-1">
              <FlaskConical className="w-3.5 h-3.5" /> TESTING & OLFACTIVE EVALUATION MANAGEMENT
            </div>
            <h1 className="text-3xl font-black text-white uppercase">
              Testing Supplies & Sample Kits
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Track blotter strips, amber sample vials, 5ml/10ml atomizers, supplier costs (Amazon ASINs), and volume pricing tiers.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/testing/products/new"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold uppercase text-xs hover:brightness-110 flex items-center gap-1.5 shadow"
            >
              <Plus className="w-3.5 h-3.5" /> New Testing Supply
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Blotter Strip Stock</span>
            <span className="text-2xl font-black text-indigo-400">{totalBlotters.toLocaleString()} Strips</span>
            <span className="text-[10px] text-lab-400 block">Lint-free calibrated strips</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">5 ml Sample Vials</span>
            <span className="text-2xl font-black text-amber-400">{totalSampleBottles} Vials</span>
            <span className="text-[10px] text-lab-400 block">Amber glass with caps</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Spray Atomizers</span>
            <span className="text-2xl font-black text-emerald-400">{totalAtomizers} Units</span>
            <span className="text-[10px] text-lab-400 block">5 ml & 10 ml mist sprayers</span>
          </div>

          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
            <span className="text-lab-500 uppercase block text-[10px]">Discovery Kits</span>
            <span className="text-2xl font-black text-white">{kits.length} Bundles</span>
            <span className="text-[10px] text-lab-400 block">Foundation kits active</span>
          </div>
        </div>

        {/* Testing Products Master Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Testing Products, Supplier Costs & Margins
          </h3>

          <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Subcategory</th>
                  <th className="p-3">Supplier / ASIN</th>
                  <th className="p-3">Unit Cost</th>
                  <th className="p-3">Starting Pack</th>
                  <th className="p-3">Gross Margin</th>
                  <th className="p-3">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lab-800/60">
                {products.map((p) => {
                  const defaultPkg = p.packageOptions[0];
                  const marginPct = Math.round(((defaultPkg.unitPrice - p.unitCost) / defaultPkg.unitPrice) * 1000) / 10;
                  return (
                    <tr key={p.id} className="hover:bg-lab-800/30 transition">
                      <td className="p-3">
                        <div className="font-bold text-white uppercase">{p.name}</div>
                        <div className="text-[10px] text-lab-500 font-mono">{p.sku}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-lab-950 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase">
                          {p.subcategory}
                        </span>
                      </td>
                      <td className="p-3 text-lab-300">
                        <div>{p.supplierName} ({p.asin})</div>
                        <div className="text-[10px] text-lab-500">{formatCurrency(p.supplierCost)} / {p.supplierQuantity}u</div>
                      </td>
                      <td className="p-3 font-bold text-amber-400">
                        {formatUnitPrice(p.unitCost)} / {p.unit}
                      </td>
                      <td className="p-3 text-white font-bold">
                        {formatCurrency(defaultPkg.price)} ({defaultPkg.quantity} {p.unit}s)
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${marginPct < 25 ? "text-rose-400" : "text-emerald-400"}`}>
                          {marginPct}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${p.inventory.quantityInStock < p.inventory.lowStockThreshold ? "text-rose-400" : "text-emerald-400"}`}>
                          {p.inventory.quantityInStock} {p.unit}s
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
