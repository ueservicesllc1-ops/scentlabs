"use client";

import React, { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INITIAL_PRODUCTS, SHRINK_WRAP_VARIANTS } from "@/data/products";
import { ProductPackage, ProductVariant } from "@/types";
import { VolumePricingTable } from "@/components/product/VolumePricingTable";
import { CompleteYourProduct } from "@/components/product/CompleteYourProduct";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductMediaViewer } from "@/components/ui/ProductMediaViewer";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Check, 
  ShoppingBag,
  Info,
  Layers,
  Zap,
  Tag,
  AlertTriangle
} from "lucide-react";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const product = INITIAL_PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const { addItem } = useCart();
  
  // Variants handling
  const availableVariants = product.hasVariants
    ? SHRINK_WRAP_VARIANTS.filter((v) => v.productId === product.id)
    : [];

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    availableVariants.length > 0 ? availableVariants[0] : null
  );

  // Active package options based on selected variant or base product
  const activePackageOptions: ProductPackage[] = selectedVariant
    ? selectedVariant.packageOptions
    : product.packageOptions;

  const [selectedPackage, setSelectedPackage] = useState<ProductPackage>(
    activePackageOptions.find((p) => p.isDefault) || activePackageOptions[0]
  );
  const [packageCount, setPackageCount] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [added, setAdded] = useState(false);
  const [buyNowMsg, setBuyNowMsg] = useState(false);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setSelectedPackage(variant.packageOptions[0]);
  };

  const totalUnits = selectedPackage.quantity * packageCount;
  const totalPrice = selectedPackage.price * packageCount;

  const handleAddToCart = () => {
    addItem(product, selectedPackage, packageCount, {
      selectedVariant: selectedVariant ? { id: selectedVariant.id, name: selectedVariant.name, sku: selectedVariant.sku } : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    addItem(product, selectedPackage, packageCount, {
      selectedVariant: selectedVariant ? { id: selectedVariant.id, name: selectedVariant.name, sku: selectedVariant.sku } : undefined,
    });
    setBuyNowMsg(true);
    setTimeout(() => setBuyNowMsg(false), 3000);
  };

  // Complementary & Recommended products
  const complementaryProducts = INITIAL_PRODUCTS.filter((p) =>
    product.complementaryProductIds.includes(p.id)
  );
  const recommendedProducts = INITIAL_PRODUCTS.filter((p) =>
    product.recommendedProductIds.includes(p.id)
  );

  const activeSku = selectedVariant ? selectedVariant.sku : product.sku;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-mono">
      {/* Navigation Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-lab-400">
        <Link href="/shop" className="hover:text-white transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Catalog
        </Link>
        <span>/</span>
        <Link href={`/shop/${product.category}`} className="hover:text-white capitalize">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-amber-400 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Media Gallery (Backblaze B2 Specimen Viewer) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-lab-800 bg-lab-950 overflow-hidden shadow-2xl">
            <ProductMediaViewer
              src={product.media[activeImageIndex]?.url}
              alt={product.name}
              category={product.category}
              sku={activeSku}
              aspectRatio="square"
            />
          </div>

          {/* Thumbnails if multiple */}
          {product.media.length > 1 && (
            <div className="flex gap-2">
              {product.media.map((med, idx) => (
                <button
                  key={med.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg bg-lab-900 border overflow-hidden transition ${
                    activeImageIndex === idx ? "border-amber-500 ring-1 ring-amber-500" : "border-lab-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <ProductMediaViewer
                    src={med.url}
                    alt=""
                    category={product.category}
                    aspectRatio="square"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Technical Specifications Box */}
          <div className="rounded-xl border border-lab-800 bg-lab-900/30 p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              Technical Specifications & Fit
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded bg-lab-950 border border-lab-800/80">
                <span className="text-lab-500 block text-[10px] uppercase">SKU</span>
                <span className="text-white font-bold">{activeSku}</span>
              </div>
              <div className="p-2.5 rounded bg-lab-950 border border-lab-800/80">
                <span className="text-lab-500 block text-[10px] uppercase">Category</span>
                <span className="text-white capitalize">{product.category} ({product.subcategory})</span>
              </div>
              {Object.entries(product.attributes).map(([key, val]) => (
                <div key={key} className="p-2.5 rounded bg-lab-950 border border-lab-800/80">
                  <span className="text-lab-500 block text-[10px] uppercase">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-white font-medium">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Engine, Variant Selection & Order Flow */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                {product.category}
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock ({product.inventory.quantityInStock} units ready)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {product.name}
            </h1>

            <p className="text-xs text-lab-300 mt-2 leading-relaxed">
              {product.description}
            </p>

            {/* Alcohol shipping notice if applicable */}
            {product.attributes.hazardousMaterialNote && (
              <div className="mt-3 p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <span>{String(product.attributes.hazardousMaterialNote)}</span>
              </div>
            )}
          </div>

          {/* Variant Selector (if product has variants e.g. Heat Shrink Bags) */}
          {product.hasVariants && availableVariants.length > 0 && (
            <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/50 space-y-2.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Select Dimensions / Size:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleVariantChange(v)}
                    className={`px-3 py-2 text-xs rounded-lg border text-center transition ${
                      selectedVariant?.id === v.id
                        ? "bg-amber-500 text-lab-950 font-bold border-amber-400 shadow"
                        : "bg-lab-950 text-lab-300 border-lab-800 hover:border-lab-600 hover:text-white"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Pricing Highlight */}
          <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/60 flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-lab-400 uppercase block">Selected Tier Unit Price</span>
              <span className="text-2xl font-black text-amber-400">
                {formatUnitPrice(selectedPackage.unitPrice)}
                <span className="text-xs font-normal text-lab-400 ml-1">/{product.unit || "unit"}</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-lab-400 uppercase block">Pack Subtotal</span>
              <span className="text-xl font-black text-white">
                {formatCurrency(selectedPackage.price)}
              </span>
            </div>
          </div>

          {/* Interactive Fractional Volume Selector (BUY MORE, SAVE MORE) */}
          <VolumePricingTable
            packageOptions={activePackageOptions}
            selectedPackage={selectedPackage}
            onSelectPackage={setSelectedPackage}
            volumePricing={product.volumePricing}
            unit={product.unit || "unit"}
          />

          {/* Quantity of Packages Multiplier & CTAs */}
          <div className="p-5 rounded-xl border border-lab-800 bg-lab-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white uppercase block">
                  Batch Multiplier
                </label>
                <span className="text-[11px] text-lab-400">
                  {packageCount} pack(s) × {selectedPackage.quantity} = <strong className="text-white">{totalUnits} total {product.unit || "units"}</strong>
                </span>
              </div>

              {/* Number of packs stepper */}
              <div className="flex items-center border border-lab-700 rounded-lg bg-lab-950 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPackageCount(Math.max(1, packageCount - 1))}
                  className="px-3 py-2 text-lab-300 hover:text-white hover:bg-lab-800 transition"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-white text-sm">
                  {packageCount}
                </span>
                <button
                  type="button"
                  onClick={() => setPackageCount(packageCount + 1)}
                  className="px-3 py-2 text-lab-300 hover:text-white hover:bg-lab-800 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total and Add to Cart Action */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-[10px] uppercase text-lab-500">Order Batch Subtotal:</span>
                <span className="text-2xl font-black text-white">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`py-3.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                    added
                      ? "bg-emerald-500 text-lab-950"
                      : "bg-lab-800 hover:bg-lab-700 text-white border border-lab-700"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Batch
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Batch
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" /> Buy Now
                </button>
              </div>

              {buyNowMsg && (
                <div className="p-2 rounded bg-amber-950/60 border border-amber-500/40 text-center text-xs text-amber-300">
                  Item added. Proceed to <Link href="/checkout" className="underline font-bold">Checkout</Link>.
                </div>
              )}
            </div>
          </div>

          {/* Strategic COMPLETE YOUR PRODUCT / COMPLETE YOUR ROLL-ON Module */}
          <CompleteYourProduct
            currentProduct={product}
            selectedBottleQuantity={totalUnits}
          />
        </div>
      </div>

      {/* Cross-Sell: Complementary Supplies Section */}
      {complementaryProducts.length > 0 && (
        <section className="space-y-4 pt-10 border-t border-lab-800">
          <div>
            <span className="text-xs text-amber-400 uppercase tracking-widest font-bold">
              SYSTEM COMPATIBILITY
            </span>
            <h2 className="text-xl font-bold text-white uppercase mt-1">
              Complementary Supplies for this Product
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {complementaryProducts.map((comp) => (
              <ProductCard key={comp.id} product={comp} />
            ))}
          </div>
        </section>
      )}

      {/* You May Also Need Section */}
      {recommendedProducts.length > 0 && (
        <section className="space-y-4 pt-10 border-t border-lab-800">
          <div>
            <span className="text-xs text-lab-400 uppercase tracking-widest font-bold">
              RECOMMENDED FOR PRODUCTION
            </span>
            <h2 className="text-xl font-bold text-white uppercase mt-1">
              You May Also Need
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendedProducts.map((rec) => (
              <ProductCard key={rec.id} product={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
