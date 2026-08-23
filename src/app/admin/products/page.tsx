"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Copy,
  Archive,
  Trash2,
  Eye,
  ExternalLink,
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle2,
  Package,
  Sparkles,
  Layers,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import AdminGuard from "@/components/auth/AdminGuard";
import ProductPreviewModal from "@/components/admin/ProductPreviewModal";
import { Product, ProductStatus, ProductType } from "@/types/product";
import { productService } from "@/lib/firestore/products";
import { categoryService } from "@/lib/firestore/categories";
import { Category } from "@/types/category";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | "all">("all");
  const [selectedType, setSelectedType] = useState<ProductType | "all">("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState<boolean | undefined>(undefined);
  const [filterCustomLabel, setFilterCustomLabel] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState("newest");

  // Modals & Action feedback
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [productList, catList] = await Promise.all([
        productService.getAdminProducts(
          {
            query: searchQuery,
            category: selectedCategory,
            status: selectedStatus,
            productType: selectedType,
            stockStatus: selectedStockStatus,
            featured: filterFeatured,
            isCustomLabel: filterCustomLabel,
          },
          sortBy
        ),
        categoryService.getCategories(),
      ]);
      setProducts(productList);
      setCategories(catList);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to load products." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedType,
    selectedStockStatus,
    filterFeatured,
    filterCustomLabel,
    sortBy,
  ]);

  // KPI Metrics Calculation
  const totalProducts = products.length;
  const activeCount = products.filter((p) => p.status === "active").length;
  const draftCount = products.filter((p) => p.status === "draft").length;
  const archivedCount = products.filter((p) => p.status === "archived").length;
  const missingImagesCount = products.filter(
    (p) => !p.media || p.media.length === 0 || !p.primaryImageUrl
  ).length;
  const lowStockCount = products.filter((p) => p.inventory?.status === "low_stock").length;
  const outOfStockCount = products.filter((p) => p.inventory?.status === "out_of_stock").length;
  const customLabelCount = products.filter((p) => p.isCustomLabelProduct || p.customizable).length;

  // Actions
  const handleDuplicate = async (id: string) => {
    setActionLoadingId(id);
    setFeedbackMsg(null);
    try {
      const result = await productService.duplicateProduct(id);
      if (result.success && result.newProduct) {
        setFeedbackMsg({
          type: "success",
          text: `Product duplicated successfully as '${result.newProduct.name}' (Draft).`,
        });
        await fetchProducts();
        router.push(`/admin/products/${result.newProduct.id}/edit`);
      } else {
        setFeedbackMsg({ type: "error", text: result.error || "Failed to duplicate product." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this product? It will be hidden from the public catalog.")) {
      return;
    }
    setActionLoadingId(id);
    setFeedbackMsg(null);
    try {
      const result = await productService.archiveProduct(id);
      if (result.success) {
        setFeedbackMsg({ type: "success", text: "Product archived successfully." });
        await fetchProducts();
      } else {
        setFeedbackMsg({ type: "error", text: result.error || "Failed to archive product." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete '${name}'? This action cannot be undone if no orders/transactions are attached.`
      )
    ) {
      return;
    }
    setActionLoadingId(id);
    setFeedbackMsg(null);
    try {
      const result = await productService.deleteProduct(id);
      if (result.success) {
        setFeedbackMsg({ type: "success", text: `Product '${name}' permanently deleted.` });
        await fetchProducts();
      } else {
        setFeedbackMsg({
          type: "error",
          text: result.error || "Failed to delete product.",
        });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-lab-950 text-white p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header & Quick Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-lab-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase mb-1">
                <Package className="w-4 h-4" /> Catalog Master Control
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Product Management
              </h1>
              <p className="text-xs text-lab-400 mt-1">
                Create, edit, duplicate, archive, and manage live Firestore catalog specifications and B2 media.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add Product
              </Link>
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                feedbackMsg.type === "success"
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  : "bg-red-950/40 border-red-800 text-red-300"
              }`}
            >
              <span>{feedbackMsg.text}</span>
              <button
                type="button"
                onClick={() => setFeedbackMsg(null)}
                className="text-white hover:underline text-[10px] uppercase font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="p-3.5 bg-lab-900/60 border border-lab-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-lab-500">Total</span>
              <div className="text-xl font-black font-mono text-white mt-0.5">{totalProducts}</div>
            </div>
            <div className="p-3.5 bg-lab-900/60 border border-lab-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-500">Active</span>
              <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">{activeCount}</div>
            </div>
            <div className="p-3.5 bg-lab-900/60 border border-lab-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-500">Draft</span>
              <div className="text-xl font-black font-mono text-amber-400 mt-0.5">{draftCount}</div>
            </div>
            <div className="p-3.5 bg-lab-900/60 border border-lab-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-lab-500">Archived</span>
              <div className="text-xl font-black font-mono text-lab-400 mt-0.5">{archivedCount}</div>
            </div>
            <div className="p-3.5 bg-lab-900/60 border border-lab-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-orange-400">No Image</span>
              <div className="text-xl font-black font-mono text-orange-400 mt-0.5">{missingImagesCount}</div>
            </div>
            <div className="p-3.5 bg-lab-900/60 border border-lab-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-400">Low Stock</span>
              <div className="text-xl font-black font-mono text-amber-400 mt-0.5">{lowStockCount}</div>
            </div>
            <div className="p-3.5 bg-lab-900/60 border border-lab-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-red-400">Out of Stock</span>
              <div className="text-xl font-black font-mono text-red-400 mt-0.5">{outOfStockCount}</div>
            </div>
            <div className="p-3.5 bg-lab-900/60 border border-lab-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-purple-400">Custom Label</span>
              <div className="text-xl font-black font-mono text-purple-400 mt-0.5">{customLabelCount}</div>
            </div>
          </div>

          {/* Search & Multi-Filters Toolbar */}
          <div className="p-5 bg-lab-900/40 border border-lab-800 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              
              {/* Search Bar */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-lab-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, SKU, slug, or supplier..."
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white placeholder:text-lab-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active (In Store)</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="name_asc">Sort: Name (A-Z)</option>
                  <option value="name_desc">Sort: Name (Z-A)</option>
                  <option value="price_asc">Sort: Price (Low-High)</option>
                  <option value="price_desc">Sort: Price (High-Low)</option>
                  <option value="stock_asc">Sort: Stock (Low-High)</option>
                  <option value="stock_desc">Sort: Stock (High-Low)</option>
                </select>
              </div>
            </div>

            {/* Secondary Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-lab-800/60 text-xs">
              <span className="text-[11px] text-lab-500 uppercase font-bold flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filters:
              </span>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-[11px] px-2.5 py-1 bg-lab-950 border border-lab-800 rounded-lg text-lab-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.slug} value={cat.slug || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                className="text-[11px] px-2.5 py-1 bg-lab-950 border border-lab-800 rounded-lg text-lab-300 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Stock Levels</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock Warning</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>

              {/* Featured Toggle */}
              <button
                type="button"
                onClick={() => setFilterFeatured(filterFeatured === true ? undefined : true)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  filterFeatured === true
                    ? "bg-purple-500/20 border-purple-500 text-purple-300"
                    : "bg-lab-950 border-lab-800 text-lab-400 hover:text-white"
                }`}
              >
                ★ Featured Only
              </button>

              {/* Custom Label Toggle */}
              <button
                type="button"
                onClick={() => setFilterCustomLabel(filterCustomLabel === true ? undefined : true)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  filterCustomLabel === true
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-lab-950 border-lab-800 text-lab-400 hover:text-white"
                }`}
              >
                ✨ Custom Label Only
              </button>

              {(searchQuery ||
                selectedCategory !== "all" ||
                selectedStatus !== "all" ||
                selectedStockStatus !== "all" ||
                filterFeatured !== undefined ||
                filterCustomLabel !== undefined) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                    setSelectedStockStatus("all");
                    setFilterFeatured(undefined);
                    setFilterCustomLabel(undefined);
                  }}
                  className="text-[11px] text-amber-400 hover:underline ml-auto font-semibold"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Products Master Table */}
          <div className="bg-lab-900/30 border border-lab-800 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="py-20 text-center text-xs text-lab-400">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Loading Firestore catalog specifications...
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-xs text-lab-400">
                <Package className="w-10 h-10 text-lab-600 mx-auto mb-3" />
                <p className="text-base font-bold text-white mb-1">No Products Found</p>
                <p>Try adjusting your search criteria or add a new product to the catalog.</p>
                <Link
                  href="/admin/products/new"
                  className="inline-block mt-4 px-4 py-2 bg-amber-500 text-black font-bold rounded-xl text-xs"
                >
                  + Add First Product
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-lab-900/80 text-lab-400 text-[10px] uppercase tracking-wider border-b border-lab-800">
                    <tr>
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">SKU / Slug</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 text-right">Price</th>
                      <th className="py-3.5 px-4 text-right">Stock</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Completeness</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lab-800/60">
                    {products.map((product) => {
                      const image =
                        product.primaryImageUrl ||
                        (product.media && (product.media as any[])[0]?.url) ||
                        (product.images && product.images[0]?.url);
                      const completeness = product.completeness || { score: 80, missingFields: [] };
                      const isActionLoading = actionLoadingId === product.id;

                      return (
                        <tr key={product.id} className="hover:bg-lab-900/50 transition-colors group">
                          
                          {/* Image & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-black/40 border border-lab-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                                {image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={image} alt={product.name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="text-[9px] text-orange-400 text-center font-bold px-1 uppercase">
                                    No Pic
                                  </div>
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <div className="font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                                  <Link href={`/admin/products/${product.id}/edit`}>{product.name}</Link>
                                  {product.featured && (
                                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/30">
                                      ★
                                    </span>
                                  )}
                                  {product.isCustomLabelProduct && (
                                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-lab-500 line-clamp-1">
                                  {product.shortDescription || "No short description provided"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* SKU / Slug */}
                          <td className="py-3 px-4 font-mono">
                            <div className="text-white font-bold">{product.sku}</div>
                            <div className="text-[10px] text-lab-500 truncate max-w-[120px]">{product.slug}</div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="text-lab-300 font-medium capitalize">
                              {product.categoryName || product.category || "General"}
                            </span>
                            {product.productType && (
                              <div className="text-[10px] text-lab-500 uppercase">{product.productType}</div>
                            )}
                          </td>

                          {/* Price / Margin */}
                          <td className="py-3 px-4 text-right font-mono">
                            <div className="font-bold text-amber-400">${(product.basePrice || 0).toFixed(2)}</div>
                            {product.cost !== undefined && product.cost > 0 && (
                              <div className="text-[10px] text-lab-500">
                                Cost: ${product.cost.toFixed(2)}
                              </div>
                            )}
                          </td>

                          {/* Stock Status */}
                          <td className="py-3 px-4 text-right font-mono">
                            <div
                              className={`font-bold ${
                                product.inventory?.status === "out_of_stock"
                                  ? "text-red-400"
                                  : product.inventory?.status === "low_stock"
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              {product.inventory?.quantityInStock ?? 0}
                            </div>
                            <div className="text-[10px] text-lab-500 capitalize">
                              {product.inventory?.status?.replace("_", " ") || "In Stock"}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                product.status === "active"
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                  : product.status === "draft"
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                  : "bg-lab-800/40 border-lab-700 text-lab-400"
                              }`}
                            >
                              {product.status}
                            </span>
                          </td>

                          {/* Completeness Bar */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-lab-300">
                                {completeness.score}%
                              </div>
                              <div className="w-14 h-1.5 bg-lab-800 rounded-full overflow-hidden mt-1">
                                <div
                                  className={`h-full ${
                                    completeness.score >= 85
                                      ? "bg-emerald-500"
                                      : completeness.score >= 50
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${completeness.score}%` }}
                                />
                              </div>
                              {completeness.missingFields.length > 0 && (
                                <span
                                  className="text-[9px] text-orange-400 hover:underline mt-0.5 cursor-help"
                                  title={`Missing: ${completeness.missingFields.join(", ")}`}
                                >
                                  {completeness.missingFields.length} missing
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Row Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Preview button */}
                              <button
                                type="button"
                                onClick={() => setPreviewProduct(product)}
                                className="p-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-white hover:border-lab-700"
                                title="Customer Store Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="p-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-amber-400 hover:border-amber-500/40"
                                title="Edit Product"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Link>

                              {/* Duplicate */}
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => handleDuplicate(product.id)}
                                className="p-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-blue-400 hover:border-blue-500/40 disabled:opacity-30"
                                title="Duplicate Product Specification"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* Archive */}
                              {product.status !== "archived" && (
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleArchive(product.id)}
                                  className="p-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-amber-400 hover:border-amber-500/40 disabled:opacity-30"
                                  title="Archive Product"
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => handleDelete(product.id, product.name)}
                                className="p-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-red-400 hover:border-red-500/40 disabled:opacity-30"
                                title="Delete (If no orders attached)"
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
            )}
          </div>

        </div>
      </div>

      {/* Storefront Preview Modal */}
      {previewProduct && (
        <ProductPreviewModal
          product={previewProduct}
          isOpen={Boolean(previewProduct)}
          onClose={() => setPreviewProduct(null)}
        />
      )}
    </AdminGuard>
  );
}
