import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/client";
import { PerfumeBase, KitProduct } from "@/types/perfume-making";
import { INITIAL_PERFUME_BASES, INITIAL_PERFUME_KITS } from "@/data/perfume-making";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const BASES_COLLECTION = "perfumeBases";
const KITS_COLLECTION = "perfumeKits";

const LOCAL_BASES = new Map<string, PerfumeBase>();
INITIAL_PERFUME_BASES.forEach((b) => LOCAL_BASES.set(b.id, b));

const LOCAL_KITS = new Map<string, KitProduct>();
INITIAL_PERFUME_KITS.forEach((k) => LOCAL_KITS.set(k.id, k));

export const perfumeMakingRepository = {
  // BASES
  async getAllBases(): Promise<PerfumeBase[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_BASES.values());
    }

    try {
      const q = query(collection(db, BASES_COLLECTION), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PerfumeBase));
      return docs.length > 0 ? docs : Array.from(LOCAL_BASES.values());
    } catch {
      return Array.from(LOCAL_BASES.values());
    }
  },

  async getBaseBySlug(slug: string): Promise<PerfumeBase | null> {
    const local = Array.from(LOCAL_BASES.values()).find((b) => b.slug === slug);
    if (!isFirebaseConfigured || !db) return local || null;

    try {
      const q = query(collection(db, BASES_COLLECTION), where("slug", "==", slug));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as PerfumeBase;
      }
      return local || null;
    } catch {
      return local || null;
    }
  },

  async saveBase(base: PerfumeBase): Promise<string> {
    LOCAL_BASES.set(base.id, base);
    if (!isFirebaseConfigured || !db) return base.id;

    try {
      const docRef = doc(db, BASES_COLLECTION, base.id);
      await setDoc(docRef, base, { merge: true });
      return base.id;
    } catch (error) {
      logger.error(`Failed to save perfume base ${base.id}`, error);
      return base.id;
    }
  },

  // KITS
  async getAllKits(): Promise<KitProduct[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_KITS.values());
    }

    try {
      const q = query(collection(db, KITS_COLLECTION), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as KitProduct));
      return docs.length > 0 ? docs : Array.from(LOCAL_KITS.values());
    } catch {
      return Array.from(LOCAL_KITS.values());
    }
  },

  async saveKit(kit: KitProduct): Promise<string> {
    LOCAL_KITS.set(kit.id, kit);
    if (!isFirebaseConfigured || !db) return kit.id;

    try {
      const docRef = doc(db, KITS_COLLECTION, kit.id);
      await setDoc(docRef, kit, { merge: true });
      return kit.id;
    } catch (error) {
      logger.error(`Failed to save perfume kit ${kit.id}`, error);
      return kit.id;
    }
  },
};
