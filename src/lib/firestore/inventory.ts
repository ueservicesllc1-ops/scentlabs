import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction 
} from "firebase/firestore";
import { db } from "../firebase/client";
import { 
  InventoryItem, 
  InventoryTransaction, 
  CostHistory, 
  InventoryLocation,
  InventoryType 
} from "@/types/inventory";
import { calculateInventoryStatus, calculateWeightedAverageCost } from "../inventory/cost";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const INVENTORY_COLLECTION = "inventory";
const TRANSACTIONS_COLLECTION = "inventoryTransactions";
const COST_HISTORY_COLLECTION = "costHistory";

// In-Memory Fallback Map
const LOCAL_INVENTORY = new Map<string, InventoryItem>();
const LOCAL_TRANSACTIONS = new Map<string, InventoryTransaction>();
const LOCAL_COST_HISTORY = new Map<string, CostHistory>();

// Initial Seed Dataset for SCENTLAB Catalog
const INITIAL_INVENTORY_SEED: InventoryItem[] = [
  {
    id: "prod_natures_oil_1l",
    productId: "prod_natures_oil_1l",
    productName: "Nature's Oil Perfumer's Alcohol Base (1 Liter)",
    sku: "BASE-ALC-1L-001",
    category: "Perfume Bases",
    inventoryType: "bulk_material",
    quantity: 80,
    unit: "liter",
    reserved: 0,
    available: 80,
    reorderPoint: 15,
    lowStockThreshold: 10,
    location: "main_storage",
    averageCost: 14.63,
    lastCost: 14.63,
    supplierCost: 49.99, // 1 gallon ASIN: B0GGDJD96Y ($13.20/L base + $1.43 Steve Spangler bottle)
    supplierId: "supp_natures_oil",
    supplierName: "Nature's Oil / Amazon",
    supplierPackSize: 4, // 1 Gallon = 3.785 L
    status: "in_stock",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_rollon_10ml",
    productId: "prod_rollon_10ml",
    productName: "10 ml Amber Glass Roll-On Bottles with Stainless Balls",
    sku: "BTL-ROL-10ML-AMB",
    category: "Bottles",
    inventoryType: "finished_product",
    quantity: 1250,
    unit: "unit",
    reserved: 0,
    available: 1250,
    reorderPoint: 250,
    lowStockThreshold: 100,
    location: "main_storage",
    averageCost: 0.32,
    lastCost: 0.32,
    supplierCost: 79.99, // ASIN: B0GVYLZZ95 (250u @ $79.99)
    supplierId: "supp_amazon_glass",
    supplierName: "Amazon Supplier / B0GVYLZZ95",
    supplierPackSize: 250,
    status: "in_stock",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_pipette_5ml",
    productId: "prod_pipette_5ml",
    productName: "5 ml Disposable Graduated Transfer Pipettes",
    sku: "PIP-5ML-200PK",
    category: "Tools",
    inventoryType: "consumable",
    quantity: 2400,
    unit: "unit",
    reserved: 0,
    available: 2400,
    reorderPoint: 400,
    lowStockThreshold: 200,
    location: "packaging",
    averageCost: 0.09,
    lastCost: 0.09,
    supplierCost: 18.00, // ASIN: B0DFG4WBPW (200u @ $18.00)
    supplierId: "supp_amazon_tools",
    supplierName: "Amazon Tools / B0DFG4WBPW",
    supplierPackSize: 200,
    status: "in_stock",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_blotter_strips",
    productId: "prod_blotter_strips",
    productName: "Professional Perfume Blotter Strips (Testing Paper)",
    sku: "TEST-BLOT-2000PK",
    category: "Testing",
    inventoryType: "consumable",
    quantity: 4000,
    unit: "strip",
    reserved: 0,
    available: 4000,
    reorderPoint: 500,
    lowStockThreshold: 200,
    location: "packaging",
    averageCost: 0.01,
    lastCost: 0.01,
    supplierCost: 19.99, // ASIN: B0FH64YJVM (2,000u @ $19.99)
    supplierId: "supp_amazon_testing",
    supplierName: "Amazon Testing / B0FH64YJVM",
    supplierPackSize: 2000,
    status: "in_stock",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mat_cardstock_kraft",
    productId: "mat_cardstock_kraft",
    productName: "Heavyweight Kraft Cardstock Sheets (8.5 x 11 in)",
    sku: "MAT-CARD-KRAFT-8511",
    category: "Packaging Materials",
    inventoryType: "raw_material",
    quantity: 500,
    unit: "sheet",
    reserved: 0,
    available: 500,
    reorderPoint: 100,
    lowStockThreshold: 50,
    location: "production",
    averageCost: 0.28,
    lastCost: 0.28,
    supplierPackSize: 100,
    status: "in_stock",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mat_gold_foil_vinyl",
    productId: "mat_gold_foil_vinyl",
    productName: "Metallic Gold Foil Adhesive Vinyl Rolls (12 in x 50 ft)",
    sku: "MAT-VINYL-GOLDFOIL",
    category: "Custom Labels",
    inventoryType: "raw_material",
    quantity: 12000, // 12000 sq in
    unit: "sq_in",
    reserved: 0,
    available: 12000,
    reorderPoint: 2000,
    lowStockThreshold: 1000,
    location: "production",
    averageCost: 0.0046,
    lastCost: 0.0046,
    status: "in_stock",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "frag_santal_33",
    productId: "frag_santal_33",
    productName: "Santal 33 Type Pure Fragrance Oil (Bulk Batch)",
    sku: "FRAG-BULK-SANTAL33",
    category: "Fragrance Oils",
    inventoryType: "bulk_material",
    quantity: 128,
    unit: "oz",
    reserved: 0,
    available: 128,
    reorderPoint: 32,
    lowStockThreshold: 16,
    location: "main_storage",
    averageCost: 1.25,
    lastCost: 1.25,
    supplierId: "supp_africa_imports",
    supplierName: "Africa Imports Bulk",
    status: "in_stock",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Initialize local seeds
INITIAL_INVENTORY_SEED.forEach((item) => {
  LOCAL_INVENTORY.set(item.id, {
    ...item,
    quantityInStock: item.quantity,
    reservedQuantity: item.reserved,
    availableQuantity: item.available,
  });
});

export const inventoryRepository = {
  async getAllInventory(): Promise<InventoryItem[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_INVENTORY.values());
    }

    try {
      const q = query(collection(db, INVENTORY_COLLECTION), orderBy("productName", "asc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryItem));
      return items.length > 0 ? items : Array.from(LOCAL_INVENTORY.values());
    } catch {
      return Array.from(LOCAL_INVENTORY.values());
    }
  },

  async getInventory(id: string): Promise<InventoryItem | null> {
    const local = LOCAL_INVENTORY.get(id);
    if (!isFirebaseConfigured || !db) return local || null;

    try {
      const docRef = doc(db, INVENTORY_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as InventoryItem;
      }
      return local || null;
    } catch {
      return local || null;
    }
  },

  async saveInventory(item: InventoryItem): Promise<string> {
    const available = Math.max(0, item.quantity - item.reserved);
    const status = calculateInventoryStatus(available, item.reorderPoint, item.lowStockThreshold);

    const updatedItem: InventoryItem = {
      ...item,
      available,
      status,
      quantityInStock: item.quantity,
      reservedQuantity: item.reserved,
      availableQuantity: available,
      updatedAt: new Date().toISOString(),
    };

    LOCAL_INVENTORY.set(item.id, updatedItem);
    if (!isFirebaseConfigured || !db) return item.id;

    try {
      const docRef = doc(db, INVENTORY_COLLECTION, item.id);
      await setDoc(docRef, updatedItem, { merge: true });
      return item.id;
    } catch (error) {
      logger.error(`Failed to save inventory for ${item.id}`, error);
      return item.id;
    }
  },

  /**
   * Atomic Reservation during checkout
   * Ensures available quantity >= quantityToReserve and prevents race conditions
   */
  async reserveInventory(id: string, quantityToReserve: number, orderId?: string): Promise<boolean> {
    const item = await this.getInventory(id);
    if (!item) return true; // Non-tracked item

    const available = item.quantity - item.reserved;
    if (available < quantityToReserve) {
      logger.warn(`Insufficient stock for ${id}: requested ${quantityToReserve}, available ${available}`);
      return false;
    }

    item.reserved += quantityToReserve;
    item.available = Math.max(0, item.quantity - item.reserved);
    item.status = calculateInventoryStatus(item.available, item.reorderPoint, item.lowStockThreshold);
    item.updatedAt = new Date().toISOString();

    await this.saveInventory(item);

    // Record ledger reservation
    await this.recordTransaction({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      inventoryItemId: item.id,
      productId: item.productId,
      productName: item.productName,
      type: "reservation",
      quantity: -quantityToReserve,
      previousQuantity: item.quantity,
      newQuantity: item.quantity,
      referenceType: "order",
      referenceId: orderId,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      notes: `Reserved ${quantityToReserve} ${item.unit}(s) for Order ${orderId || "Checkout"}`,
    });

    return true;
  },

  /**
   * Releases previously reserved inventory (e.g. cancelled checkout)
   */
  async releaseInventory(id: string, quantityToRelease: number, orderId?: string): Promise<boolean> {
    const item = await this.getInventory(id);
    if (!item) return true;

    item.reserved = Math.max(0, item.reserved - quantityToRelease);
    item.available = Math.max(0, item.quantity - item.reserved);
    item.status = calculateInventoryStatus(item.available, item.reorderPoint, item.lowStockThreshold);
    item.updatedAt = new Date().toISOString();

    await this.saveInventory(item);

    await this.recordTransaction({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      inventoryItemId: item.id,
      productId: item.productId,
      productName: item.productName,
      type: "release",
      quantity: quantityToRelease,
      previousQuantity: item.quantity,
      newQuantity: item.quantity,
      referenceType: "order",
      referenceId: orderId,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      notes: `Released ${quantityToRelease} ${item.unit}(s) reservation for Order ${orderId || "Cancelled"}`,
    });

    return true;
  },

  /**
   * Consumes inventory on order fulfillment / dispatch
   */
  async consumeInventory(id: string, quantityToConsume: number, orderId?: string): Promise<boolean> {
    const item = await this.getInventory(id);
    if (!item) return true;

    const previousQty = item.quantity;
    item.quantity = Math.max(0, item.quantity - quantityToConsume);
    item.reserved = Math.max(0, item.reserved - quantityToConsume);
    item.available = Math.max(0, item.quantity - item.reserved);
    item.status = calculateInventoryStatus(item.available, item.reorderPoint, item.lowStockThreshold);
    item.updatedAt = new Date().toISOString();

    await this.saveInventory(item);

    await this.recordTransaction({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      inventoryItemId: item.id,
      productId: item.productId,
      productName: item.productName,
      type: "sale",
      quantity: -quantityToConsume,
      previousQuantity: previousQty,
      newQuantity: item.quantity,
      referenceType: "order",
      referenceId: orderId,
      cost: item.averageCost * quantityToConsume,
      createdBy: "fulfillment",
      createdAt: new Date().toISOString(),
      notes: `Fulfilled and dispatched ${quantityToConsume} ${item.unit}(s) for Order ${orderId}`,
    });

    return true;
  },

  /**
   * Fulfills order item and updates inventory stock
   */
  async fulfillOrder(orderId: string, productId: string, quantity: number): Promise<boolean> {
    return this.consumeInventory(productId, quantity, orderId);
  },

  /**
   * Receives items from Purchase Order and updates Weighted Average Cost
   */
  async receivePurchaseItem(
    id: string,
    receivedQuantity: number,
    unitCost: number,
    purchaseId: string,
    supplierId?: string,
    supplierName?: string
  ): Promise<void> {
    const item = (await this.getInventory(id)) || {
      id,
      productId: id,
      productName: id,
      sku: `SKU-${id}`,
      inventoryType: "finished_product" as InventoryType,
      quantity: 0,
      unit: "unit" as const,
      reserved: 0,
      available: 0,
      reorderPoint: 10,
      lowStockThreshold: 5,
      location: "main_storage" as InventoryLocation,
      averageCost: unitCost,
      lastCost: unitCost,
      status: "in_stock" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const previousQty = item.quantity;
    const oldCost = item.averageCost;
    const newAverageCost = calculateWeightedAverageCost(
      item.quantity,
      item.averageCost,
      receivedQuantity,
      unitCost
    );

    item.quantity += receivedQuantity;
    item.available = Math.max(0, item.quantity - item.reserved);
    item.averageCost = newAverageCost;
    item.lastCost = unitCost;
    item.status = calculateInventoryStatus(item.available, item.reorderPoint, item.lowStockThreshold);
    item.lastRestockedAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();

    await this.saveInventory(item);

    // Record ledger transaction
    await this.recordTransaction({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      inventoryItemId: item.id,
      productId: item.productId,
      productName: item.productName,
      type: "purchase",
      quantity: receivedQuantity,
      previousQuantity: previousQty,
      newQuantity: item.quantity,
      referenceType: "purchase",
      referenceId: purchaseId,
      cost: unitCost,
      createdBy: "admin",
      createdAt: new Date().toISOString(),
      notes: `Received ${receivedQuantity} ${item.unit}(s) at $${unitCost}/unit from PO ${purchaseId}`,
    });

    // Record cost history
    await this.recordCostHistory({
      id: `cost_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: item.productId,
      oldCost,
      newCost: newAverageCost,
      supplierId,
      supplierName,
      purchaseId,
      effectiveDate: new Date().toISOString(),
      createdBy: "admin",
      notes: `WAC update from $${oldCost} to $${newAverageCost} upon receiving PO ${purchaseId}`,
    });
  },

  /**
   * Manual Stock Adjustment (Count Correction, Damage, Lost, Waste)
   */
  async adjustInventory(
    id: string,
    newPhysicalQuantity: number,
    reason: "Count Correction" | "Damaged" | "Lost" | "Found" | "Waste" | "Other",
    notes: string,
    user: string = "admin"
  ): Promise<void> {
    const item = await this.getInventory(id);
    if (!item) return;

    const previousQty = item.quantity;
    const delta = newPhysicalQuantity - previousQty;

    item.quantity = newPhysicalQuantity;
    item.available = Math.max(0, item.quantity - item.reserved);
    item.status = calculateInventoryStatus(item.available, item.reorderPoint, item.lowStockThreshold);
    item.updatedAt = new Date().toISOString();

    await this.saveInventory(item);

    await this.recordTransaction({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      inventoryItemId: item.id,
      productId: item.productId,
      productName: item.productName,
      type: reason === "Waste" ? "waste" : reason === "Damaged" ? "damage" : "adjustment",
      quantity: delta,
      previousQuantity: previousQty,
      newQuantity: newPhysicalQuantity,
      referenceType: reason === "Waste" ? "waste" : "manual",
      reason,
      notes,
      createdBy: user,
      createdAt: new Date().toISOString(),
    });
  },

  async recordTransaction(tx: InventoryTransaction): Promise<string> {
    LOCAL_TRANSACTIONS.set(tx.id, tx);
    if (!isFirebaseConfigured || !db) return tx.id;

    try {
      const docRef = doc(db, TRANSACTIONS_COLLECTION, tx.id);
      await setDoc(docRef, tx);
      return tx.id;
    } catch {
      return tx.id;
    }
  },

  async getTransactions(limitCount: number = 50): Promise<InventoryTransaction[]> {
    const local = Array.from(LOCAL_TRANSACTIONS.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (!isFirebaseConfigured || !db) return local.slice(0, limitCount);

    try {
      const q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as InventoryTransaction));
      return docs.length > 0 ? docs : local.slice(0, limitCount);
    } catch {
      return local.slice(0, limitCount);
    }
  },

  async recordCostHistory(entry: CostHistory): Promise<string> {
    LOCAL_COST_HISTORY.set(entry.id, entry);
    if (!isFirebaseConfigured || !db) return entry.id;

    try {
      const docRef = doc(db, COST_HISTORY_COLLECTION, entry.id);
      await setDoc(docRef, entry);
      return entry.id;
    } catch {
      return entry.id;
    }
  },

  async getCostHistory(productId: string): Promise<CostHistory[]> {
    const local = Array.from(LOCAL_COST_HISTORY.values()).filter((c) => c.productId === productId);
    if (!isFirebaseConfigured || !db) return local;

    try {
      const q = query(
        collection(db, COST_HISTORY_COLLECTION),
        where("productId", "==", productId),
        orderBy("effectiveDate", "desc")
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CostHistory));
      return docs.length > 0 ? docs : local;
    } catch {
      return local;
    }
  },
};

// Aliases for compatibility
export const inventoryService = inventoryRepository;
