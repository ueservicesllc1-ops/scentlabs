"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { inventoryRepository } from "@/lib/firestore/inventory";
import { InventoryTransaction } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { 
  Clock, 
  ArrowLeft, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  FileText 
} from "lucide-react";

export default function AdminInventoryAuditPage() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    inventoryRepository.getTransactions(100).then((txs) => {
      setTransactions(txs);
      setLoading(false);
    });
  }, []);

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      (tx.productName || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.referenceId || "").toLowerCase().includes(search.toLowerCase()) ||
      (tx.notes || "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || tx.type === typeFilter;
    return matchSearch && matchType;
  });

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "bg-emerald-950 text-emerald-400 border border-emerald-500/30";
      case "sale":
        return "bg-sky-950 text-sky-400 border border-sky-500/30";
      case "reservation":
        return "bg-amber-950 text-amber-400 border border-amber-500/30";
      case "release":
        return "bg-teal-950 text-teal-400 border border-teal-500/30";
      case "waste":
      case "damage":
        return "bg-rose-950 text-rose-400 border border-rose-500/30";
      default:
        return "bg-lab-900 text-lab-300 border border-lab-700";
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex justify-between items-end">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              HISTORICAL INVENTORY LEDGER
            </span>
            <h1 className="text-2xl font-black text-white uppercase">
              Inventory Audit Trail
            </h1>
          </div>

          <Link
            href="/admin/inventory"
            className="text-xs text-lab-400 hover:text-white flex items-center gap-1 uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Inventory
          </Link>
        </div>

        {/* Filter bar */}
        <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 flex flex-col md:flex-row justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-lab-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product, order/PO reference, or audit notes..."
              className="w-full bg-lab-900 border border-lab-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="all">All Movement Types</option>
              <option value="purchase">Purchases (Stock Received)</option>
              <option value="sale">Sales (Orders Dispatched)</option>
              <option value="reservation">Reservations</option>
              <option value="release">Releases</option>
              <option value="adjustment">Manual Adjustments</option>
              <option value="waste">Waste / Spillage</option>
              <option value="damage">Damage</option>
            </select>
          </div>
        </div>

        {/* Audit Trail Table */}
        <div className="rounded-2xl border border-lab-800 bg-lab-950 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Movement Type</th>
                <th className="p-3.5 text-right">Delta</th>
                <th className="p-3.5 text-right">Before $\to$ After</th>
                <th className="p-3.5">Reference</th>
                <th className="p-3.5">User / Source</th>
                <th className="p-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-900 text-lab-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-lab-500">Loading audit ledger...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-lab-500">No stock movement logs found.</td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-lab-900/40 transition">
                    <td className="p-3.5 text-[10px] text-lab-400 whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-white uppercase text-[11px]">
                        {tx.productName || tx.productId}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeColor(tx.type)}`}>
                        {tx.type}
                      </span>
                    </td>

                    <td className={`p-3.5 text-right font-mono font-bold ${
                      tx.quantity > 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </td>

                    <td className="p-3.5 text-right font-mono text-[11px] text-lab-400 whitespace-nowrap">
                      {tx.previousQuantity} $\to$ <strong className="text-white">{tx.newQuantity}</strong>
                    </td>

                    <td className="p-3.5 text-[10px] text-amber-400 font-mono">
                      {tx.referenceType.toUpperCase()}: {tx.referenceId || "N/A"}
                    </td>

                    <td className="p-3.5 text-[10px] text-lab-400">
                      {tx.createdBy}
                    </td>

                    <td className="p-3.5 text-[10px] text-lab-400 max-w-xs truncate">
                      {tx.notes || tx.reason || "—"}
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
