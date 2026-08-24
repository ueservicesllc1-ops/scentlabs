"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { testingRepository } from "@/lib/firestore/testing";
import { TestingProduct, SampleKitBundleFoundation } from "@/types/testing";
import TestingProductEditModal from "@/components/admin/TestingProductEditModal";
import { 
  FlaskConical, 
  Plus, 
  Edit3 
} from "lucide-react";

export default function AdminTestingDashboardPage() {
  const [products, setProducts] = useState<TestingProduct[]>([]);
  const [kits, setKits] = useState<SampleKitBundleFoundation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<TestingProduct | null>(null);

  const loadData = async () => {
    setLoading(true);
    const prods = await testingRepository.getAllTestingProducts();
    setProducts(prods);
    const kt = await testingRepository.getTestingKits();
    setKits(kt);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalBlotters = products.find((p) => p.testingType === "blotter_strip")?.inventory.quantityInStock || 0;
  const totalSampleBottles = products.find((p) => p.testingType === "sample_bottle")?.inventory.quantityInStock || 0;
  const totalAtomizers = products
    .filter((p) => p.testingType === "atomizer")
    .reduce((acc, p) => acc + p.inventory.quantityInStock, 0);

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <FlaskConical className="w-3 h-3 text-gray-600" /> Testing & Olfactive Evaluation Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Testing Supplies & Sample Kits
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Track blotter strips, amber sample vials, 5ml/10ml atomizers, supplier costs (Amazon ASINs), and volume pricing tiers.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link
              href="/admin/testing/products/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> New Testing Supply
            </Link>
          </div>
        </div>

        {/* ━━━━ KPI CARDS ━━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Blotter Strip Stock</span>
            <div className="text-2xl font-bold text-gray-950">{totalBlotters.toLocaleString()} Strips</div>
            <span className="text-[11px] text-gray-500 block">Lint-free calibrated strips</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">5 ml Sample Vials</span>
            <div className="text-2xl font-bold text-[#2B5F4A]">{totalSampleBottles} Vials</div>
            <span className="text-[11px] text-gray-500 block">Amber glass with caps</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Spray Atomizers</span>
            <div className="text-2xl font-bold text-gray-950">{totalAtomizers} Units</div>
            <span className="text-[11px] text-gray-500 block">5 ml & 10 ml mist sprayers</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Discovery Kits</span>
            <div className="text-2xl font-bold text-gray-950">{kits.length} Bundles</div>
            <span className="text-[11px] text-gray-500 block">Foundation kits active</span>
          </div>
        </div>

        {/* ━━━━ TESTING PRODUCTS MASTER TABLE ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Evaluation Supplies Master List
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3 px-4">Supply Item</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Supplier ASIN</th>
                  <th className="py-3 px-4 text-right">Pack Size</th>
                  <th className="py-3 px-4 text-right">Pack Price</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const defaultPkg = p.packageOptions[0] || { quantity: 1, price: p.basePrice, unitPrice: p.basePrice };
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="font-semibold text-gray-950 text-left hover:underline"
                        >
                          {p.name}
                        </button>
                        <div className="text-[10px] text-gray-500 font-mono">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">
                          {p.testingType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-mono text-[11px]">
                        {p.asin ? `ASIN: ${p.asin}` : (p.supplierName || "Direct Supply")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">
                        {defaultPkg.quantity} units
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-950">
                        ${defaultPkg.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-600">
                        ${defaultPkg.unitPrice.toFixed(3)}/u
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#166534]">
                        {p.inventory.quantityInStock}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs transition"
                        >
                          <Edit3 className="w-3 h-3 text-gray-500" /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ━━━━ EDIT MODAL ━━━━ */}
        <TestingProductEditModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          onSaved={loadData}
        />

      </div>
    </AdminGuard>
  );
}
