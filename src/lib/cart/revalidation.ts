import { CartItem, Product, OrderItemSnapshot } from "@/types";
import { productRepository } from "@/lib/firestore/products";
import { INITIAL_PRODUCTS, SHRINK_WRAP_VARIANTS } from "@/data/products";
import { calculateCartTotals, CartCalculationSummary } from "./totals";

export interface RevalidatedCartResult {
  valid: boolean;
  error?: string;
  items: OrderItemSnapshot[];
  summary: CartCalculationSummary;
}

/**
 * Server-side strict revalidation of cart items against real Firestore product catalog and inventory.
 * Never trusts prices, totals, or discounts provided by the browser.
 */
export async function revalidateCartItemsServerSide(
  clientItems: CartItem[],
  shippingCost: number = 0,
  taxRate: number = 0
): Promise<RevalidatedCartResult> {
  if (!clientItems || clientItems.length === 0) {
    return {
      valid: false,
      error: "Cart is empty.",
      items: [],
      summary: calculateCartTotals([], shippingCost, taxRate),
    };
  }

  const revalidatedSnapshots: OrderItemSnapshot[] = [];
  const revalidatedCartItems: CartItem[] = [];

  for (const clientItem of clientItems) {
    // 1. Fetch real product from repository (or fallback seed)
    let product: Product | null = null;
    try {
      product = await productRepository.getProductById(clientItem.productId);
    } catch {
      product = INITIAL_PRODUCTS.find((p) => p.id === clientItem.productId) || null;
    }

    if (!product) {
      return {
        valid: false,
        error: `Product with ID "${clientItem.productId}" was not found in catalog.`,
        items: [],
        summary: calculateCartTotals([], shippingCost, taxRate),
      };
    }

    // 2. Confirm product is active
    if (product.status !== "active") {
      return {
        valid: false,
        error: `Product "${product.name}" is currently ${product.status} and unavailable for purchase.`,
        items: [],
        summary: calculateCartTotals([], shippingCost, taxRate),
      };
    }

    // 3. Confirm variant if specified
    let matchingVariant = null;
    if (clientItem.selectedVariant?.id || clientItem.variantId) {
      const vId = clientItem.selectedVariant?.id || clientItem.variantId;
      matchingVariant = SHRINK_WRAP_VARIANTS.find((v) => v.id === vId);
      if (!matchingVariant && product.hasVariants) {
        return {
          valid: false,
          error: `Selected variant for "${product.name}" is no longer available.`,
          items: [],
          summary: calculateCartTotals([], shippingCost, taxRate),
        };
      }
    }

    // 4. Calculate real price and match package tier
    const requestedQty = clientItem.selectedPackage?.quantity || 1;
    const requestedCount = Math.max(1, clientItem.packageCount || 1);
    const totalUnitsNeeded = requestedQty * requestedCount;

    const availablePackageOptions = (matchingVariant
      ? matchingVariant.packageOptions
      : product.packageOptions) || [
        {
          id: "pkg_default",
          name: "Default Pack",
          quantity: requestedQty,
          price: product.basePrice,
          unitPrice: product.basePrice,
        },
      ];

    // Match exact package or closest volume tier
    const exactPackage =
      availablePackageOptions.find((p) => p.quantity === requestedQty) ||
      availablePackageOptions[0] || {
        id: "pkg_default",
        name: "Default Pack",
        quantity: requestedQty,
        price: product.basePrice,
        unitPrice: product.basePrice,
      };

    // Determine unit price
    let realUnitPrice = exactPackage.unitPrice;
    if (product.volumePricing && product.volumePricing.length > 0) {
      const sortedTiers = [...product.volumePricing].sort((a, b) => b.minQuantity - a.minQuantity);
      const tierMatch = sortedTiers.find((t) => totalUnitsNeeded >= t.minQuantity);
      if (tierMatch) {
        realUnitPrice = tierMatch.unitPrice;
      }
    }

    const realPackagePrice = Math.round(realUnitPrice * requestedQty * 100) / 100;
    const realLinePrice = Math.round(realPackagePrice * requestedCount * 100) / 100;

    // 5. Confirm inventory availability
    const availableStock =
      (matchingVariant
        ? matchingVariant.inventory?.availableQuantity
        : product.inventory?.availableQuantity) ?? 9999;

    if (totalUnitsNeeded > availableStock) {
      return {
        valid: false,
        error: `Insufficient inventory for "${product.name}". Requested ${totalUnitsNeeded} units, but only ${availableStock} are available.`,
        items: [],
        summary: calculateCartTotals([], shippingCost, taxRate),
      };
    }

    // 6. Build secure snapshot item
    const snapshotItem: OrderItemSnapshot = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      variantId: matchingVariant?.id,
      productName: product.name,
      sku: matchingVariant?.sku || product.sku,
      quantity: totalUnitsNeeded,
      unitPrice: realUnitPrice,
      totalPrice: realLinePrice,
      selectedOptions: {
        packageQuantity: requestedQty,
        packageCount: requestedCount,
        variantName: matchingVariant?.name,
      },
      customization: clientItem.customLabelSpecs
        ? {
            isCustomItem: true,
            bottleName: clientItem.customLabelSpecs.bottleName,
            dimensions: clientItem.customLabelSpecs.dimensions,
            material: clientItem.customLabelSpecs.material,
            customText: clientItem.customLabelSpecs.customText,
          }
        : undefined,
      imageSnapshot: product.media[0]?.url || "",
      isLinkedToParent: clientItem.isLinkedToParent,
      parentItemId: clientItem.parentCartItemId,
    };

    revalidatedSnapshots.push(snapshotItem);

    revalidatedCartItems.push({
      ...clientItem,
      unitPrice: realUnitPrice,
      packagePrice: realPackagePrice,
      totalLinePrice: realLinePrice,
      totalUnits: totalUnitsNeeded,
    });
  }

  // 7. Calculate final server-side totals
  const summary = calculateCartTotals(revalidatedCartItems, shippingCost, taxRate);

  return {
    valid: true,
    items: revalidatedSnapshots,
    summary,
  };
}
