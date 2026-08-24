export type InventoryType =
  | "finished_product"
  | "component"
  | "raw_material"
  | "bulk_material"
  | "packaging_material"
  | "consumable"
  | "service";

export type InventoryStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "discontinued";

export type InventoryLocation =
  | "main_storage"
  | "production"
  | "packaging"
  | "shipping"
  | "raw_materials"
  | "finished_products";

export interface InventoryItem {
  id: string; // productId or unique inventory ID
  productId: string;
  variantId?: string;
  productName: string;
  sku: string;
  category?: string;
  inventoryType: InventoryType;
  quantity: number; // Total on hand
  unit: "unit" | "oz" | "ml" | "liter" | "gallon" | "sheet" | "sq_in" | "strip" | "bag";
  reserved: number; // Reserved for unfulfilled orders
  available: number; // quantity - reserved
  reorderPoint: number;
  lowStockThreshold: number;
  location: InventoryLocation;
  averageCost: number; // Weighted Average Cost
  lastCost: number; // Most recent purchase cost
  supplierCost?: number;
  supplierId?: string;
  supplierName?: string;
  supplierPackSize?: number; // e.g. 250 units/box
  status: InventoryStatus;
  lastRestockedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy aliases
  quantityInStock?: number;
  reservedQuantity?: number;
  availableQuantity?: number;
}

// Alias for backwards compatibility
export type Inventory = InventoryItem;

export type InventoryTransactionType =
  | "initial_stock"
  | "purchase"
  | "sale"
  | "reservation"
  | "release"
  | "production"
  | "repackaging"
  | "adjustment"
  | "damage"
  | "waste"
  | "return"
  | "transfer";

export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  productId: string;
  variantId?: string;
  productName?: string;
  type: InventoryTransactionType;
  quantity: number; // Delta (+ or -)
  previousQuantity: number;
  newQuantity: number;
  referenceType: "order" | "purchase" | "repackaging" | "production" | "manual" | "waste";
  referenceId?: string;
  cost?: number;
  fromLocation?: InventoryLocation;
  toLocation?: InventoryLocation;
  location?: InventoryLocation;
  reason?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export type PurchaseStatus =
  | "draft"
  | "submitted"
  | "ordered"
  | "partially_received"
  | "received"
  | "cancelled";

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  productName: string;
  variantId?: string;
  sku?: string;
  supplierProductId?: string;
  supplierSku?: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityRejected?: number;
  quantityDamaged?: number;
  unit: string;
  unitCost: number;
  allocatedShipping?: number;
  landedUnitCost?: number;
  totalCost: number;
  supplierPackSize?: number;
  lotNumber?: string;
  expirationDate?: string;
  notes?: string;
}

export type PurchaseOrderItem = PurchaseItem;

export interface Purchase {
  id: string;
  purchaseNumber: string; // e.g. "PO-000001"
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  orderDate?: string; // alias
  expectedDate?: string;
  receivedDate?: string;
  status: PurchaseStatus;
  subtotal: number;
  shipping: number;
  shippingCost?: number; // alias
  tax: number;
  otherCost?: number; // customs, fees, handling
  total: number;
  totalCost?: number; // alias
  items: PurchaseItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type PurchaseOrder = Purchase;

export interface CostHistory {
  id: string;
  productId: string;
  variantId?: string;
  oldCost: number;
  newCost: number;
  supplierId?: string;
  supplierName?: string;
  purchaseId?: string;
  effectiveDate: string;
  createdBy: string;
  notes?: string;
}
