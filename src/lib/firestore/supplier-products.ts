import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase/client";
import { SupplierProduct, LandedCostAllocationMethod } from "@/types/supplier";
import { PurchaseItem } from "@/types/inventory";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const SUPPLIER_PRODUCTS_COLLECTION = "supplierProducts";

const LOCAL_SUPPLIER_PRODUCTS = new Map<string, SupplierProduct>();

// Seed initial Supplier-Product Mappings
const INITIAL_SUPPLIER_PRODUCTS: SupplierProduct[] = [
  {
    id: "sp_africa_santal",
    supplierId: "supp_africa_imports",
    productId: "frag_santal_33",
    productName: "Santal 33 Type Pure Fragrance Oil",
    supplierProductName: "Santal 33 Premium Uncut Fragrance Oil (32 oz Jug)",
    supplierSku: "OIL-SANTAL33-32OZ",
    supplierProductId: "AFR-SAN33-32",
    supplierUrl: "https://africaimports.com/santal-33-fragrance-oil-32oz",
    currentCost: 40.00, // $40 per 32 oz jug ($1.25 / oz)
    lastCost: 40.00,
    supplierPackSize: 32, // 32 oz
    minimumOrderQuantity: 32,
    unit: "oz",
    isPrimary: true,
    active: true,
    leadTimeDays: 4,
    createdAt: new Date("2026-01-10").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sp_natures_oil_alcohol_gal",
    supplierId: "supp_natures_oil",
    productId: "prod_natures_oil_1l",
    productName: "Nature's Oil Perfumer's Alcohol Base (1 Liter)",
    supplierProductName: "Perfumer's Alcohol 200 Proof SDA-40B (1 Gallon)",
    supplierSku: "ALC-SDA40B-1GAL",
    supplierProductId: "B0GGDJD96Y",
    supplierUrl: "https://bulkapothecary.com/perfumers-alcohol-gallon",
    currentCost: 49.99, // $49.99 per gallon (3.785 L -> $13.20/L base)
    lastCost: 49.99,
    supplierPackSize: 4, // Approx 4 Liters
    minimumOrderQuantity: 4,
    unit: "liter",
    isPrimary: true,
    active: true,
    leadTimeDays: 5,
    createdAt: new Date("2026-01-12").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sp_amz_rollon_250",
    supplierId: "supp_amazon_glass",
    productId: "prod_rollon_10ml",
    productName: "10 ml Amber Glass Roll-On Bottles with Stainless Balls",
    supplierProductName: "250-Pack 10ml Amber Glass Roll-on Bottles with Metal Rollers",
    supplierSku: "B0GVYLZZ95",
    supplierProductId: "B0GVYLZZ95",
    supplierUrl: "https://www.amazon.com/dp/B0GVYLZZ95",
    currentCost: 79.99, // 250 units @ $79.99 ($0.32/unit)
    lastCost: 79.99,
    supplierPackSize: 250,
    minimumOrderQuantity: 250,
    unit: "unit",
    isPrimary: true,
    active: true,
    leadTimeDays: 2,
    createdAt: new Date("2026-01-15").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sp_amz_pipettes_200",
    supplierId: "supp_amazon_tools",
    productId: "prod_pipette_5ml",
    productName: "5 ml Disposable Graduated Transfer Pipettes",
    supplierProductName: "200-Pack 5ml Plastic Transfer Pipettes",
    supplierSku: "B0DFG4WBPW",
    supplierProductId: "B0DFG4WBPW",
    supplierUrl: "https://www.amazon.com/dp/B0DFG4WBPW",
    currentCost: 18.00, // 200 units @ $18.00 ($0.09/unit)
    lastCost: 18.00,
    supplierPackSize: 200,
    minimumOrderQuantity: 200,
    unit: "unit",
    isPrimary: true,
    active: true,
    leadTimeDays: 2,
    createdAt: new Date("2026-01-15").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sp_amz_blotter_2000",
    supplierId: "supp_amazon_testing",
    productId: "prod_blotter_strips",
    productName: "Professional Perfume Blotter Strips (Testing Paper)",
    supplierProductName: "2000 Count Premium Perfume Scent Test Paper Strips",
    supplierSku: "B0FH64YJVM",
    supplierProductId: "B0FH64YJVM",
    supplierUrl: "https://www.amazon.com/dp/B0FH64YJVM",
    currentCost: 19.99, // 2000 units @ $19.99 ($0.01/strip)
    lastCost: 19.99,
    supplierPackSize: 2000,
    minimumOrderQuantity: 2000,
    unit: "strip",
    isPrimary: true,
    active: true,
    leadTimeDays: 2,
    createdAt: new Date("2026-01-18").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sp_cricut_cardstock_100",
    supplierId: "supp_cricut_craft",
    productId: "mat_cardstock_kraft",
    productName: "Heavyweight Kraft Cardstock Sheets (8.5 x 11 in)",
    supplierProductName: "100-Pack Heavyweight Kraft Cardstock 100lb Cover",
    supplierSku: "KRAFT-100LB-100PK",
    supplierProductId: "CD-KRAFT-100",
    supplierUrl: "https://craftdirect.com/kraft-cardstock-100pack",
    currentCost: 28.00, // 100 sheets @ $28.00 ($0.28/sheet)
    lastCost: 28.00,
    supplierPackSize: 100,
    minimumOrderQuantity: 100,
    unit: "sheet",
    isPrimary: true,
    active: true,
    leadTimeDays: 3,
    createdAt: new Date("2026-02-01").toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

INITIAL_SUPPLIER_PRODUCTS.forEach((sp) => LOCAL_SUPPLIER_PRODUCTS.set(sp.id, sp));

export const supplierProductRepository = {
  async getAll(): Promise<SupplierProduct[]> {
    const local = Array.from(LOCAL_SUPPLIER_PRODUCTS.values());
    if (!isFirebaseConfigured || !db) return local;

    try {
      const q = query(collection(db, SUPPLIER_PRODUCTS_COLLECTION));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SupplierProduct));
      return list.length > 0 ? list : local;
    } catch {
      return local;
    }
  },

  async getBySupplier(supplierId: string): Promise<SupplierProduct[]> {
    const local = Array.from(LOCAL_SUPPLIER_PRODUCTS.values()).filter((s) => s.supplierId === supplierId);
    if (!isFirebaseConfigured || !db) return local;

    try {
      const q = query(collection(db, SUPPLIER_PRODUCTS_COLLECTION), where("supplierId", "==", supplierId));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SupplierProduct));
      return list.length > 0 ? list : local;
    } catch {
      return local;
    }
  },

  async getByProduct(productId: string): Promise<SupplierProduct[]> {
    const local = Array.from(LOCAL_SUPPLIER_PRODUCTS.values())
      .filter((s) => s.productId === productId)
      .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

    if (!isFirebaseConfigured || !db) return local;

    try {
      const q = query(collection(db, SUPPLIER_PRODUCTS_COLLECTION), where("productId", "==", productId));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SupplierProduct));
      return list.length > 0 ? list.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)) : local;
    } catch {
      return local;
    }
  },

  async save(supplierProduct: SupplierProduct): Promise<string> {
    LOCAL_SUPPLIER_PRODUCTS.set(supplierProduct.id, {
      ...supplierProduct,
      updatedAt: new Date().toISOString(),
    });

    if (!isFirebaseConfigured || !db) return supplierProduct.id;

    try {
      const docRef = doc(db, SUPPLIER_PRODUCTS_COLLECTION, supplierProduct.id);
      await setDoc(docRef, { ...supplierProduct, updatedAt: new Date().toISOString() }, { merge: true });
      return supplierProduct.id;
    } catch (error) {
      logger.error(`Failed to save supplier product ${supplierProduct.id}`, error);
      return supplierProduct.id;
    }
  },
};

