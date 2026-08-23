import { z } from "zod";
import { ProductPackageSchema, VolumePriceTierSchema } from "./pricing.schema";

export const ProductCostDataSchema = z.object({
  supplierCost: z.number().nonnegative(),
  supplierQuantity: z.number().int().positive(),
  unitCost: z.number().nonnegative(),
  inboundShippingCost: z.number().nonnegative().optional(),
  packagingCost: z.number().nonnegative().optional(),
  materialCost: z.number().nonnegative().optional(),
  laborCost: z.number().nonnegative().optional(),
  totalUnitCost: z.number().nonnegative(),
});

export const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  b2Key: z.string(),
  altText: z.string(),
  isPrimary: z.boolean(),
  sortOrder: z.number().int(),
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  shortDescription: z.string(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
  brand: z.string().optional(),
  supplierId: z.string().optional(),
  supplierProductId: z.string().optional(),
  asin: z.string().optional(),
  externalUrl: z.string().url().optional(),
  sku: z.string().min(1),
  status: z.enum(["active", "draft", "archived"]),
  featured: z.boolean().default(false),
  tags: z.array(z.string()),
  attributes: z.record(z.string(), z.union([z.string(), z.number()])),
  images: z.array(ProductImageSchema),
  costData: ProductCostDataSchema,
  currency: z.literal("USD"),
  basePrice: z.number().nonnegative(),
  packageOptions: z.array(ProductPackageSchema).min(1),
  volumePricing: z.array(VolumePriceTierSchema).optional(),
  discountEligible: z.boolean().default(true),
  minimumDiscountMargin: z.number().min(0).max(1).default(0.25),
  hasVariants: z.boolean().default(false),
  relatedProducts: z.array(z.string()).default([]),
  recommendedProducts: z.array(z.string()).default([]),
  complementaryProductIds: z.array(z.string()).default([]),
  recommendedProductIds: z.array(z.string()).default([]),
  customizable: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});
