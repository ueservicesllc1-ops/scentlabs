"use client";

import React, { useState, useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { calculateBoxCost } from "@/lib/packaging/box-cost";
import { Box, Check, ShoppingBag, Sparkles, Layers, Sliders } from "lucide-react";

interface PresetSize {
  id: string;
  name: string;
  bottleType: string;
  width: number;
  height: number;
  depth: number;
}

const PRESET_SIZES: PresetSize[] = [
  {
    id: "preset_10ml",
    name: "10ml Roll-On",
    bottleType: "Fits standard 10ml glass roll-ons",
    width: 0.95,
    height: 3.65,
    depth: 0.95,
  },
  {
    id: "preset_30ml",
    name: "30ml Atomizer",
    bottleType: "Fits standard 30ml spray bottles",
    width: 1.65,
    height: 4.85,
    depth: 1.65,
  },
  {
    id: "preset_50ml",
    name: "50ml Bottle",
    bottleType: "Fits medium 50ml square / cylinder bottles",
    width: 2.10,
    height: 5.20,
    depth: 2.10,
  },
  {
    id: "preset_100ml",
    name: "100ml Flask",
    bottleType: "Fits large 100ml presentation bottles",
    width: 2.50,
    height: 6.00,
    depth: 2.50,
  },
];

const MATERIALS = [
  {
    id: "mat_white",
    name: "110 lb Smooth White Cardstock",
    desc: "Clean, bright white presentation surface",
    color: "#FFFFFF",
    borderColor: "#E5E5E5",
    costPerSheet: 0.0999,
  },
  {
    id: "mat_kraft",
    name: "110 lb Natural Brown Kraft",
    desc: "Rustic unbleached virgin kraft cardstock",
    color: "#E8D8C3",
    borderColor: "#C5B29B",
    costPerSheet: 0.12,
  },
];

const QUANTITY_OPTIONS = [25, 50, 100, 250, 500];

export function CustomBoxCalculator() {
  const { addItem } = useCart();

  // Dimension States
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset_10ml");
  const [width, setWidth] = useState<number>(0.95);
  const [height, setHeight] = useState<number>(3.65);
  const [depth, setDepth] = useState<number>(0.95);
  const [unit, setUnit] = useState<"in" | "cm">("in");

  // Material & Quantity States
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("mat_white");
  const [quantity, setQuantity] = useState<number>(50);
  const [added, setAdded] = useState(false);

  const activeMaterial = MATERIALS.find((m) => m.id === selectedMaterialId) || MATERIALS[0];

  const handleSelectPreset = (preset: PresetSize) => {
    setSelectedPresetId(preset.id);
    setWidth(preset.width);
    setHeight(preset.height);
    setDepth(preset.depth);
  };

  const handleCustomDimensionChange = (dimension: "w" | "h" | "d", val: number) => {
    setSelectedPresetId("custom");
    if (dimension === "w") setWidth(Math.max(0.5, Math.min(8.0, val)));
    if (dimension === "h") setHeight(Math.max(1.0, Math.min(10.0, val)));
    if (dimension === "d") setDepth(Math.max(0.5, Math.min(8.0, val)));
  };

  // Calculate box flat unfolded footprint on an 8.5" x 11" sheet
  // Flat pattern: Width = 2*W + 2*D + glue flap (0.5"), Height = H + 2*D + tuck flaps (1.0")
  const flatWidth = 2 * width + 2 * depth + 0.5;
  const flatHeight = height + 2 * depth + 1.0;

  // How many fit on 8.5 x 11 sheet (approximate layout yield)
  const sheetsRequiredPerBox = useMemo(() => {
    const fitsOneSheet = flatWidth <= 8.5 && flatHeight <= 11.0;
    if (!fitsOneSheet) return 1.5; // Requires larger or 2 sheets
    const fitsTwoPerSheet = (flatWidth <= 4.25 && flatHeight <= 11.0) || (flatWidth <= 8.5 && flatHeight <= 5.5);
    if (fitsTwoPerSheet) return 0.5;
    return 1.0;
  }, [flatWidth, flatHeight]);

  // Pricing calculation
  const pricingBreakdown = useMemo(() => {
    const cost = calculateBoxCost({
      sheetsRequiredPerBox,
      costPerSheet: activeMaterial.costPerSheet,
      laborCostPerBox: 0.08,
      wasteFactorPercent: 0.08,
      packagingCostPerBox: 0.04,
      targetGrossMargin: 0.45,
    });

    // Volume tier multiplier
    let volumeDiscount = 1.0;
    if (quantity >= 500) volumeDiscount = 0.70;
    else if (quantity >= 250) volumeDiscount = 0.75;
    else if (quantity >= 100) volumeDiscount = 0.85;
    else if (quantity >= 50) volumeDiscount = 0.92;

    const unitPrice = Math.max(0.28, Math.round(cost.suggestedPrice * volumeDiscount * 100) / 100);
    const totalPrice = Math.round(unitPrice * quantity * 100) / 100;

    return {
      unitPrice,
      totalPrice,
      unitCost: cost.unitCost,
      marginPercent: cost.marginPercent,
    };
  }, [sheetsRequiredPerBox, activeMaterial, quantity]);

  const handleAddToCart = () => {
    const sizeName = `${width}" × ${height}" × ${depth}"`;
    const boxProduct: any = {
      id: `custom_box_${Date.now()}`,
      name: `Custom Perfume Box (${sizeName} · ${activeMaterial.name})`,
      slug: "custom-perfume-boxes",
      category: "packaging",
      sku: `BOX-CUSTOM-${width}X${height}X${depth}`,
      basePrice: pricingBreakdown.totalPrice,
      currency: "USD",
      packageOptions: [
        {
          id: `pkg_box_${quantity}u`,
          name: `${quantity} Custom Fit Boxes`,
          quantity,
          price: pricingBreakdown.totalPrice,
          unitPrice: pricingBreakdown.unitPrice,
        },
      ],
      media: [{ url: "/images/products/perfume-boxes.jpg", type: "image", isPrimary: true, altText: "Custom Box" }],
    };

    addItem(
      boxProduct,
      boxProduct.packageOptions[0],
      1,
      {
        isCustomItem: true,
        customBoxSpecs: {
          dimensions: sizeName,
          material: activeMaterial.name,
          quantity,
        },
      }
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 p-6 sm:p-8 shadow-sm space-y-8">
      
      {/* ── Section Header ── */}
      <div className="border-b border-gray-100 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <span className="text-[10px] font-semibold tracking-[0.2em] text-[#2B5F4A] uppercase block">
            Cricut Precision Cut & Scored
          </span>
          <h2 className="text-xl font-semibold text-gray-950 mt-1">
            Custom Perfume Box Sizer & Calculator
          </h2>
          <p className="text-xs text-gray-500 font-light mt-0.5">
            Ingresa las medidas exactas de tu frasco o selecciona un formato predeterminado. El precio se calcula al instante.
          </p>
        </div>
        <span className="text-[10px] font-mono text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 border border-emerald-200">
          Instant Sizing
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Left Column: Controls (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Quick Presets */}
          <div className="space-y-3">
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-900 block">
              1. Selecciona Formato de Frasco (o ingresa a la medida):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_SIZES.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 text-left transition border ${
                      isSelected
                        ? "bg-[#F6FAF8] text-gray-950 border-[#2B5F4A] shadow-xs"
                        : "bg-white text-gray-800 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-xs font-semibold block">{preset.name}</span>
                    <span className={`text-[10px] font-mono block mt-0.5 ${isSelected ? "text-[#2B5F4A]" : "text-gray-400"}`}>
                      {preset.width}&quot;×{preset.height}&quot;×{preset.depth}&quot;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Exact Custom Dimension Inputs */}
          <div className="p-4 bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-900">
                2. Medidas Exactas de la Caja ({unit === "in" ? "Pulgadas" : "Centímetros"}):
              </span>
              <button
                type="button"
                onClick={() => setUnit(unit === "in" ? "cm" : "in")}
                className="text-[10px] font-semibold text-[#2B5F4A] uppercase underline"
              >
                Cambiar a {unit === "in" ? "Centímetros (cm)" : "Pulgadas (in)"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Width */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-medium block">
                  Ancho ({unit === "in" ? "Width in" : "cm"}):
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="8.0"
                  value={unit === "in" ? width : +(width * 2.54).toFixed(2)}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 1.0;
                    handleCustomDimensionChange("w", unit === "in" ? v : v / 2.54);
                  }}
                  className="w-full text-xs p-2 bg-white border border-gray-200 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              {/* Height */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-medium block">
                  Alto ({unit === "in" ? "Height in" : "cm"}):
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="10.0"
                  value={unit === "in" ? height : +(height * 2.54).toFixed(2)}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 1.0;
                    handleCustomDimensionChange("h", unit === "in" ? v : v / 2.54);
                  }}
                  className="w-full text-xs p-2 bg-white border border-gray-200 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              {/* Depth */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-medium block">
                  Profundidad ({unit === "in" ? "Depth in" : "cm"}):
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="8.0"
                  value={unit === "in" ? depth : +(depth * 2.54).toFixed(2)}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 1.0;
                    handleCustomDimensionChange("d", unit === "in" ? v : v / 2.54);
                  }}
                  className="w-full text-xs p-2 bg-white border border-gray-200 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Material Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-900 block">
              3. Tipo de Cartulina:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MATERIALS.map((mat) => {
                const isSelected = selectedMaterialId === mat.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setSelectedMaterialId(mat.id)}
                    className={`p-3.5 text-left transition border flex items-center justify-between ${
                      isSelected
                        ? "bg-[#F6FAF8] text-gray-950 border-[#2B5F4A] shadow-xs"
                        : "bg-white text-gray-800 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          background: mat.color,
                          border: `1px solid ${mat.borderColor}`,
                        }}
                      />
                      <div>
                        <span className="text-xs font-semibold block">{mat.name}</span>
                        <span className="text-[10px] text-gray-500 font-light">{mat.desc}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#2B5F4A] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Batch Quantity */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-900 block">
                4. Cantidad de Cajas (Batch):
              </label>
              <span className="text-[10px] text-gray-400">Descuentos por volumen incluidos</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {QUANTITY_OPTIONS.map((qty) => {
                const isSelected = quantity === qty;
                return (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className={`p-2.5 text-center transition border ${
                      isSelected
                        ? "bg-[#F6FAF8] text-gray-950 border-[#2B5F4A] shadow-xs font-semibold"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-xs block">{qty}</span>
                    <span className="text-[9px] text-gray-400 uppercase block">cajas</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── Right Column: 3D Visual Proof & Price Summary (5 cols) ── */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          
          {/* 3D-Styled Box Proof Card */}
          <div className="p-6 border border-gray-200 bg-gray-50 text-center space-y-4 shadow-sm">
            <div className="flex justify-between items-center text-xs border-b border-gray-200 pb-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                Visualización de Caja
              </span>
              <span className="text-[10px] font-mono text-gray-600 font-medium">
                {width}&quot; × {height}&quot; × {depth}&quot; ({(width * 2.54).toFixed(1)} × {(height * 2.54).toFixed(1)} × {(depth * 2.54).toFixed(1)} cm)
              </span>
            </div>

            {/* Simulated 3D isometric box projection */}
            <div className="py-6 flex items-center justify-center">
              <div
                style={{
                  width: Math.min(180, Math.max(70, width * 36)),
                  height: Math.min(220, Math.max(100, height * 30)),
                  background: activeMaterial.color,
                  border: `2px solid ${activeMaterial.borderColor}`,
                  boxShadow: "6px 8px 18px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "12px 8px",
                  position: "relative",
                }}
              >
                {/* Top flap crease line */}
                <div style={{ borderBottom: "1px dashed rgba(0,0,0,0.15)", width: "100%", height: 1 }} />
                
                <div className="space-y-1">
                  <div className="text-[9px] uppercase tracking-widest text-gray-400 font-semibold">SCENTLAB</div>
                  <div className="text-[10px] font-semibold text-gray-800">{width}&quot; × {height}&quot; × {depth}&quot;</div>
                  <div className="text-[8px] font-mono text-gray-500">{activeMaterial.name.split(" ")[0]} 110lb</div>
                </div>

                {/* Bottom crease line */}
                <div style={{ borderTop: "1px dashed rgba(0,0,0,0.15)", width: "100%", height: 1 }} />
              </div>
            </div>

            <p className="text-[10px] text-gray-400 font-light">
              Corte y plegado con precisión milimétrica Cricut. Se envía plegada para fácil ensamblaje manual.
            </p>
          </div>

          {/* Pricing & Checkout Summary */}
          <div className="p-6 bg-white border border-gray-200 space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-500 uppercase block">
                Precio Total del Lote ({quantity} Cajas)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-semibold text-gray-950">
                  ${pricingBreakdown.totalPrice.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  (${pricingBreakdown.unitPrice.toFixed(2)} / unidad)
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-gray-100 pt-3 text-gray-600">
              <div className="flex justify-between">
                <span>Material:</span>
                <span className="font-medium text-gray-900">{activeMaterial.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Dimensiones:</span>
                <span className="font-mono text-gray-900">{width}&quot; × {height}&quot; × {depth}&quot;</span>
              </div>
              <div className="flex justify-between">
                <span>Tiempo de despacho:</span>
                <span className="font-medium text-[#2B5F4A]">1–2 días hábiles</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              style={{
                background: added ? "#2B5F4A" : "#1A1A1A",
                color: "white",
                padding: "13px 24px",
                width: "100%",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => { if (!added) (e.target as HTMLElement).style.background = "#2B5F4A"; }}
              onMouseLeave={(e) => { if (!added) (e.target as HTMLElement).style.background = "#1A1A1A"; }}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> ¡Agregado al Carrito!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Ordenar {quantity} Cajas a la Medida
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
