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
    id: "mat_gold_foil",
    name: "Metallic Gold Foil + Premium Vinyl",
    description: "Reflective laboratory-grade gold foil on waterproof matte vinyl backing.",
    active: true,
    materialCostPerSqIn: 0.00460,
    productionCost: 0.05,
    additionalCost: 0.04,
    hexColorPreview: "#E5A93C",
    finishType: "gold_foil",
  },
  {
    id: "mat_silver_foil",
    name: "Metallic Silver Chrome Foil + Vinyl",
    description: "Sleek mirrored silver foil resistant to perfume oils and alcohol solvents.",
    active: true,
    materialCostPerSqIn: 0.00460,
    productionCost: 0.05,
    additionalCost: 0.04,
    hexColorPreview: "#D1D5DB",
    finishType: "silver_foil",
  },
  {
    id: "mat_rosegold_foil",
    name: "Rose Gold Foil + Satin Vinyl",
    description: "Warm copper-pink metallic foil with luxurious artisanal luster.",
    active: true,
    materialCostPerSqIn: 0.00480,
    productionCost: 0.05,
    additionalCost: 0.05,
    hexColorPreview: "#E09F8F",
    finishType: "rose_gold_foil",
  },
  {
    id: "mat_holo_foil",
    name: "Prismatic Holographic Foil",
    description: "Dynamic rainbow-shifting security foil with anti-counterfeiting sheen.",
    active: true,
    materialCostPerSqIn: 0.00510,
    productionCost: 0.06,
    additionalCost: 0.06,
    hexColorPreview: "#818CF8",
    finishType: "holographic",
  },
  {
    id: "mat_matte_vinyl",
    name: "Matte Black / White Waterproof Vinyl",
    description: "Ultra-crisp high-density polymer vinyl, oil-proof and scratch-resistant.",
    active: true,
    materialCostPerSqIn: 0.00250,
    productionCost: 0.03,
    additionalCost: 0.0,
    hexColorPreview: "#18181B",
    finishType: "matte_vinyl",
  },
];

// Single source of truth: 25 labels removed. Minimum order quantity is 50.
export const STANDARD_LABEL_QUANTITIES = [50, 100, 250, 500, 1000];

export interface CustomLabelPricingTier {
  quantity: number;
  totalPrice: number;
  unitPrice: number;
  active: boolean;
}

export const OFFICIAL_LABEL_PRICING_TIERS: CustomLabelPricingTier[] = [
  { quantity: 50, totalPrice: 12.50, unitPrice: 0.25, active: true },
  { quantity: 100, totalPrice: 22.00, unitPrice: 0.22, active: true },
  { quantity: 250, totalPrice: 50.00, unitPrice: 0.20, active: true },
  { quantity: 500, totalPrice: 90.00, unitPrice: 0.18, active: true },
  { quantity: 1000, totalPrice: 160.00, unitPrice: 0.16, active: true },
];
