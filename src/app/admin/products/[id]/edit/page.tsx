"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Archive,
  Copy,
  AlertCircle,
  CheckCircle2,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Boxes,
  Package,
  Truck,
  Building2,
  Sparkles,
  Search as SearchIcon,
  Tag,
  Plus,
  X,
  ShieldAlert,
  Info,
  Clock,
  HelpCircle,
} from "lucide-react";
import AdminGuard from "@/components/auth/AdminGuard";
import MediaUploader from "@/components/admin/MediaUploader";
import StockAdjustmentModal from "@/components/admin/StockAdjustmentModal";
import ProductPreviewModal from "@/components/admin/ProductPreviewModal";
import {
  Product,
  ProductStatus,
  ProductType,
  ProductVariant,
  ProductMediaItem,
} from "@/types/product";
import { VolumePriceTier } from "@/types/pricing";
import { productService, generateSlug } from "@/lib/firestore/products";
import { categoryService } from "@/lib/firestore/categories";
import { supplierRepository } from "@/lib/firestore/suppliers";
import { inventoryRepository } from "@/lib/firestore/inventory";
import { Category } from "@/types/category";
import { Supplier } from "@/types/supplier";
import { InventoryTransaction } from "@/types/inventory";

type TabKey =
  | "general"
  | "media"
  | "pricing"
  | "variants"
  | "inventory"
  | "shipping"
  | "supplier"
  | "custom_label"
  | "recommendations"
  | "seo"
  | "advanced";

