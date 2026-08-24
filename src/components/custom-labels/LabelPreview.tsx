"use client";

import React from "react";
import { LabelMaterial, LabelSize } from "@/types/custom-label";
import { Sparkles, Maximize2 } from "lucide-react";

interface LabelPreviewProps {
  brandName: string;
  fragranceName: string;
  customText?: string;
  volumeText?: string;
  logoUrl?: string;
  designUrl?: string;
  fontFamily?: string;
  textColorHex?: string;
  size: LabelSize;
  material: LabelMaterial;
  className?: string;
}

export function LabelPreview({
  brandName,
  fragranceName,
  customText,
  volumeText = "EAU DE PARFUM • 10 ML / 0.34 FL OZ",
  logoUrl,
  designUrl,
  fontFamily = "'Bodoni Moda', serif",
  textColorHex = "#E5A93C",
  size,
  material,
  className = "",
}: LabelPreviewProps) {
  // Foil sheen gradients and colors for 4 Base Materials (Black, White, Gold, Silver)
  const getFinishStyles = () => {
    switch (material.finishType) {
      case "gold_foil":
        return {
          borderColor: "border-amber-400/80",
          bgOverlay: "bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11]",
          sheen: "bg-gradient-to-tr from-amber-500/20 via-yellow-300/40 to-transparent",
        };
      case "silver_foil":
        return {
          borderColor: "border-slate-300/80",
          bgOverlay: "bg-gradient-to-br from-[#C0C0C0] via-[#FFFFFF] to-[#999999]",
          sheen: "bg-gradient-to-tr from-slate-400/20 via-white/40 to-transparent",
        };
      case "matte_white":
        return {
          borderColor: "border-gray-300",
          bgOverlay: "bg-[#FFFFFF]",
          sheen: "bg-gradient-to-b from-gray-100/30 to-transparent",
        };
      case "matte_black":
      default:
        return {
          borderColor: "border-gray-800",
          bgOverlay: "bg-[#18181B]",
          sheen: "bg-gradient-to-tr from-white/5 to-transparent",
        };
    }
  };

  const finish = getFinishStyles();
  const aspectRatio = size.width / size.height;

  // Outer mockup preview container should be elegant light gray to contrast the label
  return (
    <div className={`flex flex-col items-center space-y-4 font-sans ${className}`}>
      {/* Spec Badge Header */}
      <div className="flex items-center justify-between w-full text-[11px] text-secondary border-b border-outline-variant pb-2">
        <span className="flex items-center gap-1.5 text-primary font-semibold uppercase">
          <Sparkles className="w-3.5 h-3.5" /> {material.name}
        </span>
        <span className="flex items-center gap-1">
          <Maximize2 className="w-3 h-3 text-secondary" />
          {size.width}&quot; × {size.height}&quot; ({size.widthCm} × {size.heightCm} cm)
        </span>
      </div>

      {/* Die-Cut Label Specimen Mockup */}
      <div className="w-full flex items-center justify-center p-8 bg-surface-container border border-outline-variant rounded-sm relative overflow-hidden shadow-xs">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Dynamic Label Container Scaled to Aspect Ratio */}
        <div
          style={{
            aspectRatio: `${aspectRatio}`,
            maxWidth: size.width > size.height ? "360px" : "280px",
            minHeight: "220px",
          }}
          className={`w-full rounded-[2px] border-2 ${finish.borderColor} ${finish.bgOverlay} p-6 relative flex flex-col justify-between items-center text-center shadow-lg transition-all duration-300 overflow-hidden group`}
        >
          {/* Metallic Sheen Angle Reflex */}
          <div className={`absolute inset-0 pointer-events-none opacity-60 ${finish.sheen}`} />

          {designUrl ? (
            /* Custom Uploaded Design Image View */
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={designUrl}
                alt="Uploaded Custom Label Artwork"
                className="w-full h-full object-contain filter drop-shadow"
              />
              <div className="absolute bottom-1 bg-black/80 text-amber-300 text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-mono font-semibold backdrop-blur-xs border border-amber-400/30">
                2-Color Print Proof
              </div>
            </div>
          ) : (
            /* Standard Typography Proof View */
            <>
              {/* Top: Brand Logo / Monogram */}
              <div className="relative z-10 w-full flex flex-col items-center pt-1">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Brand Logo"
                    className="max-h-12 max-w-[140px] object-contain filter drop-shadow mb-1"
                  />
                ) : (
                  <div
                    style={{ fontFamily, color: textColorHex }}
                    className="text-[11px] font-bold uppercase tracking-[0.25em]"
                  >
                    {brandName || "STUDIO BRAND"}
                  </div>
                )}
                <div className="w-8 h-[1px] bg-gray-400/40 my-1" />
              </div>

              {/* Center: Fragrance Name & Subtext */}
              <div className="relative z-10 w-full py-2 space-y-1">
                <h4
                  style={{ fontFamily, color: textColorHex }}
                  className="text-lg font-bold uppercase tracking-widest line-clamp-2"
                >
                  {fragranceName || "FRAGRANCE NAME"}
                </h4>

                {customText && (
                  <p
                    style={{ fontFamily, color: textColorHex }}
                    className="text-[10px] font-medium tracking-wide uppercase opacity-90"
                  >
                    {customText}
                  </p>
                )}
              </div>

              {/* Bottom: Volume / Formulation Standard */}
              <div className="relative z-10 w-full pb-1 border-t border-gray-400/30 pt-2">
                <div
                  style={{ fontFamily, color: textColorHex }}
                  className="text-[9px] font-mono tracking-widest uppercase opacity-80"
                >
                  {volumeText}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
