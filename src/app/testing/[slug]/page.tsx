"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TestingProduct } from "@/types/testing";
import { testingRepository } from "@/lib/firestore/testing";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { ProductMediaViewer } from "@/components/ui/ProductMediaViewer";
import { 
  FlaskConical, 
  ShoppingBag, 
  Check, 
  ArrowLeft, 
  Layers, 
  Sparkles, 
  ShieldCheck,
  ArrowRight 
} from "lucide-react";

interface TestingPageProps {
  params: {
    slug: string;
  };
}

export default function TestingProductPage({ params }: TestingPageProps) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<TestingProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const found = await testingRepository.getTestingProductBySlug(params.slug);
      setProduct(found);
      setLoading(false);
    };

    fetchProduct();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-lab-400">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mr-3" />
        Loading testing supply specifications...
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const activePkg = product.packageOptions[selectedPkgIndex] || product.packageOptions[0];

  const handleAddToCart = () => {
    const cartProductProxy: any = {
      id: product.id,
      name: `${product.name} (${activePkg.quantity} ${product.unit}s)`,
      slug: product.slug,
      category: "testing",
      sku: `${product.sku}-${activePkg.quantity}`,
      basePrice: activePkg.price,
      media: [{ url: product.primaryImage, type: "image", isPrimary: true, altText: product.name }],
      packageOptions: product.packageOptions,
      pricingTiers: product.volumePricing || [],
    };

    addItem(cartProductProxy, activePkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-mono">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-lab-400">
        <Link href="/shop" className="hover:text-white transition">Shop</Link>
        <span>/</span>
        <Link href="/testing" className="hover:text-white transition">Testing Supplies</Link>
        <span>/</span>
        <span className="text-indigo-400 font-bold uppercase">{product.name}</span>
      </nav>

      {/* Main Product Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Media Viewer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-lab-950 border border-lab-800 shadow-2xl relative">
            <ProductMediaViewer
              src={product.primaryImage}
              alt={product.name}
              category="testing"
              sku={product.id}
              aspectRatio="square"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-lab-950/80 backdrop-blur-md border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider shadow">
                {product.subcategory}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Formulation Details, Tiers & Add to Cart */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2 border-b border-lab-800 pb-4">
            <div className="flex items-center gap-2 text-xs text-indigo-400 uppercase font-bold tracking-widest">
              <FlaskConical className="w-3.5 h-3.5" /> LABORATORY GRADE • TRIAL & EVALUATION
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              {product.name}
            </h1>
            {product.sampleSize && (
              <div className="text-xs text-lab-400">
                Specification: <span className="text-white font-bold">{product.sampleSize}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-lab-300 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Selector Matrix */}
          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase">Select Package Quantity</span>
              <span className="text-lab-400 text-[11px]">Direct Bulk Savings</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {product.packageOptions.map((pkg, idx) => {
                const isSelected = selectedPkgIndex === idx;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPkgIndex(idx)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10 text-white shadow-md shadow-indigo-500/10"
                        : "border-lab-800 bg-lab-950 text-lab-400 hover:border-lab-700 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-black uppercase text-white">
                      {pkg.quantity} {product.unit}s
                    </span>
                    <span className="text-sm font-bold text-amber-400 mt-1">
                      {formatCurrency(pkg.price)}
                    </span>
                    <span className="text-[10px] text-lab-500">
                      {formatUnitPrice(pkg.unitPrice)} / {product.unit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Pricing Tiers Table */}
          {product.volumePricing.length > 0 && (
            <div className="p-4 rounded-xl border border-lab-800 bg-lab-950 space-y-2 text-xs">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Volume Tier Matrix
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {product.volumePricing.map((tier, idx) => (
                  <div key={idx} className="p-2 rounded bg-lab-900/80 border border-lab-800 text-center">
                    <span className="text-[10px] text-lab-400 block">{tier.quantity}+ {product.unit}s</span>
                    <span className="text-xs font-bold text-white">{formatCurrency(tier.unitPrice)}/ea</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price & Add to Cart */}
          <div className="p-6 rounded-2xl border border-lab-700 bg-lab-950 space-y-4 shadow-2xl">
            <div className="flex justify-between items-baseline border-b border-lab-800 pb-3">
              <div>
                <span className="text-[10px] text-lab-500 uppercase block">Selected Pack Total</span>
                <span className="text-3xl font-black text-amber-400">
                  {formatCurrency(activePkg.price)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-lab-500 uppercase block">Unit Rate</span>
                <span className="text-xs text-lab-300 font-bold">
                  {formatUnitPrice(activePkg.unitPrice)} / {product.unit}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add {activePkg.quantity} {product.unit}s to Cart ({formatCurrency(activePkg.price)})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Two-Way Cross-Sell Banner to Fragrance Oils */}
      <div className="p-8 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-lab-900 to-lab-950 space-y-4 font-mono">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-4 h-4" /> TEST WITH SCENTLAB PURE FRAGRANCE OILS
        </div>
        <h3 className="text-lg font-bold text-white uppercase">
          Evaluate Top Accords on These Strips & Vials
        </h3>
        <p className="text-xs text-lab-300 leading-relaxed max-w-2xl">
          Order 1 oz and 2 oz fractions of Santal 33 Type, Baccarat 540 Accord, or Tobacco Vanille to benchmark olfactive curves with this testing supply.
        </p>

        <div className="pt-2">
          <Link
            href="/fragrance"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold text-xs uppercase hover:brightness-110 shadow-lg shadow-amber-500/20"
          >
            Explore Fragrance Oils Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
