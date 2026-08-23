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
  limit 
} from "firebase/firestore";
import { db } from "../firebase/client";
import { FragranceOil } from "@/types/fragrance";
import { INITIAL_FRAGRANCES } from "@/data/fragrances";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const FRAGRANCE_COLLECTION = "fragranceOils";

// In-memory fallback map for offline / development testing
const LOCAL_FRAGRANCES = new Map<string, FragranceOil>();
INITIAL_FRAGRANCES.forEach((f) => LOCAL_FRAGRANCES.set(f.id, f));

export const fragranceRepository = {
  /**
   * Retrieves all fragrance oils
   */
  async getAllFragrances(): Promise<FragranceOil[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_FRAGRANCES.values());
    }

    try {
      const q = query(collection(db, FRAGRANCE_COLLECTION), orderBy("name", "asc"), limit(200));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FragranceOil));
      return docs.length > 0 ? docs : Array.from(LOCAL_FRAGRANCES.values());
    } catch (error) {
      logger.warn("Failed to fetch fragrance oils from Firestore", error);
      return Array.from(LOCAL_FRAGRANCES.values());
    }
  },

  /**
   * Retrieves a single fragrance oil by slug
   */
  async getFragranceBySlug(slug: string): Promise<FragranceOil | null> {
    const local = Array.from(LOCAL_FRAGRANCES.values()).find((f) => f.slug === slug);
    if (!isFirebaseConfigured || !db) {
      return local || null;
    }

    try {
      const q = query(collection(db, FRAGRANCE_COLLECTION), where("slug", "==", slug), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FragranceOil;
      }
      return local || null;
    } catch (error) {
      logger.warn(`Failed to fetch fragrance by slug ${slug}`, error);
      return local || null;
    }
  },

  /**
   * Retrieves a single fragrance oil by ID
   */
  async getFragranceById(id: string): Promise<FragranceOil | null> {
    const local = LOCAL_FRAGRANCES.get(id);
    if (!isFirebaseConfigured || !db) {
      return local || null;
    }

    try {
      const docRef = doc(db, FRAGRANCE_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as FragranceOil;
      }
      return local || null;
    } catch (error) {
      logger.warn(`Failed to fetch fragrance oil ${id}`, error);
      return local || null;
    }
  },

  /**
   * Saves or updates a fragrance oil
   */
  async saveFragrance(fragrance: FragranceOil): Promise<string> {
    LOCAL_FRAGRANCES.set(fragrance.id, fragrance);

    if (!isFirebaseConfigured || !db) {
      logger.info(`[MOCK] Fragrance oil saved locally: ${fragrance.name} (${fragrance.id})`);
      return fragrance.id;
    }

    try {
      const docRef = doc(db, FRAGRANCE_COLLECTION, fragrance.id);
      await setDoc(docRef, fragrance, { merge: true });
      logger.info(`Fragrance oil ${fragrance.id} synced with Firestore.`);
      return fragrance.id;
    } catch (error) {
      logger.error(`Failed to save fragrance oil ${fragrance.id}`, error);
      return fragrance.id;
    }
  },

  /**
   * Updates bulk inventory volume in ounces
   */
  async updateBulkVolume(id: string, newVolumeOz: number): Promise<void> {
    const existing = LOCAL_FRAGRANCES.get(id);
    if (existing) {
      LOCAL_FRAGRANCES.set(id, {
        ...existing,
        inventoryVolumeOz: newVolumeOz,
        updatedAt: new Date().toISOString(),
      });
    }

    if (!isFirebaseConfigured || !db) return;

    try {
      const docRef = doc(db, FRAGRANCE_COLLECTION, id);
      await updateDoc(docRef, {
        inventoryVolumeOz: newVolumeOz,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`Failed to update bulk volume for ${id}`, error);
    }
  },
};
