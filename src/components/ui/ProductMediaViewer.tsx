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
  "custom-labels": Sparkles,
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
  const isCustomOrValidUrl = Boolean(src && (src.startsWith("http") || src.startsWith("/")));

  return (
    <div
      className={`relative w-full max-w-[480px] max-h-[480px] mx-auto overflow-hidden bg-[#FAFAFA] border border-gray-200 flex items-center justify-center p-4 group ${
        aspectRatio === "square" ? "aspect-square" : aspectRatio === "video" ? "aspect-video" : "aspect-[4/3]"
      } ${className}`}
    >
      {isCustomOrValidUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
            margin: "0 auto",
          }}
          className="transition duration-300 group-hover:scale-105"
        />
      ) : (
        // Clean Minimal SCENTLAB Missing-Image State
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-500">
            <Icon className="w-6 h-6 stroke-[1.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#2B5F4A] font-bold block">
              SCENTLAB CATALOG
            </span>
            <p className="text-xs font-medium text-gray-700 line-clamp-1 max-w-[220px]">
              {alt}
            </p>
            {sku && (
              <span className="text-[10px] font-mono text-gray-400 block">
                SKU: {sku}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
