import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/client";
import { Customer, CustomerAddress } from "@/types/customer";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const COLLECTION_NAME = "customers";

export const customerService = {
  async getProfile(uid: string): Promise<Customer | null> {
    if (!isFirebaseConfigured || !db) {
      return null;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, uid);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { id: snapshot.id, ...snapshot.data() } as Customer;
    } catch (error: any) {
      if (error?.code === "permission-denied") {
        logger.warn(`Firestore customer profile access restricted for ${uid}. Using local session.`);
      } else {
        logger.error(`Failed to get customer profile for ${uid}`, error);
      }
      return null;
    }
  },

  async saveProfile(customer: Customer): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, COLLECTION_NAME, customer.id);
      await setDoc(docRef, { ...customer, updatedAt: new Date().toISOString() }, { merge: true });
      logger.info(`Customer profile ${customer.id} saved.`);
    } catch (error) {
      logger.error(`Failed to save customer profile ${customer.id}`, error);
      throw error;
    }
  },
};
