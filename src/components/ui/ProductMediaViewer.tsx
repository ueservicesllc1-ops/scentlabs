import React from "react";
import { FlaskConical, Box, SlidersHorizontal, Wrench, ShieldCheck, Sparkles, Image as ImageIcon } from "lucide-react";
import { ProductCategory } from "@/types";

interface ProductMediaViewerProps {
  src?: string;
  alt: string;
  category?: ProductCategory | string;
  sku?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide";
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  fragrance: FlaskConical,
  bottles: SlidersHorizontal,
  packaging: Box,
  tools: Wrench,
  testing: ShieldCheck,
  custom: Sparkles,
  kits: Box,
  wholesale: Box,
};

export function ProductMediaViewer({
  src,
  alt,
  category = "bottles",
  sku,
  className = "",
  aspectRatio = "square",
}: ProductMediaViewerProps) {
  const Icon = CATEGORY_ICONS[category.toLowerCase()] || ImageIcon;
  const isCustomOrValidUrl = src && src.startsWith("http");

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-b from-lab-900 to-lab-950 border border-lab-800 flex items-center justify-center group ${
        aspectRatio === "square" ? "aspect-square" : aspectRatio === "video" ? "aspect-video" : "aspect-[4/3]"
      } ${className}`}
    >
      {/* Background blueprint grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:12px_12px] opacity-30 pointer-events-none" />

      {isCustomOrValidUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 relative z-10"
        />
      ) : (
        // Technical Neutral Laboratory Placeholder
        <div className="flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
          <div className="w-14 h-14 rounded-xl bg-lab-900/90 border border-lab-700/80 flex items-center justify-center text-amber-400 shadow-inner group-hover:border-amber-500/50 group-hover:text-amber-300 transition">
            <Icon className="w-7 h-7 stroke-[1.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/90 font-bold block">
              SCENTLAB SPECIMEN
            </span>
            <p className="text-xs font-mono font-medium text-lab-300 line-clamp-1 max-w-[200px]">
              {alt}
            </p>
            {sku && (
              <span className="text-[9px] font-mono text-lab-500 block">
                REF: {sku}
              </span>
            )}
          </div>

          <div className="text-[9px] font-mono text-lab-600 border border-lab-800/80 px-2 py-0.5 rounded bg-lab-950/60">
            B2 Media Channel Ready
          </div>
        </div>
      )}
    </div>
  );
}
