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
    window.scrollTo(0, 0);
    const fetchFragrance = async () => {
      const found = await fragranceRepository.getFragranceBySlug(params.slug);
      if (found) {
        setFragrance(found);
        const active = (found.repackagingVariants || []).filter((v) => v.active && ALLOWED_SIZES.includes(v.sellingSize));
        if (active.length > 0) setSelectedVariant(active[0]);
      }
      setLoading(false);
      window.scrollTo(0, 0);
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

            {/* Variant Size Selector - Compact 1-2 Row Grid */}
            <div className="space-y-2.5 mb-6">
              <div className="flex justify-between items-center">
                <label className="font-label-caps text-xs text-primary uppercase font-bold tracking-wider">
                  Select Size (Pure Concentrate):
                </label>
                {selectedVariant && (
                  <span className="text-xs text-emerald-700 font-semibold font-mono">
                    Selected: {selectedVariant.sellingSize} OZ (${selectedVariant.retailPrice.toFixed(2)})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
                      className={`p-2.5 sm:p-3 text-center transition rounded-xl border flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "bg-[#111827] text-white border-[#111827] ring-2 ring-[#2B5F4A] shadow-sm"
                          : "bg-white text-gray-900 border-gray-200 hover:border-gray-400 hover:bg-gray-50/80"
                      }`}
                    >
                      <span className="font-bold text-xs sm:text-sm uppercase tracking-tight">
                        {sizeText}
                      </span>
                      <span className={`font-mono text-xs font-bold ${isSelected ? "text-amber-300" : "text-gray-950"}`}>
                        ${vPrice.toFixed(2)}
                      </span>
                      <span className={`text-[9px] font-medium leading-none ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                        ${vUnitPrice.toFixed(2)}/oz
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price & Add to Order Bar */}
            {selectedVariant && (
              <div className="border border-gray-200 p-5 bg-gray-50/80 rounded-2xl space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total por Frasco</span>
                    <span className="text-2xl font-black text-gray-950 font-mono">
                      ${(typeof selectedVariant.retailPrice === "number" ? selectedVariant.retailPrice : 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-700 block">En Stock para despacho</span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      (${ ((selectedVariant.retailPrice || 0) / (selectedVariant.sellingSize || 1)).toFixed(2)} / {selectedVariant.sellingUnit})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs ${
                    added ? "bg-emerald-700 text-white" : "bg-[#2B5F4A] hover:bg-[#1E4233] text-white"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> ¡Agregado al Pedido!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Agregar al Pedido
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Formulation Tip Box */}
            <div className="p-4 border border-gray-200 bg-white flex items-start gap-3 rounded-2xl mt-4 shadow-2xs">
              <Info className="w-4 h-4 text-[#2B5F4A] shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 font-light leading-relaxed">
                <strong className="text-gray-900 font-semibold">Consejo de Formulación:</strong> Diluye el concentrado puro al 15% - 20% en peso con alcohol perfumista SDA-40B para obtener un Eau de Parfum (EDP) de alta fijación.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
