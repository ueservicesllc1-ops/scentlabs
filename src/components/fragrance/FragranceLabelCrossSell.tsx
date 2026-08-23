"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Tag } from "lucide-react";

interface FragranceLabelCrossSellProps {
  fragranceName: string;
}

export function FragranceLabelCrossSell({ fragranceName }: FragranceLabelCrossSellProps) {
  return (
    <div className="p-6 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-lab-900 to-lab-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono shadow-xl">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> CREATE YOUR OWN BRANDED LABEL
        </div>
        <h4 className="text-sm font-bold text-white uppercase">
          Custom Metallic Foil Labels for {fragranceName}
        </h4>
        <p className="text-xs text-lab-300">
          Die-cut precision metallic foil on oil-proof matte vinyl. Add your custom studio brand name and batch code.
        </p>
      </div>

      <Link
        href="/custom-labels"
        className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 whitespace-nowrap"
      >
        <Tag className="w-3.5 h-3.5" /> Launch Label Studio <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
