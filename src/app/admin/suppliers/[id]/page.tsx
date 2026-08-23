"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { supplierRepository } from "@/lib/firestore/suppliers";
import { supplierProductRepository } from "@/lib/firestore/supplier-products";
import { purchaseRepository } from "@/lib/firestore/purchases";
import { Supplier, SupplierProduct, SupplierPriceHistory } from "@/types/supplier";
import { Purchase } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { 
  Building2, 
  ArrowLeft, 
  ArrowRight,
  ExternalLink, 
  Plus, 
  Boxes, 
  Clock, 
  DollarSign, 
  Layers, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileText 
} from "lucide-react";

export default function AdminSupplierDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [priceHistory, setPriceHistory] = useState<SupplierPriceHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Mapping Modal
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState("prod_rollon_10ml");
  const [productName, setProductName] = useState("10 ml Amber Glass Roll-On Bottles");
  const [supplierSku, setSupplierSku] = useState("");
  const [supplierUrl, setSupplierUrl] = useState("");
  const [cost, setCost] = useState(0.32);
  const [packSize, setPackSize] = useState(250);
  const [unit, setUnit] = useState<any>("unit");
  const [moq, setMoq] = useState(250);
  const [isPrimary, setIsPrimary] = useState(true);
  const [savingMapping, setSavingMapping] = useState(false);

  const loadData = async () => {
    if (!id) return;
    const [s, prods, allPurchases, prices] = await Promise.all([
      supplierRepository.getSupplierById(id),
      supplierProductRepository.getBySupplier(id),
      purchaseRepository.getAllPurchases(),
      supplierRepository.getPriceHistoryBySupplier(id),
    ]);

    setSupplier(s);
    setProducts(prods);
    setPurchases(allPurchases.filter((p) => p.supplierId === id));
    setPriceHistory(prices);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return;
    setSavingMapping(true);

    const mappingId = `sp_${supplier.id}_${selectedProdId}`;
    const newMapping: SupplierProduct = {
      id: mappingId,
      supplierId: supplier.id,
      productId: selectedProdId,
      productName,
      supplierSku,
      supplierProductId: supplierSku,
      supplierUrl,
      currentCost: Number(cost),
      lastCost: Number(cost),
      supplierPackSize: Number(packSize),
      minimumOrderQuantity: Number(moq),
      unit,
      isPrimary,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await supplierProductRepository.save(newMapping);
    setIsMappingModalOpen(false);
    setSavingMapping(false);
    await loadData();
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-12 text-center text-xs font-mono text-lab-500">Loading vendor records...</div>
      </AdminGuard>
    );
  }

  if (!supplier) {
    return (
      <AdminGuard>
        <div className="max-w-md mx-auto my-20 p-8 text-center border border-lab-800 rounded-2xl bg-lab-950 font-mono text-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-white font-bold uppercase">Supplier Profile Not Found</h2>
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
        {/* Header */}
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              SUPPLIER PROFILE & DIRECT MAPPINGS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              {supplier.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsMappingModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase hover:brightness-110 transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Map Product SKU
            </button>

            <Link
              href="/admin/suppliers"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white uppercase font-bold transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Suppliers
            </Link>
          </div>
        </div>

        {/* Vendor Contact & Overview Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-2">
            <span className="text-[10px] text-lab-500 uppercase font-bold block">Contact Information</span>
            <div className="text-white font-bold text-sm">{supplier.contactName || "Direct Wholesale"}</div>
            {supplier.email && (
              <div className="flex items-center gap-2 text-lab-300">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> {supplier.email}
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-2 text-lab-300">
                <Phone className="w-3.5 h-3.5 text-amber-400" /> {supplier.phone}
              </div>
            )}
            {supplier.website && (
              <a
                href={supplier.website}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 text-[11px] pt-1"
              >
                <Globe className="w-3 h-3" /> Visit Supplier Website <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-2">
            <span className="text-[10px] text-lab-500 uppercase font-bold block">Procurement Channel</span>
            <div className="text-white font-bold text-sm uppercase">
              {(supplier.sourceType || "Vendor").replace("_", " ")}
            </div>
            <p className="text-lab-400 text-[11px] leading-relaxed">
              {supplier.notes || "Standard wholesale catalog with commercial tier discounts."}
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-2">
            <span className="text-[10px] text-lab-500 uppercase font-bold block">Purchasing Activity</span>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-lab-400">Total Purchase Orders:</span>
              <span className="text-white font-bold font-mono">{purchases.length} PO(s)</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-lab-400">Total Spend:</span>
              <span className="text-amber-400 font-bold font-mono text-sm">
                {formatCurrency(purchases.reduce((acc, p) => acc + p.total, 0))}
              </span>
            </div>
            <div className="pt-2">
              <Link
                href={`/admin/suppliers/${supplier.id}/price-history`}
                className="text-[10px] text-lab-400 hover:text-white uppercase flex items-center gap-1 font-bold underline"
              >
                <Clock className="w-3 h-3" /> View Price Fluctuation Ledger
              </Link>
            </div>
          </div>
        </div>

        {/* Mapped Products Catalog Table */}
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 shadow-xl text-xs">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Linked Products & Vendor SKUs ({products.length})
            </h2>

            <Link
              href={`/admin/suppliers/${supplier.id}/products`}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase flex items-center gap-1"
            >
              Full Products Catalog & Comparison <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-xl border border-lab-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Supplier SKU / ASIN</th>
                  <th className="p-3 text-right">Pack Size</th>
                  <th className="p-3 text-right">Current Cost</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Vendor Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lab-900 text-lab-300">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-lab-500">
                      No products mapped yet. Click "Map Product SKU" above to link catalog items.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-lab-900/40 transition">
                      <td className="p-3">
                        <div className="font-bold text-white uppercase text-[11px]">
                          {p.productName}
                        </div>
                        <span className="text-[10px] text-lab-500 font-mono">
                          SCENTLAB ID: {p.productId}
                        </span>
                      </td>

                      <td className="p-3 font-mono text-white text-[11px]">
                        {p.supplierSku || p.supplierProductId || "—"}
                      </td>

                      <td className="p-3 text-right font-mono text-white font-bold">
                        {p.supplierPackSize} {p.unit}
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-amber-400">
                        {formatCurrency(p.currentCost)} <span className="text-[10px] text-lab-500">/{p.unit}</span>
                      </td>

                      <td className="p-3 text-center">
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

                      <td className="p-3 text-right">
                        {p.supplierUrl ? (
                          <a
                            href={p.supplierUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase inline-flex items-center gap-1"
                          >
                            Supplier URL <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-lab-600 font-mono text-[10px]">No Link</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Mapping Modal */}
        {isMappingModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-lab-950 border border-lab-800 p-6 space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-lab-900 pb-3">
                <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-400" /> Map Product SKU to {supplier.name}
                </h3>
                <button type="button" onClick={() => setIsMappingModalOpen(false)} className="text-lab-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMapping} className="space-y-3">
                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">SCENTLAB Product</label>
                  <select
                    value={selectedProdId}
                    onChange={(e) => {
                      setSelectedProdId(e.target.value);
                      if (e.target.value === "prod_rollon_10ml") {
                        setProductName("10 ml Amber Glass Roll-On Bottles");
                        setCost(0.32);
                        setPackSize(250);
                        setUnit("unit");
                      } else if (e.target.value === "prod_natures_oil_1l") {
                        setProductName("Nature's Oil Perfumer's Alcohol Base (1 Liter)");
                        setCost(14.63);
                        setPackSize(4);
                        setUnit("liter");
                      } else if (e.target.value === "frag_santal_33") {
                        setProductName("Santal 33 Type Pure Fragrance Oil");
                        setCost(1.25);
                        setPackSize(32);
                        setUnit("oz");
                      } else if (e.target.value === "prod_pipette_5ml") {
                        setProductName("5 ml Disposable Graduated Transfer Pipettes");
                        setCost(0.09);
                        setPackSize(200);
                        setUnit("unit");
                      }
                    }}
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="prod_rollon_10ml">10 ml Amber Glass Roll-On Bottles</option>
                    <option value="prod_natures_oil_1l">Nature's Oil Perfumer's Alcohol Base 1L</option>
                    <option value="frag_santal_33">Santal 33 Type Pure Fragrance Oil</option>
                    <option value="prod_pipette_5ml">5 ml Disposable Graduated Pipettes</option>
                    <option value="prod_blotter_strips">Professional Perfume Blotter Strips</option>
                    <option value="mat_cardstock_kraft">Heavyweight Kraft Cardstock Sheets</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Supplier SKU / ASIN</label>
                    <input
                      type="text"
                      required
                      value={supplierSku}
                      onChange={(e) => setSupplierSku(e.target.value)}
                      placeholder="e.g. B0GVYLZZ95 or OIL-SAN33"
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Unit Cost ($)</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={cost}
                      onChange={(e) => setCost(parseFloat(e.target.value))}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Pack Size</label>
                    <input
                      type="number"
                      required
                      value={packSize}
                      onChange={(e) => setPackSize(parseInt(e.target.value))}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Unit</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="unit">Unit</option>
                      <option value="oz">Oz</option>
                      <option value="ml">Ml</option>
                      <option value="liter">Liter</option>
                      <option value="gallon">Gallon</option>
                      <option value="sheet">Sheet</option>
                      <option value="strip">Strip</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Minimum Order</label>
                    <input
                      type="number"
                      required
                      value={moq}
                      onChange={(e) => setMoq(parseInt(e.target.value))}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Supplier Product Direct URL</label>
                  <input
                    type="url"
                    value={supplierUrl}
                    onChange={(e) => setSupplierUrl(e.target.value)}
                    placeholder="https://amazon.com/dp/... or https://africaimports.com/..."
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="rounded bg-lab-900 border-lab-700 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="isPrimary" className="text-white text-xs">Set as Primary Supplier for this Product</label>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMappingModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-lab-900 text-lab-400 hover:text-white uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingMapping}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase"
                  >
                    {savingMapping ? "Saving..." : "Save Product Mapping"}
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
