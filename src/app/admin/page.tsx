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
  X,
  RefreshCw,
  TrendingUp,
  Tag
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
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.asin && p.asin.toLowerCase().includes(q));
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
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER & SUB-TABS ━━━━ */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <SlidersHorizontal className="w-3 h-3 text-gray-600" /> Admin Product & Inventory Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              SCENTLAB Operations Hub
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Live pricing adjustments, volume tiers, inventory tracking, and idempotent Firestore synchronization.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1.5 rounded-xl border border-gray-200 text-xs">
            {(["catalog", "margins", "inventory", "labels", "seeding"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-xs transition ${
                  activeTab === tab
                    ? "bg-white text-gray-950 shadow-xs border border-gray-200"
                    : "text-gray-600 hover:text-gray-950 hover:bg-white/60"
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
            
            {/* Search & Filter Bar */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search SKU, name, ASIN..."
                    className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:ring-1 focus:ring-[#2B5F4A]"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="text-xs text-gray-600">
                Total: <strong className="text-gray-950 font-bold">{filteredProducts.length}</strong> items
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                      <th className="py-3.5 px-4">SKU / Item</th>
                      <th className="py-3.5 px-4">Sourcing</th>
                      <th className="py-3.5 px-4">Cost Data</th>
                      <th className="py-3.5 px-4">Retail Price</th>
                      <th className="py-3.5 px-4">Gross Margin</th>
                      <th className="py-3.5 px-4">Inventory</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((p) => {
                      const defaultPkg = p.packageOptions?.find((o) => o.isDefault) || p.packageOptions?.[0] || {
                        id: "pkg_default",
                        name: "Standard Pack",
                        quantity: 1,
                        price: p.basePrice,
                        unitPrice: p.basePrice,
                      };
                      const unitCost = p.costData?.totalUnitCost ?? p.cost ?? 0;
                      const margin = calculateMarginPercentage(defaultPkg.unitPrice, unitCost);

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/80 transition">
                          
                          {/* Item */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-gray-950 line-clamp-1">{p.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                              {p.sku} • <span className="capitalize">{p.category}</span>
                            </div>
                          </td>

                          {/* Sourcing */}
                          <td className="py-3.5 px-4 text-gray-700">
                            {p.asin && (
                              <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono block w-max">
                                ASIN {p.asin}
                              </span>
                            )}
                            {p.supplierProductId && (
                              <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono block w-max mt-0.5">
                                Sup: {p.supplierProductId}
                              </span>
                            )}
                          </td>

                          {/* Cost */}
                          <td className="py-3.5 px-4 text-gray-600 font-mono">
                            <div>{formatCurrency(p.costData?.supplierCost ?? p.cost ?? 0)} / {p.costData?.supplierQuantity ?? 1}u</div>
                            <div className="text-gray-900 font-semibold text-[11px]">Net: {formatUnitPrice(unitCost)}</div>
                          </td>

                          {/* Retail Price */}
                          <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                            {formatCurrency(defaultPkg.price)} ({defaultPkg.quantity}u)
                          </td>

                          {/* Gross Margin */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              margin >= 30 
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}>
                              {margin.toFixed(1)}%
                            </span>
                          </td>

                          {/* Inventory */}
                          <td className="py-3.5 px-4 text-gray-700 font-mono">
                            <span className="font-semibold text-gray-950">
                              {p.inventory?.availableQuantity ?? p.inventory?.quantityInStock ?? 0}
                            </span> units
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.status === "active" 
                                ? "bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]" 
                                : "bg-gray-100 text-gray-700 border border-gray-200"
                            }`}>
                              {p.status}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleEdit(p)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 text-gray-800 transition text-[11px] font-semibold inline-flex items-center gap-1 border border-gray-300 shadow-xs"
                            >
                              <Edit3 className="w-3 h-3 text-gray-500" /> Edit
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB 2: PRODUCT EDITOR MODAL / VIEW
        ========================================== */}
        {activeTab === "editor" && editingProduct && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <div>
                <span className="text-[10px] text-[#2B5F4A] uppercase tracking-wider font-bold block">
                  PRODUCT RECORD EDITOR
                </span>
                <h2 className="text-xl font-bold text-gray-950 mt-0.5">
                  Editing: {editingProduct.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("catalog")}
                className="p-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Product pricing, inventory, and status updated successfully.
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:ring-1 focus:ring-[#2B5F4A]"
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:ring-1 focus:ring-[#2B5F4A]"
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Catalog Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A]"
                  >
                    <option value="active">Active (Visible in Storefront)</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Package Options Editor */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-4">
                <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#2B5F4A]" />
                  Fractional Package Tiers & Selling Prices
                </h3>

                <div className="space-y-2.5">
                  {(editingProduct.packageOptions || []).map((pkg, idx) => (
                    <div key={pkg.id || idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-white border border-gray-200">
                      <div>
                        <span className="text-[10px] text-gray-500 font-semibold block">Quantity (Units)</span>
                        <input
                          type="number"
                          value={pkg.quantity}
                          onChange={(e) => {
                            const newOptions = [...(editingProduct.packageOptions || [])];
                            newOptions[idx].quantity = parseInt(e.target.value) || 1;
                            newOptions[idx].unitPrice = newOptions[idx].price / newOptions[idx].quantity;
                            setEditingProduct({ ...editingProduct, packageOptions: newOptions });
                          }}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-gray-900 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-semibold block">Package Price ($)</span>
                        <input
                          type="number"
                          step="0.01"
                          value={pkg.price}
                          onChange={(e) => {
                            const newOptions = [...(editingProduct.packageOptions || [])];
                            newOptions[idx].price = parseFloat(e.target.value) || 0;
                            newOptions[idx].unitPrice = newOptions[idx].price / newOptions[idx].quantity;
                            setEditingProduct({ ...editingProduct, packageOptions: newOptions });
                          }}
                          className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-gray-900 font-bold text-xs mt-1"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 font-semibold block">Calculated Unit Price</span>
                        <div className="text-gray-900 py-1 font-mono font-bold text-xs mt-1">
                          {formatUnitPrice(pkg.unitPrice)} / unit
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Management */}
              <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-4">
                <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#2B5F4A]" />
                  Inventory Stock Controls
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Physical Stock Available</label>
                    <input
                      type="number"
                      value={editingProduct.inventory?.availableQuantity ?? editingProduct.inventory?.quantityInStock ?? 0}
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
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Reorder Point</label>
                    <input
                      type="number"
                      value={editingProduct.inventory?.reorderPoint ?? 25}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inventory: {
                            ...editingProduct.inventory,
                            reorderPoint: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Low Stock Warning</label>
                    <input
                      type="number"
                      value={editingProduct.inventory?.lowStockThreshold ?? 10}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          inventory: {
                            ...editingProduct.inventory,
                            lowStockThreshold: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("catalog")}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#2B5F4A] text-white font-bold uppercase tracking-wider hover:bg-[#1E4233] flex items-center gap-1.5 text-xs transition shadow-xs"
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
            <div className="p-5 rounded-xl border border-gray-200 bg-white space-y-2 shadow-xs">
              <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Margin Guard Rule (25%+ Floor)
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Rule: Discounts (like volume tiers for 3+ packs) are validated in real-time. If applying a discount drops the margin below 25%, the price is automatically capped at the approved floor.
              </p>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: INVENTORY
        ========================================== */}
        {activeTab === "inventory" && (
          <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#2B5F4A]" /> Stock Inventory Overview
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              All physical packaging, bottles, and supplies are tracked independently with dedicated SKU identifiers and minimum inventory levels.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/inventory"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2B5F4A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1E4233] transition"
              >
                Go to Dedicated Inventory Page →
              </Link>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: SEEDING (FIRESTORE SYNC)
        ========================================== */}
        {activeTab === "seeding" && (
          <div className="p-6 rounded-xl border border-gray-200 bg-white space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#2B5F4A]" /> Idempotent Database Synchronization
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Sync catalog definitions and packaging data to Firestore with conflict-free idempotent writes.
            </p>

            {seedMessage && (
              <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-gray-800">
                {seedMessage}
              </div>
            )}

            <button
              onClick={handleRunSeed}
              disabled={seedLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2B5F4A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1E4233] disabled:opacity-50 transition shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${seedLoading ? "animate-spin" : ""}`} />
              {seedLoading ? "Synchronizing..." : "Run Database Sync"}
            </button>
          </div>
        )}

      </div>
    </AdminGuard>
  );
}
