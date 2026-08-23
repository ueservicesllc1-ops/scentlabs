"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { purchaseRepository } from "@/lib/firestore/purchases";
import { Purchase } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { 
  Truck, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Printer, 
  Boxes, 
  ShieldAlert, 
  FileText 
} from "lucide-react";

export default function AdminPurchaseReceivingStationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [receivingLines, setReceivingLines] = useState<Record<string, {
    received: number;
    damaged: number;
    rejected: number;
    lotNumber: string;
    expirationDate: string;
    notes: string;
  }>>({});
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    if (!id) return;
    const po = await purchaseRepository.getPurchaseById(id);
    if (po) {
      setPurchase(po);
      const initialMap: Record<string, any> = {};
      po.items.forEach((item) => {
        const remaining = Math.max(0, item.quantityOrdered - (item.quantityReceived || 0));
        initialMap[item.id] = {
          received: remaining,
          damaged: 0,
          rejected: 0,
          lotNumber: item.lotNumber || `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          expirationDate: item.expirationDate || "",
          notes: "",
        };
      });
      setReceivingLines(initialMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleConfirmReceiving = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchase) return;

    setProcessing(true);
    setSuccessMsg("");

    try {
      const lines = Object.entries(receivingLines).map(([itemId, val]) => ({
        itemId,
        quantityReceived: Number(val.received),
        quantityDamaged: Number(val.damaged),
        quantityRejected: Number(val.rejected),
        lotNumber: val.lotNumber,
        notes: val.notes,
      }));

      const updated = await purchaseRepository.receivePurchase(purchase.id, lines);
      setPurchase(updated);
      setSuccessMsg("Shipment processed successfully. Physical stock and WAC average costs have been updated.");
      await loadData();
    } catch (err: any) {
      console.error("Receiving error", err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-12 text-center text-xs font-mono text-lab-500">Loading receiving station...</div>
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
            Back to Purchases
          </Link>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              RECEIVING DOCK & QUALITY INSPECTION
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              Receive Shipment — {purchase.purchaseNumber}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-300 hover:text-white uppercase font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receiving Report
            </button>

            <Link
              href={`/admin/purchases/${purchase.id}`}
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white uppercase font-bold transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> PO Details
            </Link>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* PO Header Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">Supplier</span>
            <div className="text-white font-bold">{purchase.supplierName}</div>
          </div>

          <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">PO Status</span>
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-500/30">
                {purchase.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">Order Date</span>
            <div className="text-white font-bold">{new Date(purchase.purchaseDate).toLocaleDateString()}</div>
          </div>

          <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">Total PO Cost</span>
            <div className="text-amber-400 font-mono font-bold">{formatCurrency(purchase.total)}</div>
          </div>
        </div>

        {/* Inspection Form */}
        <form onSubmit={handleConfirmReceiving} className="space-y-6">
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-6 shadow-2xl text-xs">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-lab-900 pb-3">
              <Truck className="w-4 h-4 text-amber-400" /> Physical Inspection Line Items
            </h2>

            <div className="space-y-6 divide-y divide-lab-900">
              {purchase.items.map((item) => {
                const remaining = Math.max(0, item.quantityOrdered - (item.quantityReceived || 0));
                const isFullyReceived = remaining === 0;

                return (
                  <div key={item.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="font-bold text-white uppercase text-sm">{item.productName}</div>
                        <span className="text-[10px] text-lab-500 font-mono">
                          Ordered: {item.quantityOrdered} {item.unit} | Received: {item.quantityReceived || 0} {item.unit} | Remaining: {remaining} {item.unit}
                        </span>
                      </div>

                      <div className="font-mono text-amber-400 font-bold">
                        Cost: {formatCurrency(item.unitCost)}/{item.unit}
                      </div>
                    </div>

                    {isFullyReceived ? (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold uppercase text-[11px]">
                        ✓ Fully Received & Inspected
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
                        <div>
                          <label className="text-lab-400 block mb-1 uppercase text-[10px]">Good Qty (Accept)</label>
                          <input
                            type="number"
                            min={0}
                            max={remaining}
                            value={receivingLines[item.id]?.received ?? remaining}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setReceivingLines((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], received: val },
                              }));
                            }}
                            className="w-full bg-lab-900 border border-lab-700 rounded-xl px-3 py-2 text-emerald-400 font-bold font-mono focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="text-lab-400 block mb-1 uppercase text-[10px]">Damaged Qty</label>
                          <input
                            type="number"
                            min={0}
                            value={receivingLines[item.id]?.damaged ?? 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setReceivingLines((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], damaged: val },
                              }));
                            }}
                            className="w-full bg-lab-900 border border-lab-700 rounded-xl px-3 py-2 text-amber-400 font-bold font-mono focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-lab-400 block mb-1 uppercase text-[10px]">Rejected Qty</label>
                          <input
                            type="number"
                            min={0}
                            value={receivingLines[item.id]?.rejected ?? 0}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setReceivingLines((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], rejected: val },
                              }));
                            }}
                            className="w-full bg-lab-900 border border-lab-700 rounded-xl px-3 py-2 text-rose-400 font-bold font-mono focus:border-rose-500"
                          />
                        </div>

                        <div>
                          <label className="text-lab-400 block mb-1 uppercase text-[10px]">Lot / Batch #</label>
                          <input
                            type="text"
                            value={receivingLines[item.id]?.lotNumber || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReceivingLines((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], lotNumber: val },
                              }));
                            }}
                            placeholder="LOT-2026-01"
                            className="w-full bg-lab-900 border border-lab-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-lab-400 block mb-1 uppercase text-[10px]">Expiration Date</label>
                          <input
                            type="date"
                            value={receivingLines[item.id]?.expirationDate || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReceivingLines((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], expirationDate: val },
                              }));
                            }}
                            className="w-full bg-lab-900 border border-lab-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {purchase.status !== "received" && (
              <div className="pt-4 border-t border-lab-900 flex justify-end">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase hover:brightness-110 transition flex items-center gap-2 shadow-lg shadow-amber-500/10 text-xs"
                >
                  <Save className="w-4 h-4" />
                  {processing ? "Updating Inventory & WAC..." : "Confirm Inspection & Stock Receipt"}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}
