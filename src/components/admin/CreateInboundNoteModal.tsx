"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Plus, 
  FileText, 
  DollarSign, 
  Package, 
  Building2, 
  Hash, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Barcode,
  ScanLine
} from "lucide-react";
import { Product } from "@/types/product";
import { productService } from "@/lib/firestore/products";
import { inboundNotesRepository } from "@/lib/firestore/inbound-notes";
import { formatCurrency } from "@/lib/utils";

interface CreateInboundNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  preselectedProduct?: Product | null;
}

export function CreateInboundNoteModal({
  isOpen,
  onClose,
  onSaved,
  preselectedProduct,
}: CreateInboundNoteModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form Fields
  const [supplierName, setSupplierName] = useState("FragranceNet");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [quantity, setQuantity] = useState<number | "">(5);
  const [unitCost, setUnitCost] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load product list
  useEffect(() => {
    if (isOpen) {
      setLoadingProducts(true);
      setError("");
      setSuccessMsg("");
      productService
        .getAllProducts()
        .then((all) => {
          setProducts(all);
          if (preselectedProduct) {
            setSelectedProduct(preselectedProduct);
            setUnitCost(preselectedProduct.cost || 0);
          } else if (all.length > 0 && !selectedProduct) {
            setSelectedProduct(all[0]);
            setUnitCost(all[0].cost || 0);
          }
        })
        .finally(() => setLoadingProducts(false));
    }
  }, [isOpen, preselectedProduct]);

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      p.sku.toLowerCase().includes(q) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );
  });

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setUnitCost(prod.cost || 0);
    setProductSearch("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const term = productSearch.trim().toLowerCase();
      if (!term) return;

      // Match exact or partial SKU / barcode first, then name
      const exactMatch = products.find(
        (p) => p.sku.toLowerCase() === term || p.id.toLowerCase() === term
      ) || products.find(
        (p) => p.sku.toLowerCase().includes(term) || p.name.toLowerCase().includes(term)
      );

      if (exactMatch) {
        handleSelectProduct(exactMatch);
        // Play scan beep
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.value = 0.1;
          osc.start();
          setTimeout(() => { osc.stop(); ctx.close(); }, 120);
        } catch {}
      }
    }
  };

  const calculatedTotal =
    quantity !== "" && unitCost !== "" ? Number(quantity) * Number(unitCost) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError("Debes seleccionar un producto.");
      return;
    }
    if (!supplierName.trim()) {
      setError("Debes ingresar el nombre del proveedor a quien se le compra.");
      return;
    }
    if (quantity === "" || Number(quantity) <= 0) {
      setError("La cantidad comprada debe ser mayor a 0.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await inboundNotesRepository.createInboundNote({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        brand: selectedProduct.brand || (selectedProduct.attributes?.brand as string),
        category: selectedProduct.categoryName || selectedProduct.category,
        supplierName: supplierName.trim(),
        invoiceNumber: invoiceNumber.trim() || undefined,
        quantity: Number(quantity),
        unitCost: unitCost !== "" ? Number(unitCost) : 0,
        notes: notes.trim() || undefined,
        createdBy: "ueservicesllc1@gmail.com",
      });

      if (!res.success) {
        throw new Error(res.error || "Error al registrar la nota de entrada.");
      }

      setSuccessMsg(`¡Nota de entrada registrada! Se sumaron +${quantity} unidades al inventario de ${selectedProduct.name}.`);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Error al registrar la nota de entrada.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#FAFAFA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2B5F4A] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-950 tracking-tight">Crear Nota de Entrada (Inbound Stock)</h2>
              <p className="text-[11px] text-gray-500">Registra compras y recepciones de mercancía para aumentar el inventario disponible.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* 1. Product Selector with Search */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-gray-500" /> 1. Producto a Ingresar *
            </label>

            {/* Selected Product Card */}
            {selectedProduct && (
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-gray-200 bg-white overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    {selectedProduct.primaryImageUrl ? (
                      <img src={selectedProduct.primaryImageUrl} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-lg">🧴</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                        {selectedProduct.categoryName || selectedProduct.category}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">{selectedProduct.sku}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-950">{selectedProduct.name}</h4>
                    <p className="text-[11px] text-gray-600">
                      Stock actual en catálogo: <strong className="text-gray-900">{selectedProduct.inventory?.quantityInStock || 0} unidades</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-xs text-emerald-800 underline font-semibold hover:text-emerald-950 px-2 py-1"
                >
                  Cambiar
                </button>
              </div>
            )}

            {/* Search Dropdown when no product is selected or changing */}
            {!selectedProduct && (
              <div className="space-y-2">
                <div className="relative">
                  <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#2B5F4A]" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Escanea el código de barra con la pistola o busca por nombre..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-gray-300 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B5F4A] font-medium"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-gray-400">
                    <ScanLine className="w-3.5 h-3.5 text-[#2B5F4A]" /> Listo para escanear
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white shadow-inner">
                  {loadingProducts ? (
                    <div className="p-4 text-center text-xs text-gray-500">Cargando catálogo...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">No se encontraron productos.</div>
                  ) : (
                    filteredProducts.slice(0, 15).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProduct(p)}
                        className="w-full p-2.5 text-left hover:bg-gray-50 flex items-center justify-between transition text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">🧴</span>
                          <div>
                            <span className="font-bold text-gray-900 block">{p.name}</span>
                            <span className="text-[10px] text-gray-500">{p.sku} · {p.categoryName || p.category}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          Stock: {p.inventory?.quantityInStock || 0}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Supplier (A quién se le compra) & Invoice */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
              2. Datos del Proveedor y Compra
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Supplier Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-500" /> Proveedor (A quién se le compra) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. FragranceNet, Africa Imports, Wholesale USA"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
                />
              </div>

              {/* Invoice Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-gray-500" /> Factura / N° Referencia de Compra
                </label>
                <input
                  type="text"
                  placeholder="Ej. INV-98421, PO-2026-10"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
                />
              </div>
            </div>
          </div>

          {/* 3. Quantity, Unit Cost & Auto-Total */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
              3. Cantidad y Costos de Entrada
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Cantidad Comprada *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="Ej. 5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold text-gray-950 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
                />
                <p className="text-[10px] text-gray-400">Unidades que ingresarán a stock.</p>
              </div>

              {/* Unit Cost */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-gray-500" /> Costo Unitario ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
                />
                <p className="text-[10px] text-gray-400">Costo individual por unidad.</p>
              </div>

              {/* Total Calculated Cost */}
              <div className="space-y-1 bg-[#2B5F4A]/5 p-2.5 rounded-xl border border-[#2B5F4A]/20 flex flex-col justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#2B5F4A]">
                  Total Inversión de Compra
                </label>
                <div className="text-lg font-extrabold text-[#1E4233]">
                  {formatCurrency(calculatedTotal)}
                </div>
                <span className="text-[9px] text-gray-500">
                  {quantity || 0} u. × {formatCurrency(Number(unitCost || 0))}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Notas / Observaciones de Entrada</label>
              <input
                type="text"
                placeholder="Ej. Recibido en perfecto estado, lote #0482..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
              />
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !selectedProduct || !supplierName.trim() || quantity === "" || Number(quantity) <= 0}
              className="px-6 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registrando Entrada...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Registrar Nota e Ingresar Stock
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
