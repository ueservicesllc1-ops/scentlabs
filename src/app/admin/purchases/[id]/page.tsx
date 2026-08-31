"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { purchaseRepository } from "@/lib/firestore/purchases";
import { Purchase } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { 
  Boxes, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Truck, 
  DollarSign, 
  FileText 
} from "lucide-react";

export default function AdminPurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    purchaseRepository.getPurchaseById(id).then((po) => {
      setPurchase(po);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-12 text-center text-xs font-mono text-lab-500">Loading purchase order...</div>
      </AdminGuard>
    );
  }

  if (!purchase) {
    return (
      <AdminGuard>
        <div className="max-w-md mx-auto my-20 p-8 text-center border border-lab-800 rounded-2xl bg-lab-950 font-mono text-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-white font-bold uppercase">Purchase Order Not Found</h2>
          <Link href="/admin/purchases" className="text-amber-400 font-bold uppercase underline">
            Back to PO List
          </Link>
        </div>
      </AdminGuard>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return "bg-emerald-950 text-emerald-400 border border-emerald-500/30";
      case "partially_received":
        return "bg-amber-950 text-amber-400 border border-amber-500/30";
      case "ordered":
        return "bg-sky-950 text-sky-400 border border-sky-500/30";
      case "draft":
        return "bg-lab-900 text-lab-400 border border-lab-700";
      default:
        return "bg-lab-900 text-lab-300 border border-lab-700";
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8 print:p-0 print:m-0 print:max-w-none">
        {/* Actions Header (Hidden on Print) */}
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              OFFICIAL PURCHASE ORDER RECORD
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              {purchase.purchaseNumber}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-300 hover:text-white uppercase font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print PO Document
            </button>

            {purchase.status !== "received" && (
              <Link
                href={`/admin/purchases/${purchase.id}/receive`}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase hover:brightness-110 transition flex items-center gap-1.5 shadow"
              >
                <Truck className="w-3.5 h-3.5" /> Receive Shipment
              </Link>
            )}

            <Link
              href="/admin/purchases"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white uppercase font-bold transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All POs
            </Link>
          </div>
        </div>

        {/* Printable PO Document Card */}
        <div className="p-8 rounded-2xl border border-lab-800 bg-lab-950 space-y-6 shadow-2xl print:border-none print:bg-white print:text-black print:p-0">
          {/* Header */}
          <div className="border-b border-lab-800 print:border-gray-300 pb-6 flex justify-between items-start">
            <div>
              <div className="text-2xl font-black text-amber-400 print:text-black uppercase tracking-wider">
                SCENTLAB FORMULATIONS
              </div>
              <div className="text-[11px] text-lab-400 print:text-gray-600 mt-1">
                ScentLabs Direct Lab Facility<br />
                New Jersey, NJ • United States<br />
                procurement@scentlab.com
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xl font-bold text-white print:text-black font-mono">
                {purchase.purchaseNumber}
              </div>
              <div className="text-xs text-lab-400 print:text-gray-600">
                Date: {new Date(purchase.purchaseDate).toLocaleDateString()}
              </div>
              <div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase print:border print:border-black ${getStatusBadge(purchase.status)}`}>
                  {purchase.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-lab-900/60 print:bg-gray-50 border border-lab-800 print:border-gray-300 space-y-1">
              <span className="text-[10px] text-lab-500 print:text-gray-500 uppercase font-bold block">Vendor / Supplier</span>
              <div className="text-white print:text-black font-bold text-sm">{purchase.supplierName}</div>
              <div className="text-lab-400 print:text-gray-600 text-[11px]">Supplier ID: {purchase.supplierId}</div>
            </div>

            <div className="p-4 rounded-xl bg-lab-900/60 print:bg-gray-50 border border-lab-800 print:border-gray-300 space-y-1">
              <span className="text-[10px] text-lab-500 print:text-gray-500 uppercase font-bold block">Ship To Warehouse</span>
              <div className="text-white print:text-black font-bold">SCENTLAB Fulfillment Center</div>
              <div className="text-lab-400 print:text-gray-600 text-[11px]">Dock #2 — Inbound Receiving</div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-xl border border-lab-800 print:border-gray-300 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-lab-900/80 print:bg-gray-100 text-[10px] text-lab-400 print:text-gray-700 uppercase border-b border-lab-800 print:border-gray-300">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Vendor SKU</th>
                  <th className="p-3 text-right">Qty Ordered</th>
                  <th className="p-3 text-right">Unit Cost</th>
                  <th className="p-3 text-right">Landed Unit Cost</th>
                  <th className="p-3 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lab-900 print:divide-gray-200 text-lab-300 print:text-gray-900">
                {purchase.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3">
                      <div className="font-bold text-white print:text-black uppercase text-[11px]">{item.productName}</div>
                      <span className="text-[10px] text-lab-500 print:text-gray-500">ID: {item.productId}</span>
                    </td>

                    <td className="p-3 font-mono text-[11px]">
                      {item.sku || item.supplierProductId || "—"}
                    </td>

                    <td className="p-3 text-right font-bold text-white print:text-black font-mono">
                      {item.quantityOrdered} {item.unit}
                    </td>

                    <td className="p-3 text-right font-mono">
                      {formatCurrency(item.unitCost)}
                    </td>

                    <td className="p-3 text-right font-mono text-amber-400 print:text-black font-bold">
                      {formatCurrency(item.landedUnitCost || item.unitCost)}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-white print:text-black">
                      {formatCurrency(item.quantityOrdered * item.unitCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cost Breakdown Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-72 space-y-2 text-xs font-mono border-t border-lab-900 print:border-gray-300 pt-3">
              <div className="flex justify-between text-lab-400 print:text-gray-600">
                <span>Subtotal Items:</span>
                <span className="text-white print:text-black font-bold">{formatCurrency(purchase.subtotal)}</span>
              </div>

              <div className="flex justify-between text-lab-400 print:text-gray-600">
                <span>Supplier Freight / Shipping:</span>
                <span className="text-white print:text-black">{formatCurrency(purchase.shipping || purchase.shippingCost || 0)}</span>
              </div>

              <div className="flex justify-between text-lab-400 print:text-gray-600">
                <span>Estimated Tax:</span>
                <span className="text-white print:text-black">{formatCurrency(purchase.tax || 0)}</span>
              </div>

              {Boolean(purchase.otherCost) && (
                <div className="flex justify-between text-lab-400 print:text-gray-600">
                  <span>Customs / Handling Fees:</span>
                  <span className="text-white print:text-black">{formatCurrency(purchase.otherCost || 0)}</span>
                </div>
              )}

              <div className="border-t border-lab-800 print:border-gray-400 pt-2 flex justify-between text-sm font-black text-amber-400 print:text-black">
                <span>Total PO Amount:</span>
                <span>{formatCurrency(purchase.total || purchase.totalCost || 0)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {purchase.notes && (
            <div className="p-3.5 rounded-xl bg-lab-900/40 print:bg-gray-50 border border-lab-800 print:border-gray-300 text-xs text-lab-300 print:text-gray-700">
              <strong className="text-white print:text-black uppercase text-[10px] block mb-0.5">Procurement Notes:</strong>
              {purchase.notes}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
