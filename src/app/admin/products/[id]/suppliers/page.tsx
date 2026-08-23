"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { inventoryRepository } from "@/lib/firestore/inventory";
import { supplierProductRepository } from "@/lib/firestore/supplier-products";
import { supplierRepository } from "@/lib/firestore/suppliers";
import { purchaseRepository } from "@/lib/firestore/purchases";
import { SupplierProduct, Supplier } from "@/types/supplier";
import { InventoryItem, Purchase } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { 
  Building2, 
  ArrowLeft, 
  ExternalLink, 
  Plus, 
  DollarSign, 
  CheckCircle2, 
  Star, 
  AlertCircle, 
  Truck 
} from "lucide-react";

export default function AdminProductSuppliersComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [productItem, setProductItem] = useState<InventoryItem | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingPoFor, setCreatingPoFor] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      inventoryRepository.getInventory(id),
      supplierProductRepository.getByProduct(id),
      supplierRepository.getAllSuppliers(),
    ]).then(([inv, sps, sups]) => {
      setProductItem(inv);
      setSupplierProducts(sps);
      setSuppliers(sups);
      setLoading(false);
    });
  }, [id]);

  const handleCreatePoFromComparison = async (sp: SupplierProduct) => {
    const sup = suppliers.find((s) => s.id === sp.supplierId);
    setCreatingPoFor(sp.id);

    const poNumber = await purchaseRepository.generatePurchaseNumber();
    const poId = `po_${Date.now()}`;
    const qty = sp.supplierPackSize || sp.minimumOrderQuantity || 100;
    const totalCost = qty * sp.currentCost;

    const newPurchase: Purchase = {
      id: poId,
      purchaseNumber: poNumber,
      supplierId: sp.supplierId,
      supplierName: sup?.name || "Direct Supplier",
      purchaseDate: new Date().toISOString(),
      orderDate: new Date().toISOString(),
      status: "ordered",
      subtotal: totalCost,
      shipping: 0,
      tax: 0,
      total: totalCost,
      items: [
        {
          id: `poi_${Date.now()}`,
          purchaseId: poId,
          productId: sp.productId,
          productName: sp.productName,
          sku: sp.supplierSku,
          supplierProductId: sp.supplierProductId,
          quantityOrdered: qty,
          quantityReceived: 0,
          unit: sp.unit,
          unitCost: sp.currentCost,
          totalCost,
          supplierPackSize: sp.supplierPackSize,
        },
      ],
      notes: `Order placed via multi-vendor comparison for ${sp.productName}`,
      createdBy: "ueservicesllc1@gmail.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await purchaseRepository.savePurchase(newPurchase);
    router.push("/admin/purchases");
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-12 text-center text-xs font-mono text-lab-500">Loading supplier comparison matrix...</div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              MULTI-VENDOR PROCUREMENT COMPARISON
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              {productItem?.productName || id} — Supplier Matrix
            </h1>
          </div>

          <Link
            href="/admin/inventory"
            className="text-xs text-lab-400 hover:text-white flex items-center gap-1 uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Inventory
          </Link>
        </div>

        {supplierProducts.length === 0 ? (
          <div className="p-12 text-center border border-lab-800 rounded-2xl bg-lab-950/40 space-y-3 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-sm font-bold text-white uppercase">No Supplier Mappings Registered</h3>
            <p className="text-xs text-lab-400">
              No vendors have been mapped for this SKU yet. Visit the Suppliers dashboard to link vendor ASINs, bulk packs, and URLs.
            </p>
            <Link
              href="/admin/suppliers"
              className="inline-block px-4 py-2 rounded-xl bg-amber-500 text-lab-950 font-bold uppercase text-xs hover:brightness-110"
            >
              Go to Suppliers
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
                <span className="text-[10px] text-lab-500 uppercase font-bold">Catalog SKU</span>
                <div className="text-white font-bold">{productItem?.sku || "SKU-001"}</div>
              </div>

              <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
                <span className="text-[10px] text-lab-500 uppercase font-bold">Current Inventory WAC</span>
                <div className="text-amber-400 font-mono font-bold">{formatCurrency(productItem?.averageCost || 0)}</div>
              </div>

              <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
                <span className="text-[10px] text-lab-500 uppercase font-bold">Available Stock</span>
                <div className="text-emerald-400 font-mono font-bold">
                  {productItem?.available || 0} {productItem?.unit || "units"}
                </div>
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="rounded-2xl border border-lab-800 bg-lab-950 overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
                  <tr>
                    <th className="p-3.5">Vendor / Channel</th>
                    <th className="p-3.5">Vendor SKU / ASIN</th>
                    <th className="p-3.5 text-right">Pack Size</th>
                    <th className="p-3.5 text-right">MOQ</th>
                    <th className="p-3.5 text-right">Unit Cost</th>
                    <th className="p-3.5 text-right">Lead Time</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-900 text-lab-300">
                  {supplierProducts.map((sp) => {
                    const sup = suppliers.find((s) => s.id === sp.supplierId);
                    return (
                      <tr key={sp.id} className="hover:bg-lab-900/40 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white uppercase text-[11px]">
                            {sup?.name || sp.supplierId}
                          </div>
                          {sp.supplierUrl && (
                            <a
                              href={sp.supplierUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-amber-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              Direct URL <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>

                        <td className="p-3.5 font-mono text-white text-[11px]">
                          {sp.supplierSku || sp.supplierProductId || "—"}
                        </td>

                        <td className="p-3.5 text-right font-mono text-white font-bold">
                          {sp.supplierPackSize} {sp.unit}
                        </td>

                        <td className="p-3.5 text-right font-mono text-lab-400">
                          {sp.minimumOrderQuantity} {sp.unit}
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-amber-400 text-sm">
                          {formatCurrency(sp.currentCost)} <span className="text-[10px] text-lab-500 font-normal">/{sp.unit}</span>
                        </td>

                        <td className="p-3.5 text-right text-lab-400 font-mono">
                          {sp.leadTimeDays ? `${sp.leadTimeDays} days` : "2-4 days"}
                        </td>

                        <td className="p-3.5 text-center">
                          {sp.isPrimary ? (
                            <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-emerald-400" /> Primary
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-lab-900 text-lab-400 border border-lab-700 text-[10px] font-bold uppercase">
                              Alternative
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            disabled={creatingPoFor === sp.id}
                            onClick={() => handleCreatePoFromComparison(sp)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-[11px] hover:brightness-110 transition inline-flex items-center gap-1 shadow"
                          >
                            <Plus className="w-3 h-3" />
                            {creatingPoFor === sp.id ? "Ordering..." : "Order PO"}
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
