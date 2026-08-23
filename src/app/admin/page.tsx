"use client";

import React, { useState } from "react";
import Link from "next/link";
import { INITIAL_PRODUCTS, SHRINK_WRAP_VARIANTS } from "@/data/products";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { formatCurrency, formatUnitPrice, calculateMarginPercentage } from "@/lib/utils";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { seedProducts, seedCategories } from "@/lib/firestore/seed";
import { Product, ProductPackage, VolumePriceTier } from "@/types";
import { 
  SlidersHorizontal, 
  ShieldCheck, 
  Package, 
  Box, 
  AlertTriangle, 
  Edit3,
  Plus,
  Save,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  Database,
  Layers,
  X
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "editor" | "margins" | "inventory" | "labels" | "seeding">("catalog");
  const [productsList, setProductsList] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Seeding state
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.asin && p.asin.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(product)));
    setActiveTab("editor");
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProductsList((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
    );
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab("catalog");
    }, 1500);
  };

  const handleRunSeed = async () => {
    setSeedLoading(true);
    setSeedMessage("");
    try {
      const pCount = await seedProducts();
      const cCount = await seedCategories();
      setSeedMessage(`Idempotent Seeding Completed: Synced ${pCount} products and ${cCount} categories to Firestore.`);
    } catch (err: any) {
      setSeedMessage(`Seeding Notice: ${err.message || "Failed to connect to live Firestore database."}`);
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs border border-amber-500/30 font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5" /> ADMIN PRODUCT & INVENTORY ENGINE
            </div>
            <h1 className="text-3xl font-black text-white mt-2 uppercase">
              SCENTLAB Operations Hub
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Live pricing adjustments, volume tiers, B2 storage references, and idempotent Firestore synchronization.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-lab-950 p-1.5 rounded-xl border border-lab-800 text-xs">
            {(["catalog", "margins", "inventory", "labels", "seeding"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition ${
                  activeTab === tab
                    ? "bg-amber-500 text-lab-950 font-bold shadow"
                    : "text-lab-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ==========================================
            TAB 1: PRODUCT CATALOG & SOURCING TABLE
        ========================================== */}
        {activeTab === "catalog" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-lab-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search SKU, name, ASIN..."
                    className="w-full bg-lab-950 border border-lab-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-lab-950 border border-lab-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-lab-400">
                  Total: <strong className="text-white">{filteredProducts.length}</strong> items
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">SKU / Item</th>
                    <th className="p-3">Sourcing (ASIN/ID)</th>
                    <th className="p-3">Cost Data</th>
                    <th className="p-3">Retail Price</th>
                    <th className="p-3">Gross Margin</th>
                    <th className="p-3">Inventory</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-800/60">
                  {filteredProducts.map((p) => {
                    const defaultPkg = p.packageOptions.find((o) => o.isDefault) || p.packageOptions[0];
                    const margin = calculateMarginPercentage(defaultPkg.unitPrice, p.costData.totalUnitCost);
                    return (
                      <tr key={p.id} className="hover:bg-lab-800/30 transition">
                        <td className="p-3">
                          <div className="font-bold text-white line-clamp-1">{p.name}</div>
                          <div className="text-[10px] text-lab-500">{p.sku} • {p.category} ({p.subcategory})</div>
                        </td>
                        <td className="p-3 text-lab-300">
                          {p.asin && (
                            <span className="px-1.5 py-0.5 bg-lab-950 border border-lab-700 rounded text-[10px] block w-max">
                              ASIN {p.asin}
                            </span>
                          )}
                          {p.supplierProductId && (
                            <span className="px-1.5 py-0.5 bg-lab-950 border border-lab-700 rounded text-[10px] block w-max mt-0.5">
                              Ali: {p.supplierProductId}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-lab-400">
                          <div>{formatCurrency(p.costData.supplierCost)} / {p.costData.supplierQuantity}u</div>
                          <div className="text-white font-bold text-[11px]">Net: {formatUnitPrice(p.costData.totalUnitCost)}</div>
                        </td>
                        <td className="p-3 text-amber-400 font-bold">
                          {formatCurrency(defaultPkg.price)} ({defaultPkg.quantity}u)
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            margin >= 30 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3 text-lab-300">
                          <span className="font-bold text-white">{p.inventory.availableQuantity}</span> units
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.status === "active" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-lab-800 text-lab-400"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleEdit(p)}
                            className="px-2.5 py-1 rounded bg-lab-800 hover:bg-lab-700 text-white transition text-[11px] inline-flex items-center gap-1 border border-lab-700"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
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

        {/* ==========================================
            TAB 2: PRODUCT EDITOR MODAL / VIEW
        ========================================== */}
        {activeTab === "editor" && editingProduct && (
          <div className="rounded-2xl border border-lab-800 bg-lab-950 p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-lab-800 pb-4">
              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                  PRODUCT RECORD EDITOR
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Editing: {editingProduct.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("catalog")}
                className="p-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Product pricing, inventory, and status updated successfully.
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-lab-400 block mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-lab-400 block mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-lab-400 block mb-1">Catalog Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Active (Visible in Catalog)</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Package Options Editor */}
              <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Fractional Package Tiers & Selling Prices
                </h3>

                <div className="space-y-2">
                  {editingProduct.packageOptions.map((pkg, idx) => (
                    <div key={pkg.id || idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2.5 rounded bg-lab-950 border border-lab-800">
                      <div>
                        <span className="text-[10px] text-lab-500 block">Quantity</span>
                        <input
                          type="number"
                          value={pkg.quantity}
                          onChange={(e) => {
                            const newOptions = [...editingProduct.packageOptions];
                            newOptions[idx].quantity = parseInt(e.target.value) || 1;
                            newOptions[idx].unitPrice = newOptions[idx].price / newOptions[idx].quantity;
                            setEditingProduct({ ...editingProduct, packageOptions: newOptions });
                          }}
                          className="w-full bg-lab-900 border border-lab-800 rounded px-2 py-1 text-white text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-lab-500 block">Package Price ($)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={pkg.price}
                          onChange={(e) => {
                            const newOptions = [...editingProduct.packageOptions];
                            newOptions[idx].price = parseFloat(e.target.value) || 0;
                            newOptions[idx].unitPrice = newOptions[idx].price / newOptions[idx].quantity;
                            setEditingProduct({ ...editingProduct, packageOptions: newOptions });
                          }}
                          className="w-full bg-lab-900 border border-lab-800 rounded px-2 py-1 text-amber-400 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-lab-500 block">Calculated Unit Price</span>
                        <div className="text-lab-300 py-1 font-bold">
                          {formatUnitPrice(pkg.unitPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Management */}
              <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-400" />
                  Inventory Stock Controls
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1">Physical Stock Available</label>
                    <input
                      type="number"
                      value={editingProduct.inventory.availableQuantity}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inventory: {
                            ...editingProduct.inventory,
                            availableQuantity: parseInt(e.target.value) || 0,
                            quantityInStock: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-lab-400 block mb-1">Reorder Point</label>
                    <input
                      type="number"
                      value={editingProduct.inventory.reorderPoint}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inventory: {
                            ...editingProduct.inventory,
                            reorderPoint: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-lab-400 block mb-1">Low Stock Warning</label>
                    <input
                      type="number"
                      value={editingProduct.inventory.lowStockThreshold}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inventory: {
                            ...editingProduct.inventory,
                            lowStockThreshold: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-lab-900 border border-lab-800 rounded px-3 py-2 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-lab-800">
                <button
                  type="button"
                  onClick={() => setActiveTab("catalog")}
                  className="px-4 py-2 rounded bg-lab-900 border border-lab-800 text-lab-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Product Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==========================================
            TAB 3: MARGINS
        ========================================== */}
        {activeTab === "margins" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-lab-700 bg-lab-900/60 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Margin Guard Rule (25%+ Floor)
              </h3>
              <p className="text-xs text-lab-300">
                Rule: Discounts (like the 20% OFF for 3+ packs) are validated in real-time. If applying the full 20% drops
                the margin below 25%, the discount is capped at the maximum allowed margin floor.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {productsList.filter((p) => p.packageOptions.length > 1).map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-lab-800 bg-lab-900/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{p.name}</h4>
                      <span className="text-[10px] text-lab-500">Unit Cost: {formatUnitPrice(p.costData.totalUnitCost)}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-lab-950 text-lab-300 border border-lab-800">
                      {p.sku}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {p.packageOptions.map((pkg) => {
                      const margin = calculateMarginPercentage(pkg.unitPrice, p.costData.totalUnitCost);
                      return (
                        <div key={pkg.id} className="flex justify-between items-center p-2 rounded bg-lab-950 border border-lab-800/60">
                          <span className="text-white font-bold">{pkg.quantity} Units</span>
                          <span className="text-lab-400">{formatUnitPrice(pkg.unitPrice)}</span>
                          <span className="text-white font-bold">{formatCurrency(pkg.price)}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            margin >= 30 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {margin.toFixed(1)}% Margin
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: INVENTORY
        ========================================== */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Unit Inventory & Reorder Points
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {productsList.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-white line-clamp-1">{p.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                      IN STOCK
                    </span>
                  </div>

                  <div className="space-y-1 text-lab-300">
                    <div className="flex justify-between">
                      <span className="text-lab-500">Available Stock:</span>
                      <span className="font-bold text-white">{p.inventory.availableQuantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-lab-500">Reorder Threshold:</span>
                      <span>{p.inventory.reorderPoint} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-lab-500">Low Stock Alert:</span>
                      <span>{p.inventory.lowStockThreshold} units</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: CUSTOM LABELS SPECIFICATION LINKAGES
        ========================================== */}
        {activeTab === "labels" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Bottle Outer Diameter $\leftrightarrow$ Custom Label Specifications
            </h2>

            <div className="p-5 rounded-xl border border-amber-500/40 bg-amber-500/5 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                10 ml Glass Roll-On Bottle Direct Linkage
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-lab-950 rounded border border-lab-800">
                  <span className="text-lab-500 block text-[10px]">BOTTLE DIAMETER</span>
                  <span className="text-white font-bold">0.79 inches (2.0 cm)</span>
                </div>
                <div className="p-3 bg-lab-950 rounded border border-lab-800">
                  <span className="text-lab-500 block text-[10px]">BOTTLE HEIGHT</span>
                  <span className="text-white font-bold">3.46 inches (8.8 cm)</span>
                </div>
                <div className="p-3 bg-lab-950 rounded border border-lab-800">
                  <span className="text-lab-500 block text-[10px]">LABEL SIZE (INCHES)</span>
                  <span className="text-amber-400 font-bold">1.5 × 2.25 inches</span>
                </div>
                <div className="p-3 bg-lab-950 rounded border border-lab-800">
                  <span className="text-lab-500 block text-[10px]">LABEL SIZE (CM)</span>
                  <span className="text-amber-400 font-bold">3.81 × 5.72 cm</span>
                </div>
              </div>
              <p className="text-xs text-lab-300">
                When a customer views the 10 ml Roll-On PDP, the frontend automatically mounts the 
                <strong> &quot;COMPLETE YOUR ROLL-ON&quot;</strong> recommendation banner linked to <code>prod_custom_labels</code>.
              </p>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: IDEMPOTENT DATABASE SEEDING
        ========================================== */}
        {activeTab === "seeding" && (
          <div className="max-w-2xl rounded-xl border border-lab-800 bg-lab-950 p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Database className="w-4 h-4" /> FIRESTORE SEED RUNNER
            </div>

            <h2 className="text-lg font-bold text-white">
              Idempotent Database Seed Operation
            </h2>

            <p className="text-xs text-lab-300 leading-relaxed">
              Seeds all 16 exact products and 8 categories into Firestore using deterministic document IDs. 
              Safe to run multiple times without creating duplicate records.
            </p>

            {seedMessage && (
              <div className="p-3 rounded bg-lab-900 border border-lab-800 text-xs text-amber-300">
                {seedMessage}
              </div>
            )}

            <button
              type="button"
              disabled={seedLoading}
              onClick={handleRunSeed}
              className="px-5 py-3 rounded-lg text-xs font-bold uppercase bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 transition flex items-center gap-2"
            >
              {seedLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-lab-950 border-t-transparent animate-spin rounded-full" />
                  Seeding Firestore...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" /> Run Idempotent Seed
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
