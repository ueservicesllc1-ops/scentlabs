"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import FragranceOilEditModal from "@/components/admin/FragranceOilEditModal";
import { fragranceRepository } from "@/lib/firestore/fragrance";
import { FragranceOil } from "@/types/fragrance";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Droplet, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  AlertTriangle, 
  Package, 
  ArrowRight, 
  Edit3, 
  UploadCloud, 
  SlidersHorizontal,
  RefreshCw,
  Building2,
  Tag,
  Trash2,
  Image as ImageIcon
} from "lucide-react";

export default function AdminFragranceDashboardPage() {
  const [fragrances, setFragrances] = useState<FragranceOil[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [familyFilter, setFamilyFilter] = useState("all");
  const [photoFilter, setPhotoFilter] = useState<"all" | "missing" | "has_photo">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingFragrance, setEditingFragrance] = useState<FragranceOil | null>(null);

  const fetchFragrances = async () => {
    setLoading(true);
    const all = await fragranceRepository.getAllFragrances();
    setFragrances(all);
    setLoading(false);
  };

  const handleDeleteFragrance = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el aceite de fragancia '${name}'?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await fragranceRepository.deleteFragrance(id);
      await fetchFragrances();
    } catch (err: any) {
      alert("Error al eliminar fragancia: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFragranceVisibility = async (f: FragranceOil) => {
    const nextStatus = (f as any).status === "draft" ? "active" : "draft";
    const updated = { ...f, status: nextStatus, updatedAt: new Date().toISOString() };
    setFragrances(prev => prev.map(item => item.id === f.id ? (updated as any) : item));
    try {
      await fragranceRepository.saveFragrance(updated as any);
    } catch {
      fetchFragrances();
    }
  };

  useEffect(() => {
    fetchFragrances();
  }, []);

  const totalBulkOz = fragrances.reduce((acc, f) => acc + (f.inventoryVolumeOz || 0), 0);
  const totalRepackagedUnits = fragrances.reduce(
    (acc, f) => acc + (f.repackagingVariants || []).reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0),
    0
  );
  const lowStockCount = fragrances.filter((f) => (f.inventoryVolumeOz || 0) < 32).length;
  const missingPhotosCount = fragrances.filter(
    (f) => !f.primaryImage && (!f.images || f.images.length === 0)
  ).length;
  const withPhotosCount = fragrances.length - missingPhotosCount;

  const ALLOWED_SIZES = [1, 2, 4, 8, 16];

  const filtered = fragrances.filter((f) => {
    // 1. Photo Filter
    const hasPhoto = !!(f.primaryImage || (f.images && f.images.length > 0));
    if (photoFilter === "missing" && hasPhoto) return false;
    if (photoFilter === "has_photo" && !hasPhoto) return false;

    // 2. Family Filter
    const matchesFamily = familyFilter === "all" || f.scentFamily.toLowerCase() === familyFilter.toLowerCase();
    if (!matchesFamily) return false;

    // 3. Search Query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    // Build a full searchable text blob for this fragrance
    const searchable = [
      f.name,
      f.scentFamily,
      f.supplierProductId,
      f.fragranceReference,
      f.supplierName,
      f.slug,
      f.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // All tokens must match somewhere in the searchable blob
    const tokens = q.split(/\s+/).filter(Boolean);
    return tokens.every((token) => searchable.includes(token));
  });

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER & ACTIONS ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] mb-2">
              <Droplet className="w-3 h-3 text-[#166534]" /> Bulk Repackaging & Oil Formulation
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Fragrance Oils
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Track source bulk purchases (Africa Imports), on-hand warehouse volume, fractioning conversions, and retail margins.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/admin/imports"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-800 hover:bg-gray-50 hover:text-gray-950 transition shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-gray-500" />
              <span>Import CSV</span>
            </Link>

            <Link
              href="/admin/fragrance/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2B5F4A] text-white hover:bg-[#1E4233] text-xs font-bold uppercase tracking-wider transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Fragrance Oil</span>
            </Link>
          </div>
        </div>

        {/* ━━━━ KPI SUMMARY CARDS ━━━━ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Total Formulations
            </span>
            <div className="text-2xl font-bold text-gray-950">
              {fragrances.length.toLocaleString()} Oils
            </div>
            <p className="text-[11px] text-gray-500">Active catalog references</p>
          </div>

          <button
            type="button"
            onClick={() => setPhotoFilter(photoFilter === "missing" ? "all" : "missing")}
            className={`p-4 rounded-xl border shadow-xs space-y-1 text-left transition-all ${
              photoFilter === "missing"
                ? "bg-orange-50 border-orange-400 ring-2 ring-orange-300"
                : "bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
            }`}
          >
            <span className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider block">
              Sin Foto
            </span>
            <div className="text-2xl font-bold text-orange-700">
              {missingPhotosCount.toLocaleString()} Oils
            </div>
            <p className="text-[11px] text-orange-600">Click to filter missing photos</p>
          </button>

          <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Bulk Inventory
            </span>
            <div className="text-2xl font-bold text-[#2B5F4A]">
              {Math.round(totalBulkOz).toLocaleString()} fl oz
            </div>
            <p className="text-[11px] text-gray-500">≈ {(totalBulkOz / 128).toFixed(1)} gal on hand</p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Repackaged Stock
            </span>
            <div className="text-2xl font-bold text-gray-950">
              {totalRepackagedUnits.toLocaleString()} Units
            </div>
            <p className="text-[11px] text-gray-500">Fractioned ready to ship</p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Low Bulk Stock
            </span>
            <div className="text-2xl font-bold text-amber-700">
              {lowStockCount} Oils
            </div>
            <p className="text-[11px] text-gray-500">&lt; 32 fl oz remaining</p>
          </div>

        </div>

        {/* ━━━━ SEARCH & FILTER BAR ━━━━ */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search fragrance name, accord, or supplier SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:ring-1 focus:ring-[#2B5F4A] transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              aria-label="Filter by scent family"
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
            >
              <option value="all">All Scent Families</option>
              <option value="woody">Woody</option>
              <option value="amber">Amber</option>
              <option value="floral">Floral</option>
              <option value="fresh">Fresh</option>
              <option value="citrus">Citrus</option>
              <option value="oriental">Oriental</option>
              <option value="tobacco">Tobacco</option>
              <option value="gourmand">Gourmand</option>
            </select>

            <button
              onClick={fetchFragrances}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:text-gray-950 hover:bg-gray-50 transition"
              title="Refresh dataset"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* ━━━━ VIEW TABS ━━━━ */}
        <div className="flex items-center gap-1 border-b border-gray-200 -mb-2">
          <button
            type="button"
            onClick={() => setPhotoFilter("all")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              photoFilter === "all"
                ? "border-[#2B5F4A] text-[#2B5F4A]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Todas las Esencias
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-mono">
              {fragrances.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPhotoFilter("has_photo")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              photoFilter === "has_photo"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-emerald-700"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            Con Foto
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-mono font-bold">
              {withPhotosCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPhotoFilter("missing")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              photoFilter === "missing"
                ? "border-orange-500 text-orange-700"
                : "border-transparent text-gray-500 hover:text-orange-600"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
            Sin Foto
            {missingPhotosCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-mono font-bold">
                {missingPhotosCount}
              </span>
            )}
          </button>
        </div>

        {/* ━━━━ FRAGRANCE DATA TABLE ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  <th className="py-3.5 px-4">Fragrance Oil</th>
                  <th className="py-3.5 px-4">Scent Family</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Source Purchase</th>
                  <th className="py-3.5 px-4">Cost / Oz</th>
                  <th className="py-3.5 px-4">Bulk Stock</th>
                  <th className="py-3.5 px-4">Selling Sizes</th>
                  <th className="py-3.5 px-4 text-center">Visibilidad</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((f) => {
                  const activeApprovedVariants = (f.repackagingVariants || []).filter(
                    (v) => v.active && ALLOWED_SIZES.includes(v.sellingSize)
                  );
                  const isLowBulk = (f.inventoryVolumeOz || 0) < 32;
                  const isVisible = (f as any).status !== "draft";

                  return (
                    <tr key={f.id} className="hover:bg-gray-50/80 transition">
                      
                      {/* Name & Reference */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-950">{f.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          REF: {f.fragranceReference || f.id}
                        </div>
                      </td>

                      {/* Scent Family */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">
                          {f.scentFamily}
                        </span>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4">
                        <div className="text-gray-900 font-medium">{f.supplierName || "Africa Imports"}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          SKU: {f.supplierProductId || "N/A"}
                        </div>
                      </td>

                      {/* Source Purchase (Internal Supplier Data) */}
                      <td className="py-3.5 px-4">
                        <div className="text-gray-900 font-semibold font-mono">
                          ${(f.sourceCost || 0).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          per {f.sourceSize || 32} {f.sourceUnit || "oz"}
                        </div>
                      </td>

                      {/* Cost / Oz */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                        ${(f.costPerOz || (f.sourceCost ? f.sourceCost / (f.sourceSize || 32) : 0)).toFixed(2)}
                      </td>

                      {/* Bulk Stock */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className={`font-semibold ${isLowBulk ? "text-amber-700" : "text-gray-900"}`}>
                          {f.inventoryVolumeOz || 0} fl oz
                        </span>
                        {isLowBulk && (
                          <span className="block text-[9px] uppercase font-bold text-amber-700 mt-0.5">
                            Low Stock
                          </span>
                        )}
                      </td>

                      {/* SCENTLAB Selling Sizes (Approved Customer Sizes Only) */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {activeApprovedVariants.length > 0 ? (
                            activeApprovedVariants.map((v) => (
                              <span
                                key={v.id}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-[#F6FAF8] text-[#2B5F4A] border border-[#C5DDD3]"
                              >
                                {v.sellingSize}oz (${v.retailPrice?.toFixed(2)})
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-[10px] italic">1oz, 2oz, 4oz</span>
                          )}
                        </div>
                      </td>

                      {/* 1-Click Visibility Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFragranceVisibility(f)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition inline-flex items-center gap-1 border ${
                            isVisible 
                              ? "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200" 
                              : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                          }`}
                          title={isVisible ? "Clic para ocultar de la tienda" : "Clic para hacer visible en la tienda"}
                        >
                          {isVisible ? "Visible" : "Oculto"}
                        </button>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingFragrance(f)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-semibold text-gray-800 hover:bg-gray-100 hover:text-gray-950 transition shadow-xs"
                          >
                            <Edit3 className="w-3 h-3 text-gray-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === f.id}
                            onClick={() => handleDeleteFragrance(f.id, f.name)}
                            className="p-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 hover:text-red-700 hover:bg-red-50 transition shadow-xs disabled:opacity-40"
                            title="Eliminar fragancia"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && !loading && (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <p className="text-sm font-semibold text-gray-900">No fragrance oils found</p>
                <p className="text-xs text-gray-500">
                  Try adjusting your search query or scent family filter.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Fragrance Oil Edit Modal */}
      <FragranceOilEditModal
        isOpen={Boolean(editingFragrance)}
        fragrance={editingFragrance}
        onClose={() => setEditingFragrance(null)}
        onSaved={fetchFragrances}
      />
    </AdminGuard>
  );
}
