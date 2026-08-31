import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/client";
import { ShippingSettings, ShippingOrigin, ParcelDimensions } from "@/types/shipping";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const SETTINGS_COLLECTION = "systemSettings";
const SHIPPING_SETTINGS_DOC = "shippingSettings";
const LOCAL_STORAGE_KEY = "scentlabs_shipping_settings";

export const DEFAULT_SHIPPING_ORIGIN: ShippingOrigin = {
  name: "SCENTLAB Fulfillment Center",
  company: "ScentLab Formulations LLC",
  street1: "163 Jasper St",
  street2: "",
  city: "Paterson",
  state: "NJ",
  zip: "07522",
  country: "US",
  phone: "+1 (551) 301-4573",
  email: "ueservicesllc1@gmail.com",
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
    // Check localStorage in browser first for saved admin edits
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          LOCAL_SHIPPING_SETTINGS = parsed;
          return parsed;
        }
      } catch {}
    }

    if (!isFirebaseConfigured || !db) {
      return LOCAL_SHIPPING_SETTINGS;
    }

    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SHIPPING_SETTINGS_DOC);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const remoteData = snapshot.data() as ShippingSettings;
        LOCAL_SHIPPING_SETTINGS = remoteData;
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteData));
        }
        return remoteData;
      }
      return LOCAL_SHIPPING_SETTINGS;
    } catch (error) {
      logger.warn("Failed to fetch shipping settings, using default origin", error);
      return LOCAL_SHIPPING_SETTINGS;
    }
  },

  async saveSettings(settings: ShippingSettings): Promise<void> {
    LOCAL_SHIPPING_SETTINGS = { ...settings, updatedAt: new Date().toISOString() };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(LOCAL_SHIPPING_SETTINGS));
      } catch {}
    }

    if (!isFirebaseConfigured || !db) return;

    try {
      const docRef = doc(db, SETTINGS_COLLECTION, SHIPPING_SETTINGS_DOC);
      await setDoc(docRef, LOCAL_SHIPPING_SETTINGS, { merge: true });
    } catch (error) {
      logger.error("Failed to persist shipping settings to Firestore", error);
    }
  },
};
