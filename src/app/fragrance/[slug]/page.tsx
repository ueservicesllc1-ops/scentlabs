"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FragranceOil, RepackagingVariant } from "@/types/fragrance";
import { fragranceRepository } from "@/lib/firestore/fragrance";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { ProductMediaViewer } from "@/components/ui/ProductMediaViewer";
import { 
  ShoppingBag, 
  Check, 
  ArrowLeft, 
  Droplet,
  Truck,
  FlaskConical,
  Info
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

  const ALLOWED_SIZES = [1, 2, 4, 8, 16];

  useEffect(() => {
    const fetchFragrance = async () => {
      const found = await fragranceRepository.getFragranceBySlug(params.slug);
      if (found) {
        setFragrance(found);
        const active = (found.repackagingVariants || []).filter((v) => v.active && ALLOWED_SIZES.includes(v.sellingSize));
        if (active.length > 0) setSelectedVariant(active[0]);
      }
      setLoading(false);
    };

    fetchFragrance();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-body-md text-secondary bg-surface">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        Loading fragrance compounding data...
      </div>
    );
  }

  if (!fragrance) {
    notFound();
  }

  const activeVariants = (fragrance.repackagingVariants || []).filter(
    (v) => v.active && ALLOWED_SIZES.includes(v.sellingSize)
  );

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const sizeLabel = `${selectedVariant.sellingSize} ${selectedVariant.sellingUnit}`;
    const cartProductProxy: any = {
      id: `${fragrance.id}_${selectedVariant.id}`,
      name: `${fragrance.name} (${sizeLabel})`,
      slug: fragrance.slug,
      category: "fragrance",
      subcategory: fragrance.scentFamily,
      sku: selectedVariant.sku,
      basePrice: selectedVariant.retailPrice,
      media: (fragrance as any).media || [{ url: fragrance.primaryImage, type: "image", isPrimary: true, altText: fragrance.name }],
      packageOptions: [
        {
          id: `pkg_${selectedVariant.id}`,
          name: `${sizeLabel}`,
          quantity: selectedVariant.sellingSize,
          price: selectedVariant.retailPrice,
          unitPrice: selectedVariant.unitCost,
        },
      ],
    };

    addItem(cartProductProxy, cartProductProxy.packageOptions[0], 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const primaryImage =
    fragrance.primaryImage ||
    ((fragrance as any).media && (fragrance as any).media[0]?.url) ||
    "/images/products/placeholder.jpg";

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md py-section-gap">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-stack-lg">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-secondary border-b border-outline-variant pb-4">
          <Link href="/fragrance" className="hover:text-primary transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Fragrance Oils
          </Link>
          <span>/</span>
          <span className="uppercase text-secondary">{fragrance.scentFamily}</span>
          <span>/</span>
          <span className="text-primary font-medium truncate">{fragrance.name}</span>
        </div>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Product Visuals & Specs */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="w-full max-w-[480px] mx-auto relative overflow-hidden bg-[#FAFAFA] border border-outline-variant flex items-center justify-center p-4">
              <ProductMediaViewer
                src={primaryImage}
                alt={fragrance.name}
                category="fragrance"
                sku={selectedVariant?.sku || fragrance.id}
                aspectRatio="square"
              />

              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="px-2.5 py-0.5 bg-surface-bright border border-outline-variant text-primary text-[9px] font-label-caps uppercase tracking-wider">
                  {fragrance.scentFamily}
                </span>
                <span className="px-2.5 py-0.5 bg-[#2B5F4A] text-white text-[9px] font-label-caps uppercase tracking-wider">
                  {fragrance.gender}
                </span>
              </div>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border border-outline-variant bg-surface-bright text-center space-y-1 rounded-sm">
                <Droplet className="w-5 h-5 text-primary mx-auto stroke-[1.75]" />
                <div className="font-label-caps text-[11px] text-primary uppercase">100% Uncut</div>
                <div className="font-caption text-caption text-secondary">Zero Carrier Oils</div>
              </div>
              <div className="p-4 border border-outline-variant bg-surface-bright text-center space-y-1 rounded-sm">
                <FlaskConical className="w-5 h-5 text-primary mx-auto stroke-[1.75]" />
                <div className="font-label-caps text-[11px] text-primary uppercase">Lab Grade</div>
                <div className="font-caption text-caption text-secondary">Apothecary Quality</div>
              </div>
              <div className="p-4 border border-outline-variant bg-surface-bright text-center space-y-1 rounded-sm">
                <Truck className="w-5 h-5 text-primary mx-auto stroke-[1.75]" />
                <div className="font-label-caps text-[11px] text-primary uppercase">US Dispatch</div>
                <div className="font-caption text-caption text-secondary">Same-day shipping</div>
              </div>
            </div>

            {/* Scent Pyramid Breakdown */}
            {((fragrance as any).topNotes || (fragrance as any).middleNotes || (fragrance as any).baseNotes) && (
              <div className="border border-outline-variant p-6 bg-surface-bright rounded-sm mt-stack-md">
                <h4 className="font-label-caps text-label-caps text-primary border-b border-outline-variant/60 pb-3 mb-4 uppercase">
                  Olfactory Pyramid & Notes
                </h4>
                <div className="space-y-3 font-body-md text-secondary">
                  {(fragrance as any).topNotes && (fragrance as any).topNotes.length > 0 && (
                    <div className="flex items-start gap-4">
                      <span className="w-24 font-label-caps text-label-caps text-primary uppercase shrink-0">Top Notes</span>
                      <span>{(fragrance as any).topNotes.join(", ")}</span>
                    </div>
                  )}
                  {(fragrance as any).middleNotes && (fragrance as any).middleNotes.length > 0 && (
                    <div className="flex items-start gap-4">
                      <span className="w-24 font-label-caps text-label-caps text-primary uppercase shrink-0">Heart Notes</span>
                      <span>{(fragrance as any).middleNotes.join(", ")}</span>
                    </div>
                  )}
                  {(fragrance as any).baseNotes && (fragrance as any).baseNotes.length > 0 && (
                    <div className="flex items-start gap-4">
                      <span className="w-24 font-label-caps text-label-caps text-primary uppercase shrink-0">Base Notes</span>
                      <span>{(fragrance as any).baseNotes.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Information, Pricing & Ordering */}
          <div className="lg:col-span-6 flex flex-col pt-4 lg:pt-0">
            
            {/* Header info */}
            <div className="mb-8">
              <span className="font-label-caps text-label-caps text-secondary mb-2 block uppercase tracking-widest">
                Fragrance Oils
              </span>
              <h1 className="font-display-hero text-headline-lg-mobile md:text-headline-lg text-primary mb-2 uppercase">
                {fragrance.name}
              </h1>
              {fragrance.fragranceReference && (
                <p className="font-caption text-caption text-primary italic mb-2">
                  Inspired by: {fragrance.fragranceReference}
                </p>
              )}
              <p className="font-caption text-caption text-secondary">
                SKU: {selectedVariant?.sku || fragrance.id} &bull; <span className="text-emerald-700 font-semibold">Ready to compound</span>
              </p>
            </div>

            <div className="mb-8">
              <p className="font-body-md text-body-md text-secondary leading-relaxed font-light">
                {fragrance.description}
              </p>
            </div>

            {/* Variant Size Selector */}
            <div className="space-y-4 mb-8">
              <label className="font-label-caps text-label-caps text-primary uppercase block">
                Select Size:
              </label>
              <div className="grid grid-cols-2 gap-4">
                {activeVariants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const vPrice = typeof variant.retailPrice === "number" ? variant.retailPrice : 0;
                  const vUnitPrice = variant.sellingSize ? vPrice / variant.sellingSize : vPrice;
                  const vSize = variant.sellingSize || 1;
                  const sizeText = `${vSize} OZ`;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-4 border text-left transition rounded-sm flex flex-col justify-between ${
                        isSelected
                          ? "bg-primary text-on-primary border-primary shadow-sm"
                          : "bg-surface text-primary border-outline-variant hover:border-primary"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-label-caps text-label-caps uppercase">{sizeText}</span>
                        <span className="font-body-md font-semibold font-mono">
                          ${vPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className={`text-[10px] uppercase font-semibold ${isSelected ? "text-on-primary-container" : "text-secondary"}`}>
                        ${vUnitPrice.toFixed(2)} / oz
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price & Add to Order Bar */}
            {selectedVariant && (
              <div className="border border-outline-variant p-6 bg-surface-bright rounded-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-caption text-caption text-secondary block">Total Unit Price</span>
                    <span className="font-body-lg text-body-lg text-primary font-semibold">
                      ${(typeof selectedVariant.retailPrice === "number" ? selectedVariant.retailPrice : 0).toFixed(2)}
                    </span>
                  </div>
                  <span className="font-caption text-caption text-secondary">
                    (${ ((selectedVariant.retailPrice || 0) / (selectedVariant.sellingSize || 1)).toFixed(2)} / {selectedVariant.sellingUnit})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flat-btn w-full py-4 text-xs font-label-caps uppercase transition ${
                    added ? "bg-emerald-700 hover:bg-emerald-700" : ""
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 mr-1.5" /> Added to Order
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 mr-1.5" /> Add to Order
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Formulation Tip Box */}
            <div className="p-4 border border-outline-variant bg-surface-container-low flex items-start gap-3 rounded-sm mt-6">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="font-caption text-caption text-secondary">
                <strong className="text-primary font-medium">Atelier Formula Tip:</strong> Dilute concentrate at 15% to 20% by weight with SDA-40B 200-Proof Perfumer&apos;s Alcohol Base to achieve fine EDP fragrance strength.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
