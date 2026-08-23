import { BASE_SHEET_CONFIG, STANDARD_LABEL_MATERIALS } from "@/config/custom-labels";
import { LabelCostBreakdown, LabelMaterial } from "@/types/custom-label";
import { calculateLabelSheetYield } from "./sheet-calculator";

export interface CustomLabelPricingConfig {
  wasteFactor?: number;
  laborRatePerSheet?: number;
  packagingCost?: number;
  targetGrossMargin?: number; // default 0.45 (45%)
}

/**
 * Calculates detailed internal manufacturing cost for custom labels (Admin view).
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
  const targetGrossMargin = config.targetGrossMargin ?? 0.45;

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

  // Calculate selling price with volume discounts and margin floor
  const baseSellingPrice = totalCost / (1 - targetGrossMargin);

  // Volume discount scale based on batch size
  let volumeMultiplier = 1.0;
  if (quantity >= 1000) volumeMultiplier = 0.70;
  else if (quantity >= 500) volumeMultiplier = 0.75;
  else if (quantity >= 250) volumeMultiplier = 0.82;
  else if (quantity >= 100) volumeMultiplier = 0.88;
  else if (quantity >= 50) volumeMultiplier = 0.94;

  let calculatedPrice = Math.max(totalCost * 1.35, baseSellingPrice * volumeMultiplier); // Ensure 35% minimum margin floor
  const sellingPrice = Math.round(calculatedPrice * 100) / 100;
  const unitPrice = Math.round((sellingPrice / quantity) * 1000) / 1000;

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
 * Public facing price calculator for storefront customers.
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
  const breakdown = calculateLabelCost(width, height, quantity, material);

  // Compare to base 25-unit price to calculate savings %
  const base25 = calculateLabelCost(width, height, 25, material);
  const baselineUnitPrice = base25.unitPrice;
  const savingsPercent = Math.max(
    0,
    Math.round(((baselineUnitPrice - breakdown.unitPrice) / baselineUnitPrice) * 100)
  );

  return {
    unitPrice: breakdown.unitPrice,
    totalPrice: breakdown.sellingPrice,
    materialName: material.name,
    volumeTierSavingsPercent: savingsPercent,
  };
}
