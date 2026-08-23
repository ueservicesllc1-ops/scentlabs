"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { inventoryRepository } from "@/lib/firestore/inventory";
import { purchaseRepository } from "@/lib/firestore/purchases";
import { InventoryItem, Purchase } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { 
  TrendingDown, 
  AlertTriangle, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Truck, 
  Boxes 
} from "lucide-react";

export default function AdminReorderPlanningPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingPo, setCreatingPo] = useState<string | null>(null);

  useEffect(() => {
    inventoryRepository.getAllInventory().then((all) => {
      // Filter items where available <= reorderPoint
      const reorderItems = all.filter((i) => {
        const avail = Math.max(0, i.quantity - i.reserved);
        return avail <= i.reorderPoint;
      });
      setItems(reorderItems);
      setLoading(false);
    });
  }, []);

  const handleCreatePo = async (item: InventoryItem) => {
    setCreatingPo(item.id);
    const packSize = item.supplierPackSize || 100;
    const deficit = Math.max(0, item.reorderPoint * 2 - (item.quantity - item.reserved));
    const recommendedQty = Math.max(packSize, Math.ceil(deficit / packSize) * packSize);

    const poNumber = await purchaseRepository.generatePurchaseNumber();
    const newPo: Purchase = {
      id: `po_${Date.now()}`,
      purchaseNumber: poNumber,
      supplierId: item.supplierId || "supp_general",
      supplierName: item.supplierName || "Default Supplier",
      purchaseDate: new Date().toISOString(),
      status: "draft",
      subtotal: recommendedQty * item.lastCost,
      shipping: 0,
      tax: 0,
      total: recommendedQty * item.lastCost,
      items: [
        {
          id: `poi_${Date.now()}`,
          purchaseId: `po_${Date.now()}`,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantityOrdered: recommendedQty,
          quantityReceived: 0,
          unit: item.unit,
          unitCost: item.lastCost,
          totalCost: recommendedQty * item.lastCost,
        },
      ],
      notes: `Auto-generated from reorder alert (Available: ${item.quantity - item.reserved}, Reorder Point: ${item.reorderPoint})`,
      createdBy: "ueservicesllc1@gmail.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await purchaseRepository.savePurchase(newPo);
    router.push("/admin/purchases");
  };

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex justify-between items-end">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              PROCUREMENT & STOCK SHORTAGE
            </span>
            <h1 className="text-2xl font-black text-white uppercase">
              Reorder Planning & Low Stock
            </h1>
          </div>

          <Link
            href="/admin/inventory"
            className="text-xs text-lab-400 hover:text-white flex items-center gap-1 uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Inventory
          </Link>
        </div>

        {loading ? (
          <div className="text-xs text-lab-500 py-10 text-center">Loading reorder shortages...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center border border-lab-800 rounded-2xl bg-lab-950/40 space-y-3 max-w-md mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white uppercase">Stock Levels Optimal</h3>
            <p className="text-xs text-lab-400">
              All tracked raw materials, glassware, bulk fragrance oils, and packaging are above their reorder thresholds.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>{items.length} SKUs</strong> have reached their replenishment trigger point. Review recommended quantities based on supplier pack sizes.
              </span>
            </div>

            <div className="rounded-2xl border border-lab-800 bg-lab-950 overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
                  <tr>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5 text-right">Available</th>
                    <th className="p-3.5 text-right">Reorder Pt</th>
                    <th className="p-3.5 text-right">Pack Size</th>
                    <th className="p-3.5 text-right">Last Cost</th>
                    <th className="p-3.5 text-right">Recommended Qty</th>
                    <th className="p-3.5 text-right">Est. Cost</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-900 text-lab-300">
                  {items.map((item) => {
                    const available = Math.max(0, item.quantity - item.reserved);
                    const packSize = item.supplierPackSize || 100;
                    const deficit = Math.max(0, item.reorderPoint * 2 - available);
                    const recommendedQty = Math.max(packSize, Math.ceil(deficit / packSize) * packSize);
                    const estCost = recommendedQty * item.lastCost;

                    return (
                      <tr key={item.id} className="hover:bg-lab-900/40 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white uppercase text-[11px] leading-tight">
                            {item.productName}
                          </div>
                          <span className="text-[10px] text-lab-500 font-mono">
                            Supplier: {item.supplierName || "Default"}
                          </span>
                        </td>

                        <td className="p-3.5 text-right font-black text-rose-400 font-mono">
                          {available} <span className="text-[10px] text-lab-500">{item.unit}</span>
                        </td>

                        <td className="p-3.5 text-right text-lab-400 font-mono">
                          {item.reorderPoint}
                        </td>

                        <td className="p-3.5 text-right text-lab-400 font-mono">
                          {packSize}u/box
                        </td>

                        <td className="p-3.5 text-right font-mono text-lab-300">
                          {formatCurrency(item.lastCost)}
                        </td>

                        <td className="p-3.5 text-right font-bold text-amber-400 font-mono">
                          {recommendedQty.toLocaleString()} {item.unit}
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-white">
                          {formatCurrency(estCost)}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            disabled={creatingPo === item.id}
                            onClick={() => handleCreatePo(item)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-[11px] hover:brightness-110 transition flex items-center gap-1 shadow inline-flex"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {creatingPo === item.id ? "Creating..." : "Create PO"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
