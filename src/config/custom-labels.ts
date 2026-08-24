import { LabelSize, LabelMaterial } from "@/types/custom-label";

export const BASE_SHEET_CONFIG = {
  sheetWidth: 8.5, // inches
  sheetHeight: 11.0, // inches
  areaPerSheet: 93.5, // sq in
  totalBasisArea100Sheets: 9350, // sq in
  baseMaterialBasisCost100Sheets: 43.0, // $23 Vinyl + $20 Foil
  baseMaterialCostPerSquareInch: 0.00460, // ~$0.00460 / sq in
  defaultSpacing: 0.125, // 1/8" cut gap
  defaultBleed: 0.0625, // 1/16" bleed
  defaultWasteFactor: 0.10, // 10% scrap / setup allowance
  defaultLaborRatePerSheet: 0.15, // $0.15 labor per sheet weeding / handling
  defaultPackagingCostPerOrder: 1.50, // $1.50 glassine / rigid mailer
};

export const STANDARD_LABEL_SIZES: LabelSize[] = [
  {
    id: "size_1x1",
    name: "1 x 1 in",
    width: 1.0,
    height: 1.0,
    unit: "in",
    area: 1.0,
    widthCm: 2.54,
    heightCm: 2.54,
    active: true,
  },
  {
    id: "size_1x1_5",
    name: "1 x 1.5 in",
    width: 1.0,
    height: 1.5,
    unit: "in",
    area: 1.5,
    widthCm: 2.54,
    heightCm: 3.81,
    active: true,
  },
  {
    id: "size_1x2",
    name: "1 x 2 in",
    width: 1.0,
    height: 2.0,
    unit: "in",
    area: 2.0,
    widthCm: 2.54,
    heightCm: 5.08,
    active: true,
  },
  {
    id: "size_1_5x2",
    name: "1.5 x 2 in",
    width: 1.5,
    height: 2.0,
    unit: "in",
    area: 3.0,
    widthCm: 3.81,
    heightCm: 5.08,
    active: true,
  },
  {
    id: "size_1_5x2_25",
    name: "1.5 x 2.25 in",
    width: 1.5,
    height: 2.25,
    unit: "in",
    area: 3.375,
    widthCm: 3.81,
    heightCm: 5.72,
    active: true,
  },
  {
    id: "size_1_5x2_5",
    name: "1.5 x 2.5 in (10ml Roll-On)",
    width: 1.5,
    height: 2.5,
    unit: "in",
    area: 3.75,
    widthCm: 3.81,
    heightCm: 6.35,
    active: true,
  },
  {
    id: "size_2x2_5",
    name: "2 x 2.5 in",
    width: 2.0,
    height: 2.5,
    unit: "in",
    area: 5.0,
    widthCm: 5.08,
    heightCm: 6.35,
    active: true,
  },
  {
    id: "size_2x3",
    name: "2 x 3 in",
    width: 2.0,
    height: 3.0,
    unit: "in",
    area: 6.0,
    widthCm: 5.08,
    heightCm: 7.62,
    active: true,
  },
  {
    id: "size_3x3",
    name: "3 x 3 in",
    width: 3.0,
    height: 3.0,
    unit: "in",
    area: 9.0,
    widthCm: 7.62,
    heightCm: 7.62,
    active: true,
  },
];

export const STANDARD_LABEL_MATERIALS: LabelMaterial[] = [
  {
    id: "mat_black",
    name: "Matte Black Vinyl",
    description: "Fondo negro mate de alta densidad, resistente a aceites de perfumería.",
    active: true,
    materialCostPerSqIn: 0.00250,
    productionCost: 0.03,
    additionalCost: 0.0,
    hexColorPreview: "#18181B",
    finishType: "matte_black",
    priceMultiplier: 1.00,
  },
  {
    id: "mat_white",
    name: "Matte White Vinyl",
    description: "Fondo blanco puro impermeable de grado cosmético con acabado mate suave.",
    active: true,
    materialCostPerSqIn: 0.00250,
    productionCost: 0.03,
    additionalCost: 0.0,
    hexColorPreview: "#FFFFFF",
    finishType: "matte_white",
    priceMultiplier: 1.00,
  },
  {
    id: "mat_gold",
    name: "Metallic Gold Foil Substrate",
    description: "Fondo dorado metalizado de grado laboratorio con reflejo espejo premium.",
    active: true,
    materialCostPerSqIn: 0.00460,
    productionCost: 0.05,
    additionalCost: 0.04,
    hexColorPreview: "#E5A93C",
    finishType: "gold_foil",
    priceMultiplier: 1.15,
  },
  {
    id: "mat_silver",
    name: "Metallic Silver Chrome Substrate",
    description: "Fondo plateado cromo metalizado resistente a solventes de alcohol.",
    active: true,
    materialCostPerSqIn: 0.00460,
    productionCost: 0.05,
    additionalCost: 0.04,
    hexColorPreview: "#D1D5DB",
    finishType: "silver_foil",
    priceMultiplier: 1.15,
  },
];

