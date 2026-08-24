"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INITIAL_PRODUCTS } from "@/data/products";
import { Product, ProductPackage } from "@/types";
import { productService, generateSlug } from "@/lib/firestore/products";
import { ALL_PERFUME_HOUSES, getEnrichedPerfumeData, searchPerfumePresets } from "@/data/perfume-catalog-database";
import { ProductMediaViewer } from "@/components/ui/ProductMediaViewer";
import { useCart } from "@/context/CartContext";
import { 
  ArrowLeft, 
  Check, 
  ShoppingBag
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [added, setAdded] = useState(false);
  const [packageCount, setPackageCount] = useState<number>(1);
  const [selectedPackage, setSelectedPackage] = useState<ProductPackage | null>(null);

  const { addItem } = useCart();

  useEffect(() => {
    async function loadProduct() {
      const slug = params.slug;

      let found: Product | null = null;
      try {
        found = await productService.getProductBySlug(slug);
      } catch (err) {}

      if (!found) {
        found = INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
      }

      // Fallback aliases for legacy URLs
      if (!found) {
        if (slug === "small-tuck-top-box-10ml" || slug === "custom-perfume-boxes") {
          found = INITIAL_PRODUCTS.find((p) => p.id === "prod_box_10ml") || null;
        } else if (slug === "large-folding-box-30ml-50ml") {
          found = INITIAL_PRODUCTS.find((p) => p.id === "prod_box_30ml") || null;
        } else if (slug.includes("shrink-4x6")) {
          found = INITIAL_PRODUCTS.find((p) => p.id === "prod_shrink_4x6") || null;
        } else if (slug.includes("shrink-6x6")) {
          found = INITIAL_PRODUCTS.find((p) => p.id === "prod_shrink_6x6") || null;
        } else if (slug.includes("shrink-6x8") || slug.includes("shrink")) {
          found = INITIAL_PRODUCTS.find((p) => p.id === "prod_shrink_6x8") || null;
        } else if (slug.includes("security") || slug.includes("sticker")) {
          found = INITIAL_PRODUCTS.find((p) => p.id === "prod_security_stickers") || null;
        } else if (slug.includes("tag")) {
          found = INITIAL_PRODUCTS.find((p) => p.id === "prod_tags_cord") || null;
        }
      }

      if (found) {
        // Enrich existing perfume with Master Super Catalog metadata
        const enrich = getEnrichedPerfumeData(found.name, found.brand);
        if (enrich) {
          found = {
            ...found,
            brand: found.brand || enrich.brand,
            shortDescription: found.shortDescription && !found.shortDescription.startsWith("Lattafa") && !found.shortDescription.includes("100 ml") 
              ? found.shortDescription 
              : (enrich.shortDescription || found.shortDescription),
            description: (found.description && found.description.length > 50 && !found.description.includes("prestigiosa casa"))
              ? found.description 
              : (enrich.description || found.description),
            inspiredBy: found.inspiredBy || enrich.inspiredBy,
            originalBrand: found.originalBrand || enrich.originalBrand,
            relationshipType: found.relationshipType || enrich.relationshipType,
            estimatedSimilarity: found.estimatedSimilarity || enrich.estimatedSimilarity,
            isOneToOne: found.isOneToOne || enrich.isOneToOne,
            notes: found.notes || enrich.notes,
            upc: found.upc || enrich.upc,
            barcode: found.barcode || enrich.barcode,
            attributes: {
              ...found.attributes,
              ...(found.attributes?.concentration || enrich.concentration ? { concentration: found.attributes?.concentration || enrich.concentration } : {}),
              ...(found.attributes?.gender || enrich.gender ? { gender: found.attributes?.gender || enrich.gender } : {}),
              ...(found.attributes?.measure || enrich.measure ? { measure: found.attributes?.measure || enrich.measure } : {}),
            } as Record<string, string | number>
          };
        }

        setProduct(found);

        const defaultPkg = (found.packageOptions && found.packageOptions[0]) || {
          id: "pkg_default",
          name: (found.attributes?.measure || "1 Unit").toString(),
          quantity: 1,
          price: found.basePrice || found.price || 39.99,
          unitPrice: found.basePrice || found.price || 39.99,
          isDefault: true,
        };
        setSelectedPackage(defaultPkg);

        // Fetch ONLY real products that actually exist in the store inventory
        try {
          const allProds = await productService.getAllProducts();
          const targetBrand = (found.brand || "").toLowerCase().trim();
          const targetCat = (found.category || "").toLowerCase().trim();

          const storeProducts = allProds.filter((p) => p.id !== found?.id && p.slug !== found?.slug);

          // 1. Same Brand products in the store
          const sameBrand = targetBrand 
            ? storeProducts.filter((p) => (p.brand || "").toLowerCase().trim() === targetBrand)
            : [];

          // 2. Same Category products in the store
          const sameCat = storeProducts.filter(
            (p) => (p.category || "").toLowerCase().trim() === targetCat && !sameBrand.some((sb) => sb.id === p.id)
          );

          // 3. Other store products
          const others = storeProducts.filter(
            (p) => !sameBrand.some((sb) => sb.id === p.id) && !sameCat.some((sc) => sc.id === p.id)
          );

          const finalRelated = [...sameBrand, ...sameCat, ...others].slice(0, 4);
          setRelatedProducts(finalRelated);
        } catch (rErr) {
          setRelatedProducts([]);
        }
      } else {
        setProduct(null);
      }
      setLoading(false);
    }

    loadProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-white space-y-4 font-sans">
        <div className="w-9 h-9 rounded-full border-3 border-gray-900 border-t-transparent animate-spin" />
        <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Cargando detalles del producto...</span>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const activePackageOptions: ProductPackage[] = product.packageOptions || [];
  const activeSku = product.sku;
  const currentPrice = selectedPackage?.price || product.basePrice || product.price || 0;
  const currentTotal = currentPrice * packageCount;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, selectedPackage || {
      id: "pkg_default",
      name: "1 Unit",
      quantity: 1,
      price: product.basePrice,
      unitPrice: product.basePrice,
      isDefault: true
    }, packageCount);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isPerfume = product.category === "perfumes" || product.category === "finished_perfumes" || product.productType === "finished_perfume" || product.brand;

  return (
    <div style={{ background: "white", minHeight: "100vh" }} className="font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 border-b border-gray-100 pb-3.5">
          <Link href={isPerfume ? "/perfumes" : "/shop"} className="hover:text-gray-900 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5 text-gray-700" /> {isPerfume ? "Catálogo de Perfumes" : "Catálogo Mayorista"}
          </Link>
          <span>/</span>
          {product.brand && (
            <>
              <Link href={`/perfumes?brand=${encodeURIComponent(product.brand)}`} className="text-gray-700 font-bold hover:text-black transition">
                {product.brand}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Product Image Gallery */}
          <div className="lg:col-span-5 flex flex-col items-center gap-3.5">
            <div className="w-full bg-[#FAFAFA] border border-gray-200 rounded-2xl p-6 flex items-center justify-center shadow-xs overflow-hidden h-[380px] sm:h-[420px]">
              {product.primaryImageUrl || product.media?.[activeImageIndex]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.media?.[activeImageIndex]?.url || product.primaryImageUrl}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <ProductMediaViewer
                  src=""
                  alt={product.name}
                  category={product.category}
                  sku={activeSku}
                  aspectRatio="square"
                />
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.media && product.media.length > 1 && (
              <div className="flex gap-2.5 justify-center w-full overflow-x-auto py-1">
                {product.media.map((med, idx) => (
                  <button
                    key={med.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 border rounded-xl p-1 bg-[#FAFAFA] transition flex items-center justify-center ${
                      activeImageIndex === idx ? "border-gray-900 ring-2 ring-gray-900/10" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={med.url} alt={med.altText || product.name} className="max-w-full max-h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Clear, Well-Proportioned Details & Action Box */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Header: Brand & SKU */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                {product.brand || product.categoryName || product.category}
              </span>
              <span className="font-mono text-xs text-gray-500 font-semibold">SKU: {activeSku}</span>
            </div>

            {/* Title & Short Description */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight leading-tight">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-sm text-gray-700 font-normal leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Specs Pills */}
            <div className="flex flex-wrap gap-2 pt-0.5">
              {product.attributes?.concentration && (
                <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">
                  {product.attributes.concentration}
                </span>
              )}
              {product.attributes?.gender && (
                <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-3 py-1 rounded-md">
                  {product.attributes.gender}
                </span>
              )}
              {product.attributes?.measure && (
                <span className="text-xs font-bold text-gray-900 bg-gray-100 border border-gray-200 px-3 py-1 rounded-md">
                  {product.attributes.measure}
                </span>
              )}
              {product.upc && (
                <span className="text-xs font-mono text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
                  UPC: {product.upc}
                </span>
              )}
            </div>

            {/* Inspiration (Dupe) Box - Clean & Balanced */}
            {product.inspiredBy && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Perfil de Inspiración
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 font-semibold block text-[11px] uppercase">Inspirado en:</span>
                    <strong className="text-gray-950 font-bold text-sm">{product.inspiredBy}</strong>
                  </div>
                  {product.originalBrand && (
                    <div>
                      <span className="text-gray-500 font-semibold block text-[11px] uppercase">Casa Original:</span>
                      <strong className="text-gray-900 font-bold">{product.originalBrand}</strong>
                    </div>
                  )}
                  {product.estimatedSimilarity && (
                    <div>
                      <span className="text-gray-500 font-semibold block text-[11px] uppercase">Similitud estimada:</span>
                      <strong className="text-gray-900 font-bold">{product.estimatedSimilarity}</strong>
                    </div>
                  )}
                  {product.isOneToOne && (
                    <div>
                      <span className="text-gray-500 font-semibold block text-[11px] uppercase">1 a 1:</span>
                      <strong className="text-gray-900 font-bold">{product.isOneToOne}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Olfactory Notes */}
            {product.notes && (
              <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-1 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Notas Olfativas:</span>
                <p className="text-gray-800 leading-relaxed font-normal">{product.notes}</p>
              </div>
            )}

            {/* Package Options (When applicable) */}
            {activePackageOptions.length > 0 && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-800 block">
                  Formato / Paquete:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {activePackageOptions.map((pkg) => {
                    const isSelected = selectedPackage?.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-2.5 text-left border rounded-xl transition flex items-center justify-between text-xs ${
                          isSelected
                            ? "border-gray-950 bg-gray-50 font-bold text-gray-950 ring-1 ring-gray-950"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <span>{pkg.name || `${pkg.quantity} Unidades`}</span>
                        <span className="font-mono text-xs font-bold text-gray-900">${pkg.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price & Buy Action Box */}
            <div className="p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">Precio Mayorista</span>
                  <span className="text-xs text-emerald-700 font-bold">En Stock para despacho</span>
                </div>
                <span className="text-3xl font-extrabold text-gray-950">${currentTotal.toFixed(2)}</span>
              </div>

              {/* Action Controls: Quantity + Add to Cart Button */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden h-11">
                  <button
                    type="button"
                    onClick={() => setPackageCount((c) => Math.max(1, c - 1))}
                    className="px-3.5 h-full text-gray-600 hover:bg-gray-100 font-bold text-base transition"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-900 font-mono">{packageCount}</span>
                  <button
                    type="button"
                    onClick={() => setPackageCount((c) => c + 1)}
                    className="px-3.5 h-full text-gray-600 hover:bg-gray-100 font-bold text-base transition"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 h-11 px-5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs ${
                    added
                      ? "bg-emerald-700 text-white"
                      : "bg-gray-950 hover:bg-gray-800 text-white active:scale-98"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> ¡Agregado al Carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Agregar al Carrito (${currentTotal.toFixed(2)})
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200/60 font-medium">
                <span>Garantía de Originalidad 100%</span>
                <span>Despacho Rápido y Seguro</span>
              </div>
            </div>

          </div>

        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="space-y-5 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Recomendaciones
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-950">Productos Relacionados</h2>
              </div>
              <Link href={isPerfume ? "/perfumes" : "/shop"} className="text-xs sm:text-sm font-bold text-gray-900 hover:underline">
                Ver catálogo completo →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.slug}`}
                  className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-900 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="h-36 bg-[#FAFAFA] rounded-xl flex items-center justify-center p-3 overflow-hidden">
                      {rel.primaryImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rel.primaryImageUrl}
                          alt={rel.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-xs font-bold uppercase text-gray-400">{rel.brand || "PERFUME"}</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                        {rel.brand || rel.categoryName}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate group-hover:text-black">
                        {rel.name}
                      </h3>
                      {rel.inspiredBy && (
                        <span className="text-xs text-gray-500 block truncate mt-0.5">
                          Insp: {rel.inspiredBy}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-950">${(rel.basePrice || rel.price || 39.99).toFixed(2)}</span>
                    <span className="text-xs font-bold text-gray-900 group-hover:translate-x-0.5 transition-transform">Ver →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
