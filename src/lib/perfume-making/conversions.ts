import { BaseUnit, BaseCostBreakdown } from "@/types/perfume-making";

export function convertToLiters(quantity: number, unit: BaseUnit): number {
  switch (unit) {
    case "liter":
      return quantity;
    case "gallon":
      return Math.round(quantity * 3.78541 * 10000) / 10000; // 1 US Gal = 3.78541 L
    case "ml":
      return Math.round((quantity / 1000) * 10000) / 10000;
    case "oz":
      return Math.round(quantity * 0.0295735 * 10000) / 10000;
    default:
      return quantity;
  }
}

export function calculateCostPerLiter(
  sourceCost: number,
  sourceQuantity: number,
  sourceUnit: BaseUnit
): { costPerLiter: number; costPerMl: number; totalLiters: number } {
  const totalLiters = convertToLiters(sourceQuantity, sourceUnit);
  if (totalLiters <= 0) return { costPerLiter: 0, costPerMl: 0, totalLiters: 0 };

  const costPerLiter = Math.round((sourceCost / totalLiters) * 1000) / 1000;
  const costPerMl = Math.round((costPerLiter / 1000) * 10000) / 10000;

  return { costPerLiter, costPerMl, totalLiters };
}

export function calculateBaseRepackagingCost(params: {
  costPerLiter: number;
  sellingSizeLiters: number;
  bottleCost?: number; // default $1.43 for 1L Steve Spangler Soda Bottle
  capCost?: number;
  labelCost?: number;
  packagingCost?: number;
  laborCost?: number;
  wasteFactorPercent?: number;
  shippingCost?: number;
  targetMargin?: number;
}): {
  breakdown: BaseCostBreakdown;
  unitCost: number;
  suggestedPrice: number;
  grossProfit: number;
  marginPercent: number;
} {
  const {
    costPerLiter,
    sellingSizeLiters,
    bottleCost = sellingSizeLiters >= 1 ? 1.43 : 0.65,
    capCost = 0.15,
    labelCost = 0.18,
    packagingCost = 0.35,
    laborCost = 0.50,
    wasteFactorPercent = 0.03,
    shippingCost = 0.60,
    targetMargin = 0.50,
  } = params;

  const baseLiquidCost = Math.round(costPerLiter * sellingSizeLiters * 100) / 100;
  const wasteCost = Math.round(baseLiquidCost * wasteFactorPercent * 100) / 100;

  const totalCost =
    Math.round(
      (baseLiquidCost +
        bottleCost +
        capCost +
        labelCost +
        packagingCost +
        laborCost +
        wasteCost +
        shippingCost) *
        100
    ) / 100;

  const suggestedPrice = Math.round((totalCost / (1 - targetMargin)) * 100) / 100;
  const retailPrice = sellingSizeLiters >= 1 ? 21.99 : Math.round(suggestedPrice * 100) / 100;
  const grossProfit = Math.round((retailPrice - totalCost) * 100) / 100;
  const marginPercent = Math.round((grossProfit / retailPrice) * 1000) / 10;

  const breakdown: BaseCostBreakdown = {
    baseLiquidCost,
    bottleCost,
    capCost,
    labelCost,
    packagingCost,
    laborCost,
    wasteCost,
    shippingCost,
    totalCost,
  };

  return {
    breakdown,
    unitCost: totalCost,
    suggestedPrice,
    grossProfit,
    marginPercent,
  };
}
