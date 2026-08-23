import { z } from "zod";

export const ProductPackageSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  isDefault: z.boolean().optional(),
});

export const VolumePriceTierSchema = z.object({
  minQuantity: z.number().int().positive(),
  maxQuantity: z.number().int().positive().optional(),
  unitPrice: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100).optional(),
});
