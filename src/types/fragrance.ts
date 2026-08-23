export type VolumeUnit = "oz" | "ml" | "liter" | "gallon" | "lb";

export type ScentFamily =
  | "Woody"
  | "Floral"
  | "Fresh"
  | "Citrus"
  | "Oriental"
  | "Amber"
  | "Musk"
  | "Gourmand"
  | "Fruity"
  | "Aquatic"
  | "Spicy"
  | "Green"
  | "Leather"
  | "Tobacco"
  | string;

import { Supplier } from "./supplier";
export type { Supplier };

export interface FragranceCostBreakdown {
  fragranceCost: number; // costPerOz * sellingSize
  bottleCost: number;
  capCost: number;
  labelCost: number;
  packagingCost: number;
  laborCost: number;
  wasteCost: number;
  allocatedShippingCost: number;
  totalCost: number;
}

export interface RepackagingVariant {
  id: string;
  fragranceOilId: string;
  sellingSize: number; // e.g. 1, 2, 4, 8, 16, 32
  sellingUnit: "oz" | "ml";
  containerProductId?: string; // ID of matched glass bottle / roll-on
  labelProductId?: string; // ID of matched custom label
  packagingProductId?: string; // ID of box/cap
  sku: string; // e.g. "FRAG-SANTAL-2OZ"
  costBreakdown: FragranceCostBreakdown;
  unitCost: number;
  retailPrice: number;
  suggestedRetailPrice: number;
  grossProfit: number;
  marginPercent: number;
  volumePricing?: {
    quantity: number;
    price: number;
    unitPrice: number;
  }[];
  inventoryQuantity: number; // Ready units in stock
  active: boolean;
}

export interface FragranceOil {
  id: string;
  name: string;
  slug: string;
  description: string;
  supplierId: string;
  supplierName?: string;
  supplierProductId?: string;
  supplierUrl?: string;
  fragranceReference?: string; // e.g. "Inspired by Santal 33"
  category: "fragrance_oils" | "perfume_bases" | "essential_oils" | "fragrance_concentrates" | string;
  subcategory?: string;
  scentFamily: ScentFamily;
  gender?: "unisex" | "masculine" | "feminine";
  season?: string[];
  style?: string;
  strength?: string;
  sourceSize: number; // e.g. 32, 128, 1
  sourceUnit: VolumeUnit;
  sourceCost: number; // Total cost paid for source container
  density?: number; // Specific gravity in g/ml if weight unit (lb) is used
  costPerOz: number; // Calculated cost per ounce
  costPerMl: number; // Calculated cost per milliliter
  inventoryVolumeOz: number; // Remaining bulk oil volume in stock
  status: "active" | "draft" | "discontinued" | "out_of_stock";
  images: string[];
  primaryImage: string;
  repackagingVariants: RepackagingVariant[];
  targetGrossMargin?: number; // default 0.50 (50%)
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseLot {
  id: string;
  supplierId: string;
  supplierName: string;
  fragranceOilId: string;
  fragranceName: string;
  quantity: number;
  unit: VolumeUnit;
  unitCost: number;
  totalCost: number;
  purchaseDate: string;
  lotNumber: string;
  expirationDate?: string;
  notes?: string;
  createdAt: string;
}

export interface FragranceInventoryLedger {
  id: string;
  fragranceOilId: string;
  type: "purchase" | "repackaging" | "sale" | "adjustment" | "waste" | "damage" | "return";
  sourceVolumeOz: number;
  consumedVolumeOz: number;
  outputQuantity?: number;
  outputSizeOz?: number;
  remainingBulkVolumeOz: number;
  wasteVolumeOz?: number;
  wasteReason?: "spill" | "residue" | "production_loss" | "damaged" | "other";
  lotId?: string;
  orderId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface ImportBatch {
  id: string;
  supplierId: string;
  fileName: string;
  importedBy: string;
  status: "pending_preview" | "validated" | "completed" | "cancelled";
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: string[];
  previewData?: any[];
  createdAt: string;
}

export type FragranceOilDetails = FragranceOil;


