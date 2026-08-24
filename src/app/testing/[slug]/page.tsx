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
  Sparkles, 
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center font-sans space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#2B5F4A] border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Cargando especificación de laboratorio...
        </span>
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
    <div className="bg-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 border-b border-gray-100 pb-3">
          <Link href="/shop" className="hover:text-gray-900 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5 text-gray-600" /> Tienda
          </Link>
          <span>/</span>
          <Link href="/admin/testing" className="hover:text-gray-900 transition">Suministros de Evaluación</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Media Viewer */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full bg-[#FAFAFA] border border-gray-200 rounded-2xl p-6 flex items-center justify-center shadow-xs overflow-hidden h-[340px] sm:h-[380px] relative">
              <ProductMediaViewer
                src={product.primaryImage}
                alt={product.name}
                category="testing"
                sku={product.id}
                aspectRatio="square"
              />
              <div className="absolute top-4 left-4">
                <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-gray-800 text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                  {product.subcategory}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Compact Details & Package Matrix */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Spec Badge & Title */}
            <div className="space-y-1.5 border-b border-gray-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-700" /> Grado Laboratorio • Evaluación Olfativa
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight leading-snug">
                {product.name}
              </h1>
              {product.sampleSize && (
                <div className="text-xs text-gray-600">
                  Especificación de Medida: <span className="text-gray-950 font-bold">{product.sampleSize}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-700 leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Package Quantity Selector Matrix */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
                  Selecciona la Cantidad del Paquete
                </span>
                <span className="text-emerald-700 text-[11px] font-semibold">Descuento por Volumen</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.packageOptions.map((pkg, idx) => {
                  const isSelected = selectedPkgIndex === idx;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPkgIndex(idx)}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col justify-between ${
                        isSelected
                          ? "border-[#2B5F4A] bg-[#F6FAF8] text-gray-950 shadow-xs ring-1 ring-[#2B5F4A]"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xs font-bold text-gray-950">
                        {pkg.quantity} {product.unit}s
                      </span>
                      <span className="text-sm font-extrabold text-[#2B5F4A] mt-0.5">
                        {formatCurrency(pkg.price)}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {formatUnitPrice(pkg.unitPrice)} / {product.unit}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>


            {/* Price & Add to Cart Action Box */}
            <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50 space-y-3 shadow-2xs">
              <div className="flex justify-between items-baseline border-b border-gray-200 pb-2.5">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Paquete Seleccionado</span>
                  <span className="text-2xl font-extrabold text-gray-950 font-mono">
                    {formatCurrency(activePkg.price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">Costo Unitario</span>
                  <span className="text-xs text-gray-800 font-bold font-mono">
                    {formatUnitPrice(activePkg.unitPrice)} / {product.unit}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs ${
                  added
                    ? "bg-emerald-700 text-white"
                    : "bg-[#2B5F4A] hover:bg-[#1E4233] text-white active:scale-98"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> ¡Agregado al Carrito!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Agregar {activePkg.quantity} {product.unit}s al Carrito ({formatCurrency(activePkg.price)})
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Cross-Sell Banner */}
        <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-600" /> Prueba tus Perfumes y Aceites en este Suministro
          </div>
          <h3 className="text-base font-bold text-gray-950 uppercase">
            Evalúa Acordes Superiores con Aceites ScentLabs
          </h3>
          <p className="text-xs text-gray-700 leading-relaxed max-w-2xl font-normal">
            Pide muestras de 1 oz y 2 oz de Santal 33 Type, Baccarat 540 Accord, o Tobacco Vanille para calibrar la evaporación y curva olfativa en estas tiras de prueba.
          </p>

          <div className="pt-1">
            <Link
              href="/fragrance"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs uppercase transition shadow-2xs"
            >
              Explorar Catálogo de Aceites Esenciales <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
