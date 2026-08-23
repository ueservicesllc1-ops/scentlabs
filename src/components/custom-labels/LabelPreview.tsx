"use client";

import React from "react";
import { LabelMaterial, LabelSize } from "@/types/custom-label";
import { Sparkles, Maximize2, Layers } from "lucide-react";

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
  volumeText = "EAU DE PARFUM • 10 ML / 0.34 FL OZ",
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
          bgOverlay: "bg-radial-gold",
          accentColor: "#F59E0B",
          sheen: "bg-gradient-to-tr from-amber-500/20 via-yellow-300/40 to-transparent",
        };
      case "silver_foil":
        return {
          textColor: "text-slate-200",
          borderColor: "border-slate-300/80",
          gradient: "from-slate-300 via-white to-slate-400",
          bgOverlay: "bg-radial-silver",
          accentColor: "#E2E8F0",
          sheen: "bg-gradient-to-tr from-slate-400/20 via-white/40 to-transparent",
        };
      case "rose_gold_foil":
        return {
          textColor: "text-rose-300",
          borderColor: "border-rose-300/80",
          gradient: "from-rose-300 via-pink-100 to-rose-400",
          bgOverlay: "bg-radial-rosegold",
          accentColor: "#FDA4AF",
          sheen: "bg-gradient-to-tr from-rose-400/20 via-pink-200/40 to-transparent",
        };
      case "holographic":
        return {
          textColor: "text-indigo-200",
          borderColor: "border-indigo-400/80",
          gradient: "from-cyan-300 via-purple-300 to-pink-400",
          bgOverlay: "bg-radial-holo",
          accentColor: "#818CF8",
          sheen: "bg-gradient-to-r from-cyan-400/20 via-fuchsia-400/30 to-amber-300/20",
        };
      default:
        return {
          textColor: "text-white",
          borderColor: "border-lab-600",
          gradient: "from-white to-lab-300",
          bgOverlay: "bg-lab-900",
          accentColor: "#FFFFFF",
          sheen: "bg-gradient-to-b from-white/10 to-transparent",
        };
    }
  };

  const finish = getFinishStyles();
  const aspectRatio = size.width / size.height;

  return (
    <div className={`flex flex-col items-center space-y-4 font-mono ${className}`}>
      {/* Spec Badge Header */}
      <div className="flex items-center justify-between w-full text-[11px] text-lab-400 border-b border-lab-800 pb-2">
        <span className="flex items-center gap-1.5 text-amber-400 font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" /> {material.name}
        </span>
        <span className="flex items-center gap-1">
          <Maximize2 className="w-3 h-3 text-lab-500" />
          {size.width}&quot; × {size.height}&quot; ({size.widthCm} × {size.heightCm} cm) • {size.area} sq in
        </span>
      </div>

      {/* Die-Cut Label Specimen Mockup */}
      <div className="w-full flex items-center justify-center p-8 bg-lab-950/80 rounded-2xl border border-lab-800/80 relative overflow-hidden shadow-2xl">
        {/* Subtle Laboratory Blueprint Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0a_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Dynamic Label Container Scaled to Aspect Ratio */}
        <div
          style={{
            aspectRatio: `${aspectRatio}`,
            maxWidth: size.width > size.height ? "360px" : "280px",
            minHeight: "220px",
          }}
          className={`w-full rounded-lg bg-lab-950 border-2 ${finish.borderColor} p-6 relative flex flex-col justify-between items-center text-center shadow-2xl transition-all duration-300 overflow-hidden group`}
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
                className={`text-[11px] font-black uppercase tracking-[0.25em] bg-gradient-to-r ${finish.gradient} bg-clip-text text-transparent`}
              >
                {brandName || "STUDIO BRAND"}
              </div>
            )}
            <div className="w-8 h-[1px] bg-lab-700/60 my-1" />
          </div>

          {/* Center: Fragrance Name & Subtext */}
          <div className="relative z-10 w-full py-2 space-y-1">
            <h4
              className={`text-lg font-black uppercase tracking-widest bg-gradient-to-r ${finish.gradient} bg-clip-text text-transparent line-clamp-2`}
            >
              {fragranceName || "FRAGRANCE NAME"}
            </h4>

            {customText && (
              <p className="text-[10px] text-lab-300 font-medium tracking-wide uppercase">
                {customText}
              </p>
            )}
          </div>

          {/* Bottom: Volume / Formulation Standard */}
          <div className="relative z-10 w-full pb-1 border-t border-lab-800/80 pt-2">
            <div className="text-[9px] text-lab-400 font-mono tracking-widest uppercase">
              {volumeText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
