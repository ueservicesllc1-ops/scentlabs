"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { purchaseRepository } from "@/lib/firestore/purchases";
import { supplierRepository } from "@/lib/firestore/suppliers";
import { supplierProductRepository, calculateLandedCosts } from "@/lib/firestore/supplier-products";
import { inventoryRepository } from "@/lib/firestore/inventory";
import { Purchase, PurchaseItem, PurchaseStatus } from "@/types/inventory";
import { Supplier, SupplierProduct } from "@/types/supplier";
import { formatCurrency } from "@/lib/utils";
import { 
  Boxes, 
  Plus, 
  ArrowLeft, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileText, 
  Truck, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  DollarSign 
} from "lucide-react";

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // New PO Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("supp_africa_imports");
  const [selectedProdId, setSelectedProdId] = useState("frag_santal_33");
  const [qty, setQty] = useState(32);
  const [unitCost, setUnitCost] = useState(1.25);
  const [lastCost, setLastCost] = useState(1.25);
  const [shippingCost, setShippingCost] = useState(15.00);
  const [tax, setTax] = useState(0.00);
  const [otherCost, setOtherCost] = useState(0.00);
  const [allocationMethod, setAllocationMethod] = useState<"by_cost" | "by_quantity">("by_cost");
  const [notes, setNotes] = useState("");
  const [savingPo, setSavingPo] = useState(false);

  const loadData = async () => {
    const [allPurchases, allSuppliers, allSps] = await Promise.all([
      purchaseRepository.getAllPurchases(),
      supplierRepository.getAllSuppliers(),
      supplierProductRepository.getAll(),
    ]);

    setPurchases(allPurchases);
    setSuppliers(allSuppliers);
    setSupplierProducts(allSps);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openOrdersCount = purchases.filter((p) => p.status === "ordered" || p.status === "submitted").length;
  const partialCount = purchases.filter((p) => p.status === "partially_received").length;
  const totalPurchasedSpend = purchases.reduce((acc, p) => acc + (p.total || p.totalCost || 0), 0);

  const filtered = purchases.filter((p) => {
    const matchSearch =
      p.purchaseNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreatePo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPo(true);

    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    const sp = supplierProducts.find((s) => s.productId === selectedProdId && s.supplierId === selectedSupplierId);
    const poNumber = await purchaseRepository.generatePurchaseNumber();
    const poId = `po_${Date.now()}`;
    const subtotal = Number(qty) * Number(unitCost);

    const rawItems: PurchaseItem[] = [
      {
        id: `poi_${Date.now()}`,
        purchaseId: poId,
        productId: selectedProdId,
        productName: sp?.productName || selectedProdId,
        sku: sp?.supplierSku,
        supplierProductId: sp?.supplierProductId,
        quantityOrdered: Number(qty),
        quantityReceived: 0,
        quantityDamaged: 0,
        quantityRejected: 0,
        unit: sp?.unit || "unit",
        unitCost: Number(unitCost),
        totalCost: subtotal,
        supplierPackSize: sp?.supplierPackSize || 100,
      },
    ];

    const allocatedItems = calculateLandedCosts(
      rawItems,
      Number(shippingCost),
      Number(tax),
      Number(otherCost),
      allocationMethod
    );

    const totalCost = subtotal + Number(shippingCost) + Number(tax) + Number(otherCost);

    const newPurchase: Purchase = {
      id: poId,
      purchaseNumber: poNumber,
      supplierId: selectedSupplierId,
      supplierName: sup?.name || "Vendor",
      purchaseDate: new Date().toISOString(),
      orderDate: new Date().toISOString(),
      status: "ordered",
      subtotal,
      shipping: Number(shippingCost),
      shippingCost: Number(shippingCost),
      tax: Number(tax),
      otherCost: Number(otherCost),
      total: totalCost,
      totalCost,
      items: allocatedItems,
      notes,
      createdBy: "ueservicesllc1@gmail.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await purchaseRepository.savePurchase(newPurchase);
    setIsModalOpen(false);
    setSavingPo(false);
    await loadData();
  };

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case "received":
        return "bg-emerald-950 text-emerald-400 border border-emerald-500/30";
      case "partially_received":
        return "bg-amber-950 text-amber-400 border border-amber-500/30";
      case "ordered":
        return "bg-sky-950 text-sky-400 border border-sky-500/30";
      case "submitted":
        return "bg-indigo-950 text-indigo-400 border border-indigo-500/30";
      case "draft":
        return "bg-lab-900 text-lab-400 border border-lab-700";
      case "cancelled":
        return "bg-rose-950 text-rose-400 border border-rose-500/30";
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              PROCUREMENT & PURCHASE ORDERS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              Purchase Orders
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase hover:brightness-110 transition flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" /> Issue Purchase Order
            </button>

            <Link
              href="/admin/suppliers"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-amber-400 hover:text-white uppercase font-bold transition flex items-center gap-1"
            >
              Suppliers Directory
            </Link>

            <Link
              href="/admin/inventory"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white uppercase font-bold transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Inventory
            </Link>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Total POs</span>
            <div className="text-2xl font-black text-white">{purchases.length}</div>
            <span className="text-[10px] text-lab-400">All historical orders</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">In Transit / Ordered</span>
            <div className="text-2xl font-black text-sky-400">{openOrdersCount}</div>
            <span className="text-[10px] text-lab-400">Awaiting dock receipt</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Partially Received</span>
            <div className="text-2xl font-black text-amber-400">{partialCount}</div>
            <span className="text-[10px] text-lab-400">Partial shipment pending</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Total Purchased Volume</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {formatCurrency(totalPurchasedSpend)}
            </div>
            <span className="text-[10px] text-lab-400">Freight & Landed Cost included</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 flex flex-col md:flex-row justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-lab-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PO number (e.g. PO-000001) or supplier name..."
              className="w-full bg-lab-900 border border-lab-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="ordered">Ordered / In Transit</option>
              <option value="partially_received">Partially Received</option>
              <option value="received">Fully Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* PO Table */}
        <div className="rounded-2xl border border-lab-800 bg-lab-950 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
              <tr>
                <th className="p-3.5">PO Number</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Lines / Units</th>
                <th className="p-3.5 text-right">Freight / Shipping</th>
                <th className="p-3.5 text-right">Total Landed Cost</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-900 text-lab-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-lab-500">Loading purchase orders...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-lab-500">No purchase orders found.</td>
                </tr>
              ) : (
                filtered.map((po) => {
                  const totalUnits = po.items.reduce((acc, i) => acc + i.quantityOrdered, 0);
                  const receivedUnits = po.items.reduce((acc, i) => acc + (i.quantityReceived || 0), 0);

                  return (
                    <tr key={po.id} className="hover:bg-lab-900/40 transition">
                      <td className="p-3.5 font-bold text-white uppercase font-mono">
                        {po.purchaseNumber}
                      </td>

                      <td className="p-3.5 text-white font-bold">
                        {po.supplierName}
                      </td>

                      <td className="p-3.5 text-[10px] text-lab-400 whitespace-nowrap">
                        {new Date(po.purchaseDate).toLocaleDateString()}
                      </td>

                      <td className="p-3.5 text-lab-400 text-[11px]">
                        {po.items.length} line(s) ({receivedUnits} / {totalUnits}u received)
                      </td>

                      <td className="p-3.5 text-right font-mono text-lab-400">
                        {formatCurrency(po.shipping || po.shippingCost || 0)}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-amber-400">
                        {formatCurrency(po.total || po.totalCost || 0)}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadge(po.status)}`}>
                          {po.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/admin/purchases/${po.id}`}
                            className="px-2.5 py-1 rounded-lg bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-lab-300 hover:text-white text-[11px] font-bold uppercase transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> PO
                          </Link>

                          {po.status !== "received" && (
                            <Link
                              href={`/admin/purchases/${po.id}/receive`}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-[11px] hover:brightness-110 transition inline-flex items-center gap-1 shadow"
                            >
                              <Truck className="w-3 h-3" /> Receive
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Create PO Modal with Landed Cost & Cost Warning */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl bg-lab-950 border border-lab-800 p-6 space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-lab-900 pb-3">
                <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-400" /> Issue Purchase Order
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-lab-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePo} className="space-y-3.5">
                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Select Vendor</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => {
                      setSelectedSupplierId(e.target.value);
                      if (e.target.value === "supp_africa_imports") {
                        setSelectedProdId("frag_santal_33");
                        setUnitCost(1.25);
                        setLastCost(1.25);
                        setQty(32);
                      } else if (e.target.value === "supp_natures_oil") {
                        setSelectedProdId("prod_natures_oil_1l");
                        setUnitCost(13.20);
                        setLastCost(13.20);
                        setQty(16);
                      } else if (e.target.value === "supp_amazon_glass") {
                        setSelectedProdId("prod_rollon_10ml");
                        setUnitCost(0.32);
                        setLastCost(0.32);
                        setQty(250);
                      }
                    }}
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.sourceType || "Vendor"})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Product / Material SKU</label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => {
                      setSelectedProdId(e.target.value);
                      if (e.target.value === "frag_santal_33") {
                        setUnitCost(1.25);
                        setLastCost(1.25);
                        setQty(32);
                      } else if (e.target.value === "prod_natures_oil_1l") {
                        setUnitCost(13.20);
                        setLastCost(13.20);
                        setQty(16);
                      } else if (e.target.value === "prod_rollon_10ml") {
                        setUnitCost(0.32);
                        setLastCost(0.32);
                        setQty(250);
                      }
                    }}
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="frag_santal_33">Santal 33 Type Fragrance Oil (Bulk Oil)</option>
                    <option value="prod_natures_oil_1l">Nature's Oil Perfumer's Alcohol Base 1L (Bulk Base)</option>
                    <option value="prod_rollon_10ml">10 ml Amber Glass Roll-On Bottles (Glassware)</option>
                    <option value="prod_pipette_5ml">5 ml Disposable Transfer Pipettes 200pk</option>
                    <option value="mat_cardstock_kraft">Heavyweight Kraft Cardstock Sheets (Cricut Boxes)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Quantity Ordered</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(parseInt(e.target.value))}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Unit Cost ($)</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={unitCost}
                      onChange={(e) => setUnitCost(parseFloat(e.target.value))}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Cost Change Detection Warning */}
                {unitCost > lastCost ? (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      <strong>Cost Increased:</strong> Entered cost (${unitCost}) is higher than last purchase (${lastCost}).
                    </span>
                  </div>
                ) : unitCost < lastCost ? (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Cost Decreased:</strong> Entered cost (${unitCost}) is lower than last purchase (${lastCost}).
                    </span>
                  </div>
                ) : null}

                {/* Landed Cost Inputs */}
                <div className="p-4 rounded-xl bg-lab-900/60 border border-lab-800 space-y-3">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">Landed Cost Adjustments</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-lab-400 block mb-1 uppercase text-[9px]">Supplier Freight ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                        className="w-full bg-lab-900 border border-lab-700 rounded-lg px-2 py-1 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-lab-400 block mb-1 uppercase text-[9px]">Supplier Tax ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={tax}
                        onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                        className="w-full bg-lab-900 border border-lab-700 rounded-lg px-2 py-1 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-lab-400 block mb-1 uppercase text-[9px]">Customs / Fees ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={otherCost}
                        onChange={(e) => setOtherCost(parseFloat(e.target.value) || 0)}
                        className="w-full bg-lab-900 border border-lab-700 rounded-lg px-2 py-1 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-lab-800">
                    <span className="text-lab-400 uppercase">Estimated Total PO Cost:</span>
                    <span className="font-bold font-mono text-amber-400 text-sm">
                      {formatCurrency(qty * unitCost + shippingCost + tax + otherCost)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Procurement Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Carrier account, invoice #, warehouse dock instructions..."
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white placeholder-lab-600 focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-lab-900 text-lab-400 hover:text-white uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPo}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase"
                  >
                    {savingPo ? "Issuing PO..." : "Issue Purchase Order"}
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
