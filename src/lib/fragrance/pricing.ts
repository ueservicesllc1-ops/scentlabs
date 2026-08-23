import { FragranceCostBreakdown } from "@/types/fragrance";

export interface RepackagingCostParams {
  costPerOz: number;
  sellingSizeOz: number;
  bottleCost?: number;
  capCost?: number;
  labelCost?: number;
  packagingCost?: number;
  laborCost?: number;
  wasteFactorPercent?: number; // e.g. 3% (0.03)
  allocatedShippingCost?: number;
}

/**
 * Calculates complete unit manufacturing cost for a repackaged fragrance presentation.
 */
export function calculateRepackagingCost(params: RepackagingCostParams): FragranceCostBreakdown {
  const {
    costPerOz,
    sellingSizeOz,
    bottleCost = 0.65, // Standard laboratory dropper/roll-on default
    capCost = 0.15,
    labelCost = 0.18, // Custom metallic foil label
    packagingCost = 0.35, // Unit carton or sleeve
    laborCost = 0.40, // Fractioning, filling & capping labor
    wasteFactorPercent = 0.03, // 3% filling residue/waste
    allocatedShippingCost = 0.25,
  } = params;

  const rawFragranceCost = costPerOz * sellingSizeOz;
  const wasteCost = rawFragranceCost * wasteFactorPercent;
  const fragranceCost = rawFragranceCost + wasteCost;

  const totalCost =
    Math.round(
      (fragranceCost +
        bottleCost +
        capCost +
        labelCost +
        packagingCost +
        laborCost +
        allocatedShippingCost) *
        100
    ) / 100;

  return {
    fragranceCost: Math.round(fragranceCost * 1000) / 1000,
    bottleCost: Math.round(bottleCost * 100) / 100,
    capCost: Math.round(capCost * 100) / 100,
    labelCost: Math.round(labelCost * 100) / 100,
    packagingCost: Math.round(packagingCost * 100) / 100,
    laborCost: Math.round(laborCost * 100) / 100,
    wasteCost: Math.round(wasteCost * 1000) / 1000,
    allocatedShippingCost: Math.round(allocatedShippingCost * 100) / 100,
    totalCost,
  };
}

/**
 * Computes suggested retail price from total cost and target gross margin.
 */
export function calculateSuggestedRetailPrice(
  totalCost: number,
  targetMargin: number = 0.50
): number {
  if (totalCost <= 0) return 0;
  if (targetMargin >= 1) targetMargin = 0.90;
  const suggested = totalCost / (1 - targetMargin);
  return Math.round(suggested * 100) / 100;
}

/**
 * Computes gross profit, margin percentage, and flags low margin warnings (< 25%).
 */
export function calculateGrossMargin(
  retailPrice: number,
  totalCost: number,
  minimumTargetMargin: number = 0.25
): {
  grossProfit: number;
  marginPercent: number;
  isLowMargin: boolean;
} {
  const grossProfit = Math.round((retailPrice - totalCost) * 100) / 100;
  const marginPercent =
    retailPrice > 0 ? Math.round((grossProfit / retailPrice) * 1000) / 10 : 0;
  const isLowMargin = marginPercent < minimumTargetMargin * 100;

  return {
    grossProfit,
    marginPercent,
    isLowMargin,
  };
}