export interface LabelTextColorOption {
  id: string;
  name: string;
  hex: string;
  type: "black" | "white" | "gold" | "silver";
  multiplier: number;
}

export const LABEL_TEXT_COLORS: LabelTextColorOption[] = [
  { id: "txt_gold", name: "Metallic Gold Foil Text", hex: "#E5A93C", type: "gold", multiplier: 1.15 },
  { id: "txt_silver", name: "Metallic Silver Chrome Text", hex: "#D1D5DB", type: "silver", multiplier: 1.15 },
  { id: "txt_black", name: "High-Density Black Ink Text", hex: "#18181B", type: "black", multiplier: 1.00 },
  { id: "txt_white", name: "Pure White Ink Text", hex: "#FFFFFF", type: "white", multiplier: 1.00 },
];

// Single source of truth: Minimum order quantity is 50. Quantities: 50, 100, 250, 500, 1000.
export const STANDARD_LABEL_QUANTITIES = [50, 100, 250, 500, 1000];

export interface LabelBasePricingRow {
  sizeId: string;
  width: number;
  height: number;
  name: string;
  prices: Record<number, number>;
}

/**
 * BASE PRICING MATRIX (Matte Black / White Waterproof Vinyl = 1.00x)
 */
export const BASE_LABEL_PRICING_MATRIX: LabelBasePricingRow[] = [
  { sizeId: "size_1x1", width: 1.0, height: 1.0, name: "1\" × 1\"", prices: { 50: 12.50, 100: 20.00, 250: 40.00, 500: 70.00, 1000: 120.00 } },
  { sizeId: "size_1x1_5", width: 1.0, height: 1.5, name: "1\" × 1.5\"", prices: { 50: 13.50, 100: 22.00, 250: 45.00, 500: 78.00, 1000: 135.00 } },
  { sizeId: "size_1x2", width: 1.0, height: 2.0, name: "1\" × 2\"", prices: { 50: 15.00, 100: 24.00, 250: 50.00, 500: 85.00, 1000: 145.00 } },
  { sizeId: "size_1_5x2", width: 1.5, height: 2.0, name: "1.5\" × 2\"", prices: { 50: 17.50, 100: 28.00, 250: 58.00, 500: 98.00, 1000: 165.00 } },
  { sizeId: "size_1_5x2_25", width: 1.5, height: 2.25, name: "1.5\" × 2.25\"", prices: { 50: 18.50, 100: 30.00, 250: 62.00, 500: 105.00, 1000: 175.00 } },
  { sizeId: "size_1_5x2_5", width: 1.5, height: 2.5, name: "1.5\" × 2.5\"", prices: { 50: 20.00, 100: 32.00, 250: 65.00, 500: 110.00, 1000: 185.00 } },
  { sizeId: "size_2x2_5", width: 2.0, height: 2.5, name: "2\" × 2.5\"", prices: { 50: 22.00, 100: 35.00, 250: 72.00, 500: 120.00, 1000: 200.00 } },
  { sizeId: "size_2x3", width: 2.0, height: 3.0, name: "2\" × 3\"", prices: { 50: 23.50, 100: 38.00, 250: 78.00, 500: 130.00, 1000: 215.00 } },
  { sizeId: "size_3x3", width: 3.0, height: 3.0, name: "3\" × 3\"", prices: { 50: 25.00, 100: 42.00, 250: 85.00, 500: 145.00, 1000: 240.00 } },
];

export interface CustomLabelPricingTier {
  quantity: number;
  totalPrice: number;
  unitPrice: number;
  active: boolean;
}

export const OFFICIAL_LABEL_PRICING_TIERS: CustomLabelPricingTier[] = [
  { quantity: 50, totalPrice: 20.00, unitPrice: 0.40, active: true },
  { quantity: 100, totalPrice: 32.00, unitPrice: 0.32, active: true },
  { quantity: 250, totalPrice: 65.00, unitPrice: 0.26, active: true },
  { quantity: 500, totalPrice: 110.00, unitPrice: 0.22, active: true },
  { quantity: 1000, totalPrice: 185.00, unitPrice: 0.185, active: true },
];
