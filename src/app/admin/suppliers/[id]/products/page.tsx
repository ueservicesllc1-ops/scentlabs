"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { supplierRepository } from "@/lib/firestore/suppliers";
import { supplierProductRepository } from "@/lib/firestore/supplier-products";
import { purchaseRepository } from "@/lib/firestore/purchases";
import { Supplier, SupplierProduct } from "@/types/supplier";
import { Purchase } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { 
  Layers, 
  ArrowLeft, 
  ExternalLink, 
  Plus, 
  Boxes, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

export default function AdminSupplierProductsCatalogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingPoFor, setCreatingPoFor] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supplierRepository.getSupplierById(id),
      supplierProductRepository.getBySupplier(id),
    ]).then(([s, prods]) => {
      setSupplier(s);
      setProducts(prods);
      setLoading(false);
    });
  }, [id]);

  const handleCreatePoFromProduct = async (prod: SupplierProduct) => {
    if (!supplier) return;
    setCreatingPoFor(prod.id);

    const poNumber = await purchaseRepository.generatePurchaseNumber();
    const poId = `po_${Date.now()}`;
    const qty = prod.supplierPackSize || prod.minimumOrderQuantity || 100;
    const totalCost = qty * prod.currentCost;

    const newPurchase: Purchase = {
      id: poId,
      purchaseNumber: poNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
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
          productId: prod.productId,
          productName: prod.productName,
          sku: prod.supplierSku,
          supplierProductId: prod.supplierProductId,
          quantityOrdered: qty,
          quantityReceived: 0,
          unit: prod.unit,
          unitCost: prod.currentCost,
          totalCost,
          supplierPackSize: prod.supplierPackSize,
        },
      ],
      notes: `Order created directly from ${supplier.name} product catalog`,
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
        <div className="p-12 text-center text-xs font-mono text-lab-500">Loading supplier catalog...</div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              VENDOR SPECIFIC PRODUCT CATALOG
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              {supplier.name} — Products
            </h1>
          </div>

          <Link
            href={`/admin/suppliers/${supplier.id}`}
            className="text-xs text-lab-400 hover:text-white flex items-center gap-1 uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vendor Profile
          </Link>
        </div>

        {/* Catalog Table */}
        <div className="rounded-2xl border border-lab-800 bg-lab-950 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
              <tr>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Supplier SKU / ASIN</th>
                <th className="p-3.5 text-right">Pack Size</th>
                <th className="p-3.5 text-right">MOQ</th>
                <th className="p-3.5 text-right">Unit Cost</th>
                <th className="p-3.5 text-center">Role</th>
                <th className="p-3.5 text-right">Supplier Link</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-900 text-lab-300">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-lab-500">
                    No products mapped to this vendor.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-lab-900/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white uppercase text-[11px]">{p.productName}</div>
                      <span className="text-[10px] text-lab-500 font-mono">ID: {p.productId}</span>
                    </td>

                    <td className="p-3.5 font-mono text-white text-[11px]">
                      {p.supplierSku || p.supplierProductId || "—"}
                    </td>

                    <td className="p-3.5 text-right font-mono text-white font-bold">
                      {p.supplierPackSize} {p.unit}
                    </td>

                    <td className="p-3.5 text-right font-mono text-lab-400">
                      {p.minimumOrderQuantity} {p.unit}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-amber-400">
                      {formatCurrency(p.currentCost)} <span className="text-[10px] text-lab-500">/{p.unit}</span>
                    </td>

                    <td className="p-3.5 text-center">
                      {p.isPrimary ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                          Primary
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-lab-900 text-lab-400 border border-lab-700 text-[10px] font-bold uppercase">
                          Secondary
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      {p.supplierUrl ? (
                        <a
                          href={p.supplierUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase inline-flex items-center gap-1"
                        >
                          Source URL <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-lab-600 font-mono text-[10px]">—</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        disabled={creatingPoFor === p.id}
                        onClick={() => handleCreatePoFromProduct(p)}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-[11px] hover:brightness-110 transition inline-flex items-center gap-1 shadow"
                      >
                        <Plus className="w-3 h-3" />
                        {creatingPoFor === p.id ? "Creating..." : "Order PO"}
                      </button>
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
