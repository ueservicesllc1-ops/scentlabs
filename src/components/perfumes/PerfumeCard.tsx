"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Check, Sparkles, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function PerfumeCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const stock = product.inventory?.quantityInStock || 0;
  const isOutOfStock = stock <= 0;
  const image = product.primaryImageUrl || (product.media && product.media[0]?.url) || "";
  const brand = product.brand || product.attributes?.brand || "";
  const measure = product.attributes?.measure || product.attributes?.size || "";
  const concentration = product.attributes?.concentration || "";
  const price = product.basePrice || product.price || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    const defaultPkg = product.packageOptions?.[0] || {
      id: "pkg_default",
      name: "1 Unit",
      quantity: 1,
      price: price,
      unitPrice: price,
      isDefault: true
    };

    addItem(product, defaultPkg, 1);

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group flex flex-col bg-white border border-gray-200 hover:border-gray-900 transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md font-sans">
      
      {/* Image Container */}
      <Link href={`/product/${product.slug || product.id}`} className="relative aspect-square bg-[#F8F9FA] p-5 flex items-center justify-center overflow-hidden border-b border-gray-100">
        {image ? (
          <img
            src={image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
              const parent = (e.currentTarget as HTMLElement).parentElement;
              if (parent && !parent.querySelector(".perfume-fallback")) {
                const badge = document.createElement("div");
                badge.className = "perfume-fallback flex flex-col items-center justify-center text-gray-400 gap-1 text-xs text-center p-3";
                badge.innerHTML = '<span class="text-3xl">🧴</span><span class="font-bold uppercase tracking-wider text-[10px] text-gray-500">' + (brand || "SCENTLAB") + "</span>";
                parent.appendChild(badge);
              }
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 gap-1 text-xs">
            <span className="text-3xl">🧴</span>
            <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500">{brand || "SCENTLAB"}</span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200 rounded">
              Agotado (0)
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
              {stock} en stock
            </span>
          )}
        </div>

        {/* Concentration / Size Tag */}
        {(concentration || measure) && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="px-2 py-0.5 text-[9px] font-semibold bg-white/90 backdrop-blur-xs text-gray-700 border border-gray-200 rounded shadow-2xs">
              {[concentration, measure].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}
      </Link>

      {/* Details Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {brand && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#2B5F4A] mb-0.5">
              {brand}
            </p>
          )}
          <Link href={`/product/${product.slug || product.id}`}>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 hover:text-[#2B5F4A] transition-colors leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>
          {product.inspiredBy && (
            <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-800 font-medium truncate">
              <Sparkles className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
              <span className="truncate">Insp: {product.inspiredBy}</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 uppercase font-semibold">Precio</span>
            <span className="text-sm font-extrabold text-gray-950">
              {formatCurrency(price)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || added}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${
              added
                ? "bg-emerald-600 text-white cursor-default"
                : isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-black hover:bg-[#2B5F4A] text-white active:scale-95"
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Agregado
              </>
            ) : isOutOfStock ? (
              "Agotado"
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Comprar
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
