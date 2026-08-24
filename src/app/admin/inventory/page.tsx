"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { inventoryRepository } from "@/lib/firestore/inventory";
import { InventoryItem, InventoryStatus, InventoryType } from "@/types/inventory";
import { calculateInventoryValuation } from "@/lib/inventory/cost";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  RotateCcw, 
  Edit3, 
  ArrowRight, 
  CheckCircle2, 
  Boxes, 
  Clock, 
  X,
  TrendingDown,
  FileText
} from "lucide-react";

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Adjustment Modal
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [newCount, setNewCount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<"Count Correction" | "Damaged" | "Lost" | "Found" | "Waste" | "Other">("Count Correction");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [adjustMsg, setAdjustMsg] = useState("");

  const loadData = async () => {
    const all = await inventoryRepository.getAllInventory();
    setItems(all);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const valuation = calculateInventoryValuation(items);
  const lowStockCount = items.filter((i) => i.status === "low_stock").length;
  const outOfStockCount = items.filter((i) => i.status === "out_of_stock").length;

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.productName.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchType = typeFilter === "all" || item.inventoryType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleOpenAdjust = (item: InventoryItem) => {
    setAdjustingItem(item);
    setNewCount(item.quantity);
    setAdjustReason("Count Correction");
    setAdjustNotes("");
    setAdjustMsg("");
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    await inventoryRepository.adjustInventory(
      adjustingItem.id,
      Number(newCount),
      adjustReason,
      adjustNotes,
      "ueservicesllc1@gmail.com"
    );

    setAdjustMsg("Stock quantity adjusted and logged in audit ledger.");
    setTimeout(async () => {
      setAdjustingItem(null);
      await loadData();
    }, 1000);
  };

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <Layers className="w-3 h-3 text-gray-600" /> Physical Stock Control & WAC Cost Ledger
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Inventory Management
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Track warehouse on-hand quantities, reserved units, weighted average cost basis, and low-stock reorder points.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs shrink-0">
            <Link
              href="/admin/inbound-notes"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold transition shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" /> + Notas de Entrada
            </Link>

            <Link
              href="/admin/inventory/audit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold transition shadow-xs"
            >
              <Clock className="w-3.5 h-3.5 text-gray-500" /> Audit Ledger
            </Link>

            <Link
              href="/admin/purchases"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold transition shadow-xs"
            >
              <Boxes className="w-3.5 h-3.5 text-gray-500" /> Purchase Orders
            </Link>

            <Link
              href="/admin/inventory/reorder"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider transition shadow-xs"
            >
              <TrendingDown className="w-3.5 h-3.5" /> Reorder Planning ({lowStockCount + outOfStockCount})
            </Link>
          </div>
        </div>

        {/* ━━━━ KPI SUMMARY CARDS ━━━━ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] text-gray-500 uppercase block font-semibold">Total Tracked SKUs</span>
            <div className="text-2xl font-bold text-gray-950">{items.length}</div>
            <span className="text-[11px] text-gray-500 block">Across 6 Inventory Types</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] text-gray-500 uppercase block font-semibold">Total Valuation (WAC)</span>
            <div className="text-2xl font-bold text-[#2B5F4A] font-mono">
              {formatCurrency(valuation.totalValuation)}
            </div>
            <span className="text-[11px] text-gray-500 block">Weighted Average Cost basis</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] text-gray-500 uppercase block font-semibold">Low Stock Alerts</span>
            <div className="text-2xl font-bold text-amber-700">{lowStockCount}</div>
            <span className="text-[11px] text-gray-500 block">At or below reorder threshold</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] text-gray-500 uppercase block font-semibold">Out of Stock</span>
            <div className="text-2xl font-bold text-red-700">{outOfStockCount}</div>
            <span className="text-[11px] text-gray-500 block">Available stock is 0</span>
          </div>
        </div>

        {/* Valuation by Category Pills */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-2">
          <span className="text-[11px] text-gray-500 uppercase font-bold block">Cost Valuation Breakdown:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(valuation.byCategory).map(([cat, val]) => (
              <span key={cat} className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">
                <strong className="text-gray-950 font-semibold">{cat}:</strong>{" "}
                <span className="text-[#2B5F4A] font-mono font-bold">{formatCurrency(val)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ━━━━ FILTER & SEARCH BAR ━━━━ */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col md:flex-row justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, SKU, or lot..."
              className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:ring-1 focus:ring-[#2B5F4A]"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by stock status"
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by inventory type"
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
            >
              <option value="all">All Types</option>
              <option value="finished_product">Finished Product</option>
              <option value="bulk_material">Bulk Material</option>
              <option value="raw_material">Raw Material</option>
              <option value="consumable">Consumable / Tools</option>
            </select>
          </div>
        </div>

        {/* ━━━━ STOCK ITEMS TABLE ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3.5 px-4">Product / SKU</th>
                  <th className="py-3.5 px-4">Type & Category</th>
                  <th className="py-3.5 px-4 text-right">On Hand</th>
                  <th className="py-3.5 px-4 text-right">Reserved</th>
                  <th className="py-3.5 px-4 text-right">Available</th>
                  <th className="py-3.5 px-4 text-right">Reorder Pt</th>
                  <th className="py-3.5 px-4 text-right">Avg Cost</th>
                  <th className="py-3.5 px-4 text-right">Total Value</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const available = Math.max(0, item.quantity - item.reserved);
                  const totalVal = available * item.averageCost;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-950 text-xs">
                          {item.productName}
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">{item.sku}</span>
                      </td>

                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-gray-900 font-medium">{item.category || "General"}</div>
                        <div className="text-[10px] text-gray-500 uppercase">{item.inventoryType.replace("_", " ")}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-gray-950 font-mono">
                        {item.quantity.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal">{item.unit}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                        {item.reserved}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold font-mono text-gray-950">
                        {available.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                        {item.reorderPoint}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-gray-900">
                        {formatCurrency(item.averageCost)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#2B5F4A]">
                        {formatCurrency(totalVal)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === "in_stock"
                              ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                              : item.status === "low_stock"
                              ? "bg-amber-50 border-amber-200 text-amber-800"
                              : "bg-red-50 border-red-200 text-red-800"
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs transition"
                        >
                          <Edit3 className="w-3 h-3 text-gray-500" /> Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ━━━━ ADJUSTMENT MODAL ━━━━ */}
        {adjustingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md w-full space-y-4 shadow-xl text-xs">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="font-bold text-gray-950 text-sm">
                  Adjust Physical Stock: {adjustingItem.productName}
                </span>
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="p-1 rounded-lg text-gray-500 hover:text-gray-950 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {adjustMsg && (
                <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-[#166534] font-semibold">
                  {adjustMsg}
                </div>
              )}

              <form onSubmit={handleSaveAdjustment} className="space-y-4">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">New Physical Count ({adjustingItem.unit})</label>
                  <input
                    type="number"
                    value={newCount}
                    onChange={(e) => setNewCount(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono font-bold focus:border-[#2B5F4A] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Reason for Adjustment</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  >
                    <option value="Count Correction">Count Correction (Cycle Count)</option>
                    <option value="Damaged">Damaged Goods</option>
                    <option value="Lost">Lost / Unaccounted</option>
                    <option value="Found">Found Inventory</option>
                    <option value="Waste">Formulation Waste</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Internal Audit Notes</label>
                  <textarea
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    placeholder="Provide context for warehouse audit tracking..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none h-20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setAdjustingItem(null)}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider transition shadow-xs"
                  >
                    Record Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  );
}
