"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { supplierRepository } from "@/lib/firestore/suppliers";
import { Supplier, SupplierPriceHistory } from "@/types/supplier";
import { formatCurrency } from "@/lib/utils";
import { 
  Clock, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Building2, 
  AlertCircle 
} from "lucide-react";

export default function AdminSupplierPriceHistoryPage() {
  const params = useParams();
  const id = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [history, setHistory] = useState<SupplierPriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supplierRepository.getSupplierById(id),
      supplierRepository.getPriceHistoryBySupplier(id),
    ]).then(([s, h]) => {
      setSupplier(s);
      setHistory(h);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-12 text-center text-xs font-mono text-lab-500">Loading price history...</div>
      </AdminGuard>
    );
  }

  if (!supplier) {
    return (
      <AdminGuard>
        <div className="max-w-md mx-auto my-20 p-8 text-center border border-lab-800 rounded-2xl bg-lab-950 font-mono text-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-white font-bold uppercase">Supplier Not Found</h2>
          <Link href="/admin/suppliers" className="text-amber-400 font-bold uppercase underline">
            Back to Suppliers
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
              SUPPLIER COST FLUCTUATION AUDIT
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              {supplier.name} — Price History
            </h1>
          </div>

          <Link
            href={`/admin/suppliers/${supplier.id}`}
            className="text-xs text-lab-400 hover:text-white flex items-center gap-1 uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vendor Profile
          </Link>
        </div>

        {/* Ledger Table */}
        <div className="rounded-2xl border border-lab-800 bg-lab-950 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
              <tr>
                <th className="p-3.5">Effective Date</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5 text-right">Old Cost</th>
                <th className="p-3.5 text-right">New Cost</th>
                <th className="p-3.5 text-center">Trend</th>
                <th className="p-3.5">PO Reference</th>
                <th className="p-3.5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-900 text-lab-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-lab-500">
                    No price changes recorded yet. Initial costs are active.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-lab-900/40 transition">
                    <td className="p-3.5 text-[10px] text-lab-400 whitespace-nowrap">
                      {new Date(h.effectiveDate).toLocaleDateString()}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-white uppercase text-[11px]">{h.productName}</div>
                      <span className="text-[10px] text-lab-500 font-mono">{h.productId}</span>
                    </td>

                    <td className="p-3.5 text-right font-mono text-lab-400">
                      {formatCurrency(h.oldCost)}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-white">
                      {formatCurrency(h.newCost)}
                    </td>

                    <td className="p-3.5 text-center">
                      {h.changeType === "increased" ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                          <TrendingUp className="w-2.5 h-2.5" /> Increased
                        </span>
                      ) : h.changeType === "decreased" ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                          <TrendingDown className="w-2.5 h-2.5" /> Decreased
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-lab-900 text-lab-400 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                          <Minus className="w-2.5 h-2.5" /> Unchanged
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono text-amber-400 text-[11px]">
                      {h.purchaseOrderId || "PO-000001"}
                    </td>

                    <td className="p-3.5 text-[10px] text-lab-400">
                      {h.notes || "—"}
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
