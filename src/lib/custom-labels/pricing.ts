import { 
  BASE_SHEET_CONFIG, 
  STANDARD_LABEL_MATERIALS, 
  OFFICIAL_LABEL_PRICING_TIERS 
} from "@/config/custom-labels";
import { LabelCostBreakdown, LabelMaterial } from "@/types/custom-label";
import { calculateLabelSheetYield } from "./sheet-calculator";

export interface CustomLabelPricingConfig {
  wasteFactor?: number;
  laborRatePerSheet?: number;
  packagingCost?: number;
  targetGrossMargin?: number;
}

/**
 * Calculates internal manufacturing cost for custom labels (Admin breakdown).
 */
export function calculateLabelCost(
  width: number,
  height: number,
  quantity: number,
  material: LabelMaterial,
  config: CustomLabelPricingConfig = {}
): LabelCostBreakdown {
  const wasteFactor = config.wasteFactor ?? BASE_SHEET_CONFIG.defaultWasteFactor;
  const laborRate = config.laborRatePerSheet ?? BASE_SHEET_CONFIG.defaultLaborRatePerSheet;
  const packagingCost = config.packagingCost ?? BASE_SHEET_CONFIG.defaultPackagingCostPerOrder;

  const areaPerLabel = width * height;
  const rawMaterialCost = areaPerLabel * material.materialCostPerSqIn * quantity;
  const wasteCost = rawMaterialCost * wasteFactor;
  const totalMaterialWithWaste = rawMaterialCost + wasteCost;

  // Sheet calculations for labor & machine setup
  const sheetYield = calculateLabelSheetYield(width, height, quantity);
  const sheetsNeeded = sheetYield.estimatedSheetsRequired;

  const productionCost = (material.productionCost + material.additionalCost) * quantity;
  const laborCost = sheetsNeeded * laborRate;

  const totalCost = Math.round((totalMaterialWithWaste + productionCost + laborCost + packagingCost) * 100) / 100;
  const unitCost = Math.round((totalCost / Math.max(1, quantity)) * 1000) / 1000;

  // Match selling price with official tier pricing
  const pricing = calculateLabelPricing(width, height, quantity, material.id);
  const sellingPrice = pricing.totalPrice;
  const unitPrice = pricing.unitPrice;

  const grossMarginDollar = Math.round((sellingPrice - totalCost) * 100) / 100;
  const grossMarginPercent = Math.round((grossMarginDollar / Math.max(1, sellingPrice)) * 1000) / 10;

  return {
    labelWidth: width,
    labelHeight: height,
    areaPerLabel: Math.round(areaPerLabel * 100) / 100,
    quantity,
    materialCost: Math.round(totalMaterialWithWaste * 100) / 100,
    wasteFactor,
    wasteCost: Math.round(wasteCost * 100) / 100,
    productionCost: Math.round(productionCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    packagingCost: Math.round(packagingCost * 100) / 100,
    totalCost,
    unitCost,
    sellingPrice,
    unitPrice,
    grossMarginDollar,
    grossMarginPercent,
  };
}

/**
 * SINGLE SOURCE OF TRUTH for Custom Label Pricing across SCENTLAB.
 *
 * Official Tiers:
 * - 50 LABELS:   $12.50 ($0.25 / label)
 * - 100 LABELS:  $22.00 ($0.22 / label)
 * - 250 LABELS:  $50.00 ($0.20 / label)
 * - 500 LABELS:  $90.00 ($0.18 / label)
 * - 1000 LABELS: $160.00 ($0.16 / label)
 */
export function calculateLabelPricing(
  width: number,
  height: number,
  quantity: number,
  materialId: string = "mat_gold_foil"
): {
  unitPrice: number;
  totalPrice: number;
  materialName: string;
  volumeTierSavingsPercent: number;
} {
  const material = STANDARD_LABEL_MATERIALS.find((m) => m.id === materialId) || STANDARD_LABEL_MATERIALS[0];

  // Exact tier lookup
  const exactTier = OFFICIAL_LABEL_PRICING_TIERS.find((t) => t.quantity === quantity);

  let unitPrice: number;
  let totalPrice: number;

  if (exactTier) {
    unitPrice = exactTier.unitPrice;
    totalPrice = exactTier.totalPrice;
  } else {
    // Continuous volume rate for custom quantities (minimum 50 labels = $12.50)
    if (quantity < 50) {
      unitPrice = 0.25;
      totalPrice = 12.50; // Minimum order constraint ($12.50)
    } else if (quantity < 100) {
      unitPrice = 0.25;
      totalPrice = Math.round(quantity * 0.25 * 100) / 100;
    } else if (quantity < 250) {
      unitPrice = 0.22;
      totalPrice = Math.round(quantity * 0.22 * 100) / 100;
    } else if (quantity < 500) {
      unitPrice = 0.20;
      totalPrice = Math.round(quantity * 0.20 * 100) / 100;
    } else if (quantity < 1000) {
      unitPrice = 0.18;
      totalPrice = Math.round(quantity * 0.18 * 100) / 100;
    } else {
      unitPrice = 0.16;
      totalPrice = Math.round(quantity * 0.16 * 100) / 100;
    }
  }

  // Base comparison is 50-unit price ($0.25)
  const baseUnitPrice = 0.25;
  const savingsPercent = Math.max(
    0,
    Math.round(((baseUnitPrice - unitPrice) / baseUnitPrice) * 100)
  );

  return {
    unitPrice,
    totalPrice,
    materialName: material.name,
    volumeTierSavingsPercent: savingsPercent,
  };
}
