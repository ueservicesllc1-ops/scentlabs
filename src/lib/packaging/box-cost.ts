import { BoxCostBreakdown } from "@/types/packaging";

export interface BoxCostParams {
  sheetsRequiredPerBox: number;
  costPerSheet?: number; // default $0.0999 (110 lb cardstock, $29.97/300 sheets)
  laborCostPerBox?: number; // default $0.08 (Cricut cutting, creasing & folding)
  wasteFactorPercent?: number; // default 8% (0.08)
  packagingCostPerBox?: number; // default $0.04 (protective cello sleeve)
  inkCostPerBox?: number; // default $0.03 (monochrome foil/ink branding)
  shippingMaterialsCost?: number; // default $0.02
  targetGrossMargin?: number; // default 0.50 (50%)
}

/**
 * Calculates detailed manufacturing cost and suggested retail price for custom Cricut boxes.
 */
export function calculateBoxCost(params: BoxCostParams): BoxCostBreakdown {
  const {
    sheetsRequiredPerBox,
    costPerSheet = 0.0999,
    laborCostPerBox = 0.08,
    wasteFactorPercent = 0.08,
    packagingCostPerBox = 0.04,
    inkCostPerBox = 0.03,
    shippingMaterialsCost = 0.02,
    targetGrossMargin = 0.50,
  } = params;

  const rawSheetCost = sheetsRequiredPerBox * costPerSheet;
  const wasteCost = rawSheetCost * wasteFactorPercent;
  const sheetCostWithWaste = rawSheetCost + wasteCost;

  const totalCost =
    Math.round(
      (sheetCostWithWaste +
        laborCostPerBox +
        packagingCostPerBox +
        inkCostPerBox +
        shippingMaterialsCost) *
        1000
    ) / 1000;

  const unitCost = totalCost;
  const suggestedPrice = Math.round((unitCost / (1 - targetGrossMargin)) * 100) / 100;
  const marginPercent = Math.round(((suggestedPrice - unitCost) / suggestedPrice) * 1000) / 10;

  return {
    sheetCost: Math.round(rawSheetCost * 1000) / 1000,
    sheetsUsed: sheetsRequiredPerBox,
    wasteFactor: wasteFactorPercent,
    wasteCost: Math.round(wasteCost * 1000) / 1000,
    inkCost: inkCostPerBox,
    productionLaborCost: laborCostPerBox,
    packagingCost: packagingCostPerBox,
    shippingMaterialsCost,
    totalCost,
    unitCost,
    suggestedPrice,
    marginPercent,
  };
}
