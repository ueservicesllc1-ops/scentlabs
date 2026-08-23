import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/client";
import { TestingProduct, SampleKitBundleFoundation } from "@/types/testing";
import { INITIAL_TESTING_PRODUCTS, INITIAL_TESTING_KITS } from "@/data/testing";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const TESTING_COLLECTION = "testingProducts";
const KITS_COLLECTION = "testingKits";

const LOCAL_TESTING = new Map<string, TestingProduct>();
INITIAL_TESTING_PRODUCTS.forEach((t) => LOCAL_TESTING.set(t.id, t));

const LOCAL_KITS = new Map<string, SampleKitBundleFoundation>();
INITIAL_TESTING_KITS.forEach((k) => LOCAL_KITS.set(k.id, k));

export const testingRepository = {
  async getAllTestingProducts(): Promise<TestingProduct[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_TESTING.values());
    }

    try {
      const q = query(collection(db, TESTING_COLLECTION), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TestingProduct));
      return docs.length > 0 ? docs : Array.from(LOCAL_TESTING.values());
    } catch {
      return Array.from(LOCAL_TESTING.values());
    }
  },

  async getTestingProductBySlug(slug: string): Promise<TestingProduct | null> {
    const local = Array.from(LOCAL_TESTING.values()).find((t) => t.slug === slug);
    if (!isFirebaseConfigured || !db) return local || null;

    try {
      const q = query(collection(db, TESTING_COLLECTION), where("slug", "==", slug), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TestingProduct;
      }
      return local || null;
    } catch {
      return local || null;
    }
  },

  async getTestingProductById(id: string): Promise<TestingProduct | null> {
    const local = LOCAL_TESTING.get(id);
    if (!isFirebaseConfigured || !db) return local || null;

    try {
      const docRef = doc(db, TESTING_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as TestingProduct;
      }
      return local || null;
    } catch {
      return local || null;
    }
  },

  async saveTestingProduct(product: TestingProduct): Promise<string> {
    LOCAL_TESTING.set(product.id, product);
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
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_KITS.values());
    }

    try {
      const snapshot = await getDocs(collection(db, KITS_COLLECTION));
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SampleKitBundleFoundation));
      return docs.length > 0 ? docs : Array.from(LOCAL_KITS.values());
    } catch {
      return Array.from(LOCAL_KITS.values());
    }
  },
};
