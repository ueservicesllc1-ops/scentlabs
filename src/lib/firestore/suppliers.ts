import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  where 
} from "firebase/firestore";
import { db } from "../firebase/client";
import { Supplier, SupplierPriceHistory } from "@/types/supplier";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const SUPPLIERS_COLLECTION = "suppliers";
const PRICE_HISTORY_COLLECTION = "supplierPriceHistory";

const LOCAL_SUPPLIERS = new Map<string, Supplier>();
const LOCAL_PRICE_HISTORY = new Map<string, SupplierPriceHistory>();

// Pre-seeded Suppliers for SCENTLAB
const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "supp_africa_imports",
    name: "Africa Imports",
    code: "AFRICA-IMP",
    website: "https://africaimports.com",
    email: "wholesale@africaimports.com",
    phone: "+1 (800) 500-6120",
    contactName: "Wholesale Department",
    address: "240 S Main St, Unit A, South Hackensack, NJ 07606",
    sourceType: "importer",
    notes: "Primary supplier for bulk pure fragrance oils, uncut essences, and African black soap bases.",
    active: true,
    totalPurchasesCount: 14,
    totalPurchasesAmount: 3840.50,
    createdAt: new Date("2026-01-10").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "supp_natures_oil",
    name: "Nature's Oil / Bulk Apothecary",
    code: "NATURES-OIL",
    website: "https://bulkapothecary.com",
    email: "orders@bulkapothecary.com",
    phone: "+1 (888) 728-7612",
    contactName: "Commercial Accounts",
    address: "115 Lena Dr, Aurora, OH 44202",
    sourceType: "domestic_manufacturer",
    notes: "Perfumer's alcohol 200 proof SDA 40B, carrier oils, and glass gallon drums.",
    active: true,
    totalPurchasesCount: 8,
    totalPurchasesAmount: 2150.00,
    createdAt: new Date("2026-01-12").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "supp_amazon_glass",
    name: "Amazon Glassware Direct (Various Vendors)",
    code: "AMZ-GLASS",
    website: "https://amazon.com",
    email: "procurement@scentlab.com",
    phone: "+1 (888) 280-4331",
    contactName: "Amazon Business Procurement",
    address: "Seattle, WA",
    sourceType: "amazon",
    notes: "Fast delivery for 10ml amber roll-ons (ASIN: B0GVYLZZ95), 5ml atomizers, and pipettes (ASIN: B0DFG4WBPW).",
    active: true,
    totalPurchasesCount: 19,
    totalPurchasesAmount: 1890.25,
    createdAt: new Date("2026-01-15").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "supp_cricut_craft",
    name: "Craft Direct / Cricut Materials",
    code: "CRICUT-CRAFT",
    website: "https://craftdirect.com",
    email: "support@craftdirect.com",
    phone: "+1 (800) 800-4740",
    contactName: "Specialty Media Desk",
    address: "Salt Lake City, UT",
    sourceType: "craft_direct",
    notes: "Cardstock sheets (8.5x11 Kraft/Black 100lb) for in-house Cricut box cutting and folding.",
    active: true,
    totalPurchasesCount: 6,
    totalPurchasesAmount: 760.00,
    createdAt: new Date("2026-02-01").toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "supp_online_labels",
    name: "OnlineLabels.com",
    code: "ONLINE-LABELS",
    website: "https://onlinelabels.com",
    email: "service@onlinelabels.com",
    phone: "+1 (888) 575-2235",
    contactName: "Industrial Roll Desk",
    address: "Sanford, FL",
    sourceType: "specialty_distributor",
    notes: "Waterproof vinyl label media, gold/silver metallic foil sheets, and thermal ribbons.",
    active: true,
    totalPurchasesCount: 5,
    totalPurchasesAmount: 920.00,
    createdAt: new Date("2026-02-05").toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

INITIAL_SUPPLIERS.forEach((s) => LOCAL_SUPPLIERS.set(s.id, s));

export const supplierRepository = {
  async getAllSuppliers(): Promise<Supplier[]> {
    const local = Array.from(LOCAL_SUPPLIERS.values()).sort((a, b) => a.name.localeCompare(b.name));
    if (!isFirebaseConfigured || !db) return local;

    try {
      const q = query(collection(db, SUPPLIERS_COLLECTION), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Supplier));
      return list.length > 0 ? list : local;
    } catch {
      return local;
    }
  },

  async getSupplierById(id: string): Promise<Supplier | null> {
    const local = LOCAL_SUPPLIERS.get(id);
    if (!isFirebaseConfigured || !db) return local || null;

    try {
      const docRef = doc(db, SUPPLIERS_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Supplier;
      }
      return local || null;
    } catch {
      return local || null;
    }
  },

  async saveSupplier(supplier: Supplier): Promise<string> {
    LOCAL_SUPPLIERS.set(supplier.id, {
      ...supplier,
      updatedAt: new Date().toISOString(),
    });

    if (!isFirebaseConfigured || !db) return supplier.id;

    try {
      const docRef = doc(db, SUPPLIERS_COLLECTION, supplier.id);
      await setDoc(docRef, { ...supplier, updatedAt: new Date().toISOString() }, { merge: true });
      return supplier.id;
    } catch (error) {
      logger.error(`Failed to save supplier ${supplier.id}`, error);
      return supplier.id;
    }
  },

  async recordPriceHistory(entry: SupplierPriceHistory): Promise<string> {
    LOCAL_PRICE_HISTORY.set(entry.id, entry);
    if (!isFirebaseConfigured || !db) return entry.id;

    try {
      const docRef = doc(db, PRICE_HISTORY_COLLECTION, entry.id);
      await setDoc(docRef, entry);
      return entry.id;
    } catch {
      return entry.id;
    }
  },

  async getPriceHistoryBySupplier(supplierId: string): Promise<SupplierPriceHistory[]> {
    const local = Array.from(LOCAL_PRICE_HISTORY.values()).filter((p) => p.supplierId === supplierId);
    if (!isFirebaseConfigured || !db) return local;

    try {
      const q = query(
        collection(db, PRICE_HISTORY_COLLECTION),
        where("supplierId", "==", supplierId),
        orderBy("effectiveDate", "desc")
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SupplierPriceHistory));
      return list.length > 0 ? list : local;
    } catch {
      return local;
    }
  },
};
