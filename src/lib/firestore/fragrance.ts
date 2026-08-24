import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
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
const DELETED_FRAGRANCES_KEY = "scentlabs_deleted_fragrances";

// In-memory fallback map for offline / development testing
const LOCAL_FRAGRANCES = new Map<string, FragranceOil>();
INITIAL_FRAGRANCES.forEach((f) => LOCAL_FRAGRANCES.set(f.id, f));

function getDeletedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_FRAGRANCES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDeletedId(id: string) {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedIds();
    set.add(id);
    localStorage.setItem(DELETED_FRAGRANCES_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    logger.error("Failed to save deleted fragrance ID to localStorage", err);
  }
}

export const fragranceRepository = {
  /**
   * Retrieves all fragrance oils
   */
  async getAllFragrances(): Promise<FragranceOil[]> {
    const deletedIds = getDeletedIds();

    // LOCAL_FRAGRANCES is always the source of truth (1397 fragrances from fragrances-clean.json).
    // Firestore only stores manual overrides (edits made via the admin UI).
    // We merge Firestore overrides on top of local data.
    let overridesMap = new Map<string, Partial<FragranceOil>>();

    if (isFirebaseConfigured && db) {
      try {
        const snapshot = await getDocs(collection(db, FRAGRANCE_COLLECTION));
        snapshot.docs.forEach((d) => {
          overridesMap.set(d.id, d.data() as Partial<FragranceOil>);
        });
      } catch (error) {
        logger.warn("Failed to fetch fragrance overrides from Firestore", error);
      }
    }

    return Array.from(LOCAL_FRAGRANCES.values())
      .filter((f) => !deletedIds.has(f.id))
      .map((f) => {
        const override = overridesMap.get(f.id);
        return override ? { ...f, ...override, id: f.id } : f;
      });
  },

  /**
   * Retrieves a single fragrance oil by slug
   */
  async getFragranceBySlug(slug: string): Promise<FragranceOil | null> {
    const deletedIds = getDeletedIds();
    const local = Array.from(LOCAL_FRAGRANCES.values()).find((f) => f.slug === slug && !deletedIds.has(f.id));
    if (!isFirebaseConfigured || !db) {
      return local || null;
    }

    try {
      const q = query(collection(db, FRAGRANCE_COLLECTION), where("slug", "==", slug), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const item = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FragranceOil;
        if (!deletedIds.has(item.id)) return item;
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
    const deletedIds = getDeletedIds();
    if (deletedIds.has(id)) return null;

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
   * Deletes a fragrance oil permanently
   */
  async deleteFragrance(id: string): Promise<boolean> {
    LOCAL_FRAGRANCES.delete(id);
    saveDeletedId(id);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, FRAGRANCE_COLLECTION, id);
        await deleteDoc(docRef);
        logger.info(`Fragrance oil ${id} deleted from Firestore.`);
      } catch (error) {
        logger.error(`Failed to delete fragrance oil ${id}`, error);
      }
    }

    return true;
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
