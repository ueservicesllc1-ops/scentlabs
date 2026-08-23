import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "../firebase/client";
import { Purchase, PurchaseItem, PurchaseStatus } from "@/types/inventory";
import { inventoryRepository } from "./inventory";
import { supplierRepository } from "./suppliers";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const PURCHASES_COLLECTION = "purchases";

const LOCAL_PURCHASES = new Map<string, Purchase>();

// Seed sample POs
const SEED_PO_1: Purchase = {
  id: "po_000001",
  purchaseNumber: "PO-000001",
  supplierId: "supp_africa_imports",
  supplierName: "Africa Imports",
  purchaseDate: new Date(Date.now() - 86400000 * 10).toISOString(),
  orderDate: new Date(Date.now() - 86400000 * 10).toISOString(),
  expectedDate: new Date(Date.now() - 86400000 * 6).toISOString(),
  receivedDate: new Date(Date.now() - 86400000 * 6).toISOString(),
  status: "received",
  subtotal: 160.00,
  shipping: 15.00,
  shippingCost: 15.00,
  tax: 0.00,
  otherCost: 0.00,
  total: 175.00,
  totalCost: 175.00,
  items: [
    {
      id: "poi_1",
      purchaseId: "po_000001",
      productId: "frag_santal_33",
      productName: "Santal 33 Type Pure Fragrance Oil (4 x 32 oz Jugs)",
      quantityOrdered: 128, // 128 oz
      quantityReceived: 128,
      quantityDamaged: 0,
      quantityRejected: 0,
      unit: "oz",
      unitCost: 1.25,
      allocatedShipping: 15.00,
      landedUnitCost: 1.3672,
      totalCost: 160.00,
      lotNumber: "LOT-AFR-2026-01",
    },
  ],
  notes: "Delivered to Miami facility dock 2",
  createdBy: "ueservicesllc1@gmail.com",
  createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
};

const SEED_PO_2: Purchase = {
  id: "po_000002",
  purchaseNumber: "PO-000002",
  supplierId: "supp_natures_oil",
  supplierName: "Nature's Oil / Bulk Apothecary",
  purchaseDate: new Date(Date.now() - 86400000 * 4).toISOString(),
  orderDate: new Date(Date.now() - 86400000 * 4).toISOString(),
  expectedDate: new Date(Date.now() + 86400000 * 2).toISOString(),
  status: "ordered",
  subtotal: 199.96,
  shipping: 12.50,
  shippingCost: 12.50,
  tax: 14.00,
  otherCost: 0.00,
  total: 226.46,
  totalCost: 226.46,
  items: [
    {
      id: "poi_2",
      purchaseId: "po_000002",
      productId: "prod_natures_oil_1l",
      productName: "Perfumer's Alcohol 200 Proof SDA-40B (4 x 1 Gallon)",
      quantityOrdered: 16, // 16 Liters equivalent
      quantityReceived: 0,
      quantityDamaged: 0,
      quantityRejected: 0,
      unit: "liter",
      unitCost: 13.20,
      allocatedShipping: 26.50,
      landedUnitCost: 14.8563,
      totalCost: 211.20,
      lotNumber: "LOT-NO-2026-02",
    },
  ],
  notes: "In transit via FedEx Ground",
  createdBy: "ueservicesllc1@gmail.com",
  createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
};

LOCAL_PURCHASES.set(SEED_PO_1.id, SEED_PO_1);
LOCAL_PURCHASES.set(SEED_PO_2.id, SEED_PO_2);

