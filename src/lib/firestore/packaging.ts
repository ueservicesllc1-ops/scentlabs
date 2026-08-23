import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/client";
import { PackagingMaterial, BoxSizeVariant, PackagingCompatibility } from "@/types/packaging";
import { INITIAL_MATERIALS, STANDARD_BOX_VARIANTS, INITIAL_COMPATIBILITIES } from "@/data/packaging";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const MATERIALS_COLLECTION = "packagingMaterials";
const BOX_VARIANTS_COLLECTION = "boxSizeVariants";
const COMPATIBILITY_COLLECTION = "packagingCompatibilities";

const LOCAL_MATERIALS = new Map<string, PackagingMaterial>();
INITIAL_MATERIALS.forEach((m) => LOCAL_MATERIALS.set(m.id, m));

const LOCAL_BOX_VARIANTS = new Map<string, BoxSizeVariant>();
STANDARD_BOX_VARIANTS.forEach((b) => LOCAL_BOX_VARIANTS.set(b.id, b));

const LOCAL_COMPATIBILITIES = new Map<string, PackagingCompatibility>();
INITIAL_COMPATIBILITIES.forEach((c) => LOCAL_COMPATIBILITIES.set(c.id, c));

export const packagingRepository = {
  // RAW MATERIALS (Cardstock Sheets)
  async getRawMaterials(): Promise<PackagingMaterial[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_MATERIALS.values());
    }

    try {
      const q = query(collection(db, MATERIALS_COLLECTION), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PackagingMaterial));
      return docs.length > 0 ? docs : Array.from(LOCAL_MATERIALS.values());
    } catch {
      return Array.from(LOCAL_MATERIALS.values());
    }
  },

  async saveRawMaterial(material: PackagingMaterial): Promise<string> {
    LOCAL_MATERIALS.set(material.id, material);
    if (!isFirebaseConfigured || !db) return material.id;

    try {
      const docRef = doc(db, MATERIALS_COLLECTION, material.id);
      await setDoc(docRef, material, { merge: true });
      return material.id;
    } catch {
      return material.id;
    }
  },

  // BOX SIZE VARIANTS (Cricut Production)
  async getBoxVariants(): Promise<BoxSizeVariant[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_BOX_VARIANTS.values());
    }

    try {
      const q = query(collection(db, BOX_VARIANTS_COLLECTION), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BoxSizeVariant));
      return docs.length > 0 ? docs : Array.from(LOCAL_BOX_VARIANTS.values());
    } catch {
      return Array.from(LOCAL_BOX_VARIANTS.values());
    }
  },

  async saveBoxVariant(variant: BoxSizeVariant): Promise<string> {
    LOCAL_BOX_VARIANTS.set(variant.id, variant);
    if (!isFirebaseConfigured || !db) return variant.id;

    try {
      const docRef = doc(db, BOX_VARIANTS_COLLECTION, variant.id);
      await setDoc(docRef, variant, { merge: true });
      return variant.id;
    } catch {
      return variant.id;
    }
  },

  // PACKAGING COMPATIBILITY MATRIX
  async getCompatibilities(): Promise<PackagingCompatibility[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_COMPATIBILITIES.values());
    }

    try {
      const q = query(collection(db, COMPATIBILITY_COLLECTION), where("active", "==", true));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PackagingCompatibility));
      return docs.length > 0 ? docs : Array.from(LOCAL_COMPATIBILITIES.values());
    } catch {
      return Array.from(LOCAL_COMPATIBILITIES.values());
    }
  },
};
