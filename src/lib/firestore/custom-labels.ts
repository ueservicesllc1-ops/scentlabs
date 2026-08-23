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
import { 
  CustomLabelConfiguration, 
  CustomLabelStatus, 
  LabelSize, 
  LabelMaterial 
} from "@/types/custom-label";
import { STANDARD_LABEL_SIZES, STANDARD_LABEL_MATERIALS } from "@/config/custom-labels";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const CONFIGURATIONS_COLLECTION = "customLabelConfigurations";

// In-memory fallback map for offline / development testing
const LOCAL_CONFIGURATIONS = new Map<string, CustomLabelConfiguration>();

export const customLabelRepository = {
  /**
   * Returns list of active label sizes
   */
  async getLabelSizes(): Promise<LabelSize[]> {
    return STANDARD_LABEL_SIZES.filter((s) => s.active);
  },

  /**
   * Returns list of active label materials
   */
  async getLabelMaterials(): Promise<LabelMaterial[]> {
    return STANDARD_LABEL_MATERIALS.filter((m) => m.active);
  },

  /**
   * Saves or updates a customer label configuration
   */
  async saveConfiguration(config: CustomLabelConfiguration): Promise<string> {
    LOCAL_CONFIGURATIONS.set(config.id, config);

    if (!isFirebaseConfigured || !db) {
      logger.info(`[MOCK] CustomLabelConfiguration saved locally: ${config.id}`);
      return config.id;
    }

    try {
      const docRef = doc(db, CONFIGURATIONS_COLLECTION, config.id);
      await setDoc(docRef, config, { merge: true });
      logger.info(`CustomLabelConfiguration ${config.id} synced with Firestore.`);
      return config.id;
    } catch (error) {
      logger.error(`Failed to save CustomLabelConfiguration ${config.id}`, error);
      return config.id;
    }
  },

  /**
   * Retrieves a single configuration by ID
   */
  async getConfigurationById(id: string): Promise<CustomLabelConfiguration | null> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_CONFIGURATIONS.get(id) || null;
    }

    try {
      const docRef = doc(db, CONFIGURATIONS_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as CustomLabelConfiguration;
      }
      return LOCAL_CONFIGURATIONS.get(id) || null;
    } catch (error) {
      logger.warn(`Failed to fetch custom label configuration ${id}`, error);
      return LOCAL_CONFIGURATIONS.get(id) || null;
    }
  },

  /**
   * Retrieves configurations belonging to a specific customer ID
   */
  async getConfigurationsByCustomer(customerId: string): Promise<CustomLabelConfiguration[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_CONFIGURATIONS.values()).filter((c) => c.customerId === customerId);
    }

    try {
      const q = query(
        collection(db, CONFIGURATIONS_COLLECTION),
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const configs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CustomLabelConfiguration));
      return configs.length > 0
        ? configs
        : Array.from(LOCAL_CONFIGURATIONS.values()).filter((c) => c.customerId === customerId);
    } catch (error) {
      logger.warn(`Failed to query customer label configs for ${customerId}`, error);
      return Array.from(LOCAL_CONFIGURATIONS.values()).filter((c) => c.customerId === customerId);
    }
  },

  /**
   * Retrieves all configurations (Admin view)
   */
  async getAllConfigurations(): Promise<CustomLabelConfiguration[]> {
    if (!isFirebaseConfigured || !db) {
      return Array.from(LOCAL_CONFIGURATIONS.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    try {
      const q = query(
        collection(db, CONFIGURATIONS_COLLECTION),
        orderBy("createdAt", "desc"),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const configs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CustomLabelConfiguration));
      return configs.length > 0 ? configs : Array.from(LOCAL_CONFIGURATIONS.values());
    } catch (error) {
      logger.warn("Failed to fetch all label configs from Firestore", error);
      return Array.from(LOCAL_CONFIGURATIONS.values());
    }
  },

  /**
   * Updates status of a label configuration (e.g. approved, production, completed)
   */
  async updateConfigurationStatus(
    id: string,
    status: CustomLabelStatus,
    productionNotes?: string
  ): Promise<void> {
    const existing = LOCAL_CONFIGURATIONS.get(id);
    if (existing) {
      LOCAL_CONFIGURATIONS.set(id, {
        ...existing,
        status,
        productionNotes: productionNotes || existing.productionNotes,
        updatedAt: new Date().toISOString(),
      });
    }

    if (!isFirebaseConfigured || !db) return;

    try {
      const docRef = doc(db, CONFIGURATIONS_COLLECTION, id);
      await updateDoc(docRef, {
        status,
        productionNotes: productionNotes || undefined,
        updatedAt: new Date().toISOString(),
      });
      logger.info(`Custom label ${id} updated to status: ${status}`);
    } catch (error) {
      logger.error(`Failed to update status for custom label ${id}`, error);
    }
  },
};
