import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/client";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";

const EVENTS_COLLECTION = "stripeProcessedEvents";
const LOCAL_PROCESSED_EVENTS = new Set<string>();

export const webhookIdempotency = {
  /**
   * Checks if a Stripe event ID was already processed to prevent duplicate order updates.
   */
  async isEventProcessed(eventId: string): Promise<boolean> {
    if (LOCAL_PROCESSED_EVENTS.has(eventId)) {
      return true;
    }

    if (!isFirebaseConfigured || !db) {
      return false;
    }

    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      const snapshot = await getDoc(docRef);
      return snapshot.exists();
    } catch (error) {
      logger.warn(`Failed to check idempotency for event ${eventId}`, error);
      return false;
    }
  },

  /**
   * Marks a Stripe event ID as processed.
   */
  async markEventProcessed(eventId: string, metadata?: any): Promise<void> {
    LOCAL_PROCESSED_EVENTS.add(eventId);

    if (!isFirebaseConfigured || !db) return;

    try {
      const docRef = doc(db, EVENTS_COLLECTION, eventId);
      await setDoc(docRef, {
        eventId,
        processedAt: new Date().toISOString(),
        metadata: metadata || {},
      });
    } catch (error) {
      logger.error(`Failed to store processed event ${eventId}`, error);
    }
  },

  async recordEvent(eventId: string, metadata?: any): Promise<void> {
    return this.markEventProcessed(eventId, metadata);
  },
};