export default function ProductEditorPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [product, setProduct] = useState<Product | null>(null);
  const [initialProductSnapshot, setInitialProductSnapshot] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Reference lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);

  // Modals & Feedback
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newTagInput, setNewTagInput] = useState("");

  // Variant editing state
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!productId) return;
      setLoading(true);
      try {
        const [prod, cats, supps, prodsList, txs] = await Promise.all([
          productService.getProductById(productId),
          categoryService.getCategories(),
          supplierRepository.getAllSuppliers(),
          productService.getAdminProducts(),
          inventoryRepository.getTransactions(productId),
        ]);

        if (prod) {
          // Normalize media
          const normalizedMedia = (prod.media as any[]) || [];
          const normalizedProd: Product = {
            ...prod,
            media: normalizedMedia,
            volumePricing: prod.volumePricing || [],
            variants: prod.variants || [],
            tags: prod.tags || [],
            shipping: prod.shipping || {
              weight: 8,
              weightUnit: "oz",
              length: 6,
              width: 4,
              height: 4,
              dimensionUnit: "in",
            },
            inventory: prod.inventory || {
              quantityInStock: 0,
              reservedQuantity: 0,
              availableQuantity: 0,
              lowStockThreshold: 10,
              reorderPoint: 25,
              location: "main_storage",
              status: "out_of_stock",
            },
          };
          setProduct(normalizedProd);
          setInitialProductSnapshot(JSON.stringify(normalizedProd));
        }

        setCategories(cats);
        setSuppliers(supps);
        setAllProducts(prodsList.filter((p) => p.id !== productId));
        setInventoryTransactions(txs);
      } catch (err: any) {
        setFeedback({ type: "error", text: err.message || "Failed to load product data." });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [productId]);

  const updateProduct = (updater: (prev: Product) => Product) => {
    setProduct((prev) => {
      if (!prev) return prev;
      const next = updater({ ...prev });
      setIsDirty(JSON.stringify(next) !== initialProductSnapshot);
      return next;
    });
  };

  // Save changes handler
  const handleSave = async (overrideStatus?: ProductStatus) => {
    if (!product) return;
    setSaving(true);
    setFeedback(null);

    const productToSave = { ...product };
    if (overrideStatus) {
      productToSave.status = overrideStatus;
    }

    // Validate Volume Pricing tiers (no duplicates, no negative prices)
    if (productToSave.volumePricing) {
      const seenQty = new Set<number>();
      for (const tier of productToSave.volumePricing) {
        const qty = tier.minQuantity || (tier as any).quantity;
        if (qty <= 0 || tier.unitPrice < 0) {
          setFeedback({ type: "error", text: "Volume pricing tiers must have positive quantities and valid prices." });
          setSaving(false);
          return;
        }
        if (seenQty.has(qty)) {
          setFeedback({ type: "error", text: `Duplicate quantity tier (${qty}) found in Volume Pricing.` });
          setSaving(false);
          return;
        }
        seenQty.add(qty);
      }
    }

    try {
      const result = await productService.saveProduct(productToSave);
      if (result.success && result.product) {
        setProduct(result.product);
        setInitialProductSnapshot(JSON.stringify(result.product));
        setIsDirty(false);
        setFeedback({ type: "success", text: "Product changes saved and synchronized to Firestore successfully!" });
      } else {
        setFeedback({ type: "error", text: result.error || "Failed to save product." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Error saving product." });
    } finally {
      setSaving(false);
    }
  };

  // Tag helpers
  const handleAddTag = () => {
    if (!newTagInput.trim() || !product) return;
    const clean = newTagInput.trim().toLowerCase();
    if (!product.tags.includes(clean)) {
      updateProduct((p) => ({ ...p, tags: [...p.tags, clean] }));
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateProduct((p) => ({ ...p, tags: p.tags.filter((t) => t !== tagToRemove) }));
  };

  // Volume Pricing Tiers helpers
  const handleAddVolumeTier = () => {
    updateProduct((p) => {
      const tiers = [...(p.volumePricing || [])];
      const nextMinQty = tiers.length > 0 ? (tiers[tiers.length - 1].minQuantity || (tiers[tiers.length - 1] as any).quantity) * 2 : 10;
      const lastPrice = tiers.length > 0 ? tiers[tiers.length - 1].unitPrice : p.basePrice * 0.9;
      tiers.push({
        minQuantity: nextMinQty,
        unitPrice: parseFloat((lastPrice * 0.9).toFixed(2)),
        discountPercentage: 10,
        active: true,
      } as VolumePriceTier);
      return { ...p, volumePricing: tiers };
    });
  };

  const handleUpdateVolumeTier = (index: number, field: keyof VolumePriceTier, value: any) => {
    updateProduct((p) => {
      const tiers = [...(p.volumePricing || [])];
      tiers[index] = { ...tiers[index], [field]: value };
      return { ...p, volumePricing: tiers };
    });
  };

  const handleDeleteVolumeTier = (index: number) => {
    updateProduct((p) => ({
      ...p,
      volumePricing: (p.volumePricing || []).filter((_, i) => i !== index),
    }));
  };

  // Variant Helpers
  const handleSaveVariant = (variant: ProductVariant) => {
    updateProduct((p) => {
      const variants = [...(p.variants || [])];
      const existingIdx = variants.findIndex((v) => v.id === variant.id);
      if (existingIdx >= 0) variants[existingIdx] = variant;
      else variants.push(variant);
      return { ...p, variants, hasVariants: variants.length > 0 };
    });
    setEditingVariant(null);
  };

  const handleDeleteVariant = (variantId: string) => {
    updateProduct((p) => {
      const variants = (p.variants || []).filter((v) => v.id !== variantId);
      return { ...p, variants, hasVariants: variants.length > 0 };
    });
  };

  if (loading || !product) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-lab-950 text-white flex items-center justify-center p-6">
          <div className="text-center text-xs text-lab-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading product editor...
          </div>
        </div>
      </AdminGuard>
    );
  }

  const completeness = product.completeness || { score: 80, missingFields: [] };
  const marginDollar = Math.max(0, (product.basePrice || 0) - (product.cost || 0));
  const marginPercent = product.basePrice > 0 ? ((marginDollar / product.basePrice) * 100).toFixed(1) : "0";

  return (
    <AdminGuard>
      <div className="min-h-screen bg-lab-950 text-white p-4 md:p-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Bar Navigation & Save Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-lab-800 pb-5">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/products"
                className="p-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white hover:border-lab-700 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                    Product Editor
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.2 rounded-full border ${
                    product.status === "active"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : product.status === "draft"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      : "bg-lab-800 text-lab-400 border-lab-700"
                  }`}>
                    {product.status}
                  </span>
                  {isDirty && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.2 rounded-full animate-pulse">
                      ● Unsaved Changes
                    </span>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-black text-white mt-0.5 flex items-center gap-2">
                  {product.name}
                  <span className="text-xs font-mono text-lab-500 font-normal">({product.sku})</span>
                </h1>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-3.5 py-2 bg-lab-900 border border-lab-800 text-lab-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> Preview Store
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Feedback message */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                feedback.type === "success"
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  : "bg-red-950/40 border-red-800 text-red-300"
              }`}
            >
              <span>{feedback.text}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-[10px] uppercase font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Completeness & Warning Strip */}
          <div className="p-4 bg-lab-900/40 border border-lab-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-lab-500 block">Completeness</span>
                <span className={`text-lg font-black font-mono ${
                  completeness.score >= 85 ? "text-emerald-400" : completeness.score >= 50 ? "text-amber-400" : "text-red-400"
                }`}>
                  {completeness.score}%
                </span>
              </div>
              <div className="w-36 h-2 bg-lab-800 rounded-full overflow-hidden shrink-0">
                <div
                  className={`h-full ${
                    completeness.score >= 85 ? "bg-emerald-500" : completeness.score >= 50 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${completeness.score}%` }}
                />
              </div>
              {completeness.missingFields.length > 0 && (
                <div className="text-xs text-orange-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Missing: <strong>{completeness.missingFields.join(", ")}</strong></span>
                </div>
              )}
            </div>

            {/* Quick Pricing / Margin Glance */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-lab-500 uppercase block">Retail</span>
                <span className="font-bold text-amber-400">${(product.basePrice || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-lab-500 uppercase block">Cost</span>
                <span className="text-lab-300">${(product.cost || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-lab-500 uppercase block">Margin</span>
                <span className="font-bold text-emerald-400">${marginDollar.toFixed(2)} ({marginPercent}%)</span>
              </div>
            </div>
          </div>

          {/* 11-Tab Navigation Ribbon */}
          <div className="flex items-center gap-1 border-b border-lab-800 overflow-x-auto pb-1 text-xs scrollbar-thin">
            {[
              { key: "general", label: "General", icon: Layers },
              { key: "media", label: "Media & Photos", icon: ImageIcon },
              { key: "pricing", label: "Pricing & Volume", icon: DollarSign },
              { key: "variants", label: "Variants", icon: Boxes },
              { key: "inventory", label: "Inventory & Stock", icon: Package },
              { key: "shipping", label: "Shipping & Shippo", icon: Truck },
              { key: "supplier", label: "Suppliers", icon: Building2 },
              { key: "custom_label", label: "Custom Labels", icon: Sparkles },
              { key: "recommendations", label: "Recommendations", icon: SearchIcon },
              { key: "seo", label: "SEO & Social", icon: Tag },
              { key: "advanced", label: "Advanced", icon: Info },
            ].map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as TabKey)}
                  className={`flex items-center gap-2 px-4 py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap text-[11px] ${
                    isActive
                      ? "bg-amber-500/15 border border-amber-500/40 text-amber-400"
                      : "text-lab-400 hover:text-white hover:bg-lab-900/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: GENERAL */}
          {activeTab === "general" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProduct((p) => ({ ...p, name: e.target.value }))}
                    className="w-full text-sm px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Brand / Formulator</label>
                  <input
                    type="text"
                    value={product.brand || "SCENTLAB"}
                    onChange={(e) => updateProduct((p) => ({ ...p, brand: e.target.value }))}
                    className="w-full text-xs px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">SKU (Unique Code) *</label>
                  <input
                    type="text"
                    value={product.sku}
                    onChange={(e) => updateProduct((p) => ({ ...p, sku: e.target.value.toUpperCase() }))}
                    className="w-full text-xs font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">URL Slug *</label>
                  <input
                    type="text"
                    value={product.slug}
                    onChange={(e) => updateProduct((p) => ({ ...p, slug: generateSlug(e.target.value) }))}
                    className="w-full text-xs font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Category *</label>
                  <select
                    value={product.categoryId || (product.category as string)}
                    onChange={(e) => {
                      const selectedCat = categories.find((c) => c.slug === e.target.value || c.id === e.target.value);
                      updateProduct((p) => ({
                        ...p,
                        categoryId: e.target.value,
                        category: e.target.value as any,
                        categoryName: selectedCat?.name || e.target.value,
                      }));
                    }}
                    className="w-full text-xs px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.slug} value={c.slug || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Product Type</label>
                  <select
                    value={product.productType || "physical"}
                    onChange={(e) => updateProduct((p) => ({ ...p, productType: e.target.value as any }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="physical">Physical Product</option>
                    <option value="custom">Custom Product</option>
                    <option value="bulk">Bulk Oil Repackage</option>
                    <option value="packaging">Packaging Material</option>
                    <option value="component">Component / Raw Material</option>
                    <option value="service">Service</option>
                    <option value="finished_perfume">Finished Perfume</option>
                  </select>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Short Description</label>
                  <input
                    type="text"
                    value={product.shortDescription || ""}
                    onChange={(e) => updateProduct((p) => ({ ...p, shortDescription: e.target.value }))}
                    placeholder="Brief summary for product cards and search results..."
                    className="w-full text-xs px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Full Product Description</label>
                  <textarea
                    rows={6}
                    value={product.description || ""}
                    onChange={(e) => updateProduct((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Detailed specifications, usage instructions, olfactory profile..."
                    className="w-full text-xs px-4 py-3 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Usage & Care Instructions</label>
                  <textarea
                    rows={3}
                    value={product.usageInstructions || ""}
                    onChange={(e) => updateProduct((p) => ({ ...p, usageInstructions: e.target.value }))}
                    placeholder="e.g. Store in cool, dark place away from open flame..."
                    className="w-full text-xs px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status & Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-lab-800">
                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Catalog Status</label>
                  <select
                    value={product.status}
                    onChange={(e) => updateProduct((p) => ({ ...p, status: e.target.value as any }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="active">Active (Visible in Store)</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 md:col-span-2 pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(product.featured)}
                      onChange={(e) => updateProduct((p) => ({ ...p, featured: e.target.checked }))}
                      className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 bg-lab-900 border-lab-700"
                    />
                    Featured Product
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={Boolean(product.requiresImage)}
                      onChange={(e) => updateProduct((p) => ({ ...p, requiresImage: e.target.checked }))}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-lab-900 border-lab-700"
                    />
                    Requires Primary Photo to Publish
                  </label>
                </div>
              </div>

              {/* Tags Manager */}
              <div className="pt-4 border-t border-lab-800 space-y-2">
                <label className="block text-xs uppercase font-bold text-lab-400">Search & Category Tags</label>
                <div className="flex flex-wrap items-center gap-2">
                  {product.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-lab-950 border border-lab-800 text-lab-300 text-xs rounded-lg"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-lab-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag (press Enter)..."
                      className="text-xs px-3 py-1 bg-lab-950 border border-lab-800 rounded-lg text-white placeholder:text-lab-600 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="p-1 rounded-lg bg-amber-500 text-black font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: MEDIA */}
          {activeTab === "media" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-1">
                  Product Media & Backblaze B2 Assets
                </h2>
                <p className="text-xs text-lab-400">
                  Upload high resolution images and videos directly to Backblaze B2. Firestore stores lightweight metadata.
                </p>
              </div>

              <MediaUploader
                media={(product.media as any[]) || []}
                onChange={(updated) => updateProduct((p) => ({ ...p, media: updated }))}
                folder="products"
              />
            </div>
          )}

          {/* Tab 3: PRICING & VOLUME TIERS */}
          {activeTab === "pricing" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Base Retail Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.basePrice}
                    onChange={(e) => updateProduct((p) => ({ ...p, basePrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-base font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                  />
                  {product.sourcePrice ? (
                    <div className="mt-3 p-3 bg-blue-900/20 border border-blue-900/40 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-400 block">Market Reference</span>
                        <span className="text-sm font-mono text-white">${product.sourcePrice.toFixed(2)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateProduct((p) => ({ ...p, basePrice: p.sourcePrice || 0 }))}
                        className="text-[10px] font-bold uppercase px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Use Market Price
                      </button>
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Compare at Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.compareAtPrice || ""}
                    onChange={(e) => updateProduct((p) => ({ ...p, compareAtPrice: parseFloat(e.target.value) || undefined }))}
                    placeholder="Optional original price"
                    className="w-full text-base font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-lab-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Unit Cost (Internal)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={product.cost || ""}
                    onChange={(e) => updateProduct((p) => ({ ...p, cost: parseFloat(e.target.value) || 0 }))}
                    className="w-full text-base font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-lab-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Volume Pricing Table */}
              <div className="pt-6 border-t border-lab-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Volume Pricing Tiers
                    </h3>
                    <p className="text-[11px] text-lab-400">
                      Configures tiered wholesale discounts (e.g. 1u = $1.00, 50u = $0.75, 500u = $0.50).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVolumeTier}
                    className="px-3 py-1.5 bg-lab-900 border border-lab-800 text-amber-400 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tier
                  </button>
                </div>

                <div className="border border-lab-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-lab-900/80 text-lab-400 text-[10px] uppercase">
                      <tr>
                        <th className="py-2.5 px-4">Min Quantity</th>
                        <th className="py-2.5 px-4">Unit Price (USD)</th>
                        <th className="py-2.5 px-4">Discount %</th>
                        <th className="py-2.5 px-4 text-center">Active</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lab-900 font-mono">
                      {(product.volumePricing || []).map((tier, idx) => (
                        <tr key={idx} className="hover:bg-lab-900/30">
                          <td className="py-2 px-4">
                            <input
                              type="number"
                              min="1"
                              value={tier.minQuantity || (tier as any).quantity || 1}
                              onChange={(e) =>
                                handleUpdateVolumeTier(idx, "minQuantity", parseInt(e.target.value) || 1)
                              }
                              className="w-24 px-2 py-1 bg-lab-950 border border-lab-800 rounded text-white"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={tier.unitPrice}
                              onChange={(e) =>
                                handleUpdateVolumeTier(idx, "unitPrice", parseFloat(e.target.value) || 0)
                              }
                              className="w-28 px-2 py-1 bg-lab-950 border border-lab-800 rounded text-amber-400 font-bold"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={tier.discountPercentage || ""}
                              onChange={(e) =>
                                handleUpdateVolumeTier(idx, "discountPercentage", parseFloat(e.target.value) || 0)
                              }
                              className="w-20 px-2 py-1 bg-lab-950 border border-lab-800 rounded text-emerald-400"
                            />
                          </td>
                          <td className="py-2 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={tier.active !== false}
                              onChange={(e) => handleUpdateVolumeTier(idx, "active", e.target.checked)}
                              className="w-4 h-4 rounded text-amber-500 bg-lab-900"
                            />
                          </td>
                          <td className="py-2 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteVolumeTier(idx)}
                              className="p-1 rounded text-lab-500 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: VARIANTS */}
          {activeTab === "variants" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">Product Variants</h2>
                  <p className="text-xs text-lab-400">
                    Supports size variants (e.g. 5ml, 10ml, 1oz, 32oz) with individual SKUs and prices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingVariant({
                      id: `var_${Date.now()}`,
                      productId: product.id,
                      name: "10 ml Variant",
                      sku: `${product.sku}-10ML`,
                      price: product.basePrice,
                      cost: product.cost,
                      attributes: { size: "10ml" },
                      inventory: {
                        quantityInStock: 50,
                        reservedQuantity: 0,
                        availableQuantity: 50,
                        status: "in_stock",
                      },
                      status: "active",
                    })
                  }
                  className="px-3.5 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Variant
                </button>
              </div>

              {/* Variants List Table */}
              <div className="border border-lab-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-lab-900 text-lab-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-4">Variant Name</th>
                      <th className="py-2.5 px-4">SKU</th>
                      <th className="py-2.5 px-4 text-right">Price</th>
                      <th className="py-2.5 px-4 text-right">Stock</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lab-900 font-mono">
                    {(product.variants || []).map((v) => (
                      <tr key={v.id} className="hover:bg-lab-900/30">
                        <td className="py-2.5 px-4 text-white font-bold">{v.name}</td>
                        <td className="py-2.5 px-4 text-lab-300">{v.sku}</td>
                        <td className="py-2.5 px-4 text-right text-amber-400">${(v.price || 0).toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right text-emerald-400">
                          {v.inventory?.quantityInStock ?? 0}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              v.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-lab-800 text-lab-400"
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingVariant(v)}
                              className="p-1 text-lab-400 hover:text-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(v.id)}
                              className="p-1 text-lab-400 hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: INVENTORY */}
          {activeTab === "inventory" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">Stock Level & Control</h2>
                  <p className="text-xs text-lab-400">
                    Stock adjustments are logged with an immutable audit trail.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Adjust Stock Level
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-lab-950 border border-lab-800 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-lab-500">In Stock</span>
                  <div className="text-2xl font-black font-mono text-white mt-1">
                    {product.inventory?.quantityInStock ?? 0}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-500">Reserved</span>
                  <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                    {product.inventory?.reservedQuantity ?? 0}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-500">Available to Sell</span>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                    {product.inventory?.availableQuantity ?? product.inventory?.quantityInStock ?? 0}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-lab-500">Storage Location</span>
                  <input
                    type="text"
                    value={product.inventory?.location || "main_storage"}
                    onChange={(e) =>
                      updateProduct((p) => ({
                        ...p,
                        inventory: { ...p.inventory, location: e.target.value },
                      }))
                    }
                    className="w-full text-xs mt-1 px-2.5 py-1.5 bg-lab-900 border border-lab-800 rounded text-white"
                  />
                </div>
              </div>

              {/* Recent Transactions Ledger */}
              <div className="space-y-3 pt-4 border-t border-lab-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-lab-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Audit Transaction Ledger ({inventoryTransactions.length})
                </h3>
                <div className="border border-lab-800 rounded-xl overflow-hidden text-xs max-h-60 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-lab-900 text-lab-400 text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Delta</th>
                        <th className="py-2 px-3 text-right">New Stock</th>
                        <th className="py-2 px-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lab-900 font-mono text-[11px]">
                      {inventoryTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-lab-900/30">
                          <td className="py-2 px-3 text-lab-400">{new Date(tx.createdAt).toLocaleDateString()}</td>
                          <td className="py-2 px-3 uppercase text-amber-400">{tx.type}</td>
                          <td className="py-2 px-3 text-right text-emerald-400">{tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}</td>
                          <td className="py-2 px-3 text-right text-white font-bold">{tx.newQuantity}</td>
                          <td className="py-2 px-3 text-lab-400 truncate max-w-xs">{tx.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: SHIPPING */}
          {activeTab === "shipping" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-1">
                  Shippo Shipping Weights & Dimensions
                </h2>
                <p className="text-xs text-lab-400">
                  Directly utilized to calculate live carrier rates and generate packing slips.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Weight (oz)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={product.shipping?.weight || 8}
                    onChange={(e) =>
                      updateProduct((p) => ({
                        ...p,
                        shipping: { ...(p.shipping as any), weight: parseFloat(e.target.value) || 0, weightUnit: "oz" },
                      }))
                    }
                    className="w-full text-xs font-mono px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Length (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={product.shipping?.length || 6}
                    onChange={(e) =>
                      updateProduct((p) => ({
                        ...p,
                        shipping: { ...(p.shipping as any), length: parseFloat(e.target.value) || 0, dimensionUnit: "in" },
                      }))
                    }
                    className="w-full text-xs font-mono px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Width (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={product.shipping?.width || 4}
                    onChange={(e) =>
                      updateProduct((p) => ({
                        ...p,
                        shipping: { ...(p.shipping as any), width: parseFloat(e.target.value) || 0 },
                      }))
                    }
                    className="w-full text-xs font-mono px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Height (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={product.shipping?.height || 4}
                    onChange={(e) =>
                      updateProduct((p) => ({
                        ...p,
                        shipping: { ...(p.shipping as any), height: parseFloat(e.target.value) || 0 },
                      }))
                    }
                    className="w-full text-xs font-mono px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: SUPPLIER */}
          {activeTab === "supplier" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Primary Supplier</label>
                  <select
                    value={product.supplierId || product.supplier?.primarySupplierId || ""}
                    onChange={(e) => {
                      const supp = suppliers.find((s) => s.id === e.target.value);
                      updateProduct((p) => ({
                        ...p,
                        supplierId: e.target.value,
                        supplierName: supp?.name,
                        supplier: {
                          ...p.supplier,
                          primarySupplierId: e.target.value,
                          primarySupplierName: supp?.name,
                        },
                      }));
                    }}
                    className="w-full text-xs px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                  >
                    <option value="">Select Supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Supplier SKU / ASIN</label>
                  <input
                    type="text"
                    value={product.supplierSku || product.asin || ""}
                    onChange={(e) => updateProduct((p) => ({ ...p, supplierSku: e.target.value, asin: e.target.value }))}
                    className="w-full text-xs font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Direct Supplier Reorder URL</label>
                  <input
                    type="url"
                    value={product.supplierUrl || product.externalUrl || ""}
                    onChange={(e) => updateProduct((p) => ({ ...p, supplierUrl: e.target.value, externalUrl: e.target.value }))}
                    className="w-full text-xs px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Supplier Pack Size (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={product.supplierPackSize || 100}
                    onChange={(e) => updateProduct((p) => ({ ...p, supplierPackSize: parseInt(e.target.value) || 1 }))}
                    className="w-full text-xs font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 8: CUSTOM LABEL */}
          {activeTab === "custom_label" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <label className="flex items-center gap-3 p-4 bg-lab-950 border border-lab-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(product.isCustomLabelProduct)}
                  onChange={(e) => updateProduct((p) => ({ ...p, isCustomLabelProduct: e.target.checked }))}
                  className="w-4 h-4 rounded text-amber-500 bg-lab-900 border-lab-700"
                />
                <div>
                  <div className="text-xs font-bold text-white">Is Custom Label Product</div>
                  <div className="text-[11px] text-lab-400">
                    Enables dynamic square-inch pricing, artwork uploader, and sheet yield calculation.
                  </div>
                </div>
              </label>

              {product.isCustomLabelProduct && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-lab-800">
                  <div>
                    <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Recommended Label Width (in)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={product.customLabelConfig?.recommendedWidthInches || 1.5}
                      onChange={(e) =>
                        updateProduct((p) => ({
                          ...p,
                          customLabelConfig: {
                            ...p.customLabelConfig,
                            recommendedWidthInches: parseFloat(e.target.value) || 1.5,
                          },
                        }))
                      }
                      className="w-full text-xs font-mono px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Recommended Label Height (in)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={product.customLabelConfig?.recommendedHeightInches || 2.25}
                      onChange={(e) =>
                        updateProduct((p) => ({
                          ...p,
                          customLabelConfig: {
                            ...p.customLabelConfig,
                            recommendedHeightInches: parseFloat(e.target.value) || 2.25,
                          },
                        }))
                      }
                      className="w-full text-xs font-mono px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Cost per Square Inch (USD)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={product.customLabelConfig?.areaCostPerSqInch || 0.008}
                      onChange={(e) =>
                        updateProduct((p) => ({
                          ...p,
                          customLabelConfig: {
                            ...p.customLabelConfig,
                            areaCostPerSqInch: parseFloat(e.target.value) || 0.008,
                          },
                        }))
                      }
                      className="w-full text-xs font-mono px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Price per Square Inch (USD)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={product.customLabelConfig?.areaPricePerSqInch || 0.024}
                      onChange={(e) =>
                        updateProduct((p) => ({
                          ...p,
                          customLabelConfig: {
                            ...p.customLabelConfig,
                            areaPricePerSqInch: parseFloat(e.target.value) || 0.024,
                          },
                        }))
                      }
                      className="w-full text-xs font-mono px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-amber-400 font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 9: RECOMMENDATIONS */}
          {activeTab === "recommendations" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-1">
                  Cross-Sell & Product Recommendations
                </h2>
                <p className="text-xs text-lab-400">
                  Select related oils, bases, roll-ons, and discovery kits shown to customers in cart and product pages.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs uppercase font-bold text-lab-400">Related Products</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-2 border border-lab-800 rounded-xl bg-lab-950">
                  {allProducts.map((p) => {
                    const isSelected = (product.relatedProducts || []).includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                            : "bg-lab-900/30 border-lab-800 text-lab-400 hover:text-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const cur = product.relatedProducts || [];
                            const updated = e.target.checked ? [...cur, p.id] : cur.filter((id) => id !== p.id);
                            updateProduct((prod) => ({ ...prod, relatedProducts: updated }));
                          }}
                          className="w-4 h-4 rounded text-amber-500 bg-lab-900"
                        />
                        <div className="text-xs truncate">
                          <div className="font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-lab-500 font-mono">${(p.basePrice || 0).toFixed(2)}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 10: SEO */}
          {activeTab === "seo" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    value={product.seo?.metaTitle || ""}
                    onChange={(e) =>
                      updateProduct((p) => ({
                        ...p,
                        seo: { ...p.seo, metaTitle: e.target.value },
                      }))
                    }
                    placeholder={`${product.name} | SCENTLAB Perfumery`}
                    className="w-full text-xs px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Meta Description</label>
                  <textarea
                    rows={3}
                    value={product.seo?.metaDescription || ""}
                    onChange={(e) =>
                      updateProduct((p) => ({
                        ...p,
                        seo: { ...p.seo, metaDescription: e.target.value },
                      }))
                    }
                    placeholder="Search engine summary description..."
                    className="w-full text-xs px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Canonical URL</label>
                  <input
                    type="url"
                    value={product.seo?.canonicalUrl || ""}
                    onChange={(e) =>
                      updateProduct((p) => ({
                        ...p,
                        seo: { ...p.seo, canonicalUrl: e.target.value },
                      }))
                    }
                    placeholder="https://scentlab.com/products/..."
                    className="w-full text-xs font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 11: ADVANCED */}
          {activeTab === "advanced" && (
            <div className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Internal Admin Notes</label>
                <textarea
                  rows={4}
                  value={product.internalNotes || ""}
                  onChange={(e) => updateProduct((p) => ({ ...p, internalNotes: e.target.value }))}
                  placeholder="Private administrative notes, supplier batch numbers, or handling tips..."
                  className="w-full text-xs px-4 py-3 bg-lab-950 border border-lab-800 rounded-xl text-white"
                />
              </div>

              <div className="p-4 bg-lab-950 border border-lab-800 rounded-xl grid grid-cols-2 gap-4 text-xs font-mono text-lab-400">
                <div>
                  <span className="text-[10px] uppercase font-bold text-lab-500 block">Created At</span>
                  <span>{new Date(product.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-lab-500 block">Last Updated</span>
                  <span>{new Date(product.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Sticky Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-lab-950/95 backdrop-blur-md border-t border-lab-800 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="text-xs text-lab-400">
                Editing: <span className="font-bold text-white">{product.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/products"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-lab-400 hover:text-white bg-lab-900 border border-lab-800"
                >
                  Back to List
                </Link>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Product"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isStockModalOpen && (
        <StockAdjustmentModal
          productId={product.id}
          productName={product.name}
          currentStock={product.inventory?.quantityInStock ?? 0}
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          onSuccess={(newCount) => {
            updateProduct((p) => ({
              ...p,
              inventory: {
                ...p.inventory,
                quantityInStock: newCount,
                availableQuantity: newCount - (p.inventory.reservedQuantity || 0),
                status: newCount > 10 ? "in_stock" : newCount > 0 ? "low_stock" : "out_of_stock",
              },
            }));
            // Refresh ledger
            inventoryRepository.getTransactions(product.id).then(setInventoryTransactions);
          }}
        />
      )}

      {/* Storefront Preview Modal */}
      {isPreviewOpen && (
        <ProductPreviewModal
          product={product}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </AdminGuard>
  );
}
