import { collection, getDocs, doc, getDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/client";
import { Category } from "@/types/category";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const COLLECTION_NAME = "categories";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    if (!isFirebaseConfigured || !db) {
      return INITIAL_CATEGORIES;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("sortOrder", "asc"));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return INITIAL_CATEGORIES;
      }
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
    } catch (error) {
      logger.warn("Firestore getCategories failed; using default categories.", error);
      return INITIAL_CATEGORIES;
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const categories = await this.getCategories();
    return categories.find((c) => c.slug === slug) || null;
  },
};
