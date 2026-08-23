import { InventoryItem, InventoryStatus } from "@/types/inventory";

/**
 * Calculates the Weighted Average Cost (WAC) when receiving new inventory.
 * Formula: ((Current Qty * Current Avg Cost) + (Received Qty * Unit Cost)) / (Current Qty + Received Qty)
 */
export function calculateWeightedAverageCost(
  currentQuantity: number,
  currentAverageCost: number,
  receivedQuantity: number,
  receivedUnitCost: number
): number {
  if (receivedQuantity <= 0) return currentAverageCost;

  const validCurrentQty = Math.max(0, currentQuantity);
  const totalQuantity = validCurrentQty + receivedQuantity;

  if (totalQuantity === 0) return receivedUnitCost;

  const totalValue =
    validCurrentQty * currentAverageCost + receivedQuantity * receivedUnitCost;

  const weightedAvg = totalValue / totalQuantity;
  return Math.round(weightedAvg * 10000) / 10000; // 4 decimals precision
}

/**
 * Calculates stock status automatically based on available units and thresholds.
 */
export function calculateInventoryStatus(
  available: number,
  reorderPoint: number,
  lowStockThreshold: number
): InventoryStatus {
  if (available <= 0) return "out_of_stock";
  const threshold = Math.max(reorderPoint, lowStockThreshold);
  if (available <= threshold) return "low_stock";
  return "in_stock";
}

/**
 * Calculates total inventory valuation strictly from weighted average costs.
 * Never uses retail selling prices.
 */
export function calculateInventoryValuation(items: InventoryItem[]): {
  totalValuation: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
} {
  let totalValuation = 0;
  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const item of items) {
    const itemAvailable = Math.max(0, item.available || item.quantity - (item.reserved || 0));
    const itemValue = itemAvailable * (item.averageCost || item.lastCost || 0);

    totalValuation += itemValue;

    const cat = item.category || "General";
    byCategory[cat] = (byCategory[cat] || 0) + itemValue;

    const type = item.inventoryType || "finished_product";
    byType[type] = (byType[type] || 0) + itemValue;
  }

  return {
    totalValuation: Math.round(totalValuation * 100) / 100,
    byCategory,
    byType,
  };
}
