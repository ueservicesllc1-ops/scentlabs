"use client";

import React, { useState, useRef, useEffect } from "react";
import { LabelMaterial, LabelSize } from "@/types/custom-label";
import { Maximize2, Move, RotateCcw, Undo2, Redo2 } from "lucide-react";

interface LabelPreviewProps {
  brandName: string;
  fragranceName: string;
  customText?: string;
  volumeText?: string;
  logoUrl?: string;
  designUrl?: string;
  fontFamily?: string;
  textColorHex?: string;
  borderStyle?: "none" | "outer_edge" | "inner_edge" | "inset_margin";
  size: LabelSize;
  material: LabelMaterial;
  onBrandNameChange?: (val: string) => void;
  onFragranceNameChange?: (val: string) => void;
  onCustomTextChange?: (val: string) => void;
  onVolumeTextChange?: (val: string) => void;
  className?: string;
}

interface CanvasTransformState {
  brandPos: { x: number; y: number };
  fragrancePos: { x: number; y: number };
  customPos: { x: number; y: number };
  volumePos: { x: number; y: number };
  brandScale: number;
  fragranceScale: number;
  customScale: number;
  volumeScale: number;
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
  borderStyle = "none",
  size,
  material,
  onBrandNameChange,
  onFragranceNameChange,
  onCustomTextChange,
  onVolumeTextChange,
  className = "",
}: LabelPreviewProps) {
  // Draggable positions & scale factors state for 4 INDEPENDENT text elements
  const [brandPos, setBrandPos] = useState({ x: 0, y: 0 });
  const [fragrancePos, setFragrancePos] = useState({ x: 0, y: 0 });
  const [customPos, setCustomPos] = useState({ x: 0, y: 0 });
  const [volumePos, setVolumePos] = useState({ x: 0, y: 0 });

  const [brandScale, setBrandScale] = useState(1.0);
  const [fragranceScale, setFragranceScale] = useState(1.0);
  const [customScale, setCustomScale] = useState(1.0);
  const [volumeScale, setVolumeScale] = useState(1.0);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<CanvasTransformState[]>([
    {
      brandPos: { x: 0, y: 0 },
      fragrancePos: { x: 0, y: 0 },
      customPos: { x: 0, y: 0 },
      volumePos: { x: 0, y: 0 },
      brandScale: 1.0,
      fragranceScale: 1.0,
      customScale: 1.0,
      volumeScale: 1.0,
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [activeDragItem, setActiveDragItem] = useState<string | null>(null);
  const [activeResizeItem, setActiveResizeItem] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const pushHistory = (newState: CanvasTransformState) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(newState);
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setBrandPos(prev.brandPos);
      setFragrancePos(prev.fragrancePos);
      setCustomPos(prev.customPos);
      setVolumePos(prev.volumePos);
      setBrandScale(prev.brandScale);
      setFragranceScale(prev.fragranceScale);
      setCustomScale(prev.customScale);
      setVolumeScale(prev.volumeScale);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setBrandPos(next.brandPos);
      setFragrancePos(next.fragrancePos);
      setCustomPos(next.customPos);
      setVolumePos(next.volumePos);
      setBrandScale(next.brandScale);
      setFragranceScale(next.fragranceScale);
      setCustomScale(next.customScale);
      setVolumeScale(next.volumeScale);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Keyboard listener for Ctrl + Z (Undo) and Ctrl + Y / Ctrl + Shift + Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip shortcuts if focused inside input or active contenteditable
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.getAttribute("contenteditable") === "true"
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history]);

  const handleStartDrag = (item: string, clientX: number, clientY: number) => {
    setActiveDragItem(item);
    dragStartRef.current = { x: clientX, y: clientY };
  };

  const handleStartResize = (item: string, clientX: number, clientY: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setActiveResizeItem(item);
    dragStartRef.current = { x: clientX, y: clientY };
  };

  const handleMoveDrag = (clientX: number, clientY: number) => {
    if (activeDragItem) {
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      dragStartRef.current = { x: clientX, y: clientY };

      if (activeDragItem === "brand") {
        setBrandPos((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      } else if (activeDragItem === "fragrance") {
        setFragrancePos((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      } else if (activeDragItem === "custom") {
        setCustomPos((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      } else if (activeDragItem === "volume") {
        setVolumePos((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      }
    } else if (activeResizeItem) {
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      dragStartRef.current = { x: clientX, y: clientY };
      const delta = (dx + dy) * 0.008;

      if (activeResizeItem === "brand") {
        setBrandScale((prev) => Math.min(Math.max(0.4, prev + delta), 3.0));
      } else if (activeResizeItem === "fragrance") {
        setFragranceScale((prev) => Math.min(Math.max(0.4, prev + delta), 3.0));
      } else if (activeResizeItem === "custom") {
        setCustomScale((prev) => Math.min(Math.max(0.4, prev + delta), 3.0));
      } else if (activeResizeItem === "volume") {
        setVolumeScale((prev) => Math.min(Math.max(0.4, prev + delta), 3.0));
      }
    }
  };

  const handleEndDrag = () => {
    if (activeDragItem || activeResizeItem) {
      pushHistory({
        brandPos,
        fragrancePos,
        customPos,
        volumePos,
        brandScale,
        fragranceScale,
        customScale,
        volumeScale,
      });
    }
    setActiveDragItem(null);
    setActiveResizeItem(null);
  };

  const handleResetPositions = () => {
    const defaultState: CanvasTransformState = {
      brandPos: { x: 0, y: 0 },
      fragrancePos: { x: 0, y: 0 },
      customPos: { x: 0, y: 0 },
      volumePos: { x: 0, y: 0 },
      brandScale: 1.0,
      fragranceScale: 1.0,
      customScale: 1.0,
      volumeScale: 1.0,
    };
    setBrandPos(defaultState.brandPos);
    setFragrancePos(defaultState.fragrancePos);
    setCustomPos(defaultState.customPos);
    setVolumePos(defaultState.volumePos);
    setBrandScale(1.0);
    setFragranceScale(1.0);
    setCustomScale(1.0);
    setVolumeScale(1.0);
    pushHistory(defaultState);
  };

  // Helper: Strictly enforce single-line unless user explicitly typed Enter (\n)
  const getWhitespaceClass = (text?: string) => {
    return text && text.includes("\n")
      ? "whitespace-pre-line text-center"
      : "whitespace-nowrap text-center overflow-visible";
  };

  // Foil sheen gradients and colors for Base Materials (Black Matte/Gloss, White Matte/Gloss, Gold, Silver)
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
      case "glossy_black":
        return {
          borderColor: "border-black",
          bgOverlay: "bg-gradient-to-br from-[#121214] via-[#1F1F23] to-[#09090B]",
          sheen: "bg-gradient-to-tr from-white/25 via-white/10 to-transparent",
        };
      case "glossy_white":
        return {
          borderColor: "border-gray-200",
          bgOverlay: "bg-gradient-to-br from-[#FFFFFF] via-[#F8FAFC] to-[#F1F5F9]",
          sheen: "bg-gradient-to-tr from-white/80 via-blue-100/30 to-transparent",
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

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Spec Label Header */}
      <div className="flex justify-between items-center text-xs border-b border-outline-variant/60 pb-2">
        <div className="flex items-center gap-2">
          <Maximize2 className="w-3.5 h-3.5 text-secondary" />
          <span className="font-mono font-semibold uppercase text-on-surface">
            {size.width}&quot; × {size.height}&quot; Specimen ({size.name})
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 border border-emerald-200">
          {material.name}
        </span>
      </div>

      {/* Die-Cut Label Specimen Mockup Canvas */}
      <div
        className="w-full flex flex-col items-center justify-center p-6 sm:p-8 bg-surface-container border border-outline-variant rounded-sm relative overflow-hidden shadow-xs select-none"
        onMouseMove={(e) => handleMoveDrag(e.clientX, e.clientY)}
        onMouseUp={handleEndDrag}
        onTouchMove={(e) => {
          if (e.touches[0]) handleMoveDrag(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handleEndDrag}
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Dynamic Label Container Scaled to Aspect Ratio */}
        <div
          style={{
            aspectRatio: `${aspectRatio}`,
            maxWidth: size.width > size.height ? "360px" : "280px",
            minHeight: "220px",
          }}
          className={`w-full rounded-[2px] border-2 ${finish.borderColor} ${finish.bgOverlay} p-6 relative flex flex-col justify-between items-center text-center shadow-lg transition-colors duration-300 overflow-hidden group`}
        >
          {/* Metallic Sheen Angle Reflex */}
          <div className={`absolute inset-0 pointer-events-none opacity-60 ${finish.sheen}`} />

          {/* Decorative Border Frame Overlays */}
          {borderStyle === "outer_edge" && (
            <div
              className="absolute inset-0 pointer-events-none border-[3px] z-20"
              style={{ borderColor: textColorHex }}
            />
          )}
          {borderStyle === "inner_edge" && (
            <div
              className="absolute inset-1.5 pointer-events-none rounded-xs border-2 z-20"
              style={{ borderColor: textColorHex }}
            />
          )}
          {borderStyle === "inset_margin" && (
            <div
              className="absolute inset-4 pointer-events-none rounded-xs border-2 z-20"
              style={{ borderColor: textColorHex }}
            />
          )}

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
            /* Standard Interactive Canvas Typography View */
            <>
              {/* 1. TOP: Brand Logo / Monogram (Independent Draggable & Resizable) */}
              <div
                style={{
                  transform: `translate(${brandPos.x}px, ${brandPos.y}px) scale(${brandScale})`,
                  transformOrigin: "center center",
                }}
                onMouseDown={(e) => handleStartDrag("brand", e.clientX, e.clientY)}
                onTouchStart={(e) => {
                  if (e.touches[0]) handleStartDrag("brand", e.touches[0].clientX, e.touches[0].clientY);
                }}
                className="relative z-30 inline-flex flex-col items-center pt-1 cursor-grab active:cursor-grabbing hover:outline hover:outline-dashed hover:outline-[#2B5F4A]/60 px-2 py-0.5 transition-all group/item rounded-xs max-w-full"
                title="Arrastra para mover. Usa la esquina para cambiar tamaño."
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Brand Logo"
                    className="max-h-12 max-w-[140px] object-contain filter drop-shadow mb-1 pointer-events-none"
                  />
                ) : (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onBrandNameChange?.(e.currentTarget.innerText)}
                    style={{ fontFamily, color: textColorHex }}
                    className={`text-[11px] font-bold uppercase tracking-[0.25em] outline-none cursor-text ${getWhitespaceClass(brandName)}`}
                  >
                    {brandName || "STUDIO BRAND"}
                  </div>
                )}
                <div className="w-8 h-[1px] bg-gray-400/40 my-1 pointer-events-none" />

                {/* Corner Resize Handle */}
                <div
                  onMouseDown={(e) => handleStartResize("brand", e.clientX, e.clientY, e)}
                  onTouchStart={(e) => {
                    if (e.touches[0]) handleStartResize("brand", e.touches[0].clientX, e.touches[0].clientY, e);
                  }}
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white border border-[#2B5F4A] rounded-full shadow-xs cursor-nwse-resize opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center z-40"
                  title="Arrastra de la esquina para cambiar el tamaño"
                >
                  <span className="w-1.5 h-1.5 bg-[#2B5F4A] rounded-full" />
                </div>
              </div>

              {/* CENTER WRAPPER: Holds Fragrance Name & Subtitle right next to each other in the center by default */}
              <div className="relative z-30 flex flex-col items-center justify-center my-auto space-y-1 w-full pointer-events-none">
                {/* 2. CENTER A: Fragrance Name (Distinct Draggable & Resizable Element) */}
                <div
                  style={{
                    transform: `translate(${fragrancePos.x}px, ${fragrancePos.y}px) scale(${fragranceScale})`,
                    transformOrigin: "center center",
                  }}
                  onMouseDown={(e) => handleStartDrag("fragrance", e.clientX, e.clientY)}
                  onTouchStart={(e) => {
                    if (e.touches[0]) handleStartDrag("fragrance", e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  className="relative z-30 inline-flex flex-col items-center py-0.5 cursor-grab active:cursor-grabbing hover:outline hover:outline-dashed hover:outline-[#2B5F4A]/60 px-2.5 py-0.5 transition-all group/item rounded-xs max-w-full pointer-events-auto"
                  title="Arrastra para mover el nombre del perfume. Tira de la esquina para tamaño."
                >
                  <h4
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => onFragranceNameChange?.(e.currentTarget.innerText)}
                    style={{ fontFamily, color: textColorHex }}
                    className={`text-lg font-bold uppercase tracking-widest outline-none cursor-text ${getWhitespaceClass(fragranceName)}`}
                  >
                    {fragranceName || "FRAGRANCE NAME"}
                  </h4>

                  {/* Corner Resize Handle */}
                  <div
                    onMouseDown={(e) => handleStartResize("fragrance", e.clientX, e.clientY, e)}
                    onTouchStart={(e) => {
                      if (e.touches[0]) handleStartResize("fragrance", e.touches[0].clientX, e.touches[0].clientY, e);
                    }}
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white border border-[#2B5F4A] rounded-full shadow-xs cursor-nwse-resize opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center z-40"
                    title="Arrastra de la esquina para cambiar el tamaño del nombre"
                  >
                    <span className="w-1.5 h-1.5 bg-[#2B5F4A] rounded-full" />
                  </div>
                </div>

                {/* 3. CENTER B: Custom Subtitle Below Name (Distinct Draggable & Resizable Element) */}
                {customText !== undefined && (
                  <div
                    style={{
                      transform: `translate(${customPos.x}px, ${customPos.y}px) scale(${customScale})`,
                      transformOrigin: "center center",
                    }}
                    onMouseDown={(e) => handleStartDrag("custom", e.clientX, e.clientY)}
                    onTouchStart={(e) => {
                      if (e.touches[0]) handleStartDrag("custom", e.touches[0].clientX, e.touches[0].clientY);
                    }}
                    className="relative z-30 inline-flex flex-col items-center py-0.5 cursor-grab active:cursor-grabbing hover:outline hover:outline-dashed hover:outline-[#2B5F4A]/60 px-2 py-0.5 transition-all group/item rounded-xs max-w-full pointer-events-auto"
                    title="Arrastra para mover el subtítulo de abajo. Tira de la esquina para tamaño."
                  >
                    <p
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => onCustomTextChange?.(e.currentTarget.innerText)}
                      style={{ fontFamily, color: textColorHex }}
                      className={`text-[10px] font-medium tracking-wide uppercase opacity-90 outline-none cursor-text ${getWhitespaceClass(customText)}`}
                    >
                      {customText}
                    </p>

                    {/* Corner Resize Handle */}
                    <div
                      onMouseDown={(e) => handleStartResize("custom", e.clientX, e.clientY, e)}
                      onTouchStart={(e) => {
                        if (e.touches[0]) handleStartResize("custom", e.touches[0].clientX, e.touches[0].clientY, e);
                      }}
                      className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white border border-[#2B5F4A] rounded-full shadow-xs cursor-nwse-resize opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center z-40"
                      title="Arrastra de la esquina para cambiar el tamaño del subtítulo"
                    >
                      <span className="w-1.5 h-1.5 bg-[#2B5F4A] rounded-full" />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. BOTTOM: Volume / Formulation Line (Independent Draggable & Resizable) */}
              <div
                style={{
                  transform: `translate(${volumePos.x}px, ${volumePos.y}px) scale(${volumeScale})`,
                  transformOrigin: "center center",
                }}
                onMouseDown={(e) => handleStartDrag("volume", e.clientX, e.clientY)}
                onTouchStart={(e) => {
                  if (e.touches[0]) handleStartDrag("volume", e.touches[0].clientX, e.touches[0].clientY);
                }}
                className="relative z-30 inline-flex flex-col items-center pb-1 border-t border-gray-400/30 pt-1.5 cursor-grab active:cursor-grabbing hover:outline hover:outline-dashed hover:outline-[#2B5F4A]/60 px-2 py-0.5 transition-all group/item rounded-xs max-w-full"
                title="Arrastra para mover volumen. Usa la esquina para cambiar tamaño."
              >
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => onVolumeTextChange?.(e.currentTarget.innerText)}
                  style={{ fontFamily, color: textColorHex }}
                  className={`text-[9px] font-mono tracking-widest uppercase opacity-80 outline-none cursor-text ${getWhitespaceClass(volumeText)}`}
                >
                  {volumeText}
                </div>

                {/* Corner Resize Handle */}
                <div
                  onMouseDown={(e) => handleStartResize("volume", e.clientX, e.clientY, e)}
                  onTouchStart={(e) => {
                    if (e.touches[0]) handleStartResize("volume", e.touches[0].clientX, e.touches[0].clientY, e);
                  }}
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white border border-[#2B5F4A] rounded-full shadow-xs cursor-nwse-resize opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center z-40"
                  title="Arrastra de la esquina para cambiar el tamaño"
                >
                  <span className="w-1.5 h-1.5 bg-[#2B5F4A] rounded-full" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Canvas Drag, Resize & Undo/Redo Control Bar */}
      {!designUrl && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 bg-gray-50 p-2.5 border border-gray-200 rounded">
          <span className="text-[10px] text-gray-600 font-medium flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-[#2B5F4A]" />
            Líneas independientes • Tira del punto verde para tamaño • <strong>Ctrl + Z para deshacer</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="text-[10px] font-semibold text-gray-700 hover:text-gray-900 disabled:opacity-40 flex items-center gap-1 bg-white px-2 py-1 border border-gray-200 hover:border-gray-300 transition shadow-2xs cursor-pointer"
              title="Deshacer (Ctrl + Z)"
            >
              <Undo2 className="w-3 h-3" /> Deshacer
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="text-[10px] font-semibold text-gray-700 hover:text-gray-900 disabled:opacity-40 flex items-center gap-1 bg-white px-2 py-1 border border-gray-200 hover:border-gray-300 transition shadow-2xs cursor-pointer"
              title="Rehacer (Ctrl + Y)"
            >
              <Redo2 className="w-3 h-3" /> Rehacer
            </button>
            <button
              type="button"
              onClick={handleResetPositions}
              className="text-[10px] font-semibold text-[#2B5F4A] hover:text-[#1e4435] flex items-center gap-1 bg-white px-2 py-1 border border-gray-200 hover:border-[#2B5F4A] transition shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Restablecer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
