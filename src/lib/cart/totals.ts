import { CartItem } from "@/types";

export interface CartCalculationSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  totalUnits: number;
  packageCount: number;
}

/**
 * Centralized deterministic calculation function for cart totals across client, checkout, and server.
 */
export function calculateCartTotals(
  items: CartItem[],
  shippingCost: number = 0,
  taxRate: number = 0
): CartCalculationSummary {
  let subtotal = 0;
  let totalUnits = 0;
  let totalPackages = 0;
  let eligibleDiscountSubtotal = 0;

  for (const item of items) {
    const lineTotal = item.packagePrice * item.packageCount;
    subtotal += lineTotal;
    totalUnits += item.totalUnits;
    totalPackages += item.packageCount;

    // By default, packaging and glass bottles allow volume discount if 3+ packs
    if (item.category !== "fragrance") {
      eligibleDiscountSubtotal += lineTotal;
    }
  }

  // 20% OFF for 3+ packages rule (guarded to maintain minimum margin floor)
  let discount = 0;
  if (totalPackages >= 3 && eligibleDiscountSubtotal > 0) {
    discount = Math.round(eligibleDiscountSubtotal * 0.20 * 100) / 100;
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * taxRate * 100) / 100;
  const total = Math.max(0, subtotal - discount + shippingCost + tax);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shipping: Math.round(shippingCost * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    totalUnits,
    packageCount: totalPackages,
  };
}