/**
 * Distributes Supplier Shipping, Tax, and Other Costs across PO Line Items to compute Landed Unit Cost
 */
export function calculateLandedCosts(
  items: PurchaseItem[],
  shippingCost: number = 0,
  tax: number = 0,
  otherCost: number = 0,
  method: LandedCostAllocationMethod = "by_cost"
): PurchaseItem[] {
  const extraCostsTotal = shippingCost + tax + otherCost;
  if (extraCostsTotal === 0 || items.length === 0) {
    return items.map((i) => ({
      ...i,
      allocatedShipping: 0,
      landedUnitCost: i.unitCost,
    }));
  }

  const subtotalCost = items.reduce((acc, i) => acc + i.quantityOrdered * i.unitCost, 0);
  const totalUnits = items.reduce((acc, i) => acc + i.quantityOrdered, 0);

  return items.map((item) => {
    let allocatedPortion = 0;

    if (method === "by_quantity" && totalUnits > 0) {
      allocatedPortion = (item.quantityOrdered / totalUnits) * extraCostsTotal;
    } else {
      // Default: by_cost
      const lineCost = item.quantityOrdered * item.unitCost;
      allocatedPortion = subtotalCost > 0 ? (lineCost / subtotalCost) * extraCostsTotal : 0;
    }

    const allocatedShippingPerUnit = item.quantityOrdered > 0 ? allocatedPortion / item.quantityOrdered : 0;
    const landedUnitCost = Math.round((item.unitCost + allocatedShippingPerUnit) * 10000) / 10000;

    return {
      ...item,
      allocatedShipping: Math.round(allocatedPortion * 100) / 100,
      landedUnitCost,
    };
  });
}
