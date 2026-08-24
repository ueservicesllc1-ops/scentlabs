import { collection, doc, getDoc, getDocs, setDoc, query, where, limit } from "firebase/firestore";
import { db } from "../firebase/client";
import { TestingProduct, SampleKitBundleFoundation } from "@/types/testing";
import { INITIAL_TESTING_PRODUCTS, INITIAL_TESTING_KITS } from "@/data/testing";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const TESTING_COLLECTION = "testingProducts";
const KITS_COLLECTION = "testingKits";

export const testingRepository = {
  async getAllTestingProducts(): Promise<TestingProduct[]> {
    const localMap = new Map<string, TestingProduct>();
    INITIAL_TESTING_PRODUCTS.forEach((t) => localMap.set(t.id, t));

    if (!isFirebaseConfigured || !db) {
      return Array.from(localMap.values());
    }

    try {
      const snapshot = await getDocs(collection(db, TESTING_COLLECTION));
      snapshot.docs.forEach((d) => {
        const item = { id: d.id, ...d.data() } as TestingProduct;
        localMap.set(item.id, item);
      });
      return Array.from(localMap.values());
    } catch (err: any) {
      logger.warn("Failed to fetch testing products from Firestore, using initial dataset", err);
      return Array.from(localMap.values());
    }
  },

  async getTestingProductBySlug(slug: string): Promise<TestingProduct | null> {
    const all = await this.getAllTestingProducts();
    return all.find((t) => t.slug === slug) || null;
  },

  async getTestingProductById(id: string): Promise<TestingProduct | null> {
    const all = await this.getAllTestingProducts();
    return all.find((t) => t.id === id) || null;
  },

  async saveTestingProduct(product: TestingProduct): Promise<string> {
    if (!isFirebaseConfigured || !db) return product.id;

    try {
      const docRef = doc(db, TESTING_COLLECTION, product.id);
      await setDoc(docRef, product, { merge: true });
      return product.id;
    } catch (error) {
      logger.error(`Failed to save testing product ${product.id}`, error);
      return product.id;
    }
  },

  async getTestingKits(): Promise<SampleKitBundleFoundation[]> {
    const localMap = new Map<string, SampleKitBundleFoundation>();
    INITIAL_TESTING_KITS.forEach((k) => localMap.set(k.id, k));

    if (!isFirebaseConfigured || !db) {
      return Array.from(localMap.values());
    }

    try {
      const snapshot = await getDocs(collection(db, KITS_COLLECTION));
      snapshot.docs.forEach((d) => {
        const item = { id: d.id, ...d.data() } as SampleKitBundleFoundation;
        localMap.set(item.id, item);
      });
      return Array.from(localMap.values());
    } catch {
      return Array.from(localMap.values());
    }
  },
};
