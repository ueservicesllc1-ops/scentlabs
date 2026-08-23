export type PackagingSubcategory =
  | "Boxes"
  | "Tags"
  | "Security Stickers"
  | "Labels"
  | "Heat Shrink Wrap Bags"
  | "Packaging Accessories";

export interface PackagingMaterial {
  id: string;
  name: string;
  type: "cardstock" | "kraft" | "vinyl" | "polymer" | string;
  supplier: string;
  cost: number;
  quantity: number; // Current sheet / raw material inventory
  unit: "sheet" | "roll" | "pack";
  unitCost: number; // cost per sheet
  totalCost: number;
  sheetWidth: number; // in inches (e.g. 8.5)
  sheetHeight: number; // in inches (e.g. 11.0)
  reorderPoint: number;
  lowStockThreshold: number;
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialTransaction {
  id: string;
  materialId: string;
  previousQuantity: number;
  consumedQuantity: number;
  remainingQuantity: number;
  wasteQuantity?: number;
  productionJobId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface ProductionJob {
  id: string;
  productId: string;
  variantId?: string;
  boxName: string;
  quantity: number;
  materialId: string;
  materialName: string;
  sheetsRequired: number;
  estimatedTimeMinutes: number;
  actualTimeMinutes?: number;
  status: "queued" | "cutting" | "assembly" | "qualityCheck" | "completed" | "cancelled";
  notes?: string;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export interface BoxCostBreakdown {
  sheetCost: number;
  sheetsUsed: number;
  wasteFactor: number;
  wasteCost: number;
  inkCost: number;
  productionLaborCost: number;
  packagingCost: number;
  shippingMaterialsCost: number;
  totalCost: number;
  unitCost: number;
  suggestedPrice: number;
  marginPercent: number;
}

export interface BoxSizeVariant {
  id: string;
  productId: string;
  name: string; // e.g. "Small Box (10ml Roll-On)"
  width: number; // box dimensions in inches
  height: number;
  depth: number;
  unit: "in" | "cm";
  sku: string;
  sheetsRequiredPerBox: number; // e.g. 0.5 (2 boxes per 8.5x11 sheet)
  materialId: string;
  materialName: string;
  assemblyType: "flat" | "pre_cut" | "assembled";
  costBreakdown: BoxCostBreakdown;
  unitCost: number;
  retailPrice: number;
  suggestedPrice: number;
  volumePricing?: {
    quantity: number;
    price: number;
    unitPrice: number;
  }[];
  inventory: number; // Finished assembled/flat boxes on shelf
  active: boolean;
}

export interface PackagingCompatibility {
  id: string;
  packagingProductId: string;
  compatibleProductId: string;
  compatibilityType: "fits_bottle" | "matches_label" | "fits_box" | "secures_with_sticker" | "tag_for_bottle";
  notes?: string;
  active: boolean;
}

export interface ShrinkWrapVariant {
  id: string;
  sizeName: string; // e.g. "4x6", "6x6", "6x8", "8x12", "10x14", "12x18", "14x20"
  widthInches: number;
  lengthInches: number;
  sku: string;
  unitCost50: number;
  unitCost100: number;
  price50: number;
  price100: number;
  inventory50: number;
  inventory100: number;
  active: boolean;
}
