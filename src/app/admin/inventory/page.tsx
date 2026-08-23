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
  TrendingDown 
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
    const matchSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        {/* Header */}
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              PHYSICAL STOCK CONTROL & WAC COST LEDGER
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              Inventory Management
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/admin/inventory/reorder"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-amber-400 font-bold uppercase transition flex items-center gap-1.5"
            >
              <TrendingDown className="w-3.5 h-3.5" /> Reorder Planning ({lowStockCount + outOfStockCount})
            </Link>

            <Link
              href="/admin/purchases"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-white font-bold uppercase transition flex items-center gap-1.5"
            >
              <Boxes className="w-3.5 h-3.5 text-amber-400" /> Purchase Orders
            </Link>

            <Link
              href="/admin/inventory/audit"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-lab-300 font-bold uppercase transition flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" /> Audit Ledger
            </Link>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Total Tracked SKUs</span>
            <div className="text-2xl font-black text-white">{items.length}</div>
            <span className="text-[10px] text-lab-400 block">Across 6 Inventory Types</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Total Inventory Value (WAC)</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {formatCurrency(valuation.totalValuation)}
            </div>
            <span className="text-[10px] text-lab-400 block">Weighted Average Cost basis</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Low Stock Alerts</span>
            <div className="text-2xl font-black text-amber-400">{lowStockCount}</div>
            <span className="text-[10px] text-lab-400 block">At or below reorder threshold</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Out of Stock</span>
            <div className="text-2xl font-black text-rose-400">{outOfStockCount}</div>
            <span className="text-[10px] text-lab-400 block">Available stock is 0</span>
          </div>
        </div>

        {/* Valuation by Category Pills */}
        <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950/60 space-y-2">
          <span className="text-[10px] text-lab-500 uppercase font-bold block">Cost Valuation Breakdown:</span>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(valuation.byCategory).map(([cat, val]) => (
              <span key={cat} className="px-3 py-1 rounded-xl bg-lab-900 border border-lab-800 text-lab-300">
                <strong className="text-white">{cat}:</strong> <span className="text-amber-400 font-mono font-bold">{formatCurrency(val)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 flex flex-col md:flex-row justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-lab-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, SKU, or lot..."
              className="w-full bg-lab-900 border border-lab-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="all">All Types</option>
              <option value="finished_product">Finished Product</option>
              <option value="bulk_material">Bulk Material</option>
              <option value="raw_material">Raw Material</option>
              <option value="consumable">Consumable / Tools</option>
            </select>
          </div>
        </div>

        {/* Stock Items Table */}
        <div className="rounded-2xl border border-lab-800 bg-lab-950 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
                <tr>
                  <th className="p-3.5">Product / SKU</th>
                  <th className="p-3.5">Type & Category</th>
                  <th className="p-3.5 text-right">On Hand</th>
                  <th className="p-3.5 text-right">Reserved</th>
                  <th className="p-3.5 text-right">Available</th>
                  <th className="p-3.5 text-right">Reorder Pt</th>
                  <th className="p-3.5 text-right">Avg Cost</th>
                  <th className="p-3.5 text-right">Total Value</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lab-900 text-lab-300">
                {filteredItems.map((item) => {
                  const available = Math.max(0, item.quantity - item.reserved);
                  const totalVal = available * item.averageCost;

                  return (
                    <tr key={item.id} className="hover:bg-lab-900/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white uppercase text-[11px] leading-tight">
                          {item.productName}
                        </div>
                        <span className="text-[10px] text-lab-500 font-mono">{item.sku}</span>
                      </td>

                      <td className="p-3.5 text-[11px]">
                        <div className="text-white">{item.category || "General"}</div>
                        <div className="text-[10px] text-lab-500 uppercase">{item.inventoryType.replace("_", " ")}</div>
                      </td>

                      <td className="p-3.5 text-right font-bold text-white font-mono">
                        {item.quantity.toLocaleString()} <span className="text-[10px] text-lab-500">{item.unit}</span>
                      </td>

                      <td className="p-3.5 text-right text-amber-400 font-mono">
                        {item.reserved.toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right font-black text-emerald-400 font-mono">
                        {available.toLocaleString()}
                      </td>

                      <td className="p-3.5 text-right text-lab-400 font-mono">
                        {item.reorderPoint}
                      </td>

                      <td className="p-3.5 text-right font-mono text-lab-300">
                        {formatCurrency(item.averageCost)}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-amber-400">
                        {formatCurrency(totalVal)}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === "in_stock"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            : item.status === "low_stock"
                            ? "bg-amber-950 text-amber-400 border border-amber-500/30"
                            : "bg-rose-950 text-rose-400 border border-rose-500/30"
                        }`}>
                          {item.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(item)}
                          className="px-2.5 py-1 rounded-lg bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-lab-300 hover:text-white text-[11px] font-bold uppercase transition inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" /> Adjust
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Adjustment Modal */}
        {adjustingItem && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-lab-950 border border-lab-800 p-6 space-y-4 shadow-2xl font-mono text-xs">
              <div className="flex justify-between items-center border-b border-lab-900 pb-3">
                <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" /> Adjust Physical Count
                </h3>
                <button type="button" onClick={() => setAdjustingItem(null)} className="text-lab-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {adjustMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{adjustMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveAdjustment} className="space-y-3.5">
                <div>
                  <span className="text-[10px] text-lab-500 uppercase block">Product SKU</span>
                  <span className="text-white font-bold">{adjustingItem.productName} ({adjustingItem.sku})</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Previous Count</label>
                    <input
                      type="text"
                      disabled
                      value={`${adjustingItem.quantity} ${adjustingItem.unit}`}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-lab-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">New Count</label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={newCount}
                      onChange={(e) => setNewCount(parseFloat(e.target.value))}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Reason</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value as any)}
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Count Correction">Count Correction (Cycle Count)</option>
                    <option value="Damaged">Damaged Goods</option>
                    <option value="Lost">Lost / Unaccounted</option>
                    <option value="Waste">Production Waste / Spillage</option>
                    <option value="Found">Found Stock</option>
                    <option value="Other">Other Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Audit Notes</label>
                  <textarea
                    rows={2}
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    placeholder="Provide details for inventory ledger..."
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white placeholder-lab-600 focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustingItem(null)}
                    className="px-4 py-2 rounded-xl bg-lab-900 text-lab-400 hover:text-white uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase"
                  >
                    Confirm Adjustment
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
