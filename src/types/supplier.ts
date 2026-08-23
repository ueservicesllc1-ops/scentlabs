export type SupplierSourceType =
  | "importer"
  | "domestic_manufacturer"
  | "amazon"
  | "aliexpress"
  | "specialty_distributor"
  | "craft_direct";

export interface Supplier {
  id: string;
  name: string;
  code?: string;
  website?: string;
  email?: string;
  phone?: string;
  contact?: string;
  contactName?: string;
  address?: string;
  sourceType?: SupplierSourceType;
  notes?: string;
  active: boolean;
  totalPurchasesCount?: number;
  totalPurchasesAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierProduct {
  id: string;
  supplierId: string;
  productId: string;
  variantId?: string;
  productName: string;
  supplierProductName?: string;
  supplierSku?: string;
  supplierProductId?: string; // ASIN, Africa Imports SKU, etc.
  supplierUrl?: string;
  currentCost: number;
  lastCost?: number;
  supplierPackSize: number; // e.g. 250 units/box, 200/pack, 1 gallon
  minimumOrderQuantity: number;
  unit: "unit" | "oz" | "ml" | "liter" | "gallon" | "sheet" | "sq_in" | "strip" | "bag" | "lb";
  isPrimary: boolean;
  active: boolean;
  leadTimeDays?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPriceHistory {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  oldCost: number;
  newCost: number;
  changeType: "increased" | "decreased" | "unchanged";
  purchaseOrderId?: string;
  effectiveDate: string;
  notes?: string;
  createdBy: string;
}

export type LandedCostAllocationMethod = "by_quantity" | "by_cost" | "by_weight";
