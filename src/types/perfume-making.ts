import { ProductPackage, PricingTier } from "./pricing";
import { ProductImage } from "./media";

export type BaseUnit = "liter" | "ml" | "gallon" | "oz";

export interface BaseCostBreakdown {
  baseLiquidCost: number;
  bottleCost: number; // e.g. $1.43 for Steve Spangler 1L bottle
  capCost: number;
  labelCost: number;
  packagingCost: number;
  laborCost: number;
  wasteCost: number;
  shippingCost: number;
  totalCost: number;
}

export interface BaseVariant {
  id: string;
  name: string; // e.g. "1 Liter Dispensing Bottle"
  size: number;
  unit: BaseUnit;
  sku: string;
  containerProductId?: string; // e.g. "prod_bottle_1liter_spangler"
  costBreakdown: BaseCostBreakdown;
  unitCost: number;
  retailPrice: number;
  suggestedRetailPrice: number;
  grossProfit: number;
  marginPercent: number;
  inventoryQuantity: number;
  active: boolean;
}

export interface PerfumeBase {
  id: string;
  name: string;
  slug: string;
  description: string;
  supplierId: string;
  supplierName: string;
  supplierProductId?: string; // e.g. ASIN B0GGDJD96Y
  supplierUrl?: string;
  sourceQuantity: number; // e.g. 1
  sourceUnit: BaseUnit; // e.g. "gallon"
  sourceCost: number; // e.g. $49.99
  costPerLiter: number;
  inventoryVolumeLiters: number;
  repackagingVariants: BaseVariant[];
  status: "active" | "draft" | "archived";
  primaryImage: string;
  media: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface KitItem {
  productId: string;
  variantId?: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  required: boolean;
  image?: string;
}

export interface KitProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  items: KitItem[];
  individualTotal: number;
  kitPrice: number;
  savings: number;
  discountPercent: number;
  inventoryQuantity: number;
  active: boolean;
  primaryImage: string;
  media?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PerfumeMakingStepConfig {
  stepNumber: number;
  stepName: string;
  title: string;
  description: string;
  category: string;
  defaultProductId?: string;
}
