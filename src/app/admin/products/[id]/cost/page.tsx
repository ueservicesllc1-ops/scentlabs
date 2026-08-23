"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { inventoryRepository } from "@/lib/firestore/inventory";
import { InventoryItem, CostHistory } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { 
  DollarSign, 
  ArrowLeft, 
  Clock, 
  TrendingUp, 
  Layers, 
  ShieldAlert, 
  AlertCircle 
} from "lucide-react";

export default function AdminProductCostPage() {
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<CostHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      inventoryRepository.getInventory(id),
      inventoryRepository.getCostHistory(id),
    ]).then(([inv, costHist]) => {
      setItem(inv);
      setHistory(costHist);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-12 text-center text-xs font-mono text-lab-500">Loading cost tracking records...</div>
      </AdminGuard>
    );
  }

  if (!item) {
    return (
      <AdminGuard>
        <div className="max-w-md mx-auto my-20 p-8 text-center border border-lab-800 rounded-2xl bg-lab-950 font-mono text-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-white font-bold uppercase">Product Cost File Not Found</h2>
          <Link href="/admin/inventory" className="text-amber-400 font-bold uppercase underline">
            Back to Inventory
          </Link>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              WEIGHTED AVERAGE COST & SUPPLIER HISTORY
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              {item.productName}
            </h1>
          </div>

          <Link
            href="/admin/inventory"
            className="text-xs text-lab-400 hover:text-white flex items-center gap-1 uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Inventory
          </Link>
        </div>

        {/* Cost Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">Weighted Average Cost</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {formatCurrency(item.averageCost)}
            </div>
            <span className="text-[10px] text-lab-400">Inventory valuation basis</span>
          </div>

          <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">Last Purchase Cost</span>
            <div className="text-2xl font-black text-white font-mono">
              {formatCurrency(item.lastCost)}
            </div>
            <span className="text-[10px] text-lab-400">Most recent receipt</span>
          </div>

          <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">Supplier</span>
            <div className="text-white font-bold truncate">{item.supplierName || "Default Supplier"}</div>
            <span className="text-[10px] text-lab-400">Pack: {item.supplierPackSize || 100}u</span>
          </div>

          <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">Available Stock</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {item.available} {item.unit}
            </div>
            <span className="text-[10px] text-lab-400">Total Value: {formatCurrency(item.available * item.averageCost)}</span>
          </div>
        </div>

        {/* Cost History Audit Table */}
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 shadow-xl text-xs">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Historical Cost Ledger
          </h2>

          <div className="rounded-xl border border-lab-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
                <tr>
                  <th className="p-3">Effective Date</th>
                  <th className="p-3 text-right">Previous Cost</th>
                  <th className="p-3 text-right">New WAC Cost</th>
                  <th className="p-3">Supplier / PO Reference</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lab-900 text-lab-300">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-lab-500">
                      Initial baseline cost established at {formatCurrency(item.averageCost)}.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id} className="hover:bg-lab-900/40 transition">
                      <td className="p-3 text-[10px] text-lab-400">
                        {new Date(h.effectiveDate).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-lab-400">
                        {formatCurrency(h.oldCost)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-400">
                        {formatCurrency(h.newCost)}
                      </td>
                      <td className="p-3 text-white">
                        {h.supplierName || "Supplier"} {h.purchaseId ? `(${h.purchaseId})` : ""}
                      </td>
                      <td className="p-3 text-lab-400">
                        {h.createdBy}
                      </td>
                      <td className="p-3 text-[10px] text-lab-400">
                        {h.notes || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
