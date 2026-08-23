import { z } from "zod";

export const InventorySchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  variantId: z.string().optional(),
  sku: z.string().min(1),
  quantityInStock: z.number().int().nonnegative(),
  reservedQuantity: z.number().int().nonnegative().default(0),
  availableQuantity: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  reorderPoint: z.number().int().nonnegative().default(20),
  status: z.enum(["in_stock", "low_stock", "out_of_stock"]),
  lastRestockedAt: z.string().optional(),
  updatedAt: z.string(),
});
