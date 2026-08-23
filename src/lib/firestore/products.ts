import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";
import { db } from "../firebase/client";
import { Product } from "@/types/product";
import { INITIAL_PRODUCTS } from "@/data/products";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const COLLECTION_NAME = "products";

export const productService = {
  /**
   * Fetches all active products from Firestore or fallback seed
   */
  async getAllProducts(): Promise<Product[]> {
    if (!isFirebaseConfigured || !db) {
      return INITIAL_PRODUCTS;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), where("status", "==", "active"));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return INITIAL_PRODUCTS;
      }
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    } catch (error) {
      logger.warn("Firestore getAllProducts failed; falling back to local dataset.", error);
      return INITIAL_PRODUCTS;
    }
  },

  /**
   * Fetches a product by its URL slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isFirebaseConfigured || !db) {
      return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
      }
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
    } catch (error) {
      logger.warn(`Firestore getProductBySlug(${slug}) failed; falling back to local seed.`, error);
      return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
    }
  },

  /**
   * Fetches products by category slug/id
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    if (!isFirebaseConfigured || !db) {
      return INITIAL_PRODUCTS.filter((p) => p.category === categoryId || (p as any).categoryId === categoryId);
    }

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("categoryId", "==", categoryId),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return INITIAL_PRODUCTS.filter((p) => p.category === categoryId);
      }
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    } catch (error) {
      logger.warn(`Firestore getProductsByCategory(${categoryId}) failed; fallback to local.`, error);
      return INITIAL_PRODUCTS.filter((p) => p.category === categoryId);
    }
  },

  /**
   * Retrieves a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    if (!isFirebaseConfigured || !db) {
      return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Product;
      }
      return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
    } catch (error) {
      logger.warn(`Firestore getProductById(${id}) failed; fallback to local.`, error);
      return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
    }
  },

  /**
   * Creates or updates a product document (Admin only)
   */
  async saveProduct(product: Product): Promise<void> {
    if (!db) throw new Error("Firestore not initialized");
    const docRef = doc(db, COLLECTION_NAME, product.id);
    await setDoc(docRef, { ...product, updatedAt: new Date().toISOString() }, { merge: true });
    logger.info(`Product ${product.id} saved to Firestore.`);
  },
};

export const productRepository = {
  ...productService,
  getAll: productService.getAllProducts,
};
