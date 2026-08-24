"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { CreateInboundNoteModal } from "@/components/admin/CreateInboundNoteModal";
import { inboundNotesRepository } from "@/lib/firestore/inbound-notes";
import { InboundNote, InboundSummaryMetrics } from "@/types/inbound-notes";
import { formatCurrency } from "@/lib/utils";
import { 
  FileText, 
  Plus, 
  Search, 
  DollarSign, 
  Package, 
  Building2, 
  Hash, 
  TrendingUp, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  RefreshCw,
  ArrowUpDown,
  Filter
} from "lucide-react";

export default function AdminInboundNotesPage() {
  const [notes, setNotes] = useState<InboundNote[]>([]);
  const [metrics, setMetrics] = useState<InboundSummaryMetrics>({
    totalNotes: 0,
    totalUnitsReceived: 0,
    totalSpend: 0,
    uniqueSuppliersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allNotes, allMetrics] = await Promise.all([
        inboundNotesRepository.getAllInboundNotes(),
        inboundNotesRepository.getInboundMetrics(),
      ]);
      setNotes(allNotes);
      setMetrics(allMetrics);
    } catch (err) {
      console.error("Error loading inbound notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const suppliersList = Array.from(
    new Set(notes.map((n) => n.supplierName).filter(Boolean))
  ).sort();

  const filteredNotes = notes.filter((n) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      n.noteNumber.toLowerCase().includes(q) ||
      n.productName.toLowerCase().includes(q) ||
      n.sku.toLowerCase().includes(q) ||
      n.supplierName.toLowerCase().includes(q) ||
      (n.invoiceNumber && n.invoiceNumber.toLowerCase().includes(q));

    const matchSupplier =
      supplierFilter === "all" ||
      n.supplierName.toLowerCase() === supplierFilter.toLowerCase();

    return matchSearch && matchSupplier;
  });

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans pb-16">
        
        {/* ━━━━ HEADER & QUICK ACTIONS ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2B5F4A]/10 text-[#2B5F4A] border border-[#2B5F4A]/20 mb-2">
              <FileText className="w-3 h-3" /> Contabilidad & Abastecimiento
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Notas de Entrada de Inventario
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Registro contable de compras a proveedores. Cada nota ingresa formalmente las unidades al inventario y alimenta el stock disponible para la venta.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Crear Nota de Entrada
            </button>
          </div>
        </div>

        {/* ━━━━ KPI METRIC CARDS ━━━━ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Inbound Spend */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Inversión Total en Compras</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#1E4233]">
                {formatCurrency(metrics.totalSpend)}
              </div>
              <span className="text-[10px] text-gray-400">Total acumulado ingresado</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2B5F4A] flex items-center justify-center border border-emerald-100 flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          {/* Total Units Received */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Unidades Ingresadas</span>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {metrics.totalUnitsReceived.toLocaleString()} u.
              </div>
              <span className="text-[10px] text-gray-400">Sumadas al inventario vivo</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
          </div>

          {/* Total Notes Count */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Notas Registradas</span>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {metrics.totalNotes}
              </div>
              <span className="text-[10px] text-gray-400">Comprobantes de recepción</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Active Suppliers */}
          <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Proveedores Activos</span>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {metrics.uniqueSuppliersCount}
              </div>
              <span className="text-[10px] text-gray-400">Fuentes de abastecimiento</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* ━━━━ FILTERS & SEARCH ━━━━ */}
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por producto, N° nota, proveedor o factura..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {suppliersList.length > 0 && (
              <select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
              >
                <option value="all">Todos los Proveedores</option>
                {suppliersList.map((sup) => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={loadData}
              title="Recargar datos"
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ━━━━ INBOUND NOTES TABLE ━━━━ */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-2 border-[#2B5F4A] border-t-transparent rounded-full animate-spin" />
              <span>Cargando libro de notas de entrada...</span>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-16 text-center text-gray-500 space-y-3">
              <FileText className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-800">No hay notas de entrada registradas</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {search || supplierFilter !== "all"
                  ? "No hay notas que coincidan con los filtros de búsqueda."
                  : "Crea tu primera Nota de Entrada para registrar compras y cargar stock en tus productos."}
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2B5F4A] text-white text-xs font-bold uppercase tracking-wider rounded-lg"
              >
                <Plus className="w-4 h-4" /> Crear Nota de Entrada
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-gray-200">
                <thead className="bg-gray-50/80 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3.5">N° Nota</th>
                    <th className="px-4 py-3.5">Fecha</th>
                    <th className="px-4 py-3.5">Producto</th>
                    <th className="px-4 py-3.5">Proveedor (Comprado a)</th>
                    <th className="px-4 py-3.5 text-right">Cant. Entrada</th>
                    <th className="px-4 py-3.5 text-right">Costo Unit.</th>
                    <th className="px-4 py-3.5 text-right">Total Compra</th>
                    <th className="px-4 py-3.5">Ref. Factura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-gray-50/60 transition">
                      
                      {/* Note Number */}
                      <td className="px-4 py-3.5 font-bold font-mono text-gray-900">
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                          {note.noteNumber}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                        {new Date(note.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{note.productName}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {note.sku} {note.category ? `· ${note.category}` : ""}
                          </span>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>{note.supplierName}</span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-3.5 text-right font-extrabold text-emerald-800">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                          +{note.quantity} u.
                        </span>
                      </td>

                      {/* Unit Cost */}
                      <td className="px-4 py-3.5 text-right font-medium text-gray-600">
                        {formatCurrency(note.unitCost)}
                      </td>

                      {/* Total Cost */}
                      <td className="px-4 py-3.5 text-right font-extrabold text-gray-950">
                        {formatCurrency(note.totalCost)}
                      </td>

                      {/* Invoice Ref */}
                      <td className="px-4 py-3.5 text-gray-500">
                        {note.invoiceNumber ? (
                          <span className="font-mono text-[10px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                            {note.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Create Inbound Note Modal */}
      <CreateInboundNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaved={() => {
          loadData();
        }}
      />
    </AdminGuard>
  );
}
