"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { packagingRepository } from "@/lib/firestore/packaging";
import { productionRepository } from "@/lib/firestore/production";
import { productService } from "@/lib/firestore/products";
import { PackagingMaterial, BoxSizeVariant, ProductionJob } from "@/types/packaging";
import { Product } from "@/types/product";
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
  CheckCircle2,
  Search,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react";

// Master seed for packaging products displayed in /packaging
const MASTER_PACKAGING_SEED: Product[] = ([
  {
    id: "prod_box_10ml",
    name: "Roll-On Box — 10 ml",
    slug: "roll-on-box-10ml",
    category: "packaging",
    subcategory: "Boxes",
    description: "110 lb Smooth White Cardstock. Fixed dimensions: 0.95\" × 3.65\" × 0.95\" for 10ml glass roll-ons.",
    shortDescription: "Caja de cartulina blanca 110 lb para frascos roll-on de 10 ml.",
    sku: "BOX-ROL-10ML",
    basePrice: 0.45,
    currency: "USD",
    unit: "unit",
    status: "active",
    primaryImageUrl: "/images/products/perfume-boxes.jpg",
    media: [{ id: "m1", url: "/images/products/perfume-boxes.jpg", type: "image", isPrimary: true, altText: "Roll-On Box 10ml", sortOrder: 0 }],
    inventory: { quantityInStock: 240, status: "in_stock", lowStockThreshold: 5, reorderPoint: 10 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_box_30ml",
    name: "Rectangular Perfume Box — 30 ml",
    slug: "rectangular-perfume-box-30ml",
    category: "packaging",
    subcategory: "Boxes",
    description: "110 lb Smooth White Cardstock. Fixed dimensions: 1.65\" × 4.85\" × 1.65\" for 30ml spray bottles.",
    shortDescription: "Caja rectangular plegable 110 lb para frascos atomizadores de 30 ml.",
    sku: "BOX-FLD-30ML",
    basePrice: 0.65,
    currency: "USD",
    unit: "unit",
    status: "active",
    primaryImageUrl: "/images/products/perfume-boxes.jpg",
    media: [{ id: "m2", url: "/images/products/perfume-boxes.jpg", type: "image", isPrimary: true, altText: "Perfume Box 30ml", sortOrder: 0 }],
    inventory: { quantityInStock: 180, status: "in_stock", lowStockThreshold: 5, reorderPoint: 10 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_box_50ml",
    name: "Rectangular Perfume Box — 50 ml",
    slug: "rectangular-perfume-box-50ml",
    category: "packaging",
    subcategory: "Boxes",
    description: "110 lb Smooth White Cardstock. Fixed dimensions: 2.10\" × 5.20\" × 2.10\" for 50ml perfume bottles.",
    shortDescription: "Caja rectangular plegable 110 lb para botellas de perfume de 50 ml.",
    sku: "BOX-FLD-50ML",
    basePrice: 0.75,
    currency: "USD",
    unit: "unit",
    status: "active",
    primaryImageUrl: "/images/products/perfume-boxes.jpg",
    media: [{ id: "m3", url: "/images/products/perfume-boxes.jpg", type: "image", isPrimary: true, altText: "Perfume Box 50ml", sortOrder: 0 }],
    inventory: { quantityInStock: 150, status: "in_stock", lowStockThreshold: 5, reorderPoint: 10 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_shrink_4x6",
    name: "POF Heat Shrink Bags (4×6 in · 10ml Roll-On)",
    slug: "shrink-wrap-bags-4x6",
    category: "packaging",
    subcategory: "Heat Shrink Wrap Bags",
    description: "100 Gauge crystal-clear polyolefin shrink film. Pre-sealed bottom for 10ml roll-on bottles.",
    shortDescription: "Bolsas termorretráctiles 4x6 pulgadas para roll-ons.",
    sku: "PKG-SHR-0406",
    basePrice: 0.10,
    currency: "USD",
    unit: "bag",
    status: "active",
    primaryImageUrl: "/images/products/shrink-wrap.jpg",
    media: [{ id: "m4", url: "/images/products/shrink-wrap.jpg", type: "image", isPrimary: true, altText: "Shrink Bags 4x6", sortOrder: 0 }],
    inventory: { quantityInStock: 500, status: "in_stock", lowStockThreshold: 50, reorderPoint: 100 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_shrink_6x6",
    name: "POF Heat Shrink Bags (6×6 in · 30ml Bottle)",
    slug: "shrink-wrap-bags-6x6",
    category: "packaging",
    subcategory: "Heat Shrink Wrap Bags",
    description: "100 Gauge POF heat shrink film for 30ml spray atomizers and small perfume boxes.",
    shortDescription: "Bolsas termorretráctiles 6x6 pulgadas para botellas de 30 ml.",
    sku: "PKG-SHR-0606",
    basePrice: 0.12,
    currency: "USD",
    unit: "bag",
    status: "active",
    primaryImageUrl: "/images/products/shrink-wrap.jpg",
    media: [{ id: "m5", url: "/images/products/shrink-wrap.jpg", type: "image", isPrimary: true, altText: "Shrink Bags 6x6", sortOrder: 0 }],
    inventory: { quantityInStock: 450, status: "in_stock", lowStockThreshold: 50, reorderPoint: 100 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_shrink_6x8",
    name: "POF Heat Shrink Bags (6×8 in · 50ml/100ml)",
    slug: "shrink-wrap-bags-6x8",
    category: "packaging",
    subcategory: "Heat Shrink Wrap Bags",
    description: "100 Gauge POF heat shrink film for 50ml and 100ml presentation boxes and glass bottles.",
    shortDescription: "Bolsas termorretráctiles 6x8 pulgadas para botellas de 50ml a 100ml.",
    sku: "PKG-SHR-0608",
    basePrice: 0.12,
    currency: "USD",
    unit: "bag",
    status: "active",
    primaryImageUrl: "/images/products/shrink-wrap.jpg",
    media: [{ id: "m6", url: "/images/products/shrink-wrap.jpg", type: "image", isPrimary: true, altText: "Shrink Bags 6x8", sortOrder: 0 }],
    inventory: { quantityInStock: 400, status: "in_stock", lowStockThreshold: 50, reorderPoint: 100 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_security_stickers",
    name: "Holographic Security Seals",
    slug: "holographic-security-stickers",
    category: "packaging",
    subcategory: "Security Stickers",
    description: "Tamper-evident holographic security stickers for box tucks, bottle caps, and laboratory closures.",
    shortDescription: "Sellos holográficos de seguridad con evidencia de apertura.",
    sku: "PKG-SEC-HOLO-100",
    basePrice: 0.045,
    currency: "USD",
    unit: "sticker",
    status: "active",
    primaryImageUrl: "/images/products/security-stickers.jpg",
    media: [{ id: "m7", url: "/images/products/security-stickers.jpg", type: "image", isPrimary: true, altText: "Security Seals", sortOrder: 0 }],
    inventory: { quantityInStock: 1200, status: "in_stock", lowStockThreshold: 100, reorderPoint: 200 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_tags_cord",
    name: "Metallic Hang Tags with Elastic Cord",
    slug: "tags-with-cord",
    category: "packaging",
    subcategory: "Tags",
    description: "Metallic hang tags with elastic cord for perfume packaging, bottle neck presentation, and branding.",
    shortDescription: "Etiquetas colgantes metálicas con cordón elástico.",
    sku: "PKG-TAG-50",
    basePrice: 0.076,
    currency: "USD",
    unit: "tag",
    status: "active",
    primaryImageUrl: "/images/products/hang-tags.jpg",
    media: [{ id: "m8", url: "/images/products/hang-tags.jpg", type: "image", isPrimary: true, altText: "Hang Tags with Cord", sortOrder: 0 }],
    inventory: { quantityInStock: 800, status: "in_stock", lowStockThreshold: 50, reorderPoint: 100 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
] as any[]) as Product[];

export default function AdminPackagingDashboardPage() {
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [boxes, setBoxes] = useState<BoxSizeVariant[]>([]);
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [packagingProducts, setPackagingProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
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
      
      const map = new Map<string, Product>();
      MASTER_PACKAGING_SEED.forEach(p => map.set(p.id, p));

      allProds.forEach(p => {
        if (
          p.category === "packaging" ||
          p.categoryId === "cat_packaging" ||
          p.tags?.includes("packaging") ||
          p.id.startsWith("prod_box_") ||
          p.id.startsWith("prod_shrink_") ||
          p.id.startsWith("prod_tag") ||
          p.id.startsWith("prod_security") ||
          p.id.includes("box") ||
          p.id.includes("shrink")
        ) {
          const existing = map.get(p.id);
          map.set(p.id, {
            ...existing,
            ...p,
            primaryImageUrl: p.primaryImageUrl || (p.media && (p.media as any[])[0]?.url) || (p.images && p.images[0]?.url) || existing?.primaryImageUrl || '',
          });
        }
      });

      setPackagingProducts(Array.from(map.values()));
    } catch {
      setPackagingProducts(MASTER_PACKAGING_SEED);
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
    
    // Update local state immediately for instant feedback
    setPackagingProducts(prev => prev.map(item => item.id === p.id ? updated : item));
    
    try {
      await productService.saveProduct(updated);
    } catch {
      loadData();
    }
  };

  // 1-Click Delete Product
  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`¿Estás seguro de que deseas ELIMINAR '${p.name}' permanentemente?`)) {
      return;
    }
    
    setPackagingProducts(prev => prev.filter(item => item.id !== p.id));
    
    try {
      await productService.deleteProduct(p.id, true);
    } catch {
      loadData();
    }
  };

  // Create New Packaging Item
  const handleCreateNew = () => {
    const newProd: Product = {
      id: `prod_pack_${Date.now()}`,
      name: "Nuevo Producto de Empaque",
      slug: `nuevo-empaque-${Date.now().toString().slice(-4)}`,
      sku: `PKG-NEW-${Date.now().toString().slice(-4)}`,
      category: "packaging",
      subcategory: "Boxes",
      description: "",
      shortDescription: "",
      basePrice: 1.00,
      currency: "USD",
      unit: "unit",
      status: "active",
      primaryImageUrl: "",
      media: [],
      packageOptions: [],
      inventory: { quantityInStock: 100, status: "in_stock", lowStockThreshold: 10, reorderPoint: 20 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;
    setEditingProduct(newProd);
  };

  const totalRawSheets = materials.reduce((acc, m) => acc + m.quantity, 0);
  const totalFinishedBoxes = boxes.reduce((acc, b) => acc + b.inventory, 0);
  const activeJobs = jobs.filter((j) => j.status === "queued" || j.status === "cutting" || j.status === "assembly");

  const filteredProducts = packagingProducts.filter(p => {
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
              Edita precios, fotos, descripciones, activa/oculta productos de la tienda o elimínalos según tus necesidades.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider text-xs shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Nuevo Empaque
            </button>

            <Link
              href="/packaging"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 text-xs font-semibold shadow-xs transition"
            >
              <Package className="w-3.5 h-3.5 text-gray-500" /> Ver Tienda &rarr;
            </Link>
          </div>
        </div>

        {/* ━━━━ KPI SUMMARY CARDS ━━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Total Productos Empaque</span>
            <div className="text-2xl font-bold text-gray-950">{packagingProducts.length} Artículos</div>
            <span className="text-[11px] text-[#166534] block">
              {packagingProducts.filter(p => p.status === "active").length} Visibles &bull; {packagingProducts.filter(p => p.status !== "active").length} Ocultos
            </span>
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

        {/* ━━━━ ALL PACKAGING PRODUCTS TABLE (WITH PHOTO EDIT, VISIBILITY & DELETE) ━━━━ */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden space-y-4">
          
          {/* Table Header & Search Filter Bar */}
          <div className="p-5 bg-gray-50/70 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2B5F4A]" /> Catálogo de Empaques ({filteredProducts.length})
              </h3>
              <p className="text-[11px] text-gray-500 font-light mt-0.5">
                Edita fotos, información completa, oculta productos o elimínalos en 1 clic.
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
                  placeholder="Buscar en empaques..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#2B5F4A]"
                />
              </div>

              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
              >
                <option value="all">Todas las subcategorías</option>
                <option value="Boxes">Cajas (Boxes)</option>
                <option value="Heat Shrink Wrap Bags">Bolsas Termorretráctiles</option>
                <option value="Security Stickers">Sellos Holográficos</option>
                <option value="Tags">Etiquetas Colgantes</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3.5 px-4">Producto & Foto</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Subcategoría</th>
                  <th className="py-3.5 px-4 text-right">Precio Base</th>
                  <th className="py-3.5 px-4 text-right">Stock</th>
                  <th className="py-3.5 px-4 text-center">Visibilidad</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
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
                          {p.subcategory || "General"}
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
                          title={isVisible ? "Hacer clic para ocultar de la tienda" : "Hacer clic para hacer visible en la tienda"}
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
