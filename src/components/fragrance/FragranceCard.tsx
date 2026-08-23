"use client";

import React from "react";
import Link from "next/link";
import { FragranceOil } from "@/types/fragrance";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, FlaskConical, ArrowRight } from "lucide-react";
import { ProductMediaViewer } from "../ui/ProductMediaViewer";

interface FragranceCardProps {
  fragrance: FragranceOil;
}

export function FragranceCard({ fragrance }: FragranceCardProps) {
  const activeVariants = fragrance.repackagingVariants.filter((v) => v.active);
  const lowestPrice = activeVariants.length > 0
    ? Math.min(...activeVariants.map((v) => v.retailPrice))
    : 8.50;

  return (
    <div className="group rounded-2xl border border-lab-800 bg-lab-950 p-4 transition-all duration-300 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col justify-between font-mono">
      <div className="space-y-3">
        {/* Media Container */}
        <Link href={`/fragrance/${fragrance.slug}`} className="block relative aspect-square rounded-xl overflow-hidden bg-lab-900 border border-lab-800/80">
          <ProductMediaViewer
            src={fragrance.primaryImage}
            alt={fragrance.name}
            category="fragrance"
            sku={fragrance.id}
            aspectRatio="square"
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className="px-2 py-0.5 rounded bg-lab-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              {fragrance.scentFamily}
            </span>
          </div>
        </Link>

        {/* Info */}
        <div className="space-y-1">
          <div className="text-[10px] text-lab-500 uppercase tracking-widest flex items-center justify-between">
            <span>{fragrance.subcategory || "Pure Fragrance Oil"}</span>
            {fragrance.gender && <span className="capitalize text-lab-400">{fragrance.gender}</span>}
          </div>

          <Link href={`/fragrance/${fragrance.slug}`} className="block">
            <h3 className="text-sm font-bold text-white uppercase group-hover:text-amber-400 transition line-clamp-1">
              {fragrance.name}
            </h3>
          </Link>

          <p className="text-xs text-lab-400 line-clamp-2 leading-relaxed">
            {fragrance.description}
          </p>
        </div>

        {/* Available Size Badges */}
        <div className="pt-2 border-t border-lab-900 flex flex-wrap gap-1">
          {activeVariants.map((v) => (
            <span
              key={v.id}
              className="text-[10px] px-1.5 py-0.5 rounded bg-lab-900 border border-lab-800 text-lab-300"
            >
              {v.sellingSize} oz
            </span>
          ))}
        </div>
      </div>

      {/* Footer Price & Action */}
      <div className="pt-4 mt-3 border-t border-lab-800/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-lab-500 block uppercase">Starting From</span>
          <span className="text-sm font-bold text-amber-400">{formatCurrency(lowestPrice)}</span>
        </div>

        <Link
          href={`/fragrance/${fragrance.slug}`}
          className="px-3 py-1.5 rounded-lg bg-lab-900 border border-lab-700 text-white text-xs font-bold uppercase hover:bg-amber-500 hover:text-lab-950 hover:border-amber-400 transition flex items-center gap-1"
        >
          Select Size <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
