"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { fragranceRepository } from "@/lib/firestore/fragrance";
import { supplierRepository } from "@/lib/firestore/suppliers";
import { inventoryLedgerRepository } from "@/lib/firestore/inventory-ledger";
import { FragranceOil, Supplier, VolumeUnit, ScentFamily, PurchaseLot, FragranceInventoryLedger } from "@/types/fragrance";
import { calculateCostPerOz } from "@/lib/fragrance/conversions";
import { calculateRepackagingCost, calculateSuggestedRetailPrice, calculateGrossMargin } from "@/lib/fragrance/pricing";
import { INITIAL_SUPPLIERS } from "@/data/suppliers";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Droplet, 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  ShieldCheck, 
  Box, 
  Tag, 
  Clock, 
  CheckCircle2,
  ExternalLink 
} from "lucide-react";

interface AdminFragranceEditorProps {
  params: {
    id: string;
  };
}

export default function AdminFragranceEditorPage({ params }: AdminFragranceEditorProps) {
  const router = useRouter();
  const isNew = params.id === "new";

  const [activeTab, setActiveTab] = useState<
    "general" | "supplier" | "source" | "costs" | "variants" | "pricing" | "repackaging" | "lots" | "media" | "seo"
  >("general");

  const [fragrance, setFragrance] = useState<FragranceOil | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [ledger, setLedger] = useState<FragranceInventoryLedger[]>([]);
  const [lots, setLots] = useState<PurchaseLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // Repackaging Transaction Form State
  const [repackageVariantId, setRepackageVariantId] = useState("");
  const [repackageQty, setRepackageQty] = useState(10);
  const [repackageWasteOz, setRepackageWasteOz] = useState(0.2);
  const [repackageSuccess, setRepackageSuccess] = useState("");

  // New Purchase Lot Form State
  const [newLotQty, setNewLotQty] = useState(32);
  const [newLotUnit, setNewLotUnit] = useState<VolumeUnit>("oz");
  const [newLotCost, setNewLotCost] = useState(54.0);
  const [newLotNumber, setNewLotNumber] = useState(`LOT-${Date.now().toString().slice(-6)}`);

  useEffect(() => {
    const loadData = async () => {
      const sups = await supplierRepository.getAllSuppliers();
      setSuppliers(sups);

      if (isNew) {
        setFragrance({
          id: `frag_${Date.now()}`,
          name: "New Fragrance Oil Accord",
          slug: "new-fragrance-oil-accord",
          description: "Premium uncut fragrance oil.",
          supplierId: sups[0]?.id || "sup_africa_imports",
          supplierName: sups[0]?.name || "Africa Imports",
          category: "fragrance_oils",
          scentFamily: "Woody",
          gender: "unisex",
          sourceSize: 32,
          sourceUnit: "oz",
          sourceCost: 50.0,
          costPerOz: 1.5625,
          costPerMl: 0.0528,
          inventoryVolumeOz: 32,
          status: "active",
          images: ["/images/products/fragrance-santal.jpg"],
          primaryImage: "/images/products/fragrance-santal.jpg",
          targetGrossMargin: 0.50,
          repackagingVariants: [
            {
              id: `var_${Date.now()}_1oz`,
              fragranceOilId: `frag_${Date.now()}`,
              sellingSize: 1,
              sellingUnit: "oz",
              sku: "FRAG-NEW-1OZ",
              costBreakdown: calculateRepackagingCost({ costPerOz: 1.5625, sellingSizeOz: 1 }),
              unitCost: 3.55,
              retailPrice: 8.50,
              suggestedRetailPrice: 7.10,
              grossProfit: 4.95,
              marginPercent: 58.2,
              inventoryQuantity: 20,
              active: true,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setLoading(false);
      } else {
        const found = await fragranceRepository.getFragranceById(params.id);
        if (found) {
          setFragrance(found);
          if (found.repackagingVariants.length > 0) {
            setRepackageVariantId(found.repackagingVariants[0].id);
          }
          const ledgers = await inventoryLedgerRepository.getLedgerByFragrance(found.id);
          setLedger(ledgers);
          const pLots = await inventoryLedgerRepository.getLotsByFragrance(found.id);
          setLots(pLots);
        }
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, isNew]);

  // Recalculate source cost whenever source size/unit/cost/density changes
  const handleSourceCostChange = (size: number, unit: VolumeUnit, cost: number, density?: number) => {
    if (!fragrance) return;
    const calc = calculateCostPerOz(size, unit, cost, density);
    if (calc.error) {
      setError(calc.error);
      return;
    }
    setError("");

    // Update all variant costs
    const updatedVariants = fragrance.repackagingVariants.map((v) => {
      const breakdown = calculateRepackagingCost({ costPerOz: calc.costPerOz, sellingSizeOz: v.sellingSize });
      const margin = calculateGrossMargin(v.retailPrice, breakdown.totalCost);
      return {
        ...v,
        costBreakdown: breakdown,
        unitCost: breakdown.totalCost,
        suggestedRetailPrice: calculateSuggestedRetailPrice(breakdown.totalCost, fragrance.targetGrossMargin || 0.50),
        grossProfit: margin.grossProfit,
        marginPercent: margin.marginPercent,
      };
    });

    setFragrance({
      ...fragrance,
      sourceSize: size,
      sourceUnit: unit,
      sourceCost: cost,
      density,
      costPerOz: calc.costPerOz,
      costPerMl: calc.costPerMl,
      repackagingVariants: updatedVariants,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fragrance) return;

    await fragranceRepository.saveFragrance(fragrance);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    if (isNew) {
      router.push(`/admin/fragrance/${fragrance.id}`);
    }
  };

  const handleExecuteRepackaging = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fragrance || !repackageVariantId) return;

    const variant = fragrance.repackagingVariants.find((v) => v.id === repackageVariantId);
    if (!variant) return;

    const res = await inventoryLedgerRepository.recordRepackaging({
      fragranceOilId: fragrance.id,
      variantId: variant.id,
      sellingSizeOz: variant.sellingSize,
      outputQuantity: repackageQty,
      wasteVolumeOz: repackageWasteOz,
      createdBy: "Admin",
      notes: `Batch bottling: ${repackageQty}x ${variant.sellingSize}oz bottles`,
    });

    if (!res.success) {
      setError(res.error || "Failed to execute repackaging.");
      return;
    }

    // Refresh data
    const updated = await fragranceRepository.getFragranceById(fragrance.id);
    if (updated) setFragrance(updated);
    const updatedLedger = await inventoryLedgerRepository.getLedgerByFragrance(fragrance.id);
    setLedger(updatedLedger);

    setRepackageSuccess(`Successfully repackaged ${repackageQty}x ${variant.sellingSize}oz units.`);
    setTimeout(() => setRepackageSuccess(""), 4000);
  };

  const handleAddPurchaseLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fragrance) return;

    const lot: PurchaseLot = {
      id: `lot_${Date.now()}`,
      supplierId: fragrance.supplierId,
      supplierName: fragrance.supplierName || "Africa Imports",
      fragranceOilId: fragrance.id,
      fragranceName: fragrance.name,
      quantity: newLotQty,
      unit: newLotUnit,
      unitCost: newLotCost / newLotQty,
      totalCost: newLotCost,
      purchaseDate: new Date().toISOString(),
      lotNumber: newLotNumber,
      createdAt: new Date().toISOString(),
    };

    await inventoryLedgerRepository.recordPurchaseLot(lot, newLotQty);

    const updated = await fragranceRepository.getFragranceById(fragrance.id);
    if (updated) setFragrance(updated);
    const updatedLots = await inventoryLedgerRepository.getLotsByFragrance(fragrance.id);
    setLots(updatedLots);
    const updatedLedger = await inventoryLedgerRepository.getLedgerByFragrance(fragrance.id);
    setLedger(updatedLedger);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (loading || !fragrance) {
    return (
      <AdminGuard>
        <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-lab-400">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mr-3" />
          Loading fragrance oil editor...
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link
              href="/admin/fragrance"
              className="inline-flex items-center gap-1 text-xs text-lab-400 hover:text-white mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Fragrance Dashboard
            </Link>
            <h1 className="text-3xl font-black text-white uppercase">
              {isNew ? "New Fragrance Oil" : fragrance.name}
            </h1>
            <p className="text-xs text-amber-400 mt-1 font-bold">
              Bulk Stock: {fragrance.inventoryVolumeOz} oz • Raw Cost: {formatUnitPrice(fragrance.costPerOz)}/oz
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 text-xs font-bold uppercase flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" /> Save Formulation
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Formulation records and pricing matrices synchronized successfully.</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* 10-Tab Navigation Bar */}
        <div className="flex border-b border-lab-800 text-xs overflow-x-auto gap-1 scrollbar-none">
          {[
            { id: "general", label: "1. General" },
            { id: "supplier", label: "2. Supplier" },
            { id: "source", label: "3. Source Purchase" },
            { id: "costs", label: "4. Cost Breakdown" },
            { id: "variants", label: "5. Sizes & Stock" },
            { id: "pricing", label: "6. Pricing & Margins" },
            { id: "repackaging", label: "7. Repackaging Lab" },
            { id: "lots", label: "8. Purchase Lots" },
            { id: "media", label: "9. Media" },
            { id: "seo", label: "10. SEO" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-bold whitespace-nowrap uppercase border-b-2 transition ${
                activeTab === tab.id
                  ? "border-amber-500 text-amber-400 bg-amber-500/10"
                  : "border-transparent text-lab-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Fragrance Master Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Fragrance Name</label>
                <input
                  type="text"
                  value={fragrance.name}
                  onChange={(e) => setFragrance({ ...fragrance, name: e.target.value })}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">URL Slug</label>
                <input
                  type="text"
                  value={fragrance.slug}
                  onChange={(e) => setFragrance({ ...fragrance, slug: e.target.value })}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Scent Family Accord</label>
                <select
                  value={fragrance.scentFamily}
                  onChange={(e) => setFragrance({ ...fragrance, scentFamily: e.target.value as ScentFamily })}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                >
                  {["Woody", "Amber", "Tobacco", "Fresh", "Floral", "Citrus", "Oriental", "Musk", "Gourmand", "Spicy", "Green", "Leather"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Gender Profile</label>
                <select
                  value={fragrance.gender || "unisex"}
                  onChange={(e) => setFragrance({ ...fragrance, gender: e.target.value as any })}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="unisex">Unisex</option>
                  <option value="masculine">Masculine</option>
                  <option value="feminine">Feminine</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Description</label>
                <textarea
                  rows={3}
                  value={fragrance.description}
                  onChange={(e) => setFragrance({ ...fragrance, description: e.target.value })}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUPPLIER */}
        {activeTab === "supplier" && (
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Supplier & Origin Tracking</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Supplier</label>
                <select
                  value={fragrance.supplierId}
                  onChange={(e) => {
                    const found = suppliers.find((s) => s.id === e.target.value);
                    setFragrance({
                      ...fragrance,
                      supplierId: e.target.value,
                      supplierName: found?.name || "Africa Imports",
                    });
                  }}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Supplier Product / Item Code</label>
                <input
                  type="text"
                  value={fragrance.supplierProductId || ""}
                  onChange={(e) => setFragrance({ ...fragrance, supplierProductId: e.target.value })}
                  placeholder="e.g. O-S1132"
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Supplier Product URL</label>
                <input
                  type="url"
                  value={fragrance.supplierUrl || ""}
                  onChange={(e) => setFragrance({ ...fragrance, supplierUrl: e.target.value })}
                  placeholder="https://africaimports.com/product/..."
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SOURCE PURCHASE & CONVERSIONS */}
        {activeTab === "source" && (
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-6 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Source Container Purchase & Cost Per Ounce</h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Source Quantity</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={fragrance.sourceSize}
                  onChange={(e) =>
                    handleSourceCostChange(
                      parseFloat(e.target.value) || 1,
                      fragrance.sourceUnit,
                      fragrance.sourceCost,
                      fragrance.density
                    )
                  }
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Source Unit</label>
                <select
                  value={fragrance.sourceUnit}
                  onChange={(e) =>
                    handleSourceCostChange(
                      fragrance.sourceSize,
                      e.target.value as VolumeUnit,
                      fragrance.sourceCost,
                      fragrance.density
                    )
                  }
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="oz">Fluid Ounces (oz)</option>
                  <option value="gallon">Gallon (128 oz)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="liter">Liters (1000 ml)</option>
                  <option value="lb">Pounds (lb - requires density)</option>
                </select>
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Source Total Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={fragrance.sourceCost}
                  onChange={(e) =>
                    handleSourceCostChange(
                      fragrance.sourceSize,
                      fragrance.sourceUnit,
                      parseFloat(e.target.value) || 0,
                      fragrance.density
                    )
                  }
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Specific Gravity Density (g/ml)</label>
                <input
                  type="number"
                  step="0.001"
                  value={fragrance.density || 0.985}
                  onChange={(e) =>
                    handleSourceCostChange(
                      fragrance.sourceSize,
                      fragrance.sourceUnit,
                      fragrance.sourceCost,
                      parseFloat(e.target.value) || undefined
                    )
                  }
                  placeholder="0.985"
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Calculated Results */}
            <div className="p-4 rounded-xl border border-lab-700 bg-lab-950 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-lab-500 uppercase block">Calculated Raw Cost Per Ounce</span>
                <span className="text-2xl font-black text-amber-400">{formatUnitPrice(fragrance.costPerOz)} / fl oz</span>
              </div>
              <div>
                <span className="text-[10px] text-lab-500 uppercase block">Calculated Cost Per Milliliter</span>
                <span className="text-2xl font-black text-indigo-400">{formatUnitPrice(fragrance.costPerMl)} / ml</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COST BREAKDOWN */}
        {activeTab === "costs" && (
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Fractioned Unit Cost Decomposition</h3>

            <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-950">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Size</th>
                    <th className="p-3">Fragrance Cost</th>
                    <th className="p-3">Glass Bottle</th>
                    <th className="p-3">Cap/Roller</th>
                    <th className="p-3">Custom Label</th>
                    <th className="p-3">Packaging</th>
                    <th className="p-3">Labor</th>
                    <th className="p-3">Total Unit Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-800/60">
                  {fragrance.repackagingVariants.map((v) => (
                    <tr key={v.id}>
                      <td className="p-3 font-bold text-white">{v.sellingSize} oz</td>
                      <td className="p-3 text-lab-300">{formatCurrency(v.costBreakdown.fragranceCost)}</td>
                      <td className="p-3 text-lab-300">{formatCurrency(v.costBreakdown.bottleCost)}</td>
                      <td className="p-3 text-lab-300">{formatCurrency(v.costBreakdown.capCost)}</td>
                      <td className="p-3 text-lab-300">{formatCurrency(v.costBreakdown.labelCost)}</td>
                      <td className="p-3 text-lab-300">{formatCurrency(v.costBreakdown.packagingCost)}</td>
                      <td className="p-3 text-lab-300">{formatCurrency(v.costBreakdown.laborCost)}</td>
                      <td className="p-3 font-bold text-amber-400">{formatCurrency(v.unitCost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SIZES & VARIANTS */}
        {activeTab === "variants" && (
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Selling Presentations & Shelf Inventory</h3>

            <div className="space-y-3">
              {fragrance.repackagingVariants.map((v, idx) => (
                <div key={v.id} className="p-4 rounded-xl border border-lab-800 bg-lab-950 grid grid-cols-1 sm:grid-cols-6 gap-3 items-center">
                  <div>
                    <span className="text-[10px] text-lab-500 uppercase block">Size</span>
                    <span className="text-sm font-bold text-white">{v.sellingSize} oz</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-lab-500 uppercase block">SKU</span>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => {
                        const copy = [...fragrance.repackagingVariants];
                        copy[idx].sku = e.target.value;
                        setFragrance({ ...fragrance, repackagingVariants: copy });
                      }}
                      className="bg-lab-900 border border-lab-800 rounded px-2 py-1 text-white w-full"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-lab-500 uppercase block">Retail Price ($)</span>
                    <input
                      type="number"
                      step="0.05"
                      value={v.retailPrice}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const copy = [...fragrance.repackagingVariants];
                        const margin = calculateGrossMargin(val, v.unitCost);
                        copy[idx].retailPrice = val;
                        copy[idx].grossProfit = margin.grossProfit;
                        copy[idx].marginPercent = margin.marginPercent;
                        setFragrance({ ...fragrance, repackagingVariants: copy });
                      }}
                      className="bg-lab-900 border border-lab-800 rounded px-2 py-1 text-white w-full"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-lab-500 uppercase block">Margin</span>
                    <span className={`font-bold ${v.marginPercent < 25 ? "text-rose-400" : "text-emerald-400"}`}>
                      {v.marginPercent}% ({formatCurrency(v.grossProfit)})
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-lab-500 uppercase block">Ready Stock (Shelf)</span>
                    <span className="font-bold text-indigo-400">{v.inventoryQuantity} Units</span>
                  </div>

                  <div className="text-right">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={v.active}
                        onChange={(e) => {
                          const copy = [...fragrance.repackagingVariants];
                          copy[idx].active = e.target.checked;
                          setFragrance({ ...fragrance, repackagingVariants: copy });
                        }}
                        className="rounded border-lab-700 text-amber-500"
                      />
                      <span className="text-white text-[11px]">Active</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: REPACKAGING LAB */}
        {activeTab === "repackaging" && (
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-6 text-xs">
            <div className="border-b border-lab-800 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Fractioning Machine & Repackaging Execution
              </h3>
              <span className="text-amber-400 font-bold">
                Available Bulk: {fragrance.inventoryVolumeOz} fl oz
              </span>
            </div>

            {repackageSuccess && (
              <div className="p-3 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{repackageSuccess}</span>
              </div>
            )}

            <form onSubmit={handleExecuteRepackaging} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-lab-700 bg-lab-950">
              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Target Bottle Presentation</label>
                <select
                  value={repackageVariantId}
                  onChange={(e) => setRepackageVariantId(e.target.value)}
                  className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white"
                >
                  {fragrance.repackagingVariants.map((v) => (
                    <option key={v.id} value={v.id}>{v.sellingSize} oz Bottle ({v.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Units to Bottle</label>
                <input
                  type="number"
                  min="1"
                  value={repackageQty}
                  onChange={(e) => setRepackageQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Residue Waste Buffer (oz)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={repackageWasteOz}
                  onChange={(e) => setRepackageWasteOz(parseFloat(e.target.value) || 0)}
                  className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase hover:brightness-110 shadow"
                >
                  Execute Repackaging
                </button>
              </div>
            </form>

            {/* Inventory Ledger History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase">Inventory Transaction Ledger</h4>
              <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-950">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Consumed Bulk</th>
                      <th className="p-3">Output Bottled</th>
                      <th className="p-3">Remaining Bulk</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lab-800/60">
                    {ledger.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-lab-500">No transactions recorded yet.</td>
                      </tr>
                    ) : (
                      ledger.map((l) => (
                        <tr key={l.id}>
                          <td className="p-3 text-lab-400">{new Date(l.createdAt).toLocaleString()}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-lab-900 border border-lab-700 text-amber-400">
                              {l.type}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-rose-400">-{l.consumedVolumeOz} oz</td>
                          <td className="p-3 font-bold text-emerald-400">+{l.outputQuantity || 0} units ({l.outputSizeOz || 0}oz)</td>
                          <td className="p-3 text-white font-bold">{l.remainingBulkVolumeOz} oz</td>
                          <td className="p-3 text-lab-400">{l.notes || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: PURCHASE LOTS */}
        {activeTab === "lots" && (
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-6 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Purchase Lots & Raw Inbound Tracking</h3>

            {/* Record New Purchase Lot Form */}
            <form onSubmit={handleAddPurchaseLot} className="p-4 rounded-xl border border-lab-700 bg-lab-950 grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Lot Number</label>
                <input
                  type="text"
                  value={newLotNumber}
                  onChange={(e) => setNewLotNumber(e.target.value)}
                  className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Quantity</label>
                <input
                  type="number"
                  value={newLotQty}
                  onChange={(e) => setNewLotQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Unit</label>
                <select
                  value={newLotUnit}
                  onChange={(e) => setNewLotUnit(e.target.value as VolumeUnit)}
                  className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white"
                >
                  <option value="oz">oz</option>
                  <option value="gallon">gallon</option>
                  <option value="ml">ml</option>
                  <option value="lb">lb</option>
                </select>
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Total Cost ($)</label>
                <input
                  type="number"
                  value={newLotCost}
                  onChange={(e) => setNewLotCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-amber-500 text-lab-950 font-bold uppercase hover:brightness-110 shadow"
                >
                  Receive Inbound Lot
                </button>
              </div>
            </form>

            {/* Lots Table */}
            <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-950">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Lot #</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3">Purchased</th>
                    <th className="p-3">Total Cost</th>
                    <th className="p-3">Unit Cost</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-800/60">
                  {lots.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-lab-500">No purchase lots recorded yet.</td>
                    </tr>
                  ) : (
                    lots.map((l) => (
                      <tr key={l.id}>
                        <td className="p-3 font-bold text-white">{l.lotNumber}</td>
                        <td className="p-3 text-lab-300">{l.supplierName}</td>
                        <td className="p-3 text-lab-300">{l.quantity} {l.unit}</td>
                        <td className="p-3 font-bold text-amber-400">{formatCurrency(l.totalCost)}</td>
                        <td className="p-3 text-lab-400">{formatUnitPrice(l.unitCost)}/{l.unit}</td>
                        <td className="p-3 text-lab-400">{new Date(l.purchaseDate).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
