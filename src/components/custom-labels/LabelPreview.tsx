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
  size: LabelSize;
  material: LabelMaterial;
  className?: string;
}

export function LabelPreview({
  brandName,
  fragranceName,
  customText,
  volumeText = "EAU DE PARFUM \u2022 10 ML / 0.34 FL OZ",
  logoUrl,
  size,
  material,
  className = "",
}: LabelPreviewProps) {
  // Foil sheen gradients and colors
  const getFinishStyles = () => {
    switch (material.finishType) {
      case "gold_foil":
        return {
          textColor: "text-amber-300",
          borderColor: "border-amber-400/80",
          gradient: "from-amber-400 via-yellow-200 to-amber-500",
          bgOverlay: "bg-[#111111]",
          accentColor: "#F59E0B",
          sheen: "bg-gradient-to-tr from-amber-500/20 via-yellow-300/40 to-transparent",
        };
      case "silver_foil":
        return {
          textColor: "text-slate-200",
          borderColor: "border-slate-300/80",
          gradient: "from-slate-300 via-white to-slate-400",
          bgOverlay: "bg-[#111111]",
          accentColor: "#E2E8F0",
          sheen: "bg-gradient-to-tr from-slate-400/20 via-white/40 to-transparent",
        };
      case "rose_gold_foil":
        return {
          textColor: "text-rose-300",
          borderColor: "border-rose-300/80",
          gradient: "from-rose-300 via-pink-100 to-rose-400",
          bgOverlay: "bg-[#111111]",
          accentColor: "#FDA4AF",
          sheen: "bg-gradient-to-tr from-rose-400/20 via-pink-200/40 to-transparent",
        };
      case "holographic":
        return {
          textColor: "text-indigo-200",
          borderColor: "border-indigo-400/80",
          gradient: "from-cyan-300 via-purple-300 to-pink-400",
          bgOverlay: "bg-[#111111]",
          accentColor: "#818CF8",
          sheen: "bg-gradient-to-r from-cyan-400/20 via-fuchsia-400/30 to-amber-300/20",
        };
      default:
        return {
          textColor: "text-[#111111]",
          borderColor: "border-[#111111]/80",
          gradient: "from-[#111111] to-[#605e5c]",
          bgOverlay: "bg-[#faf9f6]",
          accentColor: "#111111",
          sheen: "bg-gradient-to-b from-[#111111]/5 to-transparent",
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
                className={`text-[11px] font-bold uppercase tracking-[0.25em] bg-gradient-to-r ${finish.gradient} bg-clip-text text-transparent`}
              >
                {brandName || "STUDIO BRAND"}
              </div>
            )}
            <div className="w-8 h-[1px] bg-outline-variant/60 my-1" />
          </div>

          {/* Center: Fragrance Name & Subtext */}
          <div className="relative z-10 w-full py-2 space-y-1">
            <h4
              className={`text-lg font-bold uppercase tracking-widest bg-gradient-to-r ${finish.gradient} bg-clip-text text-transparent line-clamp-2`}
            >
              {fragranceName || "FRAGRANCE NAME"}
            </h4>

            {customText && (
              <p className={`text-[10px] font-medium tracking-wide uppercase ${material.finishType.includes("vinyl") ? "text-secondary" : "text-white/80"}`}>
                {customText}
              </p>
            )}
          </div>

          {/* Bottom: Volume / Formulation Standard */}
          <div className={`relative z-10 w-full pb-1 border-t pt-2 ${material.finishType.includes("vinyl") ? "border-outline-variant" : "border-white/10"}`}>
            <div className={`text-[9px] font-mono tracking-widest uppercase ${material.finishType.includes("vinyl") ? "text-secondary" : "text-white/60"}`}>
              {volumeText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
