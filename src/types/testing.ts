import { ProductPackage, PricingTier } from "./pricing";
import { ProductImage } from "./media";

export type TestingSubcategory =
  | "Blotter Strips"
  | "Sample Bottles"
  | "Atomizers"
  | "Testing Accessories"
  | "Testing Kits";

export type TestingType =
  | "blotter_strip"
  | "sample_bottle"
  | "atomizer"
  | "spray_bottle"
  | "kit";

export interface TestingProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: "testing";
  subcategory: TestingSubcategory;
  testingType: TestingType;
  sampleSize?: string; // e.g. "5 ml", "10 ml", "150 mm"
  recommendedFor: string[]; // e.g. ["fragrance_oils", "top_notes", "dry_down"]
  supplierId: string;
  supplierName: string;
  asin?: string;
  externalUrl?: string;
  supplierCost: number;
  supplierQuantity: number;
  unitCost: number;
  basePrice: number;
  packageOptions: ProductPackage[];
  volumePricing: PricingTier[];
  sku: string;
  unit: "strip" | "bottle" | "atomizer" | "kit" | "unit" | "pack";
  inventory: {
    quantityInStock: number;
    reservedQuantity: number;
    availableQuantity: number;
    lowStockThreshold: number;
    reorderPoint: number;
    status: "in_stock" | "low_stock" | "out_of_stock";
  };
  media: ProductImage[];
  primaryImage: string;
  relatedFragranceIds?: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SampleKitBundleFoundation {
  id: string;
  name: string;
  slug: string;
  description: string;
  bundleItems: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
  }[];
  bundlePrice?: number;
  bundleDiscountPercent?: number;
  bundleInventory?: number;
  active: boolean;
  notes?: string;
}
