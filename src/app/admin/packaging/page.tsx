"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { packagingRepository } from "@/lib/firestore/packaging";
import { productionRepository } from "@/lib/firestore/production";
import { productService } from "@/lib/firestore/products";
import { PackagingMaterial, BoxSizeVariant, ProductionJob } from "@/types/packaging";
import { Product } from "@/types/product";
import { INITIAL_PRODUCTS } from "@/data/products";
import ProductQuickEditModal from "@/components/admin/ProductQuickEditModal";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Package, 
  Box, 
  Layers, 
  Scissors, 
  Plus, 
  Tag, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  RotateCcw,
  Edit,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";

export default function AdminPackagingDashboardPage() {
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [boxes, setBoxes] = useState<BoxSizeVariant[]>([]);
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [packagingProducts, setPackagingProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const mats = await packagingRepository.getRawMaterials();
    setMaterials(mats);
    const bx = await packagingRepository.getBoxVariants();
    setBoxes(bx);
    const jb = await productionRepository.getProductionJobs();
    setJobs(jb);

    try {
      const allProds = await productService.getAllProducts();
      const packProds = allProds.filter(
        (p) => p.category === "packaging" || p.categoryId === "cat_packaging" || p.tags?.includes("packaging") || p.id.startsWith("prod_box_") || p.id.startsWith("prod_shrink_") || p.id.startsWith("prod_tag") || p.id.startsWith("prod_security")
      );
      setPackagingProducts(packProds.length > 0 ? packProds : INITIAL_PRODUCTS.filter(p => p.category === "packaging" || p.id.startsWith("prod_box_")));
    } catch {
      setPackagingProducts(INITIAL_PRODUCTS.filter(p => p.category === "packaging" || p.id.startsWith("prod_box_")));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRawSheets = materials.reduce((acc, m) => acc + m.quantity, 0);
  const totalFinishedBoxes = boxes.reduce((acc, b) => acc + b.inventory, 0);
  const activeJobs = jobs.filter((j) => j.status === "queued" || j.status === "cutting" || j.status === "assembly");

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <Package className="w-3 h-3 text-gray-600" /> Sistema de Empaque & Cajas
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Empaques, Cajas & Suministros
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Administra la fabricación de cajas Cricut, bolsas termoencogibles, sellos de seguridad, etiquetas colgantes y sube fotos a cada producto.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/admin/packaging/boxes"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 text-xs font-semibold shadow-xs transition"
            >
              <Box className="w-3.5 h-3.5 text-gray-500" /> Diseñador de Cajas
            </Link>

            <Link
              href="/admin/packaging/production"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider text-xs shadow-xs transition"
            >
              <Scissors className="w-3.5 h-3.5" /> Cola de Producción
            </Link>
          </div>
        </div>

        {/* ━━━━ KPI SUMMARY CARDS ━━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Cajas Terminadas</span>
            <div className="text-2xl font-bold text-gray-950">{totalFinishedBoxes} Unidades</div>
            <span className="text-[11px] text-[#166534] block">Listas para despacho</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Pliegos de Cartulina</span>
            <div className="text-2xl font-bold text-[#2B5F4A]">{totalRawSheets} Pliegos</div>
            <span className="text-[11px] text-gray-500 block">110 lb 8.5x11 Cardstock</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Trabajos Cricut Activos</span>
            <div className="text-2xl font-bold text-gray-950">{activeJobs.length} En Proceso</div>
            <span className="text-[11px] text-gray-500 block">En cola o sobre el tapete</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Capacidad de Producción</span>
            <div className="text-2xl font-bold text-gray-950">1,200 Cajas/sem</div>
            <span className="text-[11px] text-gray-500 block">Cricut Maker 3 Dual Output</span>
          </div>
        </div>

        {/* ━━━━ ALL PACKAGING PRODUCTS TABLE (WITH PHOTO EDIT) ━━━━ */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 bg-gray-50/70 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2B5F4A]" /> Catálogo de Productos de Empaque ({packagingProducts.length})
              </h3>
              <p className="text-[11px] text-gray-500 font-light mt-0.5">
                Haz clic en &quot;Editar / Subir Foto&quot; para cambiar precios, stock o subir fotos directamente.
              </p>
            </div>

            <Link
              href="/admin/products"
              className="text-xs text-[#2B5F4A] hover:underline font-bold"
            >
              Ver Todos los Productos &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3.5 px-4">Producto & Foto</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Categoría / Tipo</th>
                  <th className="py-3.5 px-4 text-right">Precio Base</th>
                  <th className="py-3.5 px-4 text-right">Inventario</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {packagingProducts.map((p) => {
                  const image =
                    p.primaryImageUrl ||
                    (p.media && (p.media as any[])[0]?.url) ||
                    (p.images && p.images[0]?.url);

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={image} alt={p.name} className="w-full h-full object-contain p-1" />
                            ) : (
                              <div className="text-[9px] text-orange-600 font-bold px-1 uppercase bg-orange-50 w-full h-full flex items-center justify-center text-center">
                                Sin Foto
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-950 hover:text-[#2B5F4A]">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-gray-500 line-clamp-1">{p.shortDescription || p.description}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-gray-900 text-xs">
                        {p.sku}
                      </td>

                      <td className="py-3 px-4 text-gray-700 capitalize">
                        {p.subcategory || p.category}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-950">
                        ${(p.basePrice || 0).toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#166534]">
                        {p.inventory?.quantityInStock ?? p.inventory?.availableQuantity ?? 0} u
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === "active" ? "bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]" : "bg-gray-100 text-gray-700"
                        }`}>
                          {p.status || "active"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="px-3 py-1.5 rounded-lg bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-[11px] uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                          <span>Editar / Subir Foto</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ━━━━ BOXES SPECIFICATIONS SECTION ━━━━ */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Formatos de Cajas Estándar para Corte Cricut
            </span>
            <Link
              href="/admin/packaging/boxes"
              className="text-xs text-[#2B5F4A] hover:underline font-semibold"
            >
              Configurar Cajas &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3 px-4">Formato de Caja</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Dimensiones</th>
                  <th className="py-3 px-4 text-right">Costo Unitario</th>
                  <th className="py-3 px-4 text-right">Precio Venta</th>
                  <th className="py-3 px-4 text-right">Inventario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {boxes.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-gray-950">{b.name}</td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-[11px]">{b.sku}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono">
                      {b.width}&quot; × {b.height}&quot; × {b.depth}&quot;
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700 font-semibold">
                      ${(b.unitCost || b.costBreakdown?.unitCost || 0).toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-950 font-bold">
                      ${(b.retailPrice || b.suggestedPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#166534]">
                      {b.inventory} unidades
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Edit & Photo Upload Modal */}
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
