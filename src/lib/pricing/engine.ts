import { Product } from "@/types/product";
import { ProductVariant } from "@/types/product";
import { ProductPackage, VolumePriceTier, CalculatedPriceResult } from "@/types/pricing";

export function calculatePrice(
  product: Product,
  requestedQuantity: number,
  variant?: ProductVariant
): CalculatedPriceResult {
  const packageOptions = variant?.packageOptions || product.packageOptions || [];
  const volumeTiers = variant?.volumePricing || product.volumePricing || [];
  const costPerUnit = variant?.costData?.totalUnitCost || product.costData?.totalUnitCost || 0;
  const minMargin = product.minimumDiscountMargin || 0.25;

  // 1. Check if there is an exact package match (e.g. 50 units)
  const exactPackage = packageOptions.find((p) => p.quantity === requestedQuantity);
  if (exactPackage) {
    return {
      unitPrice: exactPackage.unitPrice,
      totalPrice: exactPackage.price,
      discountAmount: 0,
      effectiveDiscountPercentage: 0,
      priceTierName: `Standard Package (${exactPackage.quantity}u)`,
      isMarginGuarded: false,
    };
  }

  // 2. Check volume pricing tiers (e.g. 100+ -> $0.25/u)
  const matchingVolumeTier = volumeTiers
    .filter((tier) => requestedQuantity >= tier.minQuantity && (!tier.maxQuantity || requestedQuantity <= tier.maxQuantity))
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  if (matchingVolumeTier) {
    const rawTotal = matchingVolumeTier.unitPrice * requestedQuantity;
    return {
      unitPrice: matchingVolumeTier.unitPrice,
      totalPrice: rawTotal,
      discountAmount: (product.basePrice * requestedQuantity) - rawTotal,
      effectiveDiscountPercentage: matchingVolumeTier.discountPercentage || 0,
      priceTierName: `Volume Tier (${matchingVolumeTier.minQuantity}+ units)`,
      isMarginGuarded: false,
    };
  }

  // 3. Fallback to base pricing with unit price interpolation
  const lowestPackage = packageOptions.sort((a, b) => a.quantity - b.quantity)[0];
  const unitPrice = lowestPackage ? lowestPackage.unitPrice : product.basePrice;
  const totalPrice = unitPrice * requestedQuantity;

  return {
    unitPrice,
    totalPrice,
    discountAmount: 0,
    effectiveDiscountPercentage: 0,
    priceTierName: "Base Pricing",
    isMarginGuarded: false,
  };
}
