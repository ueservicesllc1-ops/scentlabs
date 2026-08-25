import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/client";
import { ShippingSettings, ShippingOrigin, ParcelDimensions } from "@/types/shipping";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const SETTINGS_COLLECTION = "systemSettings";
const SHIPPING_SETTINGS_DOC = "shippingSettings";

export const DEFAULT_SHIPPING_ORIGIN: ShippingOrigin = {
  name: "SCENTLAB Fulfillment Center",
  company: "ScentLab Formulations LLC",
  street1: "100 Industrial Parkway",
  street2: "Suite 4",
  city: "Edison",
  state: "NJ",
  zip: "08817",
  country: "US",
  phone: "+1 (800) 555-SCENT",
  email: "fulfillment@scentlab.com",
};

export const DEFAULT_PARCEL: ParcelDimensions = {
  weight: 1.5,
  massUnit: "lb",
  length: 8,
  width: 6,
  height: 4,
  distanceUnit: "in",
};

const DEFAULT_SETTINGS: ShippingSettings = {
  origin: DEFAULT_SHIPPING_ORIGIN,
  defaultParcel: DEFAULT_PARCEL,
  freeShippingThreshold: 250,
  fallbackFlatRate: 6.99,
  updatedAt: new Date().toISOString(),
};

let LOCAL_SHIPPING_SETTINGS: ShippingSettings = { ...DEFAULT_SETTINGS };

export const shippingSettingsRepository = {
  async getSettings(): Promise<ShippingSettings> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_SHIPPING_SETTINGS;
    }

    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SHIPPING_SETTINGS_DOC);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as ShippingSettings;
      }
      return LOCAL_SHIPPING_SETTINGS;
    } catch (error) {
      logger.warn("Failed to fetch shipping settings, using default origin", error);
      return LOCAL_SHIPPING_SETTINGS;
    }
  },

  async saveSettings(settings: ShippingSettings): Promise<void> {
    LOCAL_SHIPPING_SETTINGS = { ...settings, updatedAt: new Date().toISOString() };

    if (!isFirebaseConfigured || !db) return;

    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SHIPPING_SETTINGS_DOC);
      await setDoc(docRef, LOCAL_SHIPPING_SETTINGS, { merge: true });
    } catch (error) {
      logger.error("Failed to persist shipping settings to Firestore", error);
    }
  },
};
