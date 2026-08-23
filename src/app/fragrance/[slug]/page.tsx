"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FragranceOil, RepackagingVariant } from "@/types/fragrance";
import { fragranceRepository } from "@/lib/firestore/fragrance";
import { useCart } from "@/context/CartContext";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { ProductMediaViewer } from "@/components/ui/ProductMediaViewer";
import { FragranceTestingCrossSell } from "@/components/fragrance/FragranceTestingCrossSell";
import { FragranceBottlingCrossSell } from "@/components/fragrance/FragranceBottlingCrossSell";
import { FragranceLabelCrossSell } from "@/components/fragrance/FragranceLabelCrossSell";
import { 
  Sparkles, 
  ShoppingBag, 
  Check, 
  ArrowLeft, 
  Layers, 
  ShieldCheck, 
  SlidersHorizontal, 
  Tag, 
  Clock, 
  Droplet 
} from "lucide-react";

interface FragrancePageProps {
  params: {
    slug: string;
  };
}

export default function FragranceProductPage({ params }: FragrancePageProps) {
  const { addItem } = useCart();
  const [fragrance, setFragrance] = useState<FragranceOil | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<RepackagingVariant | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchFragrance = async () => {
      const found = await fragranceRepository.getFragranceBySlug(params.slug);
      if (found) {
        setFragrance(found);
        const active = found.repackagingVariants.filter((v) => v.active);
        if (active.length > 0) setSelectedVariant(active[0]);
      }
      setLoading(false);
    };

    fetchFragrance();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-xs text-lab-400">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mr-3" />
        Loading fragrance oil formulation...
      </div>
    );
  }

  if (!fragrance) {
    notFound();
  }

  const activeVariants = fragrance.repackagingVariants.filter((v) => v.active);

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    // Build standard catalog Product proxy for CartContext
    const cartProductProxy: any = {
      id: fragrance.id,
      name: `${fragrance.name} (${selectedVariant.sellingSize} oz)`,
      slug: fragrance.slug,
      category: "fragrance",
      sku: selectedVariant.sku,
      basePrice: selectedVariant.retailPrice,
      media: [{ url: fragrance.primaryImage, type: "image", isPrimary: true, altText: fragrance.name }],
      packageOptions: [
        {
          id: `pkg_${selectedVariant.id}`,
          quantity: 1,
          price: selectedVariant.retailPrice,
          unitPrice: selectedVariant.retailPrice,
        },
      ],
      pricingTiers: selectedVariant.volumePricing || [],
    };

    const selectedPkg = {
      id: `pkg_${selectedVariant.id}`,
      quantity: 1,
      price: selectedVariant.retailPrice,
      unitPrice: selectedVariant.retailPrice,
    };

    addItem(cartProductProxy, selectedPkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-mono">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-lab-400">
        <Link href="/shop" className="hover:text-white transition">Shop</Link>
        <span>/</span>
        <Link href="/shop/fragrance" className="hover:text-white transition">Fragrance Oils</Link>
        <span>/</span>
        <span className="text-amber-400 font-bold uppercase">{fragrance.name}</span>
      </nav>

      {/* Main Product Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Media Viewer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-lab-950 border border-lab-800 shadow-2xl relative">
            <ProductMediaViewer
              src={fragrance.primaryImage}
              alt={fragrance.name}
              category="fragrance"
              sku={fragrance.id}
              aspectRatio="square"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="px-3 py-1 rounded-full bg-lab-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider shadow">
                {fragrance.scentFamily} Accord
              </span>
            </div>
          </div>
        </div>

        {/* Right: Formulation Details, Sizes & Add to Cart */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2 border-b border-lab-800 pb-4">
            <div className="flex items-center gap-2 text-xs text-amber-400 uppercase font-bold tracking-widest">
              <Droplet className="w-3.5 h-3.5" /> PURE UNCUT FRAGRANCE OIL • GRADE-A
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              {fragrance.name}
            </h1>
            {fragrance.fragranceReference && (
              <div className="text-xs text-lab-400">
                Olfactive Profile: <span className="text-white">{fragrance.fragranceReference}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-lab-300 leading-relaxed">
            {fragrance.description}
          </p>

          {/* Size Selector */}
          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white uppercase">Select Presentation Volume</span>
              <span className="text-lab-400 text-[11px]">Direct Bulk Fractioning</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {activeVariants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col justify-between ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10"
                        : "border-lab-800 bg-lab-950 text-lab-400 hover:border-lab-700 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-black uppercase text-white">{v.sellingSize} oz</span>
                    <span className="text-[11px] text-amber-400 font-bold mt-1">
                      {formatCurrency(v.retailPrice)}
                    </span>
                    <span className="text-[9px] text-lab-500">
                      {formatUnitPrice(v.retailPrice / v.sellingSize)}/oz
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Pricing Tiers if available */}
          {selectedVariant && selectedVariant.volumePricing && selectedVariant.volumePricing.length > 0 && (
            <div className="p-4 rounded-xl border border-lab-800 bg-lab-950 space-y-2 text-xs">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                Volume Batch Discounts ({selectedVariant.sellingSize} oz)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {selectedVariant.volumePricing.map((tier, idx) => (
                  <div key={idx} className="p-2 rounded bg-lab-900/80 border border-lab-800 text-center">
                    <span className="text-[10px] text-lab-400 block">{tier.quantity}+ Units</span>
                    <span className="text-xs font-bold text-white">{formatCurrency(tier.unitPrice)}/ea</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price & Add to Cart */}
          {selectedVariant && (
            <div className="p-6 rounded-2xl border border-lab-700 bg-lab-950 space-y-4 shadow-2xl">
              <div className="flex justify-between items-baseline border-b border-lab-800 pb-3">
                <div>
                  <span className="text-[10px] text-lab-500 uppercase block">Selected Size Price</span>
                  <span className="text-3xl font-black text-amber-400">
                    {formatCurrency(selectedVariant.retailPrice)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-lab-500 uppercase block">SKU</span>
                  <span className="text-xs text-lab-300 font-bold">{selectedVariant.sku}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" /> Added to Batch!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add {selectedVariant.sellingSize} oz to Cart ({formatCurrency(selectedVariant.retailPrice)})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Strategic Cross-Sell Grid */}
      <div className="space-y-6 pt-8 border-t border-lab-800">
        <h2 className="text-xl font-bold text-white uppercase tracking-tight">
          Complete Your Formulation & Bottling Line
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FragranceTestingCrossSell />
          <FragranceBottlingCrossSell />
        </div>

        <FragranceLabelCrossSell fragranceName={fragrance.name} />
      </div>
    </div>
  );
}
