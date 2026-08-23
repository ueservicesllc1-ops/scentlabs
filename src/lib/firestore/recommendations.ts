import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebase/client";
import { Recommendation, RecommendationItem } from "@/types/recommendation";
import { Product } from "@/types/product";
import { INITIAL_PRODUCTS } from "@/data/products";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const COLLECTION_NAME = "recommendations";

export const recommendationService = {
  /**
   * Fetches manual and complementary recommendations for a product
   */
  async getRecommendedProducts(productId: string): Promise<Product[]> {
    if (!isFirebaseConfigured || !db) {
      const sourceProduct = INITIAL_PRODUCTS.find((p) => p.id === productId);
      if (!sourceProduct) return [];

      const targetIds = [
        ...sourceProduct.complementaryProductIds,
        ...sourceProduct.recommendedProductIds,
      ];
      return INITIAL_PRODUCTS.filter((p) => targetIds.includes(p.id));
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, productId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        const sourceProduct = INITIAL_PRODUCTS.find((p) => p.id === productId);
        if (!sourceProduct) return [];
        return INITIAL_PRODUCTS.filter((p) =>
          sourceProduct.complementaryProductIds.includes(p.id)
        );
      }

      const rec = snapshot.data() as Recommendation;
      const targetIds = rec.items.map((i) => i.targetProductId);
      return INITIAL_PRODUCTS.filter((p) => targetIds.includes(p.id));
    } catch (error) {
      logger.warn(`Failed to fetch recommendations for ${productId}`, error);
      return [];
    }
  },
};
