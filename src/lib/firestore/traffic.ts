import { adminDb } from "../firebase/admin";
import { db } from "../firebase/client";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "../logger";

export interface TrafficStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  todayUnique: number;
  lastVisitedAt: string;
  currentDay: string;
}

const COLLECTION_NAME = "site_analytics";
const DOC_ID = "traffic_stats";

// In-memory fallback if Firestore is temporarily offline
let LOCAL_STATS: TrafficStats = {
  totalVisits: 1,
  uniqueVisitors: 1,
  todayVisits: 1,
  todayUnique: 1,
  lastVisitedAt: new Date().toISOString(),
  currentDay: new Date().toISOString().split("T")[0],
};

export const trafficRepository = {
  /**
   * Get current traffic stats
   */
  async getTrafficStats(): Promise<TrafficStats> {
    const today = new Date().toISOString().split("T")[0];

    // Try Firebase Admin first (Server-side)
    if (adminDb) {
      try {
        const docRef = adminDb.collection(COLLECTION_NAME).doc(DOC_ID);
        const snapshot = await docRef.get();
        if (snapshot.exists) {
          const data = snapshot.data() as TrafficStats;
          return {
            totalVisits: data.totalVisits || 0,
            uniqueVisitors: data.uniqueVisitors || 0,
            todayVisits: data.currentDay === today ? data.todayVisits || 0 : 0,
            todayUnique: data.currentDay === today ? data.todayUnique || 0 : 0,
            lastVisitedAt: data.lastVisitedAt || new Date().toISOString(),
            currentDay: data.currentDay || today,
          };
        }
      } catch (error) {
        logger.error("[TrafficRepo] Admin getTrafficStats error:", error);
      }
    }

    // Try Client Firestore SDK
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, DOC_ID);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as TrafficStats;
          return {
            totalVisits: data.totalVisits || 0,
            uniqueVisitors: data.uniqueVisitors || 0,
            todayVisits: data.currentDay === today ? data.todayVisits || 0 : 0,
            todayUnique: data.currentDay === today ? data.todayUnique || 0 : 0,
            lastVisitedAt: data.lastVisitedAt || new Date().toISOString(),
            currentDay: data.currentDay || today,
          };
        }
      } catch (error) {
        logger.error("[TrafficRepo] Client getTrafficStats error:", error);
      }
    }

    return LOCAL_STATS;
  },

  /**
   * Record a real visit and increment persistent counters
   */
  async recordVisit(isNewVisitor: boolean = false, isNewSession: boolean = true): Promise<TrafficStats> {
    const today = new Date().toISOString().split("T")[0];
    const nowIso = new Date().toISOString();

    // 1. Try with Firebase Admin SDK (Server Route)
    if (adminDb) {
      try {
        const docRef = adminDb.collection(COLLECTION_NAME).doc(DOC_ID);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
          const initialData: TrafficStats = {
            totalVisits: 1,
            uniqueVisitors: 1,
            todayVisits: 1,
            todayUnique: 1,
            lastVisitedAt: nowIso,
            currentDay: today,
          };
          await docRef.set(initialData);
          LOCAL_STATS = initialData;
          return initialData;
        }

        const data = snapshot.data() as TrafficStats;
        const isNewDay = data.currentDay !== today;

        const updatePayload: Record<string, any> = {
          lastVisitedAt: nowIso,
          currentDay: today,
        };

        if (isNewSession) {
          updatePayload.totalVisits = FieldValue.increment(1);
          updatePayload.todayVisits = isNewDay ? 1 : FieldValue.increment(1);
        }

        if (isNewVisitor) {
          updatePayload.uniqueVisitors = FieldValue.increment(1);
          updatePayload.todayUnique = isNewDay ? 1 : FieldValue.increment(1);
        } else if (isNewDay) {
          updatePayload.todayUnique = 1;
        }

        await docRef.update(updatePayload);

        // Fetch freshly updated data
        const updatedSnapshot = await docRef.get();
        const updatedData = updatedSnapshot.data() as TrafficStats;
        LOCAL_STATS = updatedData;
        return updatedData;
      } catch (error) {
        logger.error("[TrafficRepo] Admin recordVisit error:", error);
      }
    }

    // 2. Try with Client Firestore SDK
    if (db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, DOC_ID);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          const initialData: TrafficStats = {
            totalVisits: 1,
            uniqueVisitors: 1,
            todayVisits: 1,
            todayUnique: 1,
            lastVisitedAt: nowIso,
            currentDay: today,
          };
          await setDoc(docRef, initialData);
          LOCAL_STATS = initialData;
          return initialData;
        }

        const data = snapshot.data() as TrafficStats;
        const isNewDay = data.currentDay !== today;

        const updatePayload: Record<string, any> = {
          lastVisitedAt: nowIso,
          currentDay: today,
        };

        if (isNewSession) {
          updatePayload.totalVisits = increment(1);
          updatePayload.todayVisits = isNewDay ? 1 : increment(1);
        }

        if (isNewVisitor) {
          updatePayload.uniqueVisitors = increment(1);
          updatePayload.todayUnique = isNewDay ? 1 : increment(1);
        } else if (isNewDay) {
          updatePayload.todayUnique = 1;
        }

        await updateDoc(docRef, updatePayload);

        const updatedSnapshot = await getDoc(docRef);
        if (updatedSnapshot.exists()) {
          const updatedData = updatedSnapshot.data() as TrafficStats;
          LOCAL_STATS = updatedData;
          return updatedData;
        }
      } catch (error) {
        logger.error("[TrafficRepo] Client recordVisit error:", error);
      }
    }

    // 3. In-memory fallback
    if (isNewSession) {
      LOCAL_STATS.totalVisits += 1;
      LOCAL_STATS.todayVisits += 1;
    }
    if (isNewVisitor) {
      LOCAL_STATS.uniqueVisitors += 1;
      LOCAL_STATS.todayUnique += 1;
    }
    LOCAL_STATS.lastVisitedAt = nowIso;
    LOCAL_STATS.currentDay = today;

    return LOCAL_STATS;
  },
};