export const purchaseRepository = {
  /**
   * Generates sequential unique PO number: PO-000001, PO-000002...
   */
  async generatePurchaseNumber(): Promise<string> {
    const all = await this.getAllPurchases();
    const count = all.length + 1;
    return `PO-${String(count).padStart(6, "0")}`;
  },

  async getAllPurchases(): Promise<Purchase[]> {
    const local = Array.from(LOCAL_PURCHASES.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (!isFirebaseConfigured || !db) return local;

    try {
      const q = query(collection(db, PURCHASES_COLLECTION), orderBy("createdAt", "desc"), limit(100));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Purchase));
      return docs.length > 0 ? docs : local;
    } catch {
      return local;
    }
  },

  async getPurchaseById(id: string): Promise<Purchase | null> {
    const local = LOCAL_PURCHASES.get(id);
    if (!isFirebaseConfigured || !db) return local || null;

    try {
      const docRef = doc(db, PURCHASES_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Purchase;
      }
      return local || null;
    } catch {
      return local || null;
    }
  },

  async savePurchase(purchase: Purchase): Promise<string> {
    LOCAL_PURCHASES.set(purchase.id, {
      ...purchase,
      updatedAt: new Date().toISOString(),
    });

    if (!isFirebaseConfigured || !db) return purchase.id;

    try {
      const docRef = doc(db, PURCHASES_COLLECTION, purchase.id);
      await setDoc(docRef, { ...purchase, updatedAt: new Date().toISOString() }, { merge: true });
      return purchase.id;
    } catch (error) {
      logger.error(`Failed to save Purchase Order ${purchase.id}`, error);
      return purchase.id;
    }
  },

  /**
   * Receives a Purchase Order (Full or Partial Receiving)
   * Handles:
   * - quantityReceived -> increments physical inventory on-hand & updates WAC
   * - quantityDamaged -> logs "damage" transaction in ledger (not added to inventory)
   * - quantityRejected -> logs rejection notes
   * - Updates PO status (to "received" or "partially_received")
   */
  async receivePurchase(
    purchaseId: string,
    receivedLines: {
      itemId: string;
      quantityReceived: number;
      quantityDamaged?: number;
      quantityRejected?: number;
      lotNumber?: string;
      notes?: string;
    }[]
  ): Promise<Purchase> {
    const purchase = await this.getPurchaseById(purchaseId);
    if (!purchase) throw new Error(`Purchase order ${purchaseId} not found`);

    let allFullyReceived = true;

    for (const line of receivedLines) {
      const item = purchase.items.find((i) => i.id === line.itemId);
      if (!item) continue;

      const validReceived = Math.max(0, line.quantityReceived || 0);
      const validDamaged = Math.max(0, line.quantityDamaged || 0);
      const validRejected = Math.max(0, line.quantityRejected || 0);

      item.quantityReceived = (item.quantityReceived || 0) + validReceived;
      if (validDamaged > 0) item.quantityDamaged = (item.quantityDamaged || 0) + validDamaged;
      if (validRejected > 0) item.quantityRejected = (item.quantityRejected || 0) + validRejected;
      if (line.lotNumber) item.lotNumber = line.lotNumber;

      if (item.quantityReceived < item.quantityOrdered) {
        allFullyReceived = false;
      }

      // 1. Add valid received quantity to Physical Inventory and recalculate WAC
      if (validReceived > 0) {
        const costToUse = item.landedUnitCost || item.unitCost;
        await inventoryRepository.receivePurchaseItem(
          item.productId,
          validReceived,
          costToUse,
          purchase.purchaseNumber,
          purchase.supplierId,
          purchase.supplierName
        );
      }

      // 2. If items arrived damaged, log damage event in Inventory Ledger
      if (validDamaged > 0) {
        await inventoryRepository.recordTransaction({
          id: `tx_dmg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          inventoryItemId: item.productId,
          productId: item.productId,
          productName: item.productName,
          type: "damage",
          quantity: validDamaged,
          previousQuantity: 0,
          newQuantity: 0,
          referenceType: "purchase",
          referenceId: purchase.purchaseNumber,
          cost: item.unitCost * validDamaged,
          reason: "Damaged in Transit / Supplier Defect",
          notes: `Inspected at receiving: ${validDamaged} ${item.unit}(s) damaged upon arrival from ${purchase.supplierName}`,
          createdBy: "receiving_dock",
          createdAt: new Date().toISOString(),
        });
      }

      // 3. Track Price History if cost changed from previous record
      const prevInv = await inventoryRepository.getInventory(item.productId);
      if (prevInv && prevInv.lastCost && prevInv.lastCost !== item.unitCost) {
        const changeType = item.unitCost > prevInv.lastCost ? "increased" : "decreased";
        await supplierRepository.recordPriceHistory({
          id: `sph_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          supplierId: purchase.supplierId,
          supplierName: purchase.supplierName,
          productId: item.productId,
          productName: item.productName,
          oldCost: prevInv.lastCost,
          newCost: item.unitCost,
          changeType,
          purchaseOrderId: purchase.purchaseNumber,
          effectiveDate: new Date().toISOString(),
          notes: `Price ${changeType} on PO ${purchase.purchaseNumber}`,
          createdBy: "system",
        });
      }
    }

    const newStatus: PurchaseStatus = allFullyReceived ? "received" : "partially_received";
    purchase.status = newStatus;
    if (allFullyReceived) {
      purchase.receivedDate = new Date().toISOString();
    }
    purchase.updatedAt = new Date().toISOString();

    await this.savePurchase(purchase);
    return purchase;
  },
};
