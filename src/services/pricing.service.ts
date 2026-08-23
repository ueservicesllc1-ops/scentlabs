import { CartItem, Product } from "@/types";

export interface PricingCalculationResult {
  subtotal: number;
  discountTotal: number;
  discount?: number;
  effectiveDiscountPercentage: number;
  totalBeforeShipping: number;
  appliedDiscounts: {
    cartItemId: string;
    productName: string;
    originalPrice: number;
    discountedPrice: number;
    savings: number;
    marginGuarded: boolean;
  }[];
}

/**
 * Validates whether a proposed discount violates the required minimum gross margin.
 * Rule: Selling Price after discount must be >= Unit Cost / (1 - minimumMargin)
 */
export function checkMarginGuard(
  costPerUnit: number,
  regularPricePerUnit: number,
  requestedDiscountPercent: number, // e.g. 0.20 for 20%
  minimumRequiredMargin: number = 0.25 // default 25% minimum margin
): {
  allowedDiscountPercent: number;
  isGuarded: boolean;
  finalPricePerUnit: number;
} {
  const floorPricePerUnit = costPerUnit / (1 - minimumRequiredMargin);
  const potentialPrice = regularPricePerUnit * (1 - requestedDiscountPercent);

  if (potentialPrice >= floorPricePerUnit) {
    return {
      allowedDiscountPercent: requestedDiscountPercent,
      isGuarded: false,
      finalPricePerUnit: potentialPrice,
    };
  }

  // Margin is too narrow; adjust discount to exact floor
  const maxPossibleDiscount = Math.max(0, (regularPricePerUnit - floorPricePerUnit) / regularPricePerUnit);
  return {
    allowedDiscountPercent: maxPossibleDiscount,
    isGuarded: true,
    finalPricePerUnit: Math.max(floorPricePerUnit, regularPricePerUnit * (1 - maxPossibleDiscount)),
  };
}

/**
 * Calculates cart totals including the 20% OFF for 3+ packages rule,
 * guarded strictly by individual product margin thresholds.
 */
export function calculateCartSummary(
  items: CartItem[],
  productCostLookup: Record<string, { totalUnitCost: number; discountEligible: boolean; minimumDiscountMargin: number }>
): PricingCalculationResult {
  let subtotal = 0;
  let discountTotal = 0;
  const appliedDiscounts: PricingCalculationResult["appliedDiscounts"] = [];

  for (const item of items) {
    const lineTotal = item.packagePrice * item.packageCount;
    subtotal += lineTotal;

    const costInfo = productCostLookup[item.productId];
    
    // Rule: 20% OFF for 3+ packages if discountEligible
    if (item.packageCount >= 3 && costInfo?.discountEligible) {
      const requestedDiscount = 0.20; // 20% OFF
      const costPerUnit = costInfo.totalUnitCost;
      const unitPrice = item.unitPrice;
      const marginGuard = costInfo.minimumDiscountMargin || 0.25;

      const { allowedDiscountPercent, isGuarded } = checkMarginGuard(
        costPerUnit,
        unitPrice,
        requestedDiscount,
        marginGuard
      );

      if (allowedDiscountPercent > 0) {
        const itemDiscount = lineTotal * allowedDiscountPercent;
        discountTotal += itemDiscount;
        appliedDiscounts.push({
          cartItemId: item.id,
          productName: item.productName,
          originalPrice: lineTotal,
          discountedPrice: lineTotal - itemDiscount,
          savings: itemDiscount,
          marginGuarded: isGuarded,
        });
      }
    }
  }

  const effectiveDiscountPercentage = subtotal > 0 ? (discountTotal / subtotal) * 100 : 0;
  const totalBeforeShipping = subtotal - discountTotal;

  return {
    subtotal,
    discountTotal,
    effectiveDiscountPercentage,
    totalBeforeShipping,
    appliedDiscounts,
  };
}
