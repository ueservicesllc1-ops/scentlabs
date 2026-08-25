"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { productService } from "@/lib/firestore/products";
import { Product } from "@/types/product";
import { INITIAL_PRODUCTS } from "@/data/products";
import ProductQuickEditModal from "@/components/admin/ProductQuickEditModal";
import { 
  Wine, 
  FlaskConical, 
  Plus, 
  Search, 
  Tag, 
  Image as ImageIcon, 
  Edit, 
  Eye, 
  EyeOff, 
  Trash2, 
  Layers,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function AdminBottlesPage() {
  const [bottles, setBottles] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const allProds = await productService.getAdminProducts();
      
      const bottleProds = allProds.filter(
        (p) => 
          p.category === "bottles" || 
          p.categoryId === "cat_bottles" || 
          p.tags?.includes("bottles") || 
          p.tags?.includes("bottle") ||
          p.tags?.includes("rollon") ||
          p.tags?.includes("atomizer") ||
          p.id.startsWith("prod_bottle_") ||
          p.id.startsWith("prod_rollon") ||
          p.id.startsWith("prod_atomizer") ||
          p.id.startsWith("prod_dropper")
      );

      if (bottleProds.length > 0) {
        setBottles(bottleProds);
      } else {
        const localBottles = INITIAL_PRODUCTS.filter(
          (p) => p.category === "bottles" || p.id.startsWith("prod_bottle_") || p.id.startsWith("prod_rollon")
        );
        setBottles(localBottles);
      }
    } catch {
      const localBottles = INITIAL_PRODUCTS.filter(
        (p) => p.category === "bottles" || p.id.startsWith("prod_bottle_") || p.id.startsWith("prod_rollon")
      );
      setBottles(localBottles);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1-Click Visibility Toggle (Active <-> Draft)
  const handleToggleVisibility = async (p: Product) => {
    const nextStatus = p.status === "active" ? "draft" : "active";
    const updated = { ...p, status: nextStatus as any, updatedAt: new Date().toISOString() };
    
    setBottles(prev => prev.map(item => item.id === p.id ? updated : item));
    
    try {
      await productService.saveProduct(updated);
    } catch {
      loadData();
    }
  };

  // 1-Click Delete Product
  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`¿Estás seguro de que deseas ELIMINAR permanentemente '${p.name}'?`)) {
      return;
    }
    
    setBottles(prev => prev.filter(item => item.id !== p.id));
    
    try {
      await productService.deleteProduct(p.id, true);
    } catch {
      loadData();
    }
  };

  // Create New Bottle Product
  const handleCreateNew = () => {
    const newProd: Product = {
      id: `prod_bottle_${Date.now()}`,
      name: "Nuevo Frasco / Botella",
      slug: `nueva-botella-${Date.now().toString().slice(-4)}`,
      sku: `BOT-NEW-${Date.now().toString().slice(-4)}`,
      category: "bottles",
      subcategory: "Vidrio Perfumería",
      description: "",
      shortDescription: "",
      basePrice: 2.50,
      currency: "USD",
      unit: "unit",
      status: "active",
      primaryImageUrl: "",
      media: [],
      packageOptions: [],
      inventory: { quantityInStock: 50, status: "in_stock", lowStockThreshold: 10, reorderPoint: 20 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
    setEditingProduct(newProd);
  };

  const filteredBottles = bottles.filter(p => {
    if (selectedSubcategory !== "all" && p.subcategory !== selectedSubcategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.subcategory || '').toLowerCase().includes(q)
    );
  });

  const availableSubcategories = Array.from(new Set(bottles.map(b => b.subcategory).filter(Boolean)));

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] mb-2">
              <Wine className="w-3 h-3 text-[#166534]" /> Envases, Frascos & Botellas
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Glass Bottles & Envases HDPE
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Administra frascos de vidrio (roll-on, spray atomizadores, goteros), botellas plásticas HDPE de laboratorio, sube fotos, edita precios o modifícales su visibilidad.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider text-xs shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Nuevo Frasco / Botella
            </button>

            <Link
              href="/bottles"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 text-xs font-semibold shadow-xs transition"
            >
              <Wine className="w-3.5 h-3.5 text-gray-500" /> Ver en Tienda &rarr;
            </Link>
          </div>
        </div>

        {/* ━━━━ KPI CARDS ━━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Total Modelos de Botellas</span>
            <div className="text-2xl font-bold text-gray-950">{bottles.length} Formatos</div>
            <span className="text-[11px] text-[#166534] block">
              {bottles.filter(b => b.status === "active").length} Visibles &bull; {bottles.filter(b => b.status !== "active").length} Ocultas
            </span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Frascos de Vidrio</span>
            <div className="text-2xl font-bold text-[#2B5F4A]">
              {bottles.filter(b => (b.subcategory || '').toLowerCase().includes("vidrio") || b.tags?.includes("glass")).length} Modelos
            </div>
            <span className="text-[11px] text-gray-500 block">Roll-On & Spray Atomizadores</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Botellas HDPE Plástico</span>
            <div className="text-2xl font-bold text-gray-950">
              {bottles.filter(b => (b.subcategory || '').toLowerCase().includes("hdpe") || b.tags?.includes("hdpe")).length} Modelos
            </div>
            <span className="text-[11px] text-gray-500 block">Formulación & Maceración</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Stock Total en Almacén</span>
            <div className="text-2xl font-bold text-gray-950">
              {bottles.reduce((acc, b) => acc + (b.inventory?.quantityInStock || 0), 0)} Unidades
            </div>
            <span className="text-[11px] text-[#166534] block">Disponibles para despacho</span>
          </div>
        </div>

        {/* ━━━━ BOTTLES DATA TABLE ━━━━ */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden space-y-4">
          
          {/* Table Header & Search Filter Bar */}
          <div className="p-5 bg-gray-50/70 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
                <Wine className="w-4 h-4 text-[#2B5F4A]" /> Catálogo de Botellas & Frascos ({filteredBottles.length})
              </h3>
              <p className="text-[11px] text-gray-500 font-light mt-0.5">
                Edita fotos, descripciones, precios base, paquetes por volumen, oculta productos o elimínalos en 1 clic.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar botellas..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#2B5F4A]"
                />
              </div>

              {availableSubcategories.length > 0 && (
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
                >
                  <option value="all">Todas las subcategorías</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3.5 px-4">Botella / Frasco & Foto</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Material / Tipo</th>
                  <th className="py-3.5 px-4 text-right">Precio Base</th>
                  <th className="py-3.5 px-4 text-right">Stock</th>
                  <th className="py-3.5 px-4 text-center">Visibilidad</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBottles.map((p) => {
                  const image =
                    p.primaryImageUrl ||
                    (p.media && (p.media as any[])[0]?.url) ||
                    (p.images && p.images[0]?.url);

                  const isVisible = p.status === "active";

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative hover:ring-2 hover:ring-[#2B5F4A] transition group"
                            title="Hacer clic para editar o subir foto"
                          >
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={image} alt={p.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <div className="text-[9px] text-orange-700 font-bold px-1 uppercase bg-orange-50 w-full h-full flex flex-col items-center justify-center gap-0.5 group-hover:bg-orange-100">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Subir Foto</span>
                              </div>
                            )}
                          </button>
                          <div>
                            <button
                              type="button"
                              onClick={() => setEditingProduct(p)}
                              className="font-bold text-gray-950 hover:text-[#2B5F4A] text-left hover:underline block"
                            >
                              {p.name}
                            </button>
                            <div className="text-[11px] text-gray-500 line-clamp-1">{p.shortDescription || p.description}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-gray-900 text-xs">
                        {p.sku}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[11px]">
                          {p.subcategory || p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-950">
                        ${(p.basePrice || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#166534]">
                        {p.inventory?.quantityInStock ?? p.inventory?.availableQuantity ?? 0} u
                      </td>

                      {/* 1-Click Visibility Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(p)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition inline-flex items-center gap-1 border ${
                            isVisible 
                              ? "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0] hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200" 
                              : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                          }`}
                          title={isVisible ? "Clic para ocultar de la tienda" : "Clic para hacer visible en la tienda"}
                        >
                          {isVisible ? (
                            <>
                              <Eye className="w-3 h-3 text-[#166534]" />
                              <span>Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-700" />
                              <span>Oculto</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions: Edit Full & Delete */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-[11px] uppercase tracking-wider transition inline-flex items-center gap-1 shadow-2xs"
                            title="Editar todos los datos y fotos"
                          >
                            <Edit className="w-3 h-3 text-amber-300" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition"
                            title="Eliminar producto permanentemente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Full Product Edit & Photo Modal */}
        {editingProduct && (
          <ProductQuickEditModal
            isOpen={!!editingProduct}
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSaved={() => {
              loadData();
              setEditingProduct(null);
            }}
          />
        )}

      </div>
    </AdminGuard>
  );
}
