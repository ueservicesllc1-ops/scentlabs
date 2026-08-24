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
import { AdminGuard } from "@/components/auth/AdminGuard";
import ProductPreviewModal from "@/components/admin/ProductPreviewModal";
import ProductQuickEditModal from "@/components/admin/ProductQuickEditModal";
import { AddProductModal } from "@/components/admin/AddProductModal";
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
  const [filterMissingImages, setFilterMissingImages] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState("newest");

  // Modals & Action feedback
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    (p) => !p.primaryImageUrl && (!p.media || p.media.length === 0 || !(p.media as any)[0]?.url)
  ).length;
  const lowStockCount = products.filter(
    (p) => p.inventory?.status === "low_stock" || ((p.inventory?.availableQuantity ?? 0) > 0 && (p.inventory?.availableQuantity ?? 0) <= (p.inventory?.lowStockThreshold ?? 10))
  ).length;
  const outOfStockCount = products.filter(
    (p) => p.inventory?.status === "out_of_stock" || (p.inventory?.availableQuantity ?? 0) <= 0
  ).length;
  const customLabelCount = products.filter((p) => p.isCustomLabelProduct || p.customizable).length;

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
        `¿Estás seguro de que deseas eliminar permanentemente el producto '${name}'? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setActionLoadingId(id);
    setFeedbackMsg(null);
    try {
      const result = await productService.deleteProduct(id, true);
      if (result.success) {
        setFeedbackMsg({ type: "success", text: `Producto '${name}' eliminado permanentemente del sistema.` });
        await fetchProducts();
      } else {
        setFeedbackMsg({
          type: "error",
          text: result.error || "No se pudo eliminar el producto.",
        });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const displayProducts = filterMissingImages
    ? products.filter((p) => !p.primaryImageUrl && (!p.media || p.media.length === 0 || !(p.media as any)[0]?.url))
    : products;
  const paginatedProducts = displayProducts.slice((currentPage - 1) * 50, currentPage * 50);

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER & QUICK ACTION ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <Package className="w-3 h-3 text-gray-600" /> Catalog Master Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Product Management
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Create, edit, duplicate, archive, and manage live Firestore catalog specifications and product media.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackMsg && (
          <div
            className={`p-3.5 rounded-lg border flex items-center justify-between text-xs font-semibold ${
              feedbackMsg.type === "success"
                ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-gray-600 hover:text-gray-900 text-[10px] uppercase font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ━━━━ KPI SUMMARY GRID ━━━━ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Total</span>
            <div className="text-xl font-bold font-mono text-gray-950 mt-0.5">{totalProducts}</div>
          </div>
          <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Active</span>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{activeCount}</div>
          </div>
          <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Draft</span>
            <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">{draftCount}</div>
          </div>
          <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Archived</span>
            <div className="text-xl font-bold font-mono text-gray-600 mt-0.5">{archivedCount}</div>
          </div>
          <button
            type="button"
            onClick={() => setFilterMissingImages(!filterMissingImages)}
            className={`p-3.5 rounded-xl border shadow-xs text-left w-full transition-all ${
              filterMissingImages
                ? "bg-orange-50 border-orange-400 ring-2 ring-orange-300"
                : "bg-white border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-orange-700 block">Sin Foto</span>
            <div className="text-xl font-bold font-mono text-orange-700 mt-0.5">{missingImagesCount}</div>
          </button>
          <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Low Stock</span>
            <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">{lowStockCount}</div>
          </div>
          <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-red-700 block">Out of Stock</span>
            <div className="text-xl font-bold font-mono text-red-700 mt-0.5">{outOfStockCount}</div>
          </div>
          <div className="p-3.5 bg-white border border-gray-200 rounded-xl shadow-xs">
            <span className="text-[10px] uppercase font-bold text-purple-700 block">Custom Label</span>
            <div className="text-xl font-bold font-mono text-purple-700 mt-0.5">{customLabelCount}</div>
          </div>
        </div>

        {/* ━━━━ SEARCH & FILTERS TOOLBAR ━━━━ */}
        <div className="p-4 sm:p-5 bg-white border border-gray-200 rounded-xl shadow-xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            
            {/* Search Bar */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, SKU, slug, or supplier..."
                className="w-full text-xs pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-[#2B5F4A] focus:outline-none focus:ring-1 focus:ring-[#2B5F4A]"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                aria-label="Filter by status"
                className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
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
                aria-label="Sort products by"
                className="w-full text-xs px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
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
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-[11px] text-gray-500 uppercase font-bold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="text-[11px] px-2.5 py-1 bg-white border border-gray-300 rounded-md text-gray-800 focus:border-[#2B5F4A] focus:outline-none"
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
              aria-label="Filter by stock status"
              className="text-[11px] px-2.5 py-1 bg-white border border-gray-300 rounded-md text-gray-800 focus:border-[#2B5F4A] focus:outline-none"
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
              className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition ${
                filterFeatured === true
                  ? "bg-purple-50 border-purple-300 text-purple-800 font-bold"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              ★ Featured Only
            </button>

            {/* Custom Label Toggle */}
            <button
              type="button"
              onClick={() => setFilterCustomLabel(filterCustomLabel === true ? undefined : true)}
              className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition ${
                filterCustomLabel === true
                  ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534] font-bold"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              ✨ Custom Label Only
            </button>

            {/* Missing Image Toggle */}
            <button
              type="button"
              onClick={() => setFilterMissingImages(!filterMissingImages)}
              className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition ${
                filterMissingImages
                  ? "bg-orange-50 border-orange-300 text-orange-800 font-bold"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              📷 Missing Images ({missingImagesCount})
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
                className="text-[11px] text-[#2B5F4A] hover:underline ml-auto font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ━━━━ VIEW TABS ━━━━ */}
        <div className="flex items-center gap-1 border-b border-gray-200 -mb-2">
          <button
            type="button"
            onClick={() => setFilterMissingImages(false)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              !filterMissingImages
                ? "border-[#2B5F4A] text-[#2B5F4A]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Todos los Productos
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-mono">
              {products.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMissingImages(true)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              filterMissingImages
                ? "border-orange-500 text-orange-700"
                : "border-transparent text-gray-500 hover:text-orange-600"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Sin Foto
            {missingImagesCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-mono font-bold">
                {missingImagesCount}
              </span>
            )}
          </button>
        </div>

        {/* ━━━━ PRODUCTS MASTER TABLE ━━━━ */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 text-center text-xs text-gray-500">
              <div className="w-8 h-8 border-2 border-[#2B5F4A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading Firestore catalog specifications...
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500">
              <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-900 mb-1">No Products Match Filters</p>
              <p>Try resetting filters or adjusting search criteria.</p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-wider border-b border-gray-200">
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
                  <tbody className="divide-y divide-gray-100">
                    {paginatedProducts.map((product) => {
                      const image =
                        product.primaryImageUrl ||
                        (product.media && (product.media as any[])[0]?.url) ||
                        (product.images && product.images[0]?.url);
                      const completeness = product.completeness || { score: 80, missingFields: [] };
                      const isActionLoading = actionLoadingId === product.id;

                      return (
                        <tr key={product.id} className="hover:bg-gray-50/80 transition">
                          
                          {/* Image & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                                {image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={image} alt={product.name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="text-[9px] text-gray-400 text-center font-bold px-1 uppercase">
                                    No Pic
                                  </div>
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <div className="font-semibold text-gray-950 flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setQuickEditProduct(product)}
                                    className="hover:underline text-left font-semibold text-gray-950"
                                  >
                                    {product.name}
                                  </button>
                                  {product.featured && (
                                    <span className="text-[9px] bg-purple-50 text-purple-800 px-1.5 py-0.2 rounded border border-purple-200 font-bold">
                                      ★
                                    </span>
                                  )}
                                  {product.isCustomLabelProduct && (
                                    <span className="text-[9px] bg-[#F6FAF8] text-[#2B5F4A] px-1.5 py-0.2 rounded border border-[#C5DDD3] font-bold">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-500 line-clamp-1">
                                  {product.shortDescription || "No short description provided"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* SKU / Slug */}
                          <td className="py-3 px-4 font-mono">
                            <div className="text-gray-950 font-semibold">{product.sku}</div>
                            <div className="text-[10px] text-gray-500 truncate max-w-[120px]">{product.slug}</div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="text-gray-800 font-medium capitalize">
                              {product.categoryName || product.category || "General"}
                            </span>
                            {product.productType && (
                              <div className="text-[10px] text-gray-500 uppercase">{product.productType}</div>
                            )}
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 text-right font-mono">
                            <div className="font-semibold text-gray-950">${(product.basePrice || 0).toFixed(2)}</div>
                            {product.cost !== undefined && product.cost > 0 && (
                              <div className="text-[10px] text-gray-500">
                                Cost: ${product.cost.toFixed(2)}
                              </div>
                            )}
                          </td>

                          {/* Stock Status */}
                          <td className="py-3 px-4 text-right font-mono">
                            <div
                              className={`font-semibold ${
                                product.inventory?.status === "out_of_stock"
                                  ? "text-red-700"
                                  : product.inventory?.status === "low_stock"
                                  ? "text-amber-700"
                                  : "text-[#166534]"
                              }`}
                            >
                              {product.inventory?.quantityInStock ?? 0}
                            </div>
                            <div className="text-[10px] text-gray-500 capitalize">
                              {product.inventory?.status?.replace("_", " ") || "In Stock"}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                product.status === "active"
                                  ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                                  : product.status === "draft"
                                  ? "bg-amber-50 border-amber-200 text-amber-800"
                                  : "bg-gray-100 border-gray-200 text-gray-700"
                              }`}
                            >
                              {product.status}
                            </span>
                          </td>

                          {/* Completeness Bar */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <div className="text-[11px] font-mono font-bold text-gray-700">
                                {completeness.score}%
                              </div>
                              <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                                <div
                                  className={`h-full ${
                                    completeness.score >= 85
                                      ? "bg-emerald-600"
                                      : completeness.score >= 50
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: `${completeness.score}%` }}
                                />
                              </div>
                              {completeness.missingFields.length > 0 && (
                                <span
                                  className="text-[9px] text-amber-700 hover:underline mt-0.5 cursor-help"
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
                                className="p-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                                title="Customer Store Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => setQuickEditProduct(product)}
                                className="p-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 hover:text-[#2B5F4A] hover:bg-gray-50"
                                title="Quick Edit Product"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Duplicate */}
                              <button
                                type="button"
                                disabled={isActionLoading}
                                onClick={() => handleDuplicate(product.id)}
                                className="p-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 hover:text-blue-700 hover:bg-gray-50 disabled:opacity-30"
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
                                  className="p-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 hover:text-amber-700 hover:bg-gray-50 disabled:opacity-30"
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
                                className="p-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 hover:text-red-700 hover:bg-gray-50 disabled:opacity-30"
                                title="Delete Product"
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

              {/* Pagination Controls */}
              {displayProducts.length > 50 && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 font-sans">
                  <div>
                    Showing {(currentPage - 1) * 50 + 1} - {Math.min(currentPage * 50, displayProducts.length)} of {displayProducts.length} products
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-800 disabled:opacity-40 hover:bg-gray-50"
                    >
                      ← Previous
                    </button>
                    <span className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 font-semibold">
                      Page {currentPage} of {Math.ceil(displayProducts.length / 50)}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= Math.ceil(displayProducts.length / 50)}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-800 disabled:opacity-40 hover:bg-gray-50"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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

      {/* Quick Edit Modal */}
      <ProductQuickEditModal
        isOpen={Boolean(quickEditProduct)}
        onClose={() => setQuickEditProduct(null)}
        product={quickEditProduct}
        onSaved={() => {
          fetchProducts();
        }}
      />

      {/* Add Product Modal with Category Routing */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={(newProd) => {
          setFeedbackMsg({ type: "success", text: `Producto '${newProd.name}' creado exitosamente en ${newProd.categoryName || newProd.category}.` });
          fetchProducts();
        }}
      />
    </AdminGuard>
  );
}
