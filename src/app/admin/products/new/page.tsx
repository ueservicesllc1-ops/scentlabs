"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Sparkles, Check, AlertCircle } from "lucide-react";
import AdminGuard from "@/components/auth/AdminGuard";
import { productService, generateSlug } from "@/lib/firestore/products";
import { categoryService } from "@/lib/firestore/categories";
import { Category } from "@/types/category";
import { Product, ProductType, ProductStatus } from "@/types/product";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productType, setProductType] = useState<ProductType>("physical");
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [cost, setCost] = useState<number | "">("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [initialStock, setInitialStock] = useState<number>(50);
  const [isCustomLabelProduct, setIsCustomLabelProduct] = useState(false);
  const [status, setStatus] = useState<ProductStatus>("draft");

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].slug || cats[0].id);
    });
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(val));
    }
    if (!sku) {
      const generated = val
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .substring(0, 6);
      if (generated) setSku(`SKU-${generated}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Product name is required.");
      return;
    }
    if (!sku.trim()) {
      setErrorMsg("Product SKU is required.");
      return;
    }

    const priceNum = typeof basePrice === "number" ? basePrice : parseFloat(basePrice as any) || 0;
    const costNum = typeof cost === "number" ? cost : parseFloat(cost as any) || 0;

    setIsSubmitting(true);

    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const selectedCat = categories.find((c) => c.slug === categoryId || c.id === categoryId);

    const productData: Product = {
      id: newId,
      name: name.trim(),
      slug: slug ? generateSlug(slug) : generateSlug(name),
      sku: sku.trim().toUpperCase(),
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      category: categoryId as any,
      categoryId,
      categoryName: selectedCat?.name || categoryId,
      productType,
      status,
      currency: "USD",
      basePrice: priceNum,
      cost: costNum,
      costData: {
        supplierCost: costNum,
        unitCost: costNum,
        totalUnitCost: costNum,
      },
      tags: [],
      attributes: {},
      media: [],
      images: [],
      hasVariants: false,
      isCustomLabelProduct,
      customizable: isCustomLabelProduct,
      inventory: {
        quantityInStock: initialStock,
        reservedQuantity: 0,
        availableQuantity: initialStock,
        lowStockThreshold: 10,
        reorderPoint: 25,
        location: "main_storage",
        status: initialStock > 10 ? "in_stock" : initialStock > 0 ? "low_stock" : "out_of_stock",
      },
      shipping: {
        weight: 8,
        weightUnit: "oz",
        length: 6,
        width: 4,
        height: 4,
        dimensionUnit: "in",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const result = await productService.saveProduct(productData);
      if (!result.success) {
        throw new Error(result.error || "Failed to create product.");
      }

      // Route straight to the comprehensive editor
      router.push(`/admin/products/${newId}/edit`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create product.");
      setIsSubmitting(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-lab-950 text-white p-6 md:p-10">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Back & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="p-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white hover:border-lab-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Product Catalog
              </span>
              <h1 className="text-2xl font-black text-white">Create New Product</h1>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-red-950/40 border border-red-900 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-lab-900/40 border border-lab-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
            
            {/* Step 1: Basic Identity */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-lab-800 pb-2">
                1. Basic Information
              </h2>

              <div>
                <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. 10 ml Amber Glass Roll-On Bottle"
                  className="w-full text-sm px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white placeholder:text-lab-600 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">
                    SKU (Unique Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. B0GVYLZZ95 or BTL-10ML-AMB"
                    className="w-full text-xs font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white placeholder:text-lab-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="10-ml-amber-glass-roll-on-bottle"
                    className="w-full text-xs font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white placeholder:text-lab-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
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
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">
                    Product Type
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="physical">Physical Product</option>
                    <option value="custom">Custom Product (Custom Label)</option>
                    <option value="bulk">Bulk Repackaged Oil</option>
                    <option value="packaging">Packaging Material</option>
                    <option value="component">Component / Raw Material</option>
                    <option value="service">Service / Formulation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Pricing & Stock */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-lab-800 pb-2">
                2. Initial Pricing & Inventory
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">
                    Retail Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-full text-sm font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">
                    Cost (Internal USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value === "" ? "" : parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="w-full text-sm font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-lab-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={initialStock}
                    onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
                    className="w-full text-sm font-mono px-4 py-2.5 bg-lab-950 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between p-4 bg-lab-950 border border-lab-800 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-white">Initial Catalog Status</div>
                  <div className="text-[11px] text-lab-400">
                    Draft mode keeps the product private until images and volume tiers are configured.
                  </div>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="text-xs px-3 py-1.5 bg-lab-900 border border-lab-800 rounded-lg text-white font-bold focus:border-amber-500 focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active (Immediate Storefront)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Custom Label Checkbox */}
              <label className="flex items-center gap-3 p-4 bg-lab-950 border border-lab-800 rounded-xl cursor-pointer hover:border-lab-700">
                <input
                  type="checkbox"
                  checked={isCustomLabelProduct}
                  onChange={(e) => setIsCustomLabelProduct(e.target.checked)}
                  className="w-4 h-4 rounded border-lab-700 text-amber-500 focus:ring-amber-500 bg-lab-900"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Enable Custom Label Configuration
                  </div>
                  <div className="text-[11px] text-lab-400">
                    Allows customers to upload artwork, select label materials, and computes square-inch yield.
                  </div>
                </div>
              </label>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-lab-800 flex items-center justify-between">
              <Link
                href="/admin/products"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-lab-400 hover:text-white bg-lab-950 border border-lab-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? "Creating..." : "Create & Open 11-Tab Editor →"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AdminGuard>
  );
}
